"use client";

import { motion } from "framer-motion";
import { Mail } from "lucide-react";
import { useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    setError(null);
    setMessage(null);

    if (!email) {
      setError("Enter your email first.");
      return;
    }

    setLoading(true);
    const supabase = getSupabaseBrowserClient();
    const { error: signInError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });
    setLoading(false);

    if (signInError) {
      setError(signInError.message);
      return;
    }

    setMessage("Check your email for the magic link.");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[var(--comic-red)] via-[var(--comic-purple)] to-[var(--comic-green)] p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white border-4 border-black shadow-hard p-8 max-w-md w-full"
      >
        <div className="text-center mb-8">
          <div className="mb-4 flex justify-center">
            <div className="w-24 h-24 bg-gradient-to-br from-[var(--comic-red)] to-[var(--comic-purple)] border-4 border-black flex items-center justify-center">
              <span className="font-heading text-4xl text-white">F</span>
            </div>
          </div>
          <h1 className="font-heading text-4xl mb-2">WELCOME BACK!</h1>
          <p className="text-gray-600 font-bold">
            Sign in to access your wishlist and orders
          </p>
        </div>

        <div className="space-y-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full border-4 border-black px-4 py-3 font-bold"
          />
          <button
            onClick={handleSignIn}
            disabled={loading}
            className="w-full bg-white text-black px-6 py-4 border-4 border-black shadow-hard font-bold text-lg hover:scale-105 transition flex items-center justify-center gap-3 disabled:opacity-60"
          >
            <Mail size={24} className="text-[var(--comic-red)]" />
            {loading ? "SENDING..." : "SEND MAGIC LINK"}
          </button>
        </div>

        {message && (
          <div className="mt-4 border-2 border-black bg-green-100 p-3 text-sm font-bold text-green-700">
            {message}
          </div>
        )}

        {error && (
          <div className="mt-4 border-2 border-black bg-red-100 p-3 text-sm font-bold text-red-700">
            {error}
          </div>
        )}

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-600 font-bold">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>

        <div className="mt-6 p-4 bg-gradient-to-r from-yellow-100 to-orange-100 border-2 border-black">
          <p className="text-xs font-bold text-center">
            Secure authentication powered by Supabase magic links
          </p>
        </div>
      </motion.div>
    </div>
  );
}
