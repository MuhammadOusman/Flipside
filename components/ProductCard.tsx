"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWishlist } from "@/store/wishlist";
import { useState } from "react";

interface ProductCardProps {
  id: string;
  title: string;
  brand: string;
  size: string;
  price: number;
  image: string;
  condition: number;
  isSold: boolean;
  slug: string;
}

export default function ProductCard({
  id,
  title,
  brand,
  size,
  price,
  image,
  condition,
  isSold,
  slug,
}: ProductCardProps) {
  const { isInWishlist, addItem, removeItem } = useWishlistStore();
  const inWishlist = isInWishlist(id);
  const [justAdded, setJustAdded] = useState(false);

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (inWishlist) {
      removeItem(id);
    } else {
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
    }
  };
  return (
    <Link href={`/product/${slug}`}>
      <motion.div
        className={cn(
          "relative border-4 border-black bg-white shadow-hard overflow-hidden group cursor-pointer",
          isSold && "opacity-70"
        )}
        whileHover={{ scale: 1.02, y: -4 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        {/* Image Container with Halftone Background */}
        <div className="relative aspect-square bg-gradient-to-br from-yellow-300 via-blue-400 to-red-400 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle,_#00000020_1px,_transparent_1px)] bg-[size:15px_15px]" />
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
          />
          
          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Wishlist Heart Button */}
          <motion.button
            onClick={handleWishlistToggle}
            className={cn(
              "absolute top-4 left-4 bg-white p-2 border-2 border-black z-10",
              inWishlist ? "text-[--comic-red]" : "text-gray-400",
              justAdded && "animate-bounce"
            )}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Heart
              size={20}
              fill={inWishlist ? "currentColor" : "none"}
              strokeWidth={2}
            />
          </motion.button>
          
          {/* Quick View Badge */}
          <motion.div
            className="absolute top-4 right-4 bg-white text-black px-3 py-1 text-xs font-bold border-2 border-black opacity-0 group-hover:opacity-100"
            initial={{ x: 20 }}
            whileHover={{ x: 0 }}
          >
            QUICK VIEW
          </motion.div>
          
          {/* Sold Out Stamp */}
          {isSold && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-[--comic-red] text-white font-heading text-4xl px-8 py-4 border-4 border-black shadow-hard-lg sold-stamp">
                SOLD OUT!
              </div>
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="p-4 bg-white border-t-4 border-black">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-600">
                {brand}
              </p>
              <h3 className="font-heading text-xl leading-tight">{title}</h3>
            </div>
            <div className="bg-black text-white px-2 py-1 text-xs font-bold">
              EU {size}
            </div>
          </div>

          {/* Condition Bar */}
          <div className="mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold">CONDITION:</span>
              <div className="flex-1 h-2 border-2 border-black">
                <div
                  className="h-full bg-[--goblin-green]"
                  style={{ width: `${condition * 10}%` }}
                />
              </div>
              <span className="text-xs font-bold">{condition}/10</span>
            </div>
          </div>

          {/* Price */}
          <div className="flex items-center justify-between">
            <span className="font-heading text-2xl">PKR {price.toLocaleString()}</span>
            <motion.div
              className="bg-[--comic-red] text-white px-3 py-1 text-xs font-bold border-2 border-black"
              whileHover={{ scale: 1.1 }}
            >
              VIEW
            </motion.div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
