"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";
import Footer from "@/components/Footer";
import { ChevronDown, SlidersHorizontal } from "lucide-react";

// Mock products (will be replaced with Sanity data)
const mockProducts = [
  {
    id: "1",
    title: "Jordan 1 Retro High OG",
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
  {
    id: "4",
    title: "Air Max 90 Triple White",
    brand: "Nike",
    size: "9.5",
    price: 32000,
    image: "/logo.png",
    condition: 8,
    isSold: false,
    slug: "air-max-90",
  },
  {
    id: "5",
    title: "New Balance 550 White Grey",
    brand: "New Balance",
    size: "10",
    price: 28000,
    image: "/logo.png",
    condition: 9,
    isSold: false,
    slug: "nb-550",
  },
  {
    id: "6",
    title: "Jordan 4 Military Black",
    brand: "Jordan",
    size: "8",
    price: 48000,
    image: "/logo.png",
    condition: 8,
    isSold: false,
    slug: "jordan-4-military",
  },
];

const sizes = ["7", "7.5", "8", "8.5", "9", "9.5", "10", "10.5", "11", "11.5", "12"];
const brands = ["All", "Nike", "Jordan", "Yeezy", "New Balance", "Adidas"];

export default function ShopPage() {
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<string>("All");
  const [priceRange, setPriceRange] = useState<number>(100000);
  const [showFilters, setShowFilters] = useState(true);

  const filteredProducts = mockProducts.filter((product) => {
    const sizeMatch = !selectedSize || product.size === selectedSize;
    const brandMatch = selectedBrand === "All" || product.brand === selectedBrand;
    const priceMatch = product.price <= priceRange;
    return sizeMatch && brandMatch && priceMatch;
  });

  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        {/* Page Header */}
        <section className="bg-gradient-to-r from-[--comic-red] to-[--comic-purple] text-white py-12 border-b-4 border-black">
          <div className="container mx-auto px-4">
            <motion.h1
              className="font-heading text-6xl md:text-8xl text-center drop-shadow-[4px_4px_0px_rgba(0,0,0,1)]"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              THE SHOP
            </motion.h1>
            <p className="text-center text-xl mt-4 font-bold">
              {filteredProducts.length} FRESH KICKS AVAILABLE
            </p>
          </div>
        </section>

        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters Sidebar */}
            <aside className="lg:w-80">
              <div className="sticky top-24">
                {/* Filter Toggle Button (Mobile) */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden w-full mb-4 flex items-center justify-between bg-black text-white p-4 border-4 border-black font-heading text-xl"
                >
                  <span className="flex items-center gap-2">
                    <SlidersHorizontal size={24} />
                    FILTERS
                  </span>
                  <ChevronDown
                    className={`transform transition ${showFilters ? "rotate-180" : ""}`}
                  />
                </button>

                <motion.div
                  className={`border-4 border-black bg-white p-6 shadow-hard ${
                    showFilters ? "block" : "hidden lg:block"
                  }`}
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                >
                  <h2 className="font-heading text-3xl mb-6 pb-2 border-b-4 border-black">
                    FILTERS
                  </h2>

                  {/* Size Filter */}
                  <div className="mb-6">
                    <h3 className="font-bold text-lg mb-3">SIZE (UK)</h3>
                    <div className="flex flex-wrap gap-2">
                      {sizes.map((size) => (
                        <button
                          key={size}
                          onClick={() =>
                            setSelectedSize(selectedSize === size ? null : size)
                          }
                          className={`px-4 py-2 border-2 border-black font-bold transition ${
                            selectedSize === size
                              ? "bg-[--comic-red] text-white"
                              : "bg-white hover:bg-gray-100"
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Brand Filter */}
                  <div className="mb-6">
                    <h3 className="font-bold text-lg mb-3">BRAND</h3>
                    <div className="space-y-2">
                      {brands.map((brand) => (
                        <button
                          key={brand}
                          onClick={() => setSelectedBrand(brand)}
                          className={`w-full text-left px-4 py-2 border-2 border-black font-bold transition ${
                            selectedBrand === brand
                              ? "bg-[--comic-purple] text-white"
                              : "bg-white hover:bg-gray-100"
                          }`}
                        >
                          {brand}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Price Range */}
                  <div className="mb-6">
                    <h3 className="font-bold text-lg mb-3">
                      MAX PRICE: PKR {priceRange.toLocaleString()}
                    </h3>
                    <input
                      type="range"
                      min="20000"
                      max="100000"
                      step="5000"
                      value={priceRange}
                      onChange={(e) => setPriceRange(Number(e.target.value))}
                      className="w-full h-3 border-2 border-black appearance-none bg-white cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, var(--comic-red) 0%, var(--comic-red) ${
                          ((priceRange - 20000) / 80000) * 100
                        }%, white ${((priceRange - 20000) / 80000) * 100}%, white 100%)`,
                      }}
                    />
                  </div>

                  {/* Reset Button */}
                  <button
                    onClick={() => {
                      setSelectedSize(null);
                      setSelectedBrand("All");
                      setPriceRange(100000);
                    }}
                    className="w-full bg-black text-white py-3 border-2 border-black font-heading text-lg hover:bg-gray-800 transition"
                  >
                    RESET ALL
                  </button>
                </motion.div>
              </div>
            </aside>

            {/* Product Grid */}
            <div className="flex-1">
              {filteredProducts.length === 0 ? (
                <div className="text-center py-20">
                  <div className="font-heading text-8xl mb-4">😢</div>
                  <h2 className="font-heading text-4xl mb-2">NO KICKS FOUND</h2>
                  <p className="text-gray-600 mb-6">
                    Try adjusting your filters
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredProducts.map((product, index) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <ProductCard {...product} />
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
