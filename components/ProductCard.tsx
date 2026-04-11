"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWishlist } from "@/store/wishlist";
import { useCartStore } from "@/store/cart";
import { useUiStore } from "@/store/ui";
import { reserveProductAction } from "@/app/actions/storefront";
import type { ProductStatus } from "@/lib/db/types";

interface ProductCardProps {
  id: string;
  title: string;
  brand: string;
  size: string;
  price: number;
  image: string;
  condition: number;
  slug: string;
  status: ProductStatus;
  dropTime?: string | null;
  reservedUntil?: string | null;
}

function getTimeLeft(timestamp?: string | null) {
  if (!timestamp) return "00:00";
  const diff = new Date(timestamp).getTime() - Date.now();
  if (diff <= 0) return "00:00";
  const total = Math.floor(diff / 1000);
  const mm = String(Math.floor(total / 60)).padStart(2, "0");
  const ss = String(total % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

export default function ProductCard({
  id,
  title,
  brand,
  size,
  price,
  image,
  condition,
  slug,
  status,
  dropTime,
  reservedUntil,
}: ProductCardProps) {
  const { isInWishlist, addItem, removeItem } = useWishlist();
  const addCartItem = useCartStore((state) => state.addItem);
  const openCartDrawer = useUiStore((state) => state.openCartDrawer);
  const inWishlist = isInWishlist(id);
  const [justAdded, setJustAdded] = useState(false);
  const [reserveError, setReserveError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [now, setNow] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const reservedCountdown = useMemo(() => {
    void now;
    return getTimeLeft(reservedUntil);
  }, [reservedUntil, now]);
  const isDroppingSoon = status === "dropping_soon" && !!dropTime && new Date(dropTime).getTime() > now;
  const unavailable = status === "sold" || status === "archived";

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (inWishlist) {
      removeItem(id);
      return;
    }

    addItem({
      id,
      name: title,
      brand,
      price,
      image,
      slug,
      size,
      condition,
    });

    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 500);
  };

  const handleReserve = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setReserveError(null);

    startTransition(async () => {
      const result = await reserveProductAction(id);
      if (!result.ok) {
        setReserveError(result.message || "Reservation failed");
        return;
      }

      addCartItem({
        id,
        title,
        brand,
        size,
        price,
        image,
        slug,
        reservedUntil: result.reservedUntil,
      });
      openCartDrawer();
    });
  };

  return (
    <Link href={`/product/${slug}`}>
      <motion.article
        className={cn(
          "relative border-4 border-black bg-white shadow-hard overflow-hidden group cursor-pointer",
          unavailable && "opacity-70"
        )}
        whileHover={{ scale: 1.02, y: -4 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-yellow-300 via-blue-400 to-red-400">
          <div className="absolute inset-0 bg-[radial-gradient(circle,_#00000020_1px,_transparent_1px)] bg-[size:15px_15px]" />
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
          />

          <motion.button
            onClick={handleWishlistToggle}
            className={cn(
              "absolute top-4 left-4 z-10 border-2 border-black bg-white p-2",
              inWishlist ? "text-[var(--comic-red)]" : "text-gray-400",
              justAdded && "animate-bounce"
            )}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Heart size={20} fill={inWishlist ? "currentColor" : "none"} strokeWidth={2} />
          </motion.button>

          {status === "sold" && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
              <div className="border-4 border-black bg-[var(--comic-red)] px-8 py-4 font-heading text-4xl text-white shadow-hard-lg">
                SOLD OUT
              </div>
            </div>
          )}
        </div>

        <div className="space-y-3 border-t-4 border-black p-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-600">{brand}</p>
              <h3 className="font-heading text-xl leading-tight">{title}</h3>
            </div>
            <div className="bg-black px-2 py-1 text-xs font-bold text-white">UK {size}</div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold">CONDITION:</span>
            <div className="h-2 flex-1 border-2 border-black">
              <div className="h-full bg-[var(--goblin-green)]" style={{ width: `${condition * 10}%` }} />
            </div>
            <span className="text-xs font-bold">{condition}/10</span>
          </div>

          {!isDroppingSoon && <p className="font-heading text-2xl">PKR {price.toLocaleString()}</p>}

          {isDroppingSoon ? (
            <div className="border-2 border-black bg-yellow-100 p-2 text-xs font-bold">
              Dropping soon. Price unlocks at drop time.
            </div>
          ) : status === "reserved" ? (
            <div className="border-2 border-black bg-gray-200 p-2 text-xs font-bold">
              Currently in another user&apos;s cart. Check back in {reservedCountdown}.
            </div>
          ) : unavailable ? (
            <div className="border-2 border-black bg-red-100 p-2 text-xs font-bold text-red-700">
              This pair is no longer available.
            </div>
          ) : (
            <button
              onClick={handleReserve}
              disabled={isPending}
              className="w-full border-2 border-black bg-[var(--comic-red)] px-3 py-2 text-sm font-bold text-white hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending ? "Reserving..." : "Add to Cart"}
            </button>
          )}

          {reserveError && (
            <div className="border-2 border-black bg-red-100 p-2 text-xs font-bold text-red-700">{reserveError}</div>
          )}
        </div>
      </motion.article>
    </Link>
  );
}
