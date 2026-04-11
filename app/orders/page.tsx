"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Package, Eye, Clock, CheckCircle, XCircle, Truck } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/components/AuthProvider";

type Order = {
  id: string;
  orderNumber: string;
  date: string;
  total: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  items: {
    name: string;
    size: string;
    price: number;
    quantity: number;
    image: string;
  }[];
};

const mockOrders: Order[] = [
  {
    id: "1",
    orderNumber: "ORD-20260105-001",
    date: "2026-01-05",
    total: 48000,
    status: "processing",
    items: [
      {
        name: "Jordan 4 Military Black",
        size: "EU 42",
        price: 48000,
        quantity: 1,
        image: "/shoes/jordan-4.jpg",
      },
    ],
  },
  {
    id: "2",
    orderNumber: "ORD-20260103-002",
    date: "2026-01-03",
    total: 52000,
    status: "shipped",
    items: [
      {
        name: "Yeezy 350 Bred",
        size: "EU 41",
        price: 52000,
        quantity: 1,
        image: "/shoes/yeezy-350.jpg",
      },
    ],
  },
  {
    id: "3",
    orderNumber: "ORD-20251228-003",
    date: "2025-12-28",
    total: 38000,
    status: "delivered",
    items: [
      {
        name: "Dunk Low Panda",
        size: "EU 43",
        price: 38000,
        quantity: 1,
        image: "/shoes/dunk-panda.jpg",
      },
    ],
  },
];

const statusConfig = {
  pending: {
    label: "Pending",
    icon: Clock,
    color: "bg-yellow-100 border-yellow-600 text-yellow-600",
  },
  processing: {
    label: "Processing",
    icon: Package,
    color: "bg-blue-100 border-blue-600 text-blue-600",
  },
  shipped: {
    label: "Shipped",
    icon: Truck,
    color: "bg-purple-100 border-purple-600 text-purple-600",
  },
  delivered: {
    label: "Delivered",
    icon: CheckCircle,
    color: "bg-green-100 border-green-600 text-green-600",
  },
  cancelled: {
    label: "Cancelled",
    icon: XCircle,
    color: "bg-red-100 border-red-600 text-red-600",
  },
};

export default function OrdersPage() {
  const { session, loading } = useAuth();
  const router = useRouter();
  const [orders] = useState(mockOrders);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (!loading && !session) {
      router.push("/auth/signin");
    }
  }, [loading, session, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-bounce font-heading text-4xl">LOADING...</div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-white">
        {/* Header */}
        <div className="bg-gradient-to-r from-[var(--comic-purple)] to-[var(--comic-green)] border-b-4 border-black p-6">
          <div className="max-w-7xl mx-auto">
            <h1 className="font-heading text-5xl text-white mb-2 flex items-center gap-3">
              <Package size={48} />
              MY ORDERS
            </h1>
            <p className="text-white font-bold">
              Track your purchases • {orders.length} total orders
            </p>
          </div>
        </div>

      <div className="max-w-7xl mx-auto p-6">
        {orders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <Package size={80} className="mx-auto mb-6 text-gray-300" />
            <h2 className="font-heading text-3xl mb-4">NO ORDERS YET</h2>
            <p className="text-gray-600 font-bold mb-8">
              Start shopping and your orders will appear here!
            </p>
            <Link href="/shop">
              <button className="bg-[var(--comic-green)] text-white px-8 py-4 border-4 border-black shadow-hard font-heading text-xl hover:scale-105 transition">
                START SHOPPING
              </button>
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {orders.map((order, index) => {
              const statusInfo = statusConfig[order.status];
              const StatusIcon = statusInfo.icon;

              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white border-4 border-black shadow-hard p-6"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    <div>
                      <h3 className="font-heading text-2xl mb-1">
                        {order.orderNumber}
                      </h3>
                      <p className="text-sm text-gray-600 font-bold">
                        Placed on {new Date(order.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`px-4 py-2 border-2 border-black font-bold flex items-center gap-2 ${statusInfo.color}`}
                      >
                        <StatusIcon size={16} />
                        {statusInfo.label}
                      </span>
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="p-3 bg-[var(--comic-purple)] text-white border-2 border-black hover:bg-purple-700 transition"
                      >
                        <Eye size={20} />
                      </button>
                    </div>
                  </div>

                  <div className="border-t-2 border-black pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-bold text-gray-600 mb-2">
                          ITEMS
                        </p>
                        {order.items.map((item, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-3 mb-2"
                          >
                            <div className="w-16 h-16 border-2 border-black bg-gradient-to-br from-gray-300 to-gray-400" />
                            <div>
                              <p className="font-bold text-sm">{item.name}</p>
                              <p className="text-xs text-gray-600">
                                Size: {item.size} • Qty: {item.quantity}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-gray-600 mb-2">
                          TOTAL
                        </p>
                        <p className="font-heading text-3xl">
                          PKR {order.total.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => setSelectedOrder(null)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white border-4 border-black shadow-hard p-8 z-50 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <h2 className="font-heading text-3xl mb-4">ORDER DETAILS</h2>
            <p className="font-bold mb-6">{selectedOrder.orderNumber}</p>

            <div className="space-y-4 mb-6">
              {selectedOrder.items.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 p-4 border-2 border-black"
                >
                  <div className="w-20 h-20 border-2 border-black bg-gradient-to-br from-gray-300 to-gray-400" />
                  <div className="flex-1">
                    <p className="font-bold">{item.name}</p>
                    <p className="text-sm text-gray-600">Size: {item.size}</p>
                  </div>
                  <p className="font-bold">
                    PKR {item.price.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>

            <div className="border-t-2 border-black pt-4 mb-6">
              <div className="flex justify-between font-heading text-2xl">
                <span>TOTAL</span>
                <span>PKR {selectedOrder.total.toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={() => setSelectedOrder(null)}
              className="w-full bg-black text-white px-6 py-3 border-2 border-black font-bold hover:bg-gray-800 transition"
            >
              CLOSE
            </button>
          </motion.div>
        </>
      )}
      </div>
      <Footer />
    </>
  );
}
