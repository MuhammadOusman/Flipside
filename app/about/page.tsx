"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Instagram, Phone, Mail } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ComicButton from "@/components/ComicButton";

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        {/* Hero */}
        <section className="bg-gradient-to-r from-[var(--comic-red)] to-[var(--comic-purple)] text-white py-20 border-b-4 border-black">
          <div className="container mx-auto px-4 text-center">
            <motion.h1
              className="font-heading text-6xl md:text-8xl mb-4 drop-shadow-[4px_4px_0px_rgba(0,0,0,1)]"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              ABOUT FLIPSIDE
            </motion.h1>
            <p className="text-xl font-bold max-w-2xl mx-auto">
              Pakistan&apos;s most trusted thrift shoe destination
            </p>
          </div>
        </section>

        {/* Our Story */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="font-heading text-5xl mb-6">OUR STORY</h2>
                <div className="space-y-4 text-gray-700">
                  <p>
                    Flipside started with a simple mission: make premium sneakers
                    accessible to everyone in Pakistan. We believe that everyone
                    deserves to rock fresh kicks without breaking the bank.
                  </p>
                  <p>
                    Every pair in our collection is carefully hand-picked,
                    authenticated, and cleaned to ensure you get the best quality
                    thrift shoes. From rare Jordans to classic Dunks, we&apos;ve got
                    your feet covered.
                  </p>
                  <p className="font-bold">
                    Each piece is 1-of-1 — when it&apos;s gone, it&apos;s gone! 🔥
                  </p>
                </div>
              </motion.div>

              <motion.div
                className="relative aspect-square border-4 border-black shadow-hard-lg bg-gradient-to-br from-yellow-300 to-blue-400"
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle,_#00000020_2px,_transparent_2px)] bg-[size:20px_20px]" />
                <Image
                  src="/logo.png"
                  alt="Flipside"
                  fill
                  className="object-contain p-12"
                />
              </motion.div>
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="bg-black text-white py-16 border-y-4 border-white">
          <div className="container mx-auto px-4">
            <h2 className="font-heading text-5xl md:text-7xl text-center mb-12">
              WHY CHOOSE US?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  icon: "✅",
                  title: "100% AUTHENTIC",
                  desc: "Every pair verified",
                },
                {
                  icon: "💰",
                  title: "BEST PRICES",
                  desc: "Unbeatable deals",
                },
                {
                  icon: "🚀",
                  title: "FAST DELIVERY",
                  desc: "3-5 days nationwide",
                },
                {
                  icon: "🔥",
                  title: "FRESH DROPS",
                  desc: "New stock weekly",
                },
              ].map((item, i) => (
                <motion.div
                  key={item.title}
                  className="border-4 border-white bg-black p-6 text-center"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="text-5xl mb-3">{item.icon}</div>
                  <h3 className="font-heading text-xl mb-2 text-[var(--comic-red)]">
                    {item.title}
                  </h3>
                  <p className="text-gray-300 text-sm">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact CTA */}
        <section className="py-20 bg-gradient-to-br from-yellow-300 via-pink-300 to-blue-400">
          <div className="container mx-auto px-4">
            <div className="bg-white border-4 border-black p-12 shadow-hard-lg max-w-3xl mx-auto text-center">
              <h2 className="font-heading text-5xl mb-6">GET IN TOUCH</h2>
              <p className="text-gray-700 mb-8">
                Have questions? Want to sell your kicks? Hit us up!
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <a
                  href="tel:+923001234567"
                  className="flex flex-col items-center gap-2 p-4 border-2 border-black hover:bg-gray-100 transition"
                >
                  <Phone size={32} className="text-[var(--comic-red)]" />
                  <span className="font-bold">+92 300 1234567</span>
                </a>
                <a
                  href="mailto:hello@flipside.pk"
                  className="flex flex-col items-center gap-2 p-4 border-2 border-black hover:bg-gray-100 transition"
                >
                  <Mail size={32} className="text-[var(--comic-purple)]" />
                  <span className="font-bold">hello@flipside.pk</span>
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-2 p-4 border-2 border-black hover:bg-gray-100 transition"
                >
                  <Instagram size={32} className="text-[var(--comic-red)]" />
                  <span className="font-bold">@flipside.pk</span>
                </a>
              </div>

              <ComicButton size="lg" variant="primary">
                <a href="https://wa.me/923001234567" target="_blank" rel="noopener noreferrer">
                  CHAT ON WHATSAPP
                </a>
              </ComicButton>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
