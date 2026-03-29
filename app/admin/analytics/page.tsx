"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  Users,
  Eye,
  MousePointerClick,
  TrendingUp,
  ShoppingCart,
  CreditCard,
  BarChart3,
  Calendar,
} from "lucide-react";
import { useAnalytics } from "@/store/analytics";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#FF3333", "#6A0DAD", "#50C878", "#FBBF24", "#3B82F6"];

export default function AnalyticsPage() {
  const analytics = useAnalytics();
  const [data, setData] = useState<any>(null);
  const [timeRange, setTimeRange] = useState<"today" | "week" | "month">("week");

  useEffect(() => {
    setData(analytics.getAnalytics());
  }, []);

  // Mock traffic data for charts
  const trafficData = [
    { date: "Mon", visits: 245, pageViews: 892, uniqueVisitors: 189 },
    { date: "Tue", visits: 312, pageViews: 1024, uniqueVisitors: 245 },
    { date: "Wed", visits: 289, pageViews: 956, uniqueVisitors: 223 },
    { date: "Thu", visits: 401, pageViews: 1342, uniqueVisitors: 312 },
    { date: "Fri", visits: 478, pageViews: 1589, uniqueVisitors: 389 },
    { date: "Sat", visits: 523, pageViews: 1823, uniqueVisitors: 456 },
    { date: "Sun", visits: 445, pageViews: 1467, uniqueVisitors: 378 },
  ];

  const deviceData = [
    { name: "Mobile", value: 65 },
    { name: "Desktop", value: 28 },
    { name: "Tablet", value: 7 },
  ];

  const topPagesData = [
    { page: "Homepage", views: 3245, percentage: 32 },
    { page: "Shop", views: 2156, percentage: 21 },
    { page: "Product Pages", views: 1834, percentage: 18 },
    { page: "Checkout", views: 945, percentage: 9 },
    { page: "About", views: 734, percentage: 7 },
  ];

  const conversionData = [
    { stage: "Visits", count: 5234 },
    { stage: "Product Views", count: 3421 },
    { stage: "Add to Cart", count: 1567 },
    { stage: "Checkout", count: 945 },
    { stage: "Purchase", count: 623 },
  ];

  const stats = [
    {
      icon: Eye,
      label: "Page Views",
      value: data?.totalPageViews || "10.2K",
      change: "+23% vs last week",
      color: "bg-blue-500",
    },
    {
      icon: Users,
      label: "Unique Visitors",
      value: data?.totalVisitors || "3,421",
      change: "+15% vs last week",
      color: "bg-green-500",
    },
    {
      icon: MousePointerClick,
      label: "Total Clicks",
      value: "18.9K",
      change: "+18% vs last week",
      color: "bg-purple-500",
    },
    {
      icon: TrendingUp,
      label: "Bounce Rate",
      value: "32.5%",
      change: "-5% vs last week",
      color: "bg-orange-500",
    },
    {
      icon: ShoppingCart,
      label: "Cart Additions",
      value: "1,567",
      change: "+28% vs last week",
      color: "bg-pink-500",
    },
    {
      icon: CreditCard,
      label: "Conversions",
      value: "623",
      change: "+31% vs last week",
      color: "bg-red-500",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-4xl mb-2">ANALYTICS DASHBOARD</h1>
          <p className="text-gray-600 font-bold">
            Track store performance and customer behavior
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setTimeRange("today")}
            className={`px-4 py-2 border-2 border-black font-bold transition ${
              timeRange === "today"
                ? "bg-[--comic-purple] text-white"
                : "bg-white hover:bg-gray-100"
            }`}
          >
            TODAY
          </button>
          <button
            onClick={() => setTimeRange("week")}
            className={`px-4 py-2 border-2 border-black font-bold transition ${
              timeRange === "week"
                ? "bg-[--comic-purple] text-white"
                : "bg-white hover:bg-gray-100"
            }`}
          >
            WEEK
          </button>
          <button
            onClick={() => setTimeRange("month")}
            className={`px-4 py-2 border-2 border-black font-bold transition ${
              timeRange === "month"
                ? "bg-[--comic-purple] text-white"
                : "bg-white hover:bg-gray-100"
            }`}
          >
            MONTH
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              className="bg-white border-4 border-black shadow-hard p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 ${stat.color} border-2 border-black`}>
                  <Icon size={24} className="text-white" />
                </div>
              </div>
              <h3 className="text-3xl font-heading mb-1">{stat.value}</h3>
              <p className="text-sm text-gray-600 font-bold mb-2">
                {stat.label}
              </p>
              <p className="text-xs text-green-600 font-bold">{stat.change}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Traffic Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border-4 border-black shadow-hard p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <BarChart3 size={24} className="text-[--comic-purple]" />
          <h2 className="font-heading text-2xl">TRAFFIC OVERVIEW</h2>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={trafficData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#000" />
            <XAxis dataKey="date" stroke="#000" />
            <YAxis stroke="#000" />
            <Tooltip
              contentStyle={{
                border: "2px solid black",
                borderRadius: 0,
                fontWeight: "bold",
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="pageViews"
              stroke="#FF3333"
              strokeWidth={3}
              name="Page Views"
            />
            <Line
              type="monotone"
              dataKey="uniqueVisitors"
              stroke="#6A0DAD"
              strokeWidth={3}
              name="Unique Visitors"
            />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Device Distribution */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white border-4 border-black shadow-hard p-6"
        >
          <h2 className="font-heading text-2xl mb-6">DEVICE BREAKDOWN</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={deviceData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry: any) =>
                  `${entry.name} ${((entry.percent || 0) * 100).toFixed(0)}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                stroke="#000"
                strokeWidth={2}
              >
                {deviceData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  border: "2px solid black",
                  borderRadius: 0,
                  fontWeight: "bold",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Top Pages */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white border-4 border-black shadow-hard p-6"
        >
          <h2 className="font-heading text-2xl mb-6">TOP PAGES</h2>
          <div className="space-y-4">
            {topPagesData.map((page, index) => (
              <div key={page.page} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm">{page.page}</span>
                  <span className="font-bold text-sm">{page.views} views</span>
                </div>
                <div className="w-full h-3 bg-gray-200 border-2 border-black">
                  <div
                    className="h-full"
                    style={{
                      width: `${page.percentage}%`,
                      background: COLORS[index % COLORS.length],
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Conversion Funnel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border-4 border-black shadow-hard p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <TrendingUp size={24} className="text-[--comic-green]" />
          <h2 className="font-heading text-2xl">CONVERSION FUNNEL</h2>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={conversionData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#000" />
            <XAxis dataKey="stage" stroke="#000" />
            <YAxis stroke="#000" />
            <Tooltip
              contentStyle={{
                border: "2px solid black",
                borderRadius: 0,
                fontWeight: "bold",
              }}
            />
            <Bar dataKey="count" fill="#50C878" stroke="#000" strokeWidth={2}>
              {conversionData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-4 p-4 bg-green-50 border-2 border-black">
          <p className="font-bold text-sm mb-1">CONVERSION RATE</p>
          <p className="font-heading text-4xl text-[--comic-green]">
            11.9%
          </p>
          <p className="text-xs text-gray-600 font-bold mt-1">
            623 purchases from 5,234 visitors
          </p>
        </div>
      </motion.div>

      {/* Real-time Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-[--comic-red] to-[--comic-purple] border-4 border-black shadow-hard p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
          <h2 className="font-heading text-2xl text-white">
            REAL-TIME ACTIVITY
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white border-2 border-black p-4">
            <p className="text-sm font-bold text-gray-600 mb-1">
              ACTIVE USERS
            </p>
            <p className="font-heading text-3xl">47</p>
          </div>
          <div className="bg-white border-2 border-black p-4">
            <p className="text-sm font-bold text-gray-600 mb-1">
              PAGES/MIN
            </p>
            <p className="font-heading text-3xl">128</p>
          </div>
          <div className="bg-white border-2 border-black p-4">
            <p className="text-sm font-bold text-gray-600 mb-1">
              AVG. SESSION
            </p>
            <p className="font-heading text-3xl">4:23</p>
          </div>
          <div className="bg-white border-2 border-black p-4">
            <p className="text-sm font-bold text-gray-600 mb-1">
              ACTIVE CARTS
            </p>
            <p className="font-heading text-3xl">12</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
