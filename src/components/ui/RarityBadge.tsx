"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { RARITY_CONFIG } from "@/data/rarity";
import type { Rarity } from "@/types";

interface RarityBadgeProps {
  rarity: Rarity;
  size?: "sm" | "md" | "lg";
  showChance?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-3 py-1 text-sm",
  lg: "px-4 py-1.5 text-base",
};

export function RarityBadge({
  rarity,
  size = "md",
  showChance = false,
  className,
}: RarityBadgeProps) {
  const config = RARITY_CONFIG[rarity];

  return (
    <motion.span
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-semibold uppercase tracking-wider",
        sizeClasses[size],
        className
      )}
      style={{
        color: config.color,
        backgroundColor: `${config.color}20`,
        border: `1px solid ${config.color}40`,
        boxShadow: `0 0 12px ${config.glowColor}`,
      }}
    >
      <span
        className="w-2 h-2 rounded-full"
        style={{ backgroundColor: config.color }}
      />
      {config.label}
      {showChance && (
        <span className="opacity-70 normal-case">({config.chance}%)</span>
      )}
    </motion.span>
  );
}
