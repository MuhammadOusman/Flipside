"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, MapPin, Phone, User, Package } from "lucide-react";
import Navbar from "@/components/Navbar";
import ComicButton from "@/components/ComicButton";
import Footer from "@/components/Footer";
import { useCartStore } from "@/store/cart";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotal, clearCart } = useCartStore();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    notes: "",
  });
  const [orderPlaced, setOrderPlaced] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would send order to backend/Sanity
    console.log("Order placed:", { items, customer: formData, total: getTotal() });
    setOrderPlaced(true);
    
    // Simulate success and redirect
    setTimeout(() => {
      clearCart();
      router.push("/");
    }, 3000);
  };

  if (items.length === 0 && !orderPlaced) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="font-heading text-8xl mb-4">🛒</div>
            <h1 className="font-heading text-5xl mb-4">CART IS EMPTY</h1>
            <p className="text-gray-600 mb-6">Add some kicks before checkout!</p>
            <Link href="/shop">
              <ComicButton size="lg">GO TO SHOP</ComicButton>
            </Link>
          </div>
        </main>
      </>
    );
  }

  if (orderPlaced) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-300 via-green-400 to-blue-400">
          <motion.div
            className="text-center bg-white border-4 border-black p-12 shadow-hard-lg max-w-2xl mx-4"
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            <motion.div
              className="font-heading text-8xl mb-6"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              🎉
            </motion.div>
            <h1 className="font-heading text-6xl text-[--comic-red] mb-4">
              ORDER PLACED!
            </h1>
            <div className="bg-yellow-300 border-4 border-black p-6 mb-6">
              <p className="font-heading text-4xl mb-2">💥 BOOM! 💥</p>
              <p className="text-lg font-bold">
                Your order has been confirmed!
              </p>
            </div>
            <p className="text-gray-700 mb-2">
              We&apos;ll call you soon to confirm delivery details.
            </p>
            <p className="text-sm text-gray-600">
              Redirecting to homepage...
            </p>
          </motion.div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen py-8">
        <div className="container mx-auto px-4">
          {/* Back Button */}
          <Link href="/shop">
            <motion.button
              className="flex items-center gap-2 mb-6 px-4 py-2 border-2 border-black bg-white shadow-hard hover:shadow-none transition"
              whileHover={{ x: -5 }}
            >
              <ArrowLeft size={20} />
              <span className="font-bold">BACK TO SHOP</span>
            </motion.button>
          </Link>

          {/* Page Header */}
          <div className="text-center mb-12">
            <h1 className="font-heading text-6xl md:text-8xl mb-4">CHECKOUT</h1>
            <div className="w-32 h-2 bg-[--comic-red] mx-auto border-2 border-black" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2">
              <motion.form
                onSubmit={handleSubmit}
                className="border-4 border-black bg-white p-8 shadow-hard-lg"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <h2 className="font-heading text-4xl mb-6 pb-4 border-b-4 border-black">
                  DELIVERY INFO
                </h2>

                {/* Name */}
                <div className="mb-6">
                  <label className="flex items-center gap-2 font-bold text-lg mb-2">
                    <User size={20} />
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-4 py-3 border-4 border-black focus:outline-none focus:border-[--comic-red] transition"
                    placeholder="Your Name"
                  />
                </div>

                {/* Phone */}
                <div className="mb-6">
                  <label className="flex items-center gap-2 font-bold text-lg mb-2">
                    <Phone size={20} />
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="w-full px-4 py-3 border-4 border-black focus:outline-none focus:border-[--comic-red] transition"
                    placeholder="03XX-XXXXXXX"
                  />
                </div>

                {/* City */}
                <div className="mb-6">
                  <label className="flex items-center gap-2 font-bold text-lg mb-2">
                    <MapPin size={20} />
                    City *
                  </label>
                  <select
                    required
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                    className="w-full px-4 py-3 border-4 border-black focus:outline-none focus:border-[--comic-red] transition"
                  >
                    <option value="">Select City</option>
                    <option value="karachi">Karachi</option>
                    <option value="lahore">Lahore</option>
                    <option value="islamabad">Islamabad</option>
                    <option value="rawalpindi">Rawalpindi</option>
                    <option value="faisalabad">Faisalabad</option>
                    <option value="multan">Multan</option>
                    <option value="peshawar">Peshawar</option>
                    <option value="quetta">Quetta</option>
                  </select>
                </div>

                {/* Address */}
                <div className="mb-6">
                  <label className="flex items-center gap-2 font-bold text-lg mb-2">
                    <Package size={20} />
                    Complete Address *
                  </label>
                  <textarea
                    required
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    className="w-full px-4 py-3 border-4 border-black focus:outline-none focus:border-[--comic-red] transition resize-none"
                    rows={3}
                    placeholder="House #, Street, Area..."
                  />
                </div>

                {/* Notes */}
                <div className="mb-6">
                  <label className="font-bold text-lg mb-2 block">
                    Order Notes (Optional)
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    className="w-full px-4 py-3 border-4 border-black focus:outline-none focus:border-[--comic-red] transition resize-none"
                    rows={2}
                    placeholder="Any special instructions..."
                  />
                </div>

                {/* Payment Method */}
                <div className="bg-yellow-300 border-4 border-black p-6 mb-6">
                  <h3 className="font-heading text-2xl mb-2">PAYMENT METHOD</h3>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 border-4 border-black bg-[--comic-red] flex items-center justify-center text-white font-bold">
                      ✓
                    </div>
                    <span className="font-bold text-lg">
                      💰 Cash on Delivery (COD)
                    </span>
                  </div>
                  <p className="text-sm mt-2 text-gray-700">
                    Pay when you receive your order
                  </p>
                </div>

                {/* Submit Button */}
                <ComicButton
                  type="submit"
                  size="lg"
                  variant="primary"
                  className="w-full"
                >
                  PLACE ORDER - PKR {getTotal().toLocaleString()}
                </ComicButton>
              </motion.form>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <motion.div
                className="border-4 border-black bg-white shadow-hard-lg sticky top-24"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <div className="bg-[--comic-purple] text-white p-4 border-b-4 border-black">
                  <h2 className="font-heading text-3xl">ORDER SUMMARY</h2>
                </div>

                <div className="p-4">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex gap-3 mb-4 pb-4 border-b-2 border-gray-200 last:border-0"
                    >
                      <div className="relative w-16 h-16 border-2 border-black">
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-sm leading-tight">
                          {item.title}
                        </h3>
                        <p className="text-xs text-gray-600">
                          {item.brand} • UK {item.size}
                        </p>
                        <p className="font-bold text-sm mt-1">
                          PKR {item.price.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}

                  {/* Total */}
                  <div className="bg-yellow-300 border-4 border-black p-4 mt-4">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-lg">TOTAL:</span>
                      <span className="font-heading text-3xl">
                        PKR {getTotal().toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs mt-2 text-gray-700">
                      + Delivery charges may apply
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
