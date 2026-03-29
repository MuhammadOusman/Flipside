"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { X, Trash2, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/store/cart";
import ComicButton from "./ComicButton";
import Link from "next/link";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { items, removeItem, getTotal, clearCart } = useCartStore();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/60 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            className="fixed right-0 top-0 h-full w-full md:w-[450px] bg-white border-l-4 border-black shadow-hard-lg z-50 overflow-y-auto"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {/* Header */}
            <div className="sticky top-0 bg-[--comic-red] text-white p-4 border-b-4 border-black flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag size={28} />
                <h2 className="font-heading text-3xl">YOUR CART</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded transition"
              >
                <X size={28} />
              </button>
            </div>

            {/* Cart Items */}
            <div className="p-4">
              {items.length === 0 ? (
                <div className="text-center py-12">
                  <div className="font-heading text-6xl mb-4">😢</div>
                  <p className="font-heading text-2xl mb-2">CART IS EMPTY</p>
                  <p className="text-gray-600 mb-6">
                    Add some fresh kicks to your cart!
                  </p>
                  <ComicButton onClick={onClose}>START SHOPPING</ComicButton>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    {items.map((item) => (
                      <motion.div
                        key={item.id}
                        layout
                        className="border-4 border-black bg-white p-4 shadow-hard"
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                      >
                        <div className="flex gap-4">
                          <div className="relative w-24 h-24 border-2 border-black">
                            <Image
                              src={item.image}
                              alt={item.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-lg leading-tight mb-1">
                              {item.title}
                            </h3>
                            <p className="text-sm text-gray-600 uppercase">
                              {item.brand} • UK {item.size}
                            </p>
                            <p className="font-heading text-xl mt-2">
                              PKR {item.price.toLocaleString()}
                            </p>
                          </div>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="p-2 h-fit hover:bg-red-100 border-2 border-black transition"
                          >
                            <Trash2 size={20} className="text-[--comic-red]" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* POW! Animation */}
                  <motion.div
                    className="text-center my-6 font-heading text-4xl text-[--comic-red]"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  >
                    💥 BOOM!
                  </motion.div>

                  {/* Total */}
                  <div className="border-4 border-black bg-yellow-300 p-4 mt-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-lg">TOTAL:</span>
                      <span className="font-heading text-3xl">
                        PKR {getTotal().toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">
                      💰 Cash on Delivery (COD) Available
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3 mt-6">
                    <Link href="/checkout" onClick={onClose}>
                      <ComicButton size="lg" variant="primary" className="w-full">
                        CHECKOUT NOW
                      </ComicButton>
                    </Link>
                    <ComicButton
                      size="md"
                      variant="secondary"
                      onClick={clearCart}
                      className="w-full"
                    >
                      CLEAR CART
                    </ComicButton>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
