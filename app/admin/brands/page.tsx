"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Save,
  Tag,
} from "lucide-react";

type Brand = {
  id: string;
  name: string;
  slug: string;
  description: string;
  isActive: boolean;
  productCount: number;
};

const initialBrands: Brand[] = [];

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>(initialBrands);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [deleteModal, setDeleteModal] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    isActive: true,
  });

  const handleEdit = (brand: Brand) => {
    setEditingBrand(brand);
    setFormData({
      name: brand.name,
      slug: brand.slug,
      description: brand.description,
      isActive: brand.isActive,
    });
  };

  const handleSave = () => {
    if (editingBrand) {
      // Update existing brand
      setBrands(
        brands.map((b) =>
          b.id === editingBrand.id ? { ...b, ...formData } : b
        )
      );
      setEditingBrand(null);
    } else {
      // Add new brand
      const newBrand: Brand = {
        id: `${Date.now()}`,
        ...formData,
        productCount: 0,
      };
      setBrands([...brands, newBrand]);
      setIsAdding(false);
    }
    setFormData({ name: "", slug: "", description: "", isActive: true });
  };

  const handleDelete = (id: string) => {
    setBrands(brands.filter((b) => b.id !== id));
    setDeleteModal(null);
  };

  const handleCancel = () => {
    setEditingBrand(null);
    setIsAdding(false);
    setFormData({ name: "", slug: "", description: "", isActive: true });
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-4xl mb-2">BRAND MANAGEMENT</h1>
          <p className="text-gray-600 font-bold">
            Manage shoe brands available in your store
          </p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="bg-[var(--comic-green)] text-white px-6 py-3 border-4 border-black shadow-hard font-heading text-xl hover:scale-105 transition flex items-center gap-2"
        >
          <Plus size={24} />
          ADD BRAND
        </button>
      </div>

      {brands.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-yellow-50 border-4 border-black shadow-hard p-6"
        >
          <h2 className="font-heading text-3xl mb-3">No brands yet</h2>
          <p className="text-gray-700 font-bold mb-4">
            Create your first brand and it will appear here. This page no longer shows placeholder data.
          </p>
          <button
            onClick={() => setIsAdding(true)}
            className="bg-[var(--comic-purple)] text-white px-6 py-3 border-2 border-black font-bold hover:bg-purple-700 transition"
          >
            Add a brand
          </button>
        </motion.div>
      )}

      {/* Add/Edit Form Modal */}
      <AnimatePresence>
        {(isAdding || editingBrand) && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={handleCancel}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white border-4 border-black shadow-hard p-8 z-50 max-w-2xl w-full"
            >
              <h2 className="font-heading text-3xl mb-6">
                {editingBrand ? "EDIT BRAND" : "ADD NEW BRAND"}
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block font-bold mb-2">Brand Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        name: e.target.value,
                        slug: generateSlug(e.target.value),
                      });
                    }}
                    placeholder="e.g., Nike"
                    className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-[var(--comic-purple)] font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-2">Slug *</label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) =>
                      setFormData({ ...formData, slug: e.target.value })
                    }
                    placeholder="e.g., nike"
                    className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-[var(--comic-purple)] font-bold"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    URL-friendly version (auto-generated)
                  </p>
                </div>

                <div>
                  <label className="block font-bold mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={3}
                    placeholder="Brief description of the brand..."
                    className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-[var(--comic-purple)] font-bold resize-none"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) =>
                        setFormData({ ...formData, isActive: e.target.checked })
                      }
                      className="w-5 h-5 border-2 border-black"
                    />
                    <span className="font-bold">Brand is active</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  onClick={handleCancel}
                  className="flex-1 px-6 py-3 border-2 border-black font-bold hover:bg-gray-100 transition"
                >
                  CANCEL
                </button>
                <button
                  onClick={handleSave}
                  disabled={!formData.name || !formData.slug}
                  className="flex-1 px-6 py-3 bg-[var(--comic-green)] text-white border-2 border-black font-bold hover:bg-green-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Save size={20} />
                  {editingBrand ? "UPDATE" : "CREATE"}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Brands Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {brands.map((brand, index) => (
          <motion.div
            key={brand.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white border-4 border-black shadow-hard p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-[var(--comic-red)] to-[var(--comic-purple)] border-2 border-black">
                  <Tag size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="font-heading text-2xl">{brand.name}</h3>
                  <p className="text-sm text-gray-600 font-bold">
                    /{brand.slug}
                  </p>
                </div>
              </div>
              <span
                className={`px-3 py-1 border-2 border-black text-xs font-bold ${
                  brand.isActive
                    ? "bg-green-100 text-green-600"
                    : "bg-red-100 text-red-600"
                }`}
              >
                {brand.isActive ? "ACTIVE" : "INACTIVE"}
              </span>
            </div>

            <p className="text-sm text-gray-600 mb-4 line-clamp-2">
              {brand.description}
            </p>

            <div className="mb-4 p-3 bg-gray-50 border-2 border-black">
              <p className="text-xs text-gray-600 font-bold mb-1">
                PRODUCTS IN STOCK
              </p>
              <p className="font-heading text-3xl">{brand.productCount}</p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(brand)}
                className="flex-1 p-3 bg-[var(--comic-purple)] text-white border-2 border-black font-bold hover:bg-purple-700 transition flex items-center justify-center gap-2"
              >
                <Edit size={16} />
                EDIT
              </button>
              <button
                onClick={() => setDeleteModal(brand.id)}
                className="flex-1 p-3 bg-[var(--comic-red)] text-white border-2 border-black font-bold hover:bg-red-600 transition flex items-center justify-center gap-2"
              >
                <Trash2 size={16} />
                DELETE
              </button>
            </div>
          </motion.div>
        ))}
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
              <h2 className="font-heading text-3xl mb-4">DELETE BRAND?</h2>
              <p className="text-gray-600 font-bold mb-6">
                This will remove the brand from the system. Products with this
                brand will need to be reassigned. This action cannot be undone.
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
                  className="flex-1 px-6 py-3 bg-[var(--comic-red)] text-white border-2 border-black font-bold hover:bg-red-600 transition"
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
