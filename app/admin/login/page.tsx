"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Lock, Mail } from "lucide-react";
import ComicButton from "@/components/ComicButton";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const router = useRouter();
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = getSupabaseBrowserClient();
    const { error: loginError } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    setLoading(false);

    if (loginError) {
      setError(loginError.message);
      return;
    }

    router.push("/admin/dashboard");
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-[var(--comic-red)] via-[var(--comic-purple)] to-black">
      <div className="absolute inset-0 bg-[radial-gradient(circle,_#ffffff10_1px,_transparent_1px)] bg-[size:20px_20px]" />

      <motion.div
        className="relative z-10 mx-4 w-full max-w-md"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200 }}
      >
        <div className="border-4 border-black bg-white p-8 shadow-hard-lg">
          <div className="mb-8 text-center">
            <Image
              src="/logo.png"
              alt="Flipside"
              width={80}
              height={80}
              className="mx-auto mb-4 rounded-full border-4 border-black"
            />
            <h1 className="font-heading text-4xl">ADMIN LOGIN</h1>
            <p className="font-bold text-gray-600">Supabase email/password protected</p>
          </div>

          {error && (
            <div className="mb-4 border-2 border-[var(--comic-red)] bg-red-100 p-3 text-center">
              <p className="text-sm font-bold text-[var(--comic-red)]">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block">
              <span className="mb-2 flex items-center gap-2 font-bold">
                <Mail size={18} /> Email
              </span>
              <input
                type="email"
                value={credentials.email}
                onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                className="w-full border-4 border-black px-4 py-3 focus:border-[var(--comic-red)] focus:outline-none"
                placeholder="admin@store.pk"
                required
              />
            </label>

            <label className="block">
              <span className="mb-2 flex items-center gap-2 font-bold">
                <Lock size={18} /> Password
              </span>
              <input
                type="password"
                value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                className="w-full border-4 border-black px-4 py-3 focus:border-[var(--comic-red)] focus:outline-none"
                placeholder="********"
                required
              />
            </label>

            <ComicButton type="submit" size="lg" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Login"}
            </ComicButton>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
