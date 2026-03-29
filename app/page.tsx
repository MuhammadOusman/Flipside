"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";
import ComicButton from "@/components/ComicButton";
import Footer from "@/components/Footer";
import SpeechBubble from "@/components/SpeechBubble";

// Mock data for demo (you'll replace this with Sanity data)
const mockProducts = [
  {
    id: "1",
    title: "Jordan 1 Retro High",
    brand: "Jordan",
    size: "9",
    price: 45000,
    image: "/logo.png",
    condition: 9,
    isSold: false,
    slug: "jordan-1-retro-high",
  },
  {
    id: "2",
    title: "Dunk Low Panda",
    brand: "Nike",
    size: "10",
    price: 38000,
    image: "/logo.png",
    condition: 8,
    isSold: false,
    slug: "dunk-low-panda",
  },
  {
    id: "3",
    title: "Yeezy 350 Bred",
    brand: "Yeezy",
    size: "8.5",
    price: 52000,
    image: "/logo.png",
    condition: 7,
    isSold: true,
    slug: "yeezy-350-bred",
  },
];

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        {/* Hero Section */}
        <section className="relative h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-yellow-400 via-red-500 to-purple-600">
          {/* Halftone Pattern Overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(circle,_#00000030_2px,_transparent_2px)] bg-[size:25px_25px]" />
          
          <div className="relative z-10 text-center px-4">
            <motion.h1
              className="font-heading text-7xl md:text-9xl text-white drop-shadow-[5px_5px_0px_rgba(0,0,0,1)]"
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
            >
              THRIFT SHOES
            </motion.h1>
            <motion.p
              className="text-2xl md:text-4xl font-bold text-white mt-4 drop-shadow-[3px_3px_0px_rgba(0,0,0,1)]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Jordans • Dunks • Yeezy
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mt-8"
            >
              <Link href="/shop">
                <ComicButton size="lg" variant="primary">
                  SHOP NOW
                </ComicButton>
              </Link>
            </motion.div>

            {/* Trust Badges */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="flex flex-wrap gap-4 justify-center mt-8"
            >
              {["✅ 100% LEGIT", "💰 COD", "🔥 FRESH WEEKLY"].map((badge) => (
                <div
                  key={badge}
                  className="bg-white text-black px-4 py-2 border-2 border-black font-bold text-sm"
                >
                  {badge}
                </div>
              ))}
            </motion.div>
          </div>

          {/* POW! Graphic */}
          <motion.div
            className="absolute top-20 right-20 hidden md:block"
            animate={{ rotate: [12, 15, 12] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <SpeechBubble text="POW!" variant="pow" />
          </motion.div>

          {/* ZAP! Graphic */}
          <motion.div
            className="absolute bottom-20 left-20 hidden md:block"
            animate={{ rotate: [-12, -15, -12] }}
            transition={{ repeat: Infinity, duration: 2.5 }}
          >
            <SpeechBubble text="ZAP!" variant="zap" />
          </motion.div>
          <div className="text-center mt-12">
            <Link href="/shop">
              <ComicButton size="lg" variant="secondary">
                VIEW ALL PRODUCTS
              </ComicButton>
            </Link>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="font-heading text-5xl md:text-7xl text-center mb-12">
              WHY FLIPSIDE?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  icon: "✅",
                  title: "100% AUTHENTIC",
                  desc: "Every pair is hand-picked and verified for authenticity",
                },
                {
                  icon: "💰",
                  title: "BEST PRICES",
                  desc: "Premium thrift shoes at unbeatable prices in Pakistan",
                },
                {
                  icon: "🚀",
                  title: "FAST DELIVERY",
                  desc: "Cash on Delivery available. Get your kicks in 3-5 days",
                },
              ].map((item, i) => (
                <motion.div
                  key={item.title}
                  className="border-4 border-black bg-white p-8 shadow-hard text-center"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.2 }}
                  whileHover={{ y: -5 }}
                >
                  <div className="text-6xl mb-4">{item.icon}</div>
                  <h3 className="font-heading text-2xl mb-2">{item.title}</h3>
                  <p className="text-gray-600">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Comic Panels - Categories */}
        <section className="bg-black text-white py-16 border-y-4 border-black">
          <div className="container mx-auto px-4">
            <h2 className="font-heading text-5xl md:text-7xl text-center mb-12">
              SHOP BY BRAND
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {["JORDANS", "DUNKS", "YEEZY"].map((category, i) => (
                <Link key={category} href={`/shop?brand=${category.toLowerCase()}`}>
                  <motion.div
                    className="relative h-64 bg-gradient-to-br from-[--comic-red] to-[--comic-purple] border-4 border-white shadow-hard-lg cursor-pointer overflow-hidden"
                    whileHover={{ scale: 1.05, rotate: i % 2 === 0 ? 2 : -2 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="absolute inset-0 bg-[radial-gradient(circle,_#ffffff20_1px,_transparent_1px)] bg-[size:20px_20px]" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="font-heading text-6xl text-white drop-shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                        {category}
                      </span>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-[--comic-red] to-[--comic-purple] border-y-4 border-black">
          <div className="container mx-auto px-4 text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <h2 className="font-heading text-5xl md:text-7xl text-white drop-shadow-[4px_4px_0px_rgba(0,0,0,1)] mb-4">
                NEW DROPS EVERY SUNDAY!
              </h2>
              <p className="text-xl text-white mb-8 font-bold">
                Follow us on Instagram to never miss a drop
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ComicButton size="lg" variant="secondary">
                    FOLLOW ON INSTAGRAM
                  </ComicButton>
                </a>
                <Link href="/shop">
                  <ComicButton size="lg" variant="danger">
                    SHOP NOW
                  </ComicButton>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        <Footer />
      </main>
    </>
  );
}
