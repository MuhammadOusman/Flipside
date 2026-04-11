"use client";

import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";

export default function WhatsAppButton() {
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "923001234567";
  const message = "Hi! I'm interested in your shoes";

  const handleClick = () => {
    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  return (
    <motion.button
      onClick={handleClick}
      className="fixed bottom-24 right-8 z-50 bg-[var(--goblin-green)] text-white p-4 rounded-full border-4 border-black shadow-hard-lg"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <MessageCircle size={28} />
      
      {/* Pulse Animation */}
      <span className="absolute inset-0 rounded-full bg-[var(--goblin-green)] animate-ping opacity-20" />
    </motion.button>
  );
}
