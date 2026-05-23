"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface StickerBadgeProps {
  variant: "new" | "duplicate";
  className?: string;
  size?: "sm" | "md" | "lg";
}

const config = {
  new: {
    label: "Novo",
    bg: "bg-gradient-to-br from-emerald-400 to-green-600",
    text: "text-white",
    shadow: "shadow-emerald-500/50",
    border: "border-emerald-300/80",
  },
  duplicate: {
    label: "Repetido",
    bg: "bg-gradient-to-br from-amber-400 to-orange-500",
    text: "text-slate-900",
    shadow: "shadow-amber-500/50",
    border: "border-amber-200/80",
  },
};

const sizes = {
  sm: "px-2.5 py-1 text-xs",
  md: "px-3.5 py-1.5 text-sm",
  lg: "px-5 py-2 text-base",
};

export function StickerBadge({
  variant,
  className,
  size = "md",
}: StickerBadgeProps) {
  const c = config[variant];

  return (
    <motion.div
      initial={{ scale: 0, rotate: -12 }}
      animate={{ scale: 1, rotate: variant === "new" ? -8 : 6 }}
      transition={{ type: "spring", damping: 12, stiffness: 300, delay: 0.2 }}
      className={cn(
        "inline-flex items-center justify-center font-black uppercase tracking-wider",
        "rounded-lg border-2 shadow-lg",
        "select-none pointer-events-none",
        c.bg,
        c.text,
        c.shadow,
        c.border,
        sizes[size],
        className
      )}
      style={{
        textShadow:
          variant === "new" ? "0 1px 2px rgba(0,0,0,0.2)" : "none",
        boxShadow: `0 4px 14px ${variant === "new" ? "rgba(34,197,94,0.4)" : "rgba(245,158,11,0.4)"}, inset 0 1px 0 rgba(255,255,255,0.3)`,
      }}
    >
      {c.label}
    </motion.div>
  );
}
