"use client";

import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import {
  Users,
  Eye,
  MousePointerClick,
  TrendingUp,
  ShoppingCart,
  CreditCard,
  BarChart3,
} from "lucide-react";
import { useAnalytics } from "@/store/analytics";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
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
  const data = useMemo(() => analytics.getAnalytics(), [analytics]);
  const [timeRange, setTimeRange] = useState<"today" | "week" | "month">("week");

  const hasAnalytics = data.totalEvents > 0;

  const pageViewEvents = useMemo(
    () => analytics.events.filter((event) => event.type === "page_view"),
    [analytics.events]
  );

  const cartAddEvents = useMemo(
    () => analytics.events.filter((event) => event.type === "cart_add"),
    [analytics.events]
  );

  const checkoutEvents = useMemo(
    () => analytics.events.filter((event) => event.type === "checkout_start"),
    [analytics.events]
  );

  const purchaseEvents = useMemo(
    () => analytics.events.filter((event) => event.type === "purchase"),
    [analytics.events]
  );

  const trafficData = useMemo(() => {
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    const formatDay = (timestamp: number) =>
      new Date(timestamp).toLocaleDateString("en-US", { weekday: "short" });

    const bucketMap = new Map<string, { date: string; visits: number; pageViews: number; uniqueVisitors: number; visitors: Set<string> }>();
    for (let i = 6; i >= 0; i--) {
      const ts = now - i * dayMs;
      const date = formatDay(ts);
      bucketMap.set(date, {
        date,
        visits: 0,
        pageViews: 0,
        uniqueVisitors: 0,
        visitors: new Set(),
      });
    }

    pageViewEvents.forEach((event) => {
      const day = formatDay(event.timestamp);
      const bucket = bucketMap.get(day);
      if (!bucket) return;

      bucket.visits += 1;
      bucket.pageViews += 1;
      const visitorId = String(event.data?.visitorId || "unknown");
      bucket.visitors.add(visitorId);
    });

    return Array.from(bucketMap.values()).map((bucket) => ({
      date: bucket.date,
      visits: bucket.visits,
      pageViews: bucket.pageViews,
      uniqueVisitors: bucket.visitors.size,
    }));
  }, [pageViewEvents]);

  const topPagesData = useMemo(
    () =>
      data.topPages.map(([page, views]) => ({
        page,
        views,
        percentage:
          data.totalPageViews > 0
            ? Math.round((views / data.totalPageViews) * 100)
            : 0,
      })),
    [data.topPages, data.totalPageViews]
  );

  const conversionData = useMemo(
    () => [
      { stage: "Visits", count: data.totalPageViews },
      { stage: "Product Views", count: data.totalProductViews },
      { stage: "Add to Cart", count: cartAddEvents.length },
      { stage: "Checkout", count: checkoutEvents.length },
      { stage: "Purchase", count: purchaseEvents.length },
    ],
    [data.totalPageViews, data.totalProductViews, cartAddEvents.length, checkoutEvents.length, purchaseEvents.length]
  );

  const recentActivity = useMemo(() => {
    const now = Date.now();
    const tenMinutes = 10 * 60 * 1000;
    const recent = analytics.events.filter((event) => now - event.timestamp < tenMinutes);
    const activeUsers = new Set(
      recent
        .filter((event) => event.data?.visitorId)
        .map((event) => String(event.data?.visitorId))
    ).size;
    const pageViewsPerMin = Math.round(
      (recent.filter((event) => event.type === "page_view").length / 10) * 100
    ) / 100;

    return {
      activeUsers,
      pagesPerMin: pageViewsPerMin,
      activeCarts: recent.filter((event) => event.type === "cart_add").length,
      avgSession: "n/a",
    };
  }, [analytics.events]);

  const stats = [
    {
      icon: Eye,
      label: "Page Views",
      value: data.totalPageViews,
      change: hasAnalytics ? `${data.todayViews} today` : "No data yet",
      color: "bg-blue-500",
    },
    {
      icon: Users,
      label: "Unique Visitors",
      value: data.totalVisitors,
      change: hasAnalytics ? `${data.returningVisitors} returning` : "No data yet",
      color: "bg-green-500",
    },
    {
      icon: MousePointerClick,
      label: "Product Views",
      value: data.totalProductViews,
      change: hasAnalytics ? `${cartAddEvents.length} cart adds` : "No data yet",
      color: "bg-purple-500",
    },
    {
      icon: ShoppingCart,
      label: "Cart Adds",
      value: cartAddEvents.length,
      change: hasAnalytics ? "Tracked live" : "No data yet",
      color: "bg-pink-500",
    },
    {
      icon: TrendingUp,
      label: "Checkouts",
      value: checkoutEvents.length,
      change: hasAnalytics ? "Tracked live" : "No data yet",
      color: "bg-orange-500",
    },
    {
      icon: CreditCard,
      label: "Purchases",
      value: purchaseEvents.length,
      change: hasAnalytics ? "Tracked live" : "No data yet",
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
                ? "bg-[var(--comic-purple)] text-white"
                : "bg-white hover:bg-gray-100"
            }`}
          >
            TODAY
          </button>
          <button
            onClick={() => setTimeRange("week")}
            className={`px-4 py-2 border-2 border-black font-bold transition ${
              timeRange === "week"
                ? "bg-[var(--comic-purple)] text-white"
                : "bg-white hover:bg-gray-100"
            }`}
          >
            WEEK
          </button>
          <button
            onClick={() => setTimeRange("month")}
            className={`px-4 py-2 border-2 border-black font-bold transition ${
              timeRange === "month"
                ? "bg-[var(--comic-purple)] text-white"
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

      {!hasAnalytics ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-yellow-50 border-4 border-black shadow-hard p-6"
        >
          <h2 className="font-heading text-3xl mb-3">No analytics data yet</h2>
          <p className="text-gray-700 font-bold mb-4">
            Browse the storefront and interact with products to populate analytics charts. This page now reflects real event data instead of dummy values.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white border-2 border-black p-4">
              <p className="text-sm font-bold text-gray-600 mb-1">Page Views</p>
              <p className="font-heading text-3xl">0</p>
            </div>
            <div className="bg-white border-2 border-black p-4">
              <p className="text-sm font-bold text-gray-600 mb-1">Unique Visitors</p>
              <p className="font-heading text-3xl">0</p>
            </div>
          </div>
        </motion.div>
      ) : (
        <>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border-4 border-black shadow-hard p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <BarChart3 size={24} className="text-[var(--comic-purple)]" />
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
            <motion.div
              initial={{ opacity: 0, x: -20 }}
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

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white border-4 border-black shadow-hard p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <TrendingUp size={24} className="text-[var(--comic-green)]" />
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
                <p className="font-bold text-sm mb-1">CONVERSION TREND</p>
                <p className="font-heading text-4xl text-[var(--comic-green)]">
                  {conversionData.length > 0 ? `${Math.round((purchaseEvents.length / Math.max(data.totalPageViews, 1)) * 100)}%` : "0%"}
                </p>
                <p className="text-xs text-gray-600 font-bold mt-1">
                  {purchaseEvents.length} purchases from {data.totalPageViews} page views
                </p>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-[var(--comic-red)] to-[var(--comic-purple)] border-4 border-black shadow-hard p-6"
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
                <p className="font-heading text-3xl">{recentActivity.activeUsers}</p>
              </div>
              <div className="bg-white border-2 border-black p-4">
                <p className="text-sm font-bold text-gray-600 mb-1">
                  PAGES/MIN
                </p>
                <p className="font-heading text-3xl">{recentActivity.pagesPerMin}</p>
              </div>
              <div className="bg-white border-2 border-black p-4">
                <p className="text-sm font-bold text-gray-600 mb-1">
                  AVG. SESSION
                </p>
                <p className="font-heading text-3xl">{recentActivity.avgSession}</p>
              </div>
              <div className="bg-white border-2 border-black p-4">
                <p className="text-sm font-bold text-gray-600 mb-1">
                  ACTIVE CARTS
                </p>
                <p className="font-heading text-3xl">{recentActivity.activeCarts}</p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
}
