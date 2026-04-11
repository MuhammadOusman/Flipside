"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Menu, X, Heart, Package, User, LogOut } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { useWishlist } from "@/store/wishlist";
import { useUiStore } from "@/store/ui";
import { useState } from "react";
import CartDrawer from "./CartDrawer";
import { useAuth } from "@/components/AuthProvider";

export default function Navbar() {
  const itemCount = useCartStore((state) => state.items.length);
  const wishlistCount = useWishlist((state) => state.items.length);
  const cartOpen = useUiStore((state) => state.cartDrawerOpen);
  const openCartDrawer = useUiStore((state) => state.openCartDrawer);
  const closeCartDrawer = useUiStore((state) => state.closeCartDrawer);
  const { session, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userDisplayName =
    (session?.user?.user_metadata?.full_name as string | undefined) ||
    (session?.user?.user_metadata?.name as string | undefined) ||
    session?.user?.email?.split("@")[0] ||
    "User";

  return (
    <motion.nav
      className="sticky top-0 z-50 bg-white border-b-4 border-black shadow-hard"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="Flipside Logo"
              width={60}
              height={60}
              className="border-2 border-black rounded-full"
            />
            <span className="font-heading text-3xl hidden sm:block">FLIPSIDE</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className="font-bold hover:text-[var(--comic-red)] transition-colors"
            >
              HOME
            </Link>
            <Link
              href="/shop"
              className="font-bold hover:text-[var(--comic-red)] transition-colors"
            >
              SHOP
            </Link>
            <Link
              href="/about"
              className="font-bold hover:text-[var(--comic-red)] transition-colors"
            >
              ABOUT
            </Link>
          </div>

          {/* Right Actions */}
          <div className="hidden md:flex items-center gap-3">
            {/* Wishlist Button */}
            <Link href="/wishlist">
              <motion.button
                className="relative bg-[var(--comic-purple)] text-white p-3 border-4 border-black shadow-hard"
                whileHover={{ scale: 1.05, x: 2, y: 2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Heart size={24} />
                {wishlistCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-[var(--comic-red)] text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full border-2 border-black">
                    {wishlistCount}
                  </span>
                )}
              </motion.button>
            </Link>

            {/* Cart Button */}
            <motion.button
              onClick={openCartDrawer}
              className="relative bg-[var(--comic-red)] text-white p-3 border-4 border-black shadow-hard"
              whileHover={{ scale: 1.05, x: 2, y: 2 }}
              whileTap={{ scale: 0.95 }}
            >
              <ShoppingCart size={24} />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-[var(--comic-purple)] text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full border-2 border-black">
                  {itemCount}
                </span>
              )}
            </motion.button>

            {/* User Menu */}
            {session ? (
              <div className="relative">
                <motion.button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="bg-[var(--comic-green)] text-white p-3 border-4 border-black shadow-hard"
                  whileHover={{ scale: 1.05, x: 2, y: 2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <User size={24} />
                </motion.button>

                {userMenuOpen && (
                  <motion.div
                    className="absolute right-0 mt-2 w-64 bg-white border-4 border-black shadow-hard"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="p-4 border-b-4 border-black">
                      <p className="font-bold text-sm">
                        {userDisplayName}
                      </p>
                      <p className="text-xs text-gray-600">
                        {session.user?.email}
                      </p>
                    </div>
                    <div className="p-2">
                      <Link
                        href="/orders"
                        className="flex items-center gap-2 p-3 hover:bg-gray-100 font-bold"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <Package size={20} />
                        MY ORDERS
                      </Link>
                      <Link
                        href="/wishlist"
                        className="flex items-center gap-2 p-3 hover:bg-gray-100 font-bold"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <Heart size={20} />
                        WISHLIST
                      </Link>
                      <button
                        onClick={() => {
                          void signOut();
                          setUserMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2 p-3 hover:bg-red-50 font-bold text-[var(--comic-red)]"
                      >
                        <LogOut size={20} />
                        SIGN OUT
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            ) : (
              <Link href="/auth/signin">
                <motion.button
                  className="bg-[var(--comic-green)] text-white px-6 py-3 border-4 border-black shadow-hard font-bold"
                  whileHover={{ scale: 1.05, x: 2, y: 2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  SIGN IN
                </motion.button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            className="md:hidden mt-4 pb-4 border-t-4 border-black pt-4"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="flex flex-col gap-4">
              <Link
                href="/"
                className="font-bold hover:text-[var(--comic-red)] transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                HOME
              </Link>
              <Link
                href="/shop"
                className="font-bold hover:text-[var(--comic-red)] transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                SHOP
              </Link>
              <Link
                href="/about"
                className="font-bold hover:text-[var(--comic-red)] transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                ABOUT
              </Link>

              {/* Mobile Auth Section */}
              {session ? (
                <>
                  <div className="border-t-4 border-black pt-4 mt-4">
                    <p className="font-bold text-sm mb-2">
                      {userDisplayName}
                    </p>
                  </div>
                  <Link
                    href="/wishlist"
                    className="flex items-center gap-2 font-bold hover:text-[var(--comic-purple)]"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Heart size={20} />
                    WISHLIST ({wishlistCount})
                  </Link>
                  <Link
                    href="/orders"
                    className="flex items-center gap-2 font-bold hover:text-[var(--comic-purple)]"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Package size={20} />
                    MY ORDERS
                  </Link>
                  <button
                    onClick={() => {
                      void signOut();
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-2 font-bold text-[var(--comic-red)] hover:underline"
                  >
                    <LogOut size={20} />
                    SIGN OUT
                  </button>
                </>
              ) : (
                <Link
                  href="/auth/signin"
                  className="bg-[var(--comic-green)] text-white px-6 py-3 border-4 border-black shadow-hard font-bold text-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  SIGN IN
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </div>

      {/* Ticker Tape */}
      <div className="bg-black border-t-4 border-black overflow-hidden">
        <motion.div
          className="flex whitespace-nowrap py-3 font-heading text-xl text-white"
          animate={{ x: [0, -1000] }}
          transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
        >
          {Array(10)
            .fill(null)
            .map((_, i) => (
              <span key={i} className="mx-8">
                ⚡ RESTOCKED EVERY SUNDAY • 💯 COD AVAILABLE • ✅ 100% LEGIT
              </span>
            ))}
        </motion.div>
      </div>

      {/* Cart Drawer */}
      <CartDrawer isOpen={cartOpen} onClose={closeCartDrawer} />
    </motion.nav>
  );
}
