"use client";

import { useState, useTransition } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import {
  CheckCircle2,
  Clock3,
  Phone,
  ReceiptText,
  ShieldCheck,
  Trash2,
  X,
} from "lucide-react";
import ComicButton from "@/components/ComicButton";
import { useCartStore } from "@/store/cart";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { releaseProductReservationAction } from "@/app/actions/storefront";
import { useAnalytics } from "@/store/analytics";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

type PaymentMethod = "cod_with_advance" | "full_bank_transfer";

function formatMMSS(timestamp?: string | null) {
  if (!timestamp) {
    return "00:00";
  }

  const diff = new Date(timestamp).getTime() - Date.now();
  if (diff <= 0) {
    return "00:00";
  }

  const totalSeconds = Math.floor(diff / 1000);
  const mm = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const ss = String(totalSeconds % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { items, removeItem, clearCart } = useCartStore();
  const trackCheckoutStart = useAnalytics((state) => state.trackCheckoutStart);
  const trackPurchase = useAnalytics((state) => state.trackPurchase);

  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod_with_advance");
  const [otpPhone, setOtpPhone] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [isBusy, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [hasTrackedCheckoutStart, setHasTrackedCheckoutStart] = useState(false);

  const [customer, setCustomer] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
  });

  function normalizePhoneNumber(phone: string) {
    const trimmed = phone.trim();
    if (!trimmed) {
      return "";
    }

    const digits = trimmed.replace(/\D/g, "");
    if (trimmed.startsWith("+")) {
      return `+${digits}`;
    }

    if (digits.length === 11 && digits.startsWith("03")) {
      return `+92${digits.slice(1)}`;
    }

    if (digits.length === 12 && digits.startsWith("92")) {
      return `+${digits}`;
    }

    return `+${digits}`;
  }

  const primaryItem = items[0] || null;
  const total = primaryItem?.price || 0;
  const activeCountdown = formatMMSS(primaryItem?.reservedUntil || null);

  function moveToStep(nextStep: number) {
    if (nextStep >= 2 && !hasTrackedCheckoutStart && primaryItem) {
      trackCheckoutStart();
      setHasTrackedCheckoutStart(true);
    }

    setStep(nextStep);
  }

  function handleStepThreeContinue() {
    if (paymentMethod === "full_bank_transfer" && !receiptFile) {
      setError("Upload payment receipt before continuing.");
      return;
    }

    moveToStep(4);
  }

  async function sendOtp() {
    if (!otpPhone) {
      setError("Enter your phone number before requesting OTP.");
      return;
    }

    const normalizedPhone = normalizePhoneNumber(otpPhone);
    if (!normalizedPhone) {
      setError("Enter a valid phone number.");
      return;
    }

    setError(null);
    setOtpPhone(normalizedPhone);
    const supabase = getSupabaseBrowserClient();
    const { error: otpError } = await supabase.auth.signInWithOtp({
      phone: normalizedPhone,
    });

    if (otpError) {
      setError(otpError.message);
      return;
    }

    setSuccessMessage("OTP sent. Enter the code below.");
  }

  async function verifyOtp() {
    if (!otpPhone || !otpCode) {
      setError("Phone and OTP code are required.");
      return;
    }

    const normalizedPhone = normalizePhoneNumber(otpPhone);
    if (!normalizedPhone) {
      setError("Enter a valid phone number.");
      return;
    }

    const supabase = getSupabaseBrowserClient();
    const { error: verifyError } = await supabase.auth.verifyOtp({
      phone: normalizedPhone,
      token: otpCode,
      type: "sms",
    });

    if (verifyError) {
      setError(verifyError.message);
      return;
    }

    setOtpPhone(normalizedPhone);
    setCustomer((s) => ({ ...s, phone: normalizedPhone }));
    setOtpVerified(true);
    setSuccessMessage("Phone verified.");
  }

  async function uploadReceiptAndPlaceOrder() {
    if (!primaryItem) {
      setError("Your cart is empty.");
      return;
    }

    if (!customer.name || !customer.phone || !customer.address || !customer.city) {
      setError("Please complete customer details.");
      return;
    }

    const normalizedCustomerPhone = normalizePhoneNumber(customer.phone);
    if (!normalizedCustomerPhone) {
      setError("Enter a valid phone number for the order.");
      return;
    }

    if (paymentMethod === "cod_with_advance" && !otpVerified) {
      setError("Phone verification is required for COD orders.");
      return;
    }

    if (paymentMethod === "full_bank_transfer" && !receiptFile) {
      setError("Upload payment receipt before placing your order.");
      return;
    }

    setCustomer((s) => ({ ...s, phone: normalizedCustomerPhone }));
    setError(null);

    let receiptImageUrl = "";
    if (receiptFile) {
      const supabase = getSupabaseBrowserClient();
      const objectPath = `${Date.now()}-${receiptFile.name.replace(/\s+/g, "-")}`;
      const { error: uploadError } = await supabase.storage
        .from("payment-receipts")
        .upload(objectPath, receiptFile, { upsert: false });

      if (uploadError) {
        setError(uploadError.message);
        return;
      }

      const { data } = supabase.storage
        .from("payment-receipts")
        .getPublicUrl(objectPath);
      receiptImageUrl = data.publicUrl;
    }

    startTransition(async () => {
      const response = await fetch("/api/order/complete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: primaryItem.id,
          customerName: customer.name,
          phone: normalizedCustomerPhone,
          address: customer.address,
          city: customer.city,
          paymentMethod,
          receiptImageUrl: receiptImageUrl || undefined,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        setError(result.error || result.message || "Failed to place order");
        return;
      }

      trackPurchase(total);
      setSuccessMessage("Order placed and sent for verification.");
      clearCart();
      setStep(1);
      setReceiptFile(null);
      setOtpCode("");
      setOtpPhone("");
      setOtpVerified(false);
      setHasTrackedCheckoutStart(false);
    });
  }

  function handleRemove(id: string) {
    startTransition(async () => {
      await releaseProductReservationAction(id);
      removeItem(id);
    });
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            className="fixed inset-x-0 bottom-0 z-50 max-h-[92vh] overflow-y-auto border-t-4 border-black bg-white shadow-hard-lg"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 260, damping: 30 }}
          >
            <div className="sticky top-0 flex items-center justify-between border-b-4 border-black bg-[var(--comic-red)] p-4 text-white">
              <div>
                <p className="font-heading text-3xl">CHECKOUT DRAWER</p>
                {primaryItem?.reservedUntil && (
                  <p className="flex items-center gap-2 text-sm font-bold">
                    <Clock3 size={16} />
                    Reservation expires in {activeCountdown}
                  </p>
                )}
              </div>
              <button onClick={onClose} className="rounded border-2 border-white p-2">
                <X size={22} />
              </button>
            </div>

            <div className="mx-auto grid max-w-6xl gap-6 p-4 md:grid-cols-2">
              <section className="space-y-4">
                <div className="border-4 border-black bg-white p-4 shadow-hard">
                  <p className="font-heading text-2xl">YOUR PAIR</p>
                  {items.length > 1 && (
                    <div className="mt-2 space-y-2">
                      <p className="border-2 border-black bg-yellow-100 p-2 text-sm font-bold">
                        1-of-1 mode is active. Only the first pair can be checked out.
                      </p>
                      {items.slice(1).map((item) => (
                        <div key={item.id} className="flex items-center justify-between border-2 border-black bg-gray-50 p-2">
                          <p className="text-xs font-bold">{item.title}</p>
                          <button
                            onClick={() => handleRemove(item.id)}
                            className="border-2 border-black bg-white px-2 py-1 text-[11px] font-bold"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {primaryItem ? (
                    <div className="mt-4 flex gap-4">
                      <div className="relative h-24 w-24 border-2 border-black">
                        <Image src={primaryItem.image} alt={primaryItem.title} fill className="object-cover" />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold">{primaryItem.title}</p>
                        <p className="text-sm text-gray-600">
                          {primaryItem.brand} • UK {primaryItem.size}
                        </p>
                        <p className="font-heading text-2xl">Rs. {primaryItem.price.toLocaleString()}</p>
                      </div>
                      <button
                        onClick={() => handleRemove(primaryItem.id)}
                        className="h-fit border-2 border-black bg-red-50 p-2"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ) : (
                    <p className="mt-3 text-sm font-bold text-gray-600">No reserved item yet.</p>
                  )}
                </div>

                <div className="border-4 border-black bg-yellow-200 p-4 shadow-hard">
                  <p className="font-heading text-2xl">ORDER TOTAL</p>
                  <p className="text-4xl font-heading">Rs. {total.toLocaleString()}</p>
                  {paymentMethod === "cod_with_advance" ? (
                    <p className="text-sm font-bold">COD advance required: Rs. 1,000</p>
                  ) : (
                    <p className="text-sm font-bold">Full amount must be paid before dispatch.</p>
                  )}
                </div>

                <div className="border-4 border-black bg-white p-4 shadow-hard">
                  <p className="mb-2 font-heading text-xl">STEP {step} OF 4</p>
                  <div className="grid grid-cols-4 gap-2 text-center text-xs font-bold">
                    {["Phone", "Payment", "Receipt", "Place Order"].map((label, idx) => (
                      <div
                        key={label}
                        className={`border-2 border-black p-2 ${step >= idx + 1 ? "bg-[var(--comic-green)] text-white" : "bg-gray-100"}`}
                      >
                        {label}
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                {error && <div className="border-2 border-black bg-red-100 p-3 font-bold text-red-700">{error}</div>}
                {successMessage && (
                  <div className="border-2 border-black bg-green-100 p-3 font-bold text-green-700">{successMessage}</div>
                )}

                {step === 1 && (
                  <div className="space-y-4 border-4 border-black bg-white p-4 shadow-hard">
                    <p className="font-heading text-2xl">STEP 1: PHONE VERIFICATION</p>
                    <p className="text-sm font-bold text-gray-700">Required for COD orders to reduce fake checkouts.</p>

                    <label className="block font-bold">
                      <span className="mb-2 block">Phone Number</span>
                      <input
                        className="w-full border-2 border-black p-3"
                        placeholder="+923XXXXXXXXX"
                        inputMode="tel"
                        value={otpPhone}
                        onChange={(e) => setOtpPhone(e.target.value)}
                      />
                    </label>

                    <div className="grid grid-cols-2 gap-3">
                      <ComicButton onClick={sendOtp} className="w-full" variant="secondary">
                        <span className="flex items-center justify-center gap-2">
                          <Phone size={18} /> Send OTP
                        </span>
                      </ComicButton>

                      <input
                        className="w-full border-2 border-black p-3"
                        placeholder="4-digit OTP"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                      />
                    </div>

                    <ComicButton onClick={verifyOtp} className="w-full" variant="secondary">
                      Verify OTP
                    </ComicButton>

                    <ComicButton onClick={() => moveToStep(2)} className="w-full">
                      Continue
                    </ComicButton>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-4 border-4 border-black bg-white p-4 shadow-hard">
                    <p className="font-heading text-2xl">STEP 2: PAYMENT SELECTION</p>
                    <button
                      className={`w-full border-2 border-black p-3 text-left font-bold ${
                        paymentMethod === "cod_with_advance" ? "bg-[var(--comic-purple)] text-white" : "bg-white"
                      }`}
                      onClick={() => setPaymentMethod("cod_with_advance")}
                    >
                      Cash on Delivery (Rs. 1000 Advance Required)
                    </button>
                    <button
                      className={`w-full border-2 border-black p-3 text-left font-bold ${
                        paymentMethod === "full_bank_transfer" ? "bg-[var(--comic-purple)] text-white" : "bg-white"
                      }`}
                      onClick={() => setPaymentMethod("full_bank_transfer")}
                    >
                      Full Payment via Bank/JazzCash
                    </button>

                    <div className="grid grid-cols-2 gap-2">
                      <ComicButton variant="secondary" onClick={() => moveToStep(1)} className="w-full">
                        Back
                      </ComicButton>
                      <ComicButton onClick={() => moveToStep(3)} className="w-full">
                        Continue
                      </ComicButton>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-4 border-4 border-black bg-white p-4 shadow-hard">
                    <p className="font-heading text-2xl">STEP 3: UPLOAD RECEIPT</p>
                    <div className="border-2 border-black bg-gray-50 p-3 text-sm font-bold">
                      <p>Account Title: Flipside Kicks</p>
                      <p>IBAN: PK00XXXX0000000000000000</p>
                      <p>JazzCash: 03XX-XXXXXXX</p>
                    </div>

                    <label className="block rounded border-2 border-dashed border-black bg-white p-4 text-sm font-bold">
                      <span className="mb-2 flex items-center gap-2">
                        <ReceiptText size={18} /> Upload JazzCash/Bank Receipt
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
                        className="w-full"
                      />
                    </label>

                    <div className="grid grid-cols-2 gap-2">
                      <ComicButton variant="secondary" onClick={() => moveToStep(2)} className="w-full">
                        Back
                      </ComicButton>
                      <ComicButton onClick={handleStepThreeContinue} className="w-full">
                        Continue
                      </ComicButton>
                    </div>
                  </div>
                )}

                {step === 4 && (
                  <div className="space-y-4 border-4 border-black bg-white p-4 shadow-hard">
                    <p className="font-heading text-2xl">STEP 4: PLACE ORDER</p>

                    <div className="grid gap-3 md:grid-cols-2">
                      <input
                        className="border-2 border-black p-3"
                        placeholder="Full name"
                        value={customer.name}
                        onChange={(e) => setCustomer((s) => ({ ...s, name: e.target.value }))}
                      />
                      <input
                        className="border-2 border-black p-3"
                        placeholder="Phone"
                        value={customer.phone}
                        onChange={(e) => setCustomer((s) => ({ ...s, phone: e.target.value }))}
                      />
                      <input
                        className="border-2 border-black p-3"
                        placeholder="City"
                        value={customer.city}
                        onChange={(e) => setCustomer((s) => ({ ...s, city: e.target.value }))}
                      />
                      <input
                        className="border-2 border-black p-3"
                        placeholder="Address"
                        value={customer.address}
                        onChange={(e) => setCustomer((s) => ({ ...s, address: e.target.value }))}
                      />
                    </div>

                    <div className="border-2 border-black bg-green-50 p-3 text-sm font-bold">
                      <p className="flex items-center gap-2">
                        <ShieldCheck size={16} />
                        COD blacklist check is enforced before order creation.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <ComicButton variant="secondary" onClick={() => moveToStep(3)} className="w-full">
                        Back
                      </ComicButton>
                      <ComicButton onClick={uploadReceiptAndPlaceOrder} className="w-full" disabled={isBusy || !primaryItem}>
                        {isBusy ? "Placing..." : "Place Order"}
                      </ComicButton>
                    </div>
                  </div>
                )}
              </section>
            </div>

            <div className="border-t-4 border-black bg-black p-4 text-xs font-bold text-white">
              <p className="flex items-center gap-2">
                <CheckCircle2 size={14} />
                Orders are inserted as pending verification and processed by admin approval.
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
