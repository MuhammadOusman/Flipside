"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Instagram, Facebook, Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-black text-white border-t-4 border-white">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <Image
              src="/logo.png"
              alt="Flipside"
              width={80}
              height={80}
              className="border-4 border-white rounded-full mb-4"
            />
            <p className="font-bold text-lg mb-2">FLIPSIDE</p>
            <p className="text-gray-400 text-sm">
              Pakistan&apos;s #1 thrift shoe store. Fresh kicks, unbeatable prices.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-heading text-2xl mb-4 text-[--comic-red]">
              QUICK LINKS
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="hover:text-[--comic-red] transition">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/shop" className="hover:text-[--comic-red] transition">
                  Shop
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-[--comic-red] transition">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[--comic-red] transition">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-heading text-2xl mb-4 text-[--comic-red]">
              CATEGORIES
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/shop?brand=jordan" className="hover:text-[--comic-red] transition">
                  Jordans
                </Link>
              </li>
              <li>
                <Link href="/shop?brand=nike" className="hover:text-[--comic-red] transition">
                  Nike Dunks
                </Link>
              </li>
              <li>
                <Link href="/shop?brand=yeezy" className="hover:text-[--comic-red] transition">
                  Yeezy
                </Link>
              </li>
              <li>
                <Link href="/shop?brand=new-balance" className="hover:text-[--comic-red] transition">
                  New Balance
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-heading text-2xl mb-4 text-[--comic-red]">
              CONTACT US
            </h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2">
                <Phone size={18} className="text-[--comic-red]" />
                <a href="tel:+923001234567" className="hover:text-[--comic-red] transition">
                  +92 300 1234567
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={18} className="text-[--comic-red]" />
                <a href="mailto:hello@flipside.pk" className="hover:text-[--comic-red] transition">
                  hello@flipside.pk
                </a>
              </li>
              <li className="flex items-center gap-2">
                <MapPin size={18} className="text-[--comic-red]" />
                <span>Karachi, Pakistan</span>
              </li>
            </ul>

            {/* Social Links */}
            <div className="flex gap-3 mt-4">
              <motion.a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-white text-black border-2 border-white hover:bg-[--comic-red] hover:text-white transition"
                whileHover={{ scale: 1.1, rotate: 5 }}
              >
                <Instagram size={20} />
              </motion.a>
              <motion.a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-white text-black border-2 border-white hover:bg-[--comic-purple] hover:text-white transition"
                whileHover={{ scale: 1.1, rotate: -5 }}
              >
                <Facebook size={20} />
              </motion.a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t-2 border-white/20">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-400">
              © {currentYear} Flipside. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm">
              <Link href="/privacy" className="hover:text-[--comic-red] transition">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-[--comic-red] transition">
                Terms & Conditions
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Comic Strip */}
      <div className="bg-[--comic-red] text-white py-2 text-center font-heading text-sm">
        ⚡ FRESH KICKS • UNBEATABLE PRICES • 100% LEGIT ⚡
      </div>
    </footer>
  );
}
