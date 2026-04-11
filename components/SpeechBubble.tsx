"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SpeechBubbleProps {
  text: string;
  variant?: "pow" | "zap" | "boom" | "bam";
  className?: string;
}

export default function SpeechBubble({
  text,
  variant = "pow",
  className,
}: SpeechBubbleProps) {
  const colors = {
    pow: "bg-[var(--comic-red)] text-white",
    zap: "bg-[var(--comic-purple)] text-white",
    boom: "bg-yellow-300 text-black",
    bam: "bg-[var(--goblin-green)] text-white",
  };

  const rotations = {
    pow: 12,
    zap: -12,
    boom: 8,
    bam: -8,
  };

  return (
    <motion.div
      className={cn(
        "font-heading text-4xl md:text-6xl px-8 py-4 border-4 border-black shadow-hard-lg inline-block",
        colors[variant],
        className
      )}
      initial={{ scale: 0, rotate: 0 }}
      animate={{ 
        scale: 1,
        rotate: rotations[variant]
      }}
      transition={{ 
        type: "spring", 
        stiffness: 400, 
        damping: 15,
        duration: 0.6
      }}
    >
      {text}
    </motion.div>
  );
}
