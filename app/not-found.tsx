"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ComicButton from "@/components/ComicButton";
import SpeechBubble from "@/components/SpeechBubble";

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-300 via-pink-400 to-blue-500 relative overflow-hidden">
        {/* Halftone Background */}
        <div className="absolute inset-0 bg-[radial-gradient(circle,_#00000020_2px,_transparent_2px)] bg-[size:25px_25px]" />

        <div className="relative z-10 text-center px-4">
          {/* 404 */}
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="mb-8"
          >
            <h1 className="font-heading text-[150px] md:text-[250px] leading-none text-white drop-shadow-[8px_8px_0px_rgba(0,0,0,1)]">
              404
            </h1>
          </motion.div>

          {/* Speech Bubble */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8"
          >
            <SpeechBubble text="OOPS!" variant="boom" />
          </motion.div>

          {/* Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white border-4 border-black p-8 shadow-hard-lg max-w-md mx-auto mb-8"
          >
            <h2 className="font-heading text-3xl mb-4">PAGE NOT FOUND!</h2>
            <p className="text-gray-700 mb-6">
              Looks like this page took a wrong turn. Let&apos;s get you back to
              hunting for fresh kicks!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/">
                <ComicButton size="lg" variant="primary">
                  GO HOME
                </ComicButton>
              </Link>
              <Link href="/shop">
                <ComicButton size="lg" variant="secondary">
                  SHOP NOW
                </ComicButton>
              </Link>
            </div>
          </motion.div>

          {/* Decorative Elements */}
          <motion.div
            className="absolute top-20 left-10 hidden md:block"
            animate={{ rotate: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 3 }}
          >
            <div className="font-heading text-5xl text-[--comic-red] bg-white border-4 border-black px-6 py-3 rotate-12 shadow-hard-lg">
              LOST?
            </div>
          </motion.div>

          <motion.div
            className="absolute bottom-20 right-10 hidden md:block"
            animate={{ rotate: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 3.5 }}
          >
            <div className="font-heading text-5xl text-[--comic-purple] bg-white border-4 border-black px-6 py-3 -rotate-12 shadow-hard-lg">
              UH OH!
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </>
  );
}
