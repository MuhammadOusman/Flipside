"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Heart, Share2, Check, Copy } from "lucide-react";
import Navbar from "@/components/Navbar";
import ComicButton from "@/components/ComicButton";
import SizeSelector from "@/components/SizeSelector";
import Footer from "@/components/Footer";
import { useCartStore } from "@/store/cart";
import { useWishlist } from "@/store/wishlist";
import { useParams } from "next/navigation";
import { getSizeByEU } from "@/lib/sizeConversion";

// Mock product data (will be replaced with Sanity)
const mockProduct = {
  id: "1",
  title: "Jordan 1 Retro High OG",
  brand: "Jordan",
  sizeEU: 42, // Primary EU size
  price: 45000,
  images: ["/logo.png", "/logo.png", "/logo.png"],
  condition: 9,
  isSold: false,
  slug: "jordan-1-retro-high",
  description:
    "Classic Jordan 1 in near-perfect condition. Only worn a few times. Comes with original box and extra laces. True to size.",
  category: "Jordans",
};

export default function ProductPage() {
  const params = useParams();
  const [selectedImage, setSelectedImage] = useState(0);
  const [added, setAdded] = useState(false);
  const [shared, setShared] = useState(false);
  const [copied, setCopied] = useState(false);
  const addItem = useCartStore((state) => state.addItem);
  const { isInWishlist, addItem: addToWishlist, removeItem: removeFromWishlist } = useWishlist();
  const inWishlist = isInWishlist(mockProduct.id);
  
  // Get size object with all conversions
  const sizeData = getSizeByEU(mockProduct.sizeEU);

  const handleAddToCart = () => {
    addItem({
      id: mockProduct.id,
      title: mockProduct.title,
      brand: mockProduct.brand,
      size: mockProduct.sizeEU.toString(),
      price: mockProduct.price,
      image: mockProduct.images[0],
      slug: mockProduct.slug,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleWishlistToggle = () => {
    if (inWishlist) {
      removeFromWishlist(mockProduct.id);
    } else {
      addToWishlist({
        id: mockProduct.id,
        name: mockProduct.title,
        brand: mockProduct.brand,
        price: mockProduct.price,
        image: mockProduct.images[0],
        slug: mockProduct.slug,
        size: mockProduct.sizeEU.toString(),
        condition: mockProduct.condition,
      });
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    const text = `Check out ${mockProduct.title} by ${mockProduct.brand} on Flipside!`;

    // Try Web Share API first (mobile)
    if (navigator.share) {
      try {
        await navigator.share({
          title: mockProduct.title,
          text: text,
          url: url,
        });
        setShared(true);
        setTimeout(() => setShared(false), 2000);
      } catch (err) {
        // User cancelled or share failed
        console.log("Share cancelled");
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("Failed to copy:", err);
      }
    }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen py-8">
        <div className="container mx-auto px-4">
          {/* Back Button */}
          <Link href="/shop">
            <motion.button
              className="flex items-center gap-2 mb-6 px-6 py-3 border-4 border-black bg-white shadow-hard hover:shadow-none transition font-bold text-lg"
              whileHover={{ x: -5 }}
            >
              <ArrowLeft size={24} />
              <span className="font-bold">BACK TO SHOP</span>
            </motion.button>
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Image Gallery */}
            <div>
              {/* Main Image */}
              <motion.div
                className="relative aspect-square border-4 border-black shadow-hard-lg mb-4 overflow-hidden bg-gradient-to-br from-yellow-200 via-pink-300 to-blue-400"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                {/* Halftone Background */}
                <div className="absolute inset-0 bg-[radial-gradient(circle,_#00000020_2px,_transparent_2px)] bg-[size:20px_20px]" />
                <Image
                  src={mockProduct.images[selectedImage]}
                  alt={mockProduct.title}
                  fill
                  className="object-cover"
                  priority
                />

                {/* SOLD OUT Overlay */}
                {mockProduct.isSold && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <div className="bg-[--comic-red] text-white font-heading text-5xl px-12 py-6 border-4 border-white shadow-hard-lg sold-stamp">
                      SOLD OUT!
                    </div>
                  </div>
                )}
              </motion.div>

              {/* Thumbnail Strip */}
              <div className="flex gap-3">
                {mockProduct.images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative w-24 h-24 border-4 ${
                      selectedImage === index
                        ? "border-[--comic-red]"
                        : "border-black"
                    } shadow-hard transition hover:scale-105`}
                  >
                    <Image src={img} alt={`View ${index + 1}`} fill className="object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Product Info */}
            <div>
              {/* Comic Badge */}
              <div className="inline-block bg-white border-4 border-black px-4 py-2 font-bold text-sm mb-4 shadow-hard">
                <span className="text-[--comic-purple]">{mockProduct.category.toUpperCase()}</span>
              </div>

              <h1 className="font-heading text-5xl md:text-6xl leading-tight mb-2">
                {mockProduct.title}
              </h1>
              <p className="text-2xl text-gray-600 font-bold uppercase mb-6">
                {mockProduct.brand}
              </p>

              {/* Price Tag */}
              <motion.div
                className="inline-block bg-yellow-300 border-4 border-black px-8 py-4 shadow-hard-lg mb-6"
                whileHover={{ rotate: [0, -2, 2, 0] }}
              >
                <p className="text-sm font-bold text-gray-700">PRICE</p>
                <p className="font-heading text-5xl">
                  PKR {mockProduct.price.toLocaleString()}
                </p>
              </motion.div>

              {/* Size & Condition */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                {sizeData && <SizeSelector size={sizeData} />}
                <div className="border-4 border-black bg-white p-4 shadow-hard">
                  <p className="text-sm font-bold text-gray-600 mb-1">CONDITION</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-3 border-2 border-black">
                      <div
                        className="h-full bg-[--goblin-green]"
                        style={{ width: `${mockProduct.condition * 10}%` }}
                      />
                    </div>
                    <span className="font-heading text-2xl">
                      {mockProduct.condition}/10
                    </span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="border-4 border-black bg-white p-6 shadow-hard mb-6">
                <h3 className="font-heading text-2xl mb-3">DESCRIPTION</h3>
                <p className="leading-relaxed">{mockProduct.description}</p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4">
                {!mockProduct.isSold ? (
                  <>
                    <ComicButton
                      size="lg"
                      variant="primary"
                      onClick={handleAddToCart}
                      className="w-full relative overflow-hidden"
                      disabled={added}
                    >
                      {added ? (
                        <span className="flex items-center justify-center gap-2">
                          <Check size={24} />
                          ADDED TO CART!
                        </span>
                      ) : (
                        "ADD TO CART"
                      )}
                    </ComicButton>

                    {added && (
                      <motion.div
                        className="absolute top-0 left-0 w-full text-center bg-[--goblin-green] text-white font-heading text-2xl py-3 border-4 border-black shadow-hard"
                        initial={{ y: -100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -100, opacity: 0 }}
                      >
                        💥 POW! ADDED TO CART!
                      </motion.div>
                    )}

                    <div className="flex gap-4">
                      <motion.button
                        onClick={handleWishlistToggle}
                        className={`flex-1 flex items-center justify-center gap-2 py-4 border-4 border-black font-bold text-lg transition shadow-hard ${
                          inWishlist
                            ? "bg-[--comic-red] text-white hover:bg-red-600"
                            : "bg-white hover:bg-gray-50"
                        }`}
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Heart
                          size={24}
                          fill={inWishlist ? "currentColor" : "none"}
                        />
                        {inWishlist ? "IN WISHLIST" : "ADD WISHLIST"}
                      </motion.button>
                      <motion.button
                        onClick={handleShare}
                        className="flex-1 flex items-center justify-center gap-2 py-4 border-4 border-black bg-white font-bold text-lg hover:bg-gray-50 transition shadow-hard relative"
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {copied ? (
                          <>
                            <Copy size={20} />
                            LINK COPIED!
                          </>
                        ) : shared ? (
                          <>
                            <Check size={20} />
                            SHARED!
                          </>
                        ) : (
                          <>
                            <Share2 size={20} />
                            SHARE
                          </>
                        )}
                      </motion.button>
                    </div>
                  </>
                ) : (
                  <div className="bg-red-100 border-4 border-[--comic-red] p-6 text-center">
                    <p className="font-heading text-3xl text-[--comic-red]">
                      SOLD OUT!
                    </p>
                    <p className="text-gray-700 mt-2">
                      Check back every Sunday for new drops
                    </p>
                  </div>
                )}
              </div>

              {/* Trust Badges */}
              <div className="mt-8 grid grid-cols-3 gap-3 text-center">
                {["✅ 100% LEGIT", "💰 COD AVAILABLE", "🔥 FRESH KICKS"].map(
                  (badge) => (
                    <div
                      key={badge}
                      className="bg-black text-white py-3 border-2 border-black font-bold text-xs"
                    >
                      {badge}
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
