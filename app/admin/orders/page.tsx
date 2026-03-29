"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import {
  Search,
  Filter,
  ChevronDown,
  Eye,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";

type Order = {
  id: string;
  orderNumber: string;
  customer: {
    name: string;
    phone: string;
    email: string;
    address: string;
    city: string;
  };
  items: {
    name: string;
    size: string;
    price: number;
    quantity: number;
  }[];
  total: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  paymentMethod: string;
  date: string;
};

const mockOrders: Order[] = [
  {
    id: "1",
    orderNumber: "ORD-001",
    customer: {
      name: "Ali Hassan",
      phone: "+92 300 1234567",
      email: "ali@email.com",
      address: "Street 5, DHA Phase 2",
      city: "Lahore",
    },
    items: [
      {
        name: "Jordan 4 Military Black",
        size: "UK 9",
        price: 48000,
        quantity: 1,
      },
    ],
    total: 48000,
    status: "pending",
    paymentMethod: "Cash on Delivery",
    date: "2024-01-15",
  },
  {
    id: "2",
    orderNumber: "ORD-002",
    customer: {
      name: "Sara Khan",
      phone: "+92 321 9876543",
      email: "sara@email.com",
      address: "Block B, Bahria Town",
      city: "Karachi",
    },
    items: [
      { name: "Yeezy 350 Bred", size: "UK 8.5", price: 52000, quantity: 1 },
    ],
    total: 52000,
    status: "shipped",
    paymentMethod: "Cash on Delivery",
    date: "2024-01-14",
  },
  {
    id: "3",
    orderNumber: "ORD-003",
    customer: {
      name: "Ahmed Raza",
      phone: "+92 333 5555555",
      email: "ahmed@email.com",
      address: "F-10 Markaz",
      city: "Islamabad",
    },
    items: [
      { name: "Dunk Low Panda", size: "UK 10", price: 38000, quantity: 1 },
    ],
    total: 38000,
    status: "delivered",
    paymentMethod: "Cash on Delivery",
    date: "2024-01-12",
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
    icon: Clock,
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
  const [orders, setOrders] = useState(mockOrders);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const updateOrderStatus = (orderId: string, newStatus: Order["status"]) => {
    setOrders(
      orders.map((order) =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
  };

  const filteredOrders = orders.filter(
    (order) =>
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-heading text-4xl mb-2">ORDER MANAGEMENT</h1>
        <p className="text-gray-600 font-bold">Track and manage customer orders</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {Object.entries(statusConfig).map(([key, config]) => {
          const Icon = config.icon;
          const count = orders.filter((o) => o.status === key).length;
          return (
            <div
              key={key}
              className="bg-white border-2 border-black shadow-hard p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon size={20} className={config.color.split(" ")[2]} />
                <span className="font-bold text-sm">{config.label}</span>
              </div>
              <p className="font-heading text-3xl">{count}</p>
            </div>
          );
        })}
      </div>

      {/* Search & Filters */}
      <div className="bg-white border-4 border-black shadow-hard p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search by order ID or customer name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-[--comic-purple] font-bold"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-6 py-3 border-2 border-black font-bold hover:bg-gray-100 transition flex items-center gap-2"
          >
            <Filter size={20} />
            FILTERS
            <ChevronDown
              size={20}
              className={`transition-transform ${
                showFilters ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-4 pt-4 border-t-2 border-black"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <select className="px-4 py-2 border-2 border-black font-bold">
                  <option>All Statuses</option>
                  <option>Pending</option>
                  <option>Processing</option>
                  <option>Shipped</option>
                  <option>Delivered</option>
                  <option>Cancelled</option>
                </select>
                <select className="px-4 py-2 border-2 border-black font-bold">
                  <option>All Cities</option>
                  <option>Lahore</option>
                  <option>Karachi</option>
                  <option>Islamabad</option>
                </select>
                <select className="px-4 py-2 border-2 border-black font-bold">
                  <option>All Dates</option>
                  <option>Today</option>
                  <option>Last 7 Days</option>
                  <option>Last 30 Days</option>
                </select>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.map((order, index) => {
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
                    {order.customer.name} • {order.customer.city} •{" "}
                    {order.date}
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
                    className="p-3 bg-[--comic-purple] text-white border-2 border-black hover:bg-purple-700 transition"
                  >
                    <Eye size={20} />
                  </button>
                </div>
              </div>

              <div className="border-t-2 border-black pt-4">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-600 mb-2">
                      ITEMS
                    </p>
                    {order.items.map((item, i) => (
                      <p key={i} className="font-bold">
                        {item.quantity}x {item.name} ({item.size})
                      </p>
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

      {/* Order Detail Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setSelectedOrder(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white border-4 border-black shadow-hard p-8 z-50 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <h2 className="font-heading text-3xl mb-4">
                ORDER DETAILS: {selectedOrder.orderNumber}
              </h2>

              {/* Customer Info */}
              <div className="mb-6 p-4 border-2 border-black bg-gray-50">
                <h3 className="font-bold mb-2">CUSTOMER INFORMATION</h3>
                <p className="text-sm">
                  <strong>Name:</strong> {selectedOrder.customer.name}
                </p>
                <p className="text-sm">
                  <strong>Phone:</strong> {selectedOrder.customer.phone}
                </p>
                <p className="text-sm">
                  <strong>Email:</strong> {selectedOrder.customer.email}
                </p>
                <p className="text-sm">
                  <strong>Address:</strong> {selectedOrder.customer.address},{" "}
                  {selectedOrder.customer.city}
                </p>
              </div>

              {/* Items */}
              <div className="mb-6">
                <h3 className="font-bold mb-2">ITEMS</h3>
                {selectedOrder.items.map((item, i) => (
                  <div
                    key={i}
                    className="flex justify-between p-3 border-2 border-black mb-2"
                  >
                    <div>
                      <p className="font-bold">{item.name}</p>
                      <p className="text-sm text-gray-600">
                        Size: {item.size} • Qty: {item.quantity}
                      </p>
                    </div>
                    <p className="font-bold">
                      PKR {item.price.toLocaleString()}
                    </p>
                  </div>
                ))}
                <div className="flex justify-between p-3 border-2 border-black bg-gray-100">
                  <p className="font-heading text-xl">TOTAL</p>
                  <p className="font-heading text-xl">
                    PKR {selectedOrder.total.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Status Update */}
              <div className="mb-6">
                <h3 className="font-bold mb-2">UPDATE STATUS</h3>
                <select
                  value={selectedOrder.status}
                  onChange={(e) =>
                    updateOrderStatus(
                      selectedOrder.id,
                      e.target.value as Order["status"]
                    )
                  }
                  className="w-full px-4 py-3 border-2 border-black font-bold"
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <button
                onClick={() => setSelectedOrder(null)}
                className="w-full px-6 py-3 bg-black text-white border-2 border-black font-bold hover:bg-gray-800 transition"
              >
                CLOSE
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
