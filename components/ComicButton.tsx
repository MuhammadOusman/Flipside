"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ComicButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "danger";
  size?: "sm" | "md" | "lg";
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}

export default function ComicButton({
  children,
  onClick,
  variant = "primary",
  size = "md",
  className,
  disabled = false,
  type = "button",
}: ComicButtonProps) {
  const baseStyles =
    "font-heading uppercase tracking-wide border-4 border-black transition-all duration-75 cursor-pointer";

  const variantStyles = {
    primary: "bg-[var(--comic-red)] text-white hover:bg-red-600 shadow-hard",
    secondary: "bg-white text-black hover:bg-gray-100 shadow-hard",
    danger: "bg-[var(--comic-purple)] text-white hover:bg-purple-700 shadow-hard",
  };

  const sizeStyles = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-xl",
  };

  const disabledStyles = "opacity-50 cursor-not-allowed";

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        disabled && disabledStyles,
        className
      )}
      whileHover={!disabled ? { scale: 1.02, x: 3, y: 3 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {children}
    </motion.button>
  );
}
