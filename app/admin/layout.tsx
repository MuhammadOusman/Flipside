"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Settings,
  LogOut,
  Menu,
  X,
  BarChart3,
  Tag,
} from "lucide-react";
import { useState } from "react";
import Image from "next/image";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin/dashboard" },
  { icon: Package, label: "Products", href: "/admin/products" },
  { icon: ShoppingBag, label: "Orders", href: "/admin/orders" },
  { icon: Tag, label: "Brands", href: "/admin/brands" },
  { icon: BarChart3, label: "Analytics", href: "/admin/analytics" },
  { icon: Settings, label: "Settings", href: "/admin/settings" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const isAuth = localStorage.getItem("adminAuth");
    if (!isAuth && pathname !== "/admin/login") {
      router.push("/admin/login");
    }
  }, [pathname, router]);

  const handleLogout = () => {
    localStorage.removeItem("adminAuth");
    router.push("/admin/login");
  };

  if (pathname === "/admin/login") {
    return children;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-black text-white border-r-4 border-white transition-all duration-300 z-50 ${
          sidebarOpen ? "w-64" : "w-20"
        }`}
      >
        {/* Logo */}
        <div className="p-4 border-b-2 border-white/20 flex items-center justify-between">
          {sidebarOpen ? (
            <>
              <div className="flex items-center gap-3">
                <Image
                  src="/logo.png"
                  alt="Flipside"
                  width={40}
                  height={40}
                  className="border-2 border-white rounded-full"
                />
                <div>
                  <h2 className="font-heading text-xl text-[--comic-red]">
                    FLIPSIDE
                  </h2>
                  <p className="text-xs text-gray-400">Admin Panel</p>
                </div>
              </div>
              <button onClick={() => setSidebarOpen(false)}>
                <X size={20} />
              </button>
            </>
          ) : (
            <button onClick={() => setSidebarOpen(true)} className="mx-auto">
              <Menu size={24} />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <motion.div
                  className={`flex items-center gap-3 p-3 rounded transition ${
                    isActive
                      ? "bg-[--comic-red] text-white"
                      : "hover:bg-white/10"
                  }`}
                  whileHover={{ x: 5 }}
                >
                  <Icon size={20} />
                  {sidebarOpen && (
                    <span className="font-bold">{item.label}</span>
                  )}
                </motion.div>
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="absolute bottom-0 w-full p-4 border-t-2 border-white/20">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 p-3 rounded hover:bg-red-600 transition w-full"
          >
            <LogOut size={20} />
            {sidebarOpen && <span className="font-bold">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={`transition-all duration-300 ${
          sidebarOpen ? "ml-64" : "ml-20"
        }`}
      >
        {/* Top Bar */}
        <header className="bg-white border-b-4 border-black p-4 sticky top-0 z-40">
          <div className="flex items-center justify-between">
            <h1 className="font-heading text-2xl">
              {navItems.find((item) => item.href === pathname)?.label ||
                "Admin Panel"}
            </h1>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="font-bold text-sm">Admin User</p>
                <p className="text-xs text-gray-600">admin@flipside.pk</p>
              </div>
              <div className="w-10 h-10 bg-[--comic-red] border-2 border-black rounded-full flex items-center justify-center text-white font-bold">
                A
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
