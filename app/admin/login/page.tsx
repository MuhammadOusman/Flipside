"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Lock, User } from "lucide-react";
import ComicButton from "@/components/ComicButton";
import Image from "next/image";

export default function AdminLoginPage() {
  const router = useRouter();
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple auth (replace with real auth later)
    if (credentials.username === "admin" && credentials.password === "admin123") {
      localStorage.setItem("adminAuth", "true");
      router.push("/admin/dashboard");
    } else {
      setError("Invalid credentials! Try admin/admin123");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[--comic-red] via-[--comic-purple] to-black relative overflow-hidden">
      {/* Halftone Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle,_#ffffff10_1px,_transparent_1px)] bg-[size:20px_20px]" />

      <motion.div
        className="relative z-10 w-full max-w-md mx-4"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200 }}
      >
        <div className="bg-white border-4 border-black shadow-hard-lg p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <Image
              src="/logo.png"
              alt="Flipside"
              width={80}
              height={80}
              className="mx-auto mb-4 border-4 border-black rounded-full"
            />
            <h1 className="font-heading text-4xl mb-2">ADMIN LOGIN</h1>
            <p className="text-gray-600 font-bold">Inventory Management System</p>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              className="bg-red-100 border-2 border-[--comic-red] p-3 mb-4 text-center"
              initial={{ x: -10 }}
              animate={{ x: 0 }}
            >
              <p className="text-[--comic-red] font-bold text-sm">{error}</p>
            </motion.div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="flex items-center gap-2 font-bold mb-2">
                <User size={20} />
                Username
              </label>
              <input
                type="text"
                value={credentials.username}
                onChange={(e) =>
                  setCredentials({ ...credentials, username: e.target.value })
                }
                className="w-full px-4 py-3 border-4 border-black focus:outline-none focus:border-[--comic-red]"
                placeholder="admin"
                required
              />
            </div>

            <div>
              <label className="flex items-center gap-2 font-bold mb-2">
                <Lock size={20} />
                Password
              </label>
              <input
                type="password"
                value={credentials.password}
                onChange={(e) =>
                  setCredentials({ ...credentials, password: e.target.value })
                }
                className="w-full px-4 py-3 border-4 border-black focus:outline-none focus:border-[--comic-red]"
                placeholder="••••••••"
                required
              />
            </div>

            <ComicButton type="submit" size="lg" variant="primary" className="w-full">
              LOGIN
            </ComicButton>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 bg-yellow-100 border-2 border-black p-4 text-center">
            <p className="text-xs font-bold mb-1">DEMO CREDENTIALS:</p>
            <p className="text-sm">admin / admin123</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
