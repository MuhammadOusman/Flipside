"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  BarChart3,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Settings,
  ShoppingBag,
  Tag,
  X,
} from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin/dashboard" },
  { icon: Package, label: "Products", href: "/admin/products" },
  { icon: ShoppingBag, label: "Orders", href: "/admin/orders" },
  { icon: Tag, label: "Brands", href: "/admin/brands" },
  { icon: BarChart3, label: "Analytics", href: "/admin/analytics" },
  { icon: Settings, label: "Settings", href: "/admin/settings" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [email, setEmail] = useState("admin");

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    async function loadSession() {
      const { data } = await supabase.auth.getSession();
      const session = data.session;
      if (!session && pathname !== "/admin/login") {
        router.push("/admin/login");
      }
      if (session?.user?.email) {
        setEmail(session.user.email);
      }
    }

    void loadSession();
  }, [pathname, router]);

  const handleLogout = async () => {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
  };

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <aside
        className={`fixed left-0 top-0 z-50 h-full border-r-4 border-white bg-black text-white transition-all duration-300 ${
          sidebarOpen ? "w-64" : "w-20"
        }`}
      >
        <div className="flex items-center justify-between border-b-2 border-white/20 p-4">
          {sidebarOpen ? (
            <>
              <div className="flex items-center gap-3">
                <Image src="/logo.png" alt="Flipside" width={40} height={40} className="rounded-full border-2 border-white" />
                <div>
                  <h2 className="font-heading text-xl text-[var(--comic-red)]">FLIPSIDE</h2>
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

        <nav className="space-y-2 p-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <motion.div
                  className={`flex items-center gap-3 rounded p-3 transition ${
                    isActive ? "bg-[var(--comic-red)] text-white" : "hover:bg-white/10"
                  }`}
                  whileHover={{ x: 5 }}
                >
                  <Icon size={20} />
                  {sidebarOpen && <span className="font-bold">{item.label}</span>}
                </motion.div>
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 w-full border-t-2 border-white/20 p-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded p-3 transition hover:bg-red-600"
          >
            <LogOut size={20} />
            {sidebarOpen && <span className="font-bold">Logout</span>}
          </button>
        </div>
      </aside>

      <main className={`transition-all duration-300 ${sidebarOpen ? "ml-64" : "ml-20"}`}>
        <header className="sticky top-0 z-40 border-b-4 border-black bg-white p-4">
          <div className="flex items-center justify-between">
            <h1 className="font-heading text-2xl">
              {navItems.find((item) => item.href === pathname)?.label || "Admin Panel"}
            </h1>
            <div className="text-right">
              <p className="text-sm font-bold">Signed in</p>
              <p className="text-xs text-gray-600">{email}</p>
            </div>
          </div>
        </header>

        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
