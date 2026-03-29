"use client";

import { motion } from "framer-motion";
import {
  Package,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  AlertCircle,
  Eye,
  Users,
  MousePointerClick,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import Link from "next/link";

const stats = [
  {
    icon: Package,
    label: "Total Products",
    value: "156",
    change: "+12",
    changeLabel: "this week",
    trend: "up",
    color: "bg-blue-500",
  },
  {
    icon: ShoppingBag,
    label: "Total Orders",
    value: "89",
    change: "+23",
    changeLabel: "this month",
    trend: "up",
    color: "bg-green-500",
  },
  {
    icon: DollarSign,
    label: "Revenue",
    value: "PKR 2.4M",
    change: "+15%",
    changeLabel: "vs last month",
    trend: "up",
    color: "bg-purple-500",
  },
  {
    icon: TrendingUp,
    label: "Avg. Order Value",
    value: "PKR 27K",
    change: "+8%",
    changeLabel: "vs last month",
    trend: "up",
    color: "bg-orange-500",
  },
  {
    icon: Users,
    label: "Store Visitors",
    value: "3,421",
    change: "+18%",
    changeLabel: "this week",
    trend: "up",
    color: "bg-pink-500",
  },
  {
    icon: MousePointerClick,
    label: "Conversion Rate",
    value: "11.9%",
    change: "+2.3%",
    changeLabel: "vs last week",
    trend: "up",
    color: "bg-indigo-500",
  },
];

const lowStockItems = [
  { name: "Jordan 1 Retro High", stock: 2, size: "UK 9" },
  { name: "Yeezy 350 Bred", stock: 1, size: "UK 8.5" },
  { name: "Dunk Low Panda", stock: 3, size: "UK 10" },
];

const recentOrders = [
  {
    id: "ORD-001",
    customer: "Ali Hassan",
    product: "Jordan 4 Military",
    amount: "PKR 48,000",
    status: "Pending",
  },
  {
    id: "ORD-002",
    customer: "Sara Khan",
    product: "Yeezy 350",
    amount: "PKR 52,000",
    status: "Shipped",
  },
  {
    id: "ORD-003",
    customer: "Ahmed Raza",
    product: "Dunk Low",
    amount: "PKR 38,000",
    status: "Delivered",
  },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-heading text-4xl mb-2">DASHBOARD</h1>
        <p className="text-gray-600 font-bold">
          Welcome back! Here's your store overview
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const TrendIcon = stat.trend === "up" ? ArrowUp : ArrowDown;
          return (
            <motion.div
              key={stat.label}
              className="bg-white border-4 border-black shadow-hard p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 ${stat.color} border-2 border-black`}>
                  <Icon size={24} className="text-white" />
                </div>
                <div
                  className={`flex items-center gap-1 px-2 py-1 border-2 border-black text-xs font-bold ${
                    stat.trend === "up"
                      ? "bg-green-100 text-green-600"
                      : "bg-red-100 text-red-600"
                  }`}
                >
                  <TrendIcon size={14} />
                  {stat.change}
                </div>
              </div>
              <h3 className="text-3xl font-heading mb-1">{stat.value}</h3>
              <p className="text-sm text-gray-600 font-bold mb-2">
                {stat.label}
              </p>
              <p className="text-xs text-gray-500 font-bold">
                {stat.changeLabel}
              </p>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Alert */}
        <motion.div
          className="bg-white border-4 border-black shadow-hard p-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle size={24} className="text-[--comic-red]" />
            <h2 className="font-heading text-2xl">LOW STOCK ALERT</h2>
          </div>
          <div className="space-y-3">
            {lowStockItems.map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between p-3 border-2 border-black bg-red-50"
              >
                <div>
                  <p className="font-bold">{item.name}</p>
                  <p className="text-sm text-gray-600">Size: {item.size}</p>
                </div>
                <div className="text-right">
                  <p className="font-heading text-2xl text-[--comic-red]">
                    {item.stock}
                  </p>
                  <p className="text-xs text-gray-600">units left</p>
                </div>
              </div>
            ))}
          </div>
          <Link href="/admin/products">
            <button className="mt-4 w-full bg-[--comic-red] text-white py-2 border-2 border-black font-bold hover:bg-red-600 transition">
              MANAGE INVENTORY
            </button>
          </Link>
        </motion.div>

        {/* Recent Orders */}
        <motion.div
          className="bg-white border-4 border-black shadow-hard p-6"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <ShoppingBag size={24} className="text-[--comic-purple]" />
            <h2 className="font-heading text-2xl">RECENT ORDERS</h2>
          </div>
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between p-3 border-2 border-black hover:bg-gray-50 transition"
              >
                <div className="flex-1">
                  <p className="font-bold text-sm">{order.id}</p>
                  <p className="text-xs text-gray-600">{order.customer}</p>
                  <p className="text-xs text-gray-600">{order.product}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm">{order.amount}</p>
                  <span
                    className={`text-xs px-2 py-1 border ${
                      order.status === "Delivered"
                        ? "bg-green-100 border-green-600 text-green-600"
                        : order.status === "Shipped"
                        ? "bg-blue-100 border-blue-600 text-blue-600"
                        : "bg-yellow-100 border-yellow-600 text-yellow-600"
                    }`}
                  >
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <Link href="/admin/orders">
            <button className="mt-4 w-full bg-[--comic-purple] text-white py-2 border-2 border-black font-bold hover:bg-purple-700 transition flex items-center justify-center gap-2">
              <Eye size={18} />
              VIEW ALL ORDERS
            </button>
          </Link>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        className="bg-gradient-to-r from-[--comic-red] to-[--comic-purple] border-4 border-black shadow-hard p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="font-heading text-3xl text-white mb-4">
          QUICK ACTIONS
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/admin/products/new">
            <button className="w-full bg-white text-black py-4 border-4 border-black font-heading text-xl hover:scale-105 transition">
              + ADD PRODUCT
            </button>
          </Link>
          <Link href="/admin/orders">
            <button className="w-full bg-white text-black py-4 border-4 border-black font-heading text-xl hover:scale-105 transition">
              📦 MANAGE ORDERS
            </button>
          </Link>
          <Link href="/">
            <button className="w-full bg-white text-black py-4 border-4 border-black font-heading text-xl hover:scale-105 transition">
              👁️ VIEW STORE
            </button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
