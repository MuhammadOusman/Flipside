"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Size, SizeSystem, formatSize } from "@/lib/sizeConversion";

interface SizeSelectorProps {
  size: Size;
  className?: string;
}

export default function SizeSelector({ size, className = "" }: SizeSelectorProps) {
  const [selectedSystem, setSelectedSystem] = useState<SizeSystem>("EU");

  const systems: SizeSystem[] = ["EU", "US", "UK"];

  return (
    <div className={`border-4 border-black bg-white shadow-hard ${className}`}>
      <div className="p-4">
        <p className="text-sm font-bold text-gray-600 mb-3">SIZE</p>
        
        {/* Size System Tabs */}
        <div className="flex gap-2 mb-3">
          {systems.map((system) => (
            <button
              key={system}
              onClick={() => setSelectedSystem(system)}
              className={`flex-1 py-2 px-3 border-2 border-black font-bold text-sm transition ${
                selectedSystem === system
                  ? "bg-[var(--comic-red)] text-white"
                  : "bg-white hover:bg-gray-100"
              }`}
            >
              {system}
            </button>
          ))}
        </div>

        {/* Selected Size Display */}
        <motion.div
          key={selectedSystem}
          className="bg-yellow-300 border-2 border-black p-4 text-center"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <p className="font-heading text-4xl">{formatSize(size, selectedSystem)}</p>
        </motion.div>

        {/* All Sizes Reference */}
        <div className="mt-3 pt-3 border-t-2 border-black text-center">
          <p className="text-xs font-bold text-gray-500">
            EU {size.EU} • US {size.US} • UK {size.UK}
          </p>
        </div>
      </div>
    </div>
  );
}
