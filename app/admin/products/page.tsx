"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  Filter,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

type Product = {
  id: string;
  name: string;
  brand: string;
  size: string;
  price: number;
  condition: number;
  stock: number;
  image: string;
  isSold: boolean;
};

const mockProducts: Product[] = [
  {
    id: "1",
    name: "Jordan 4 Military Black",
    brand: "Nike",
    size: "UK 9",
    price: 48000,
    condition: 95,
    stock: 1,
    image: "/shoes/jordan-4.jpg",
    isSold: false,
  },
  {
    id: "2",
    name: "Yeezy 350 Bred",
    brand: "Adidas",
    size: "UK 8.5",
    price: 52000,
    condition: 90,
    stock: 1,
    image: "/shoes/yeezy-350.jpg",
    isSold: false,
  },
  {
    id: "3",
    name: "Dunk Low Panda",
    brand: "Nike",
    size: "UK 10",
    price: 38000,
    condition: 85,
    stock: 3,
    image: "/shoes/dunk-panda.jpg",
    isSold: false,
  },
];

export default function ProductsPage() {
  const [products, setProducts] = useState(mockProducts);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [deleteModal, setDeleteModal] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    setProducts(products.filter((p) => p.id !== id));
    setDeleteModal(null);
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-4xl mb-2">PRODUCT INVENTORY</h1>
          <p className="text-gray-600 font-bold">
            Manage your shoe collection
          </p>
        </div>
        <Link href="/admin/products/new">
          <button className="bg-[--comic-green] text-white px-6 py-3 border-4 border-black shadow-hard font-heading text-xl hover:scale-105 transition flex items-center gap-2">
            <Plus size={24} />
            ADD PRODUCT
          </button>
        </Link>
      </div>

      {/* Search & Filters */}
      <div className="bg-white border-4 border-black shadow-hard p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-[--comic-purple] font-bold"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-6 py-3 border-2 border-black font-bold hover:bg-gray-100 transition flex items-center gap-2"
          >
            <Filter size={20} />
            FILTERS
            <ChevronDown
              size={20}
              className={`transition-transform ${
                showFilters ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-4 pt-4 border-t-2 border-black"
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <select className="px-4 py-2 border-2 border-black font-bold">
                  <option>All Brands</option>
                  <option>Nike</option>
                  <option>Adidas</option>
                  <option>New Balance</option>
                </select>
                <select className="px-4 py-2 border-2 border-black font-bold">
                  <option>All Sizes</option>
                  <option>UK 7-8</option>
                  <option>UK 8.5-9.5</option>
                  <option>UK 10-11</option>
                </select>
                <select className="px-4 py-2 border-2 border-black font-bold">
                  <option>All Stock</option>
                  <option>In Stock</option>
                  <option>Low Stock</option>
                  <option>Sold Out</option>
                </select>
                <select className="px-4 py-2 border-2 border-black font-bold">
                  <option>All Conditions</option>
                  <option>90%+</option>
                  <option>80-89%</option>
                  <option>Below 80%</option>
                </select>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Products Table */}
      <div className="bg-white border-4 border-black shadow-hard overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-[--comic-red] to-[--comic-purple] text-white">
              <tr>
                <th className="px-6 py-4 text-left font-heading text-lg border-r-2 border-black">
                  PRODUCT
                </th>
                <th className="px-6 py-4 text-left font-heading text-lg border-r-2 border-black">
                  BRAND
                </th>
                <th className="px-6 py-4 text-left font-heading text-lg border-r-2 border-black">
                  SIZE
                </th>
                <th className="px-6 py-4 text-left font-heading text-lg border-r-2 border-black">
                  PRICE
                </th>
                <th className="px-6 py-4 text-left font-heading text-lg border-r-2 border-black">
                  CONDITION
                </th>
                <th className="px-6 py-4 text-left font-heading text-lg border-r-2 border-black">
                  STOCK
                </th>
                <th className="px-6 py-4 text-left font-heading text-lg">
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product, index) => (
                <motion.tr
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-t-2 border-black hover:bg-gray-50"
                >
                  <td className="px-6 py-4 border-r-2 border-black">
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-16 border-2 border-black bg-gray-200 relative">
                        <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400" />
                      </div>
                      <div>
                        <p className="font-bold">{product.name}</p>
                        <p className="text-sm text-gray-600">
                          ID: {product.id}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 border-r-2 border-black font-bold">
                    {product.brand}
                  </td>
                  <td className="px-6 py-4 border-r-2 border-black font-bold">
                    {product.size}
                  </td>
                  <td className="px-6 py-4 border-r-2 border-black font-bold">
                    PKR {product.price.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 border-r-2 border-black">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-200 border border-black">
                        <div
                          className={`h-full ${
                            product.condition >= 90
                              ? "bg-green-500"
                              : product.condition >= 80
                              ? "bg-yellow-500"
                              : "bg-red-500"
                          }`}
                          style={{ width: `${product.condition}%` }}
                        />
                      </div>
                      <span className="font-bold text-sm">
                        {product.condition}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 border-r-2 border-black">
                    <span
                      className={`px-3 py-1 border-2 border-black font-bold ${
                        product.stock === 0
                          ? "bg-red-100 text-red-600"
                          : product.stock <= 3
                          ? "bg-yellow-100 text-yellow-600"
                          : "bg-green-100 text-green-600"
                      }`}
                    >
                      {product.stock} units
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button className="p-2 bg-blue-500 text-white border-2 border-black hover:bg-blue-600 transition">
                        <Eye size={16} />
                      </button>
                      <Link href={`/admin/products/edit/${product.id}`}>
                        <button className="p-2 bg-[--comic-purple] text-white border-2 border-black hover:bg-purple-700 transition">
                          <Edit size={16} />
                        </button>
                      </Link>
                      <button
                        onClick={() => setDeleteModal(product.id)}
                        className="p-2 bg-[--comic-red] text-white border-2 border-black hover:bg-red-600 transition"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="font-heading text-2xl text-gray-400">
              NO PRODUCTS FOUND
            </p>
            <p className="text-gray-600 font-bold mt-2">
              Try adjusting your search or filters
            </p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setDeleteModal(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white border-4 border-black shadow-hard p-8 z-50 max-w-md w-full"
            >
              <h2 className="font-heading text-3xl mb-4">DELETE PRODUCT?</h2>
              <p className="text-gray-600 font-bold mb-6">
                This action cannot be undone. Are you sure you want to delete
                this product?
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setDeleteModal(null)}
                  className="flex-1 px-6 py-3 border-2 border-black font-bold hover:bg-gray-100 transition"
                >
                  CANCEL
                </button>
                <button
                  onClick={() => handleDelete(deleteModal)}
                  className="flex-1 px-6 py-3 bg-[--comic-red] text-white border-2 border-black font-bold hover:bg-red-600 transition"
                >
                  DELETE
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
