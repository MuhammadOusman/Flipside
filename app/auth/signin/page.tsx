"use client";

import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import { Chrome } from "lucide-react";
import Image from "next/image";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[--comic-red] via-[--comic-purple] to-[--comic-green] p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white border-4 border-black shadow-hard p-8 max-w-md w-full"
      >
        <div className="text-center mb-8">
          <div className="mb-4 flex justify-center">
            <div className="w-24 h-24 bg-gradient-to-br from-[--comic-red] to-[--comic-purple] border-4 border-black flex items-center justify-center">
              <span className="font-heading text-4xl text-white">F</span>
            </div>
          </div>
          <h1 className="font-heading text-4xl mb-2">WELCOME BACK!</h1>
          <p className="text-gray-600 font-bold">
            Sign in to access your wishlist and orders
          </p>
        </div>

        <button
          onClick={() => signIn("google", { callbackUrl: "/" })}
          className="w-full bg-white text-black px-6 py-4 border-4 border-black shadow-hard font-bold text-lg hover:scale-105 transition flex items-center justify-center gap-3"
        >
          <Chrome size={24} className="text-[--comic-red]" />
          SIGN IN WITH GOOGLE
        </button>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-600 font-bold">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>

        <div className="mt-6 p-4 bg-gradient-to-r from-yellow-100 to-orange-100 border-2 border-black">
          <p className="text-xs font-bold text-center">
            🔒 Secure authentication powered by Google OAuth
          </p>
        </div>
      </motion.div>
    </div>
  );
}
