"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { CheckCircle2, Truck } from "lucide-react";
import { approvePaymentAction, generateTrackingAction } from "@/app/actions/admin";

export type AdminOrder = {
  id: string;
  created_at: string;
  customer_name: string;
  phone: string;
  address: string;
  city: string;
  payment_method: string;
  order_status: string;
  tracking_number: string | null;
  receipt_image_url: string | null;
  advance_paid: boolean;
  products?: {
    brand: string;
    model: string;
  };
};

export default function AdminOrdersClient({ initialOrders }: { initialOrders: AdminOrder[] }) {
  const [orders, setOrders] = useState(initialOrders);
  const [selectedId, setSelectedId] = useState(initialOrders[0]?.id || null);
  const [isBusy, startTransition] = useTransition();

  const selectedOrder = orders.find((order) => order.id === selectedId) || null;

  function refreshLocal(orderId: string, patch: Partial<AdminOrder>) {
    setOrders((prev) => prev.map((order) => (order.id === orderId ? { ...order, ...patch } : order)));
  }

  function handleApprove(orderId: string) {
    startTransition(async () => {
      const res = await approvePaymentAction(orderId);
      if (!res.ok) {
        return;
      }
      refreshLocal(orderId, { order_status: "processing", advance_paid: true });
    });
  }

  function handleGenerateTracking(orderId: string) {
    startTransition(async () => {
      const res = await generateTrackingAction(orderId);
      if (!res.ok) {
        return;
      }
      refreshLocal(orderId, {
        order_status: "dispatched",
        tracking_number: res.trackingNumber,
      });
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
      <section className="space-y-3 border-4 border-black bg-white p-4 shadow-hard">
        <h1 className="font-heading text-3xl">PENDING VERIFICATION</h1>
        {orders.length === 0 && <p className="text-sm font-bold text-gray-600">No pending orders.</p>}

        {orders.map((order) => (
          <button
            key={order.id}
            onClick={() => setSelectedId(order.id)}
            className={`w-full border-2 border-black p-3 text-left ${selectedId === order.id ? "bg-[var(--comic-purple)] text-white" : "bg-white"}`}
          >
            <p className="font-bold">{order.customer_name}</p>
            <p className="text-xs font-bold">{order.products?.brand} {order.products?.model}</p>
            <p className="text-xs">{new Date(order.created_at).toLocaleString()}</p>
          </button>
        ))}
      </section>

      <section className="border-4 border-black bg-white p-6 shadow-hard">
        {!selectedOrder ? (
          <p className="font-bold text-gray-600">Select an order to review.</p>
        ) : (
          <div className="space-y-5">
            <h2 className="font-heading text-4xl">ORDER REVIEW</h2>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2 border-2 border-black bg-gray-50 p-4">
                <p className="font-bold">{selectedOrder.customer_name}</p>
                <p className="text-sm font-bold">Phone: {selectedOrder.phone}</p>
                <p className="text-sm font-bold">City: {selectedOrder.city}</p>
                <p className="text-sm font-bold">Address: {selectedOrder.address}</p>
                <p className="text-sm font-bold">Payment: {selectedOrder.payment_method}</p>
                <p className="text-sm font-bold">Status: {selectedOrder.order_status}</p>
                {selectedOrder.tracking_number && (
                  <p className="text-sm font-bold">Tracking: {selectedOrder.tracking_number}</p>
                )}
              </div>

              <div className="flex items-center justify-center border-2 border-black bg-white p-3">
                {selectedOrder.receipt_image_url ? (
                  <div className="relative h-72 w-full border-2 border-black">
                    <Image
                      src={selectedOrder.receipt_image_url}
                      alt="Payment receipt"
                      fill
                      className="object-contain"
                    />
                  </div>
                ) : (
                  <p className="text-sm font-bold text-gray-600">No receipt image uploaded.</p>
                )}
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <button
                disabled={isBusy}
                onClick={() => handleApprove(selectedOrder.id)}
                className="flex items-center justify-center gap-2 border-2 border-black bg-green-500 px-4 py-3 font-bold text-white disabled:opacity-60"
              >
                <CheckCircle2 size={18} /> Approve Payment
              </button>

              <button
                disabled={isBusy}
                onClick={() => handleGenerateTracking(selectedOrder.id)}
                className="flex items-center justify-center gap-2 border-2 border-black bg-blue-500 px-4 py-3 font-bold text-white disabled:opacity-60"
              >
                <Truck size={18} /> Generate Tracking
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
