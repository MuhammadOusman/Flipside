"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Heart, Trash2, ShoppingCart } from "lucide-react";
import { useWishlist, type WishlistItem } from "@/store/wishlist";
import { useCartStore } from "@/store/cart";
import { useUiStore } from "@/store/ui";
import { useAnalytics } from "@/store/analytics";
import { reserveProductAction } from "@/app/actions/storefront";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/components/AuthProvider";

export default function WishlistPage() {
  const { session, loading } = useAuth();
  const router = useRouter();
  const { items, removeItem } = useWishlist();
  const cartItems = useCartStore((state) => state.items);
  const addToCart = useCartStore((state) => state.addItem);
  const openCartDrawer = useUiStore((state) => state.openCartDrawer);
  const trackCartAdd = useAnalytics((state) => state.trackCartAdd);
  const [cartNotice, setCartNotice] = useState<string | null>(null);
  const [isReserving, startTransition] = useTransition();

  useEffect(() => {
    if (!loading && !session) {
      router.push("/auth/signin");
    }
  }, [loading, session, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-bounce font-heading text-4xl">LOADING...</div>
      </div>
    );
  }

  const handleAddToCart = (item: WishlistItem) => {
    const alreadyInCart = cartItems.some((cartItem) => cartItem.id === item.id);
    if (alreadyInCart) {
      setCartNotice("This pair is already reserved in your cart.");
      openCartDrawer();
      return;
    }

    if (cartItems.length > 0) {
      setCartNotice("Only one pair can be reserved at a time. Remove the current pair from cart first.");
      return;
    }

    setCartNotice(null);
    startTransition(async () => {
      const result = await reserveProductAction(item.id);
      if (!result.ok) {
        setCartNotice(result.message || "Could not reserve this pair right now.");
        return;
      }

      addToCart({
        id: item.id,
        title: item.name,
        brand: item.brand,
        size: item.size,
        price: item.price,
        image: item.image,
        slug: item.slug,
        reservedUntil: result.reservedUntil,
      });
      trackCartAdd(item.id);
      openCartDrawer();
    });
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-white">
        {/* Header */}
        <div className="bg-gradient-to-r from-[var(--comic-red)] to-[var(--comic-purple)] border-b-4 border-black p-6">
          <div className="max-w-7xl mx-auto">
            <h1 className="font-heading text-5xl text-white mb-2 flex items-center gap-3">
              <Heart size={48} fill="white" />
              MY WISHLIST
            </h1>
            <p className="text-white font-bold">
              Your saved items • {items.length} products
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto p-6">{items.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <Heart size={80} className="mx-auto mb-6 text-gray-300" />
            <h2 className="font-heading text-3xl mb-4">
              YOUR WISHLIST IS EMPTY
            </h2>
            <p className="text-gray-600 font-bold mb-8">
              Start adding products you love!
            </p>
            <Link href="/shop">
              <button className="bg-[var(--comic-purple)] text-white px-8 py-4 border-4 border-black shadow-hard font-heading text-xl hover:scale-105 transition">
                BROWSE PRODUCTS
              </button>
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {cartNotice && (
              <div className="border-2 border-black bg-yellow-100 p-3 text-sm font-bold text-black">
                {cartNotice}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((item: WishlistItem, index: number) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white border-4 border-black shadow-hard overflow-hidden group"
                >
                  <Link href={`/product/${item.slug}`}>
                    <div className="relative h-64 bg-gradient-to-br from-gray-200 to-gray-300 overflow-hidden">
                      <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle,black_1px,transparent_1px)] bg-[size:8px_8px]" />
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                  </Link>

                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-xs font-bold text-gray-600 mb-1">
                          {item.brand}
                        </p>
                        <h3 className="font-bold text-lg line-clamp-2">
                          {item.name}
                        </h3>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                      <span className="font-bold text-sm">Size:</span>
                      <span className="px-2 py-1 border-2 border-black text-xs font-bold">
                        {item.size}
                      </span>
                    </div>

                    <div className="mb-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-gray-600">
                          CONDITION
                        </span>
                        <span className="font-bold text-sm">
                          {item.condition}%
                        </span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 border border-black">
                        <div
                          className={`h-full ${
                            item.condition >= 90
                              ? "bg-green-500"
                              : item.condition >= 80
                              ? "bg-yellow-500"
                              : "bg-red-500"
                          }`}
                          style={{ width: `${item.condition}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <p className="font-heading text-2xl">
                        PKR {item.price.toLocaleString()}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAddToCart(item)}
                        disabled={isReserving}
                        className="flex-1 bg-[var(--comic-green)] text-white px-4 py-3 border-2 border-black font-bold hover:bg-green-600 transition flex items-center justify-center gap-2"
                      >
                        <ShoppingCart size={18} />
                        {isReserving ? "RESERVING..." : "ADD TO CART"}
                      </button>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-3 bg-[var(--comic-red)] text-white border-2 border-black hover:bg-red-600 transition"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
        </div>
      </div>
      <Footer />
    </>
  );
}
