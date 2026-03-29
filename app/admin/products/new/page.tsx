"use client";

import { motion } from "framer-motion";
import { useState, useCallback } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";

type UploadedImage = {
  id: string;
  file: File;
  preview: string;
};

export default function NewProductPage() {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    size: "",
    price: "",
    condition: "95",
    stock: "1",
    description: "",
  });

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files).filter((file) =>
      file.type.startsWith("image/")
    );

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        setImages((prev) => [
          ...prev,
          {
            id: Math.random().toString(36).substr(2, 9),
            file,
            preview: reader.result as string,
          },
        ]);
      };
      reader.readAsDataURL(file);
    });
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        setImages((prev) => [
          ...prev,
          {
            id: Math.random().toString(36).substr(2, 9),
            file,
            preview: reader.result as string,
          },
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (id: string) => {
    setImages(images.filter((img) => img.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form Data:", formData);
    console.log("Images:", images);
    alert("Product created! (This is a demo - connect to Sanity for real functionality)");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-4xl mb-2">ADD NEW PRODUCT</h1>
        <p className="text-gray-600 font-bold">
          Upload product details and images
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Image Upload Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border-4 border-black shadow-hard p-6"
        >
          <h2 className="font-heading text-2xl mb-4 flex items-center gap-2">
            <ImageIcon size={24} />
            PRODUCT IMAGES
          </h2>

          {/* Drag & Drop Area */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-4 border-dashed ${
              isDragging
                ? "border-[--comic-purple] bg-purple-50"
                : "border-gray-300"
            } p-12 text-center transition`}
          >
            <Upload
              size={48}
              className={`mx-auto mb-4 ${
                isDragging ? "text-[--comic-purple]" : "text-gray-400"
              }`}
            />
            <p className="font-heading text-2xl mb-2">
              {isDragging ? "DROP IMAGES HERE!" : "DRAG & DROP IMAGES"}
            </p>
            <p className="text-gray-600 font-bold mb-4">or</p>
            <label className="inline-block">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <span className="bg-[--comic-purple] text-white px-6 py-3 border-2 border-black font-bold cursor-pointer hover:bg-purple-700 transition inline-block">
                BROWSE FILES
              </span>
            </label>
          </div>

          {/* Image Previews */}
          {images.length > 0 && (
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              {images.map((image, index) => (
                <motion.div
                  key={image.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="relative group"
                >
                  <div className="aspect-square border-2 border-black overflow-hidden bg-gray-200">
                    <img
                      src={image.preview}
                      alt={`Upload ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeImage(image.id)}
                    className="absolute -top-2 -right-2 bg-[--comic-red] text-white p-1 border-2 border-black hover:bg-red-600 transition"
                  >
                    <X size={16} />
                  </button>
                  {index === 0 && (
                    <div className="absolute bottom-2 left-2 bg-[--comic-green] text-white px-2 py-1 border border-black text-xs font-bold">
                      PRIMARY
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Product Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white border-4 border-black shadow-hard p-6"
        >
          <h2 className="font-heading text-2xl mb-4">PRODUCT DETAILS</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block font-bold mb-2">Product Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g., Jordan 4 Military Black"
                className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-[--comic-purple] font-bold"
              />
            </div>

            <div>
              <label className="block font-bold mb-2">Brand *</label>
              <select
                required
                value={formData.brand}
                onChange={(e) =>
                  setFormData({ ...formData, brand: e.target.value })
                }
                className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-[--comic-purple] font-bold"
              >
                <option value="">Select Brand</option>
                <option value="Nike">Nike</option>
                <option value="Adidas">Adidas</option>
                <option value="New Balance">New Balance</option>
                <option value="Jordan">Jordan</option>
                <option value="Yeezy">Yeezy</option>
                <option value="Converse">Converse</option>
                <option value="Vans">Vans</option>
              </select>
            </div>

            <div>
              <label className="block font-bold mb-2">Size (UK) *</label>
              <input
                type="text"
                required
                value={formData.size}
                onChange={(e) =>
                  setFormData({ ...formData, size: e.target.value })
                }
                placeholder="e.g., UK 9"
                className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-[--comic-purple] font-bold"
              />
            </div>

            <div>
              <label className="block font-bold mb-2">Price (PKR) *</label>
              <input
                type="number"
                required
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                placeholder="e.g., 48000"
                className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-[--comic-purple] font-bold"
              />
            </div>

            <div>
              <label className="block font-bold mb-2">
                Condition (%) *: {formData.condition}%
              </label>
              <input
                type="range"
                min="50"
                max="100"
                value={formData.condition}
                onChange={(e) =>
                  setFormData({ ...formData, condition: e.target.value })
                }
                className="w-full h-3 border-2 border-black appearance-none"
                style={{
                  background: `linear-gradient(to right, 
                    ${
                      parseInt(formData.condition) >= 90
                        ? "var(--comic-green)"
                        : parseInt(formData.condition) >= 80
                        ? "#FBBF24"
                        : "var(--comic-red)"
                    } 0%, 
                    ${
                      parseInt(formData.condition) >= 90
                        ? "var(--comic-green)"
                        : parseInt(formData.condition) >= 80
                        ? "#FBBF24"
                        : "var(--comic-red)"
                    } ${formData.condition}%, 
                    #E5E7EB ${formData.condition}%, 
                    #E5E7EB 100%)`,
                }}
              />
            </div>

            <div>
              <label className="block font-bold mb-2">Stock Quantity *</label>
              <input
                type="number"
                min="0"
                required
                value={formData.stock}
                onChange={(e) =>
                  setFormData({ ...formData, stock: e.target.value })
                }
                className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-[--comic-purple] font-bold"
              />
            </div>
          </div>

          <div className="mt-6">
            <label className="block font-bold mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={4}
              placeholder="Product description, flaws, authenticity details..."
              className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-[--comic-purple] font-bold resize-none"
            />
          </div>
        </motion.div>

        {/* Submit Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex gap-4"
        >
          <button
            type="button"
            onClick={() => window.history.back()}
            className="flex-1 px-6 py-4 border-4 border-black font-heading text-xl hover:bg-gray-100 transition"
          >
            CANCEL
          </button>
          <button
            type="submit"
            className="flex-1 px-6 py-4 bg-[--comic-green] text-white border-4 border-black shadow-hard font-heading text-xl hover:scale-105 transition"
          >
            CREATE PRODUCT
          </button>
        </motion.div>
      </form>
    </div>
  );
}
