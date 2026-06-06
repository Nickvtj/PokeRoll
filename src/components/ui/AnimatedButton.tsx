"use client";

import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { playUiClick, playUiConfirm } from "@/lib/ui-sounds";
import { cn } from "@/lib/utils";

interface AnimatedButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: "primary" | "secondary" | "gold" | "ghost";
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  icon?: React.ReactNode;
}

const variants = {
  primary:
    "bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white shadow-lg shadow-indigo-500/30",
  secondary:
    "glass text-white hover:bg-white/10 border border-white/20",
  gold: "bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-900 font-bold shadow-lg shadow-amber-500/40",
  ghost: "text-white/70 hover:text-white hover:bg-white/5",
};

const sizes = {
  sm: "px-4 py-2 text-sm rounded-xl",
  md: "px-6 py-3 text-base rounded-xl",
  lg: "px-8 py-4 text-lg rounded-2xl",
  xl: "px-12 py-5 text-xl rounded-2xl",
};

export function AnimatedButton({
  children,
  onClick,
  disabled,
  loading,
  variant = "primary",
  size = "md",
  className,
  icon,
}: AnimatedButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: disabled || loading ? 1 : 1.03 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.97 }}
      onClick={(e) => {
        if (!disabled && !loading) {
          if (variant === "gold" || variant === "primary") playUiConfirm();
          else playUiClick();
        }
        onClick?.(e as React.MouseEvent<HTMLButtonElement>);
      }}
      disabled={disabled || loading}
      className={cn(
        "btn-shine relative inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        className
      )}
    >
      {loading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        icon
      )}
      {children}
    </motion.button>
  );
}
