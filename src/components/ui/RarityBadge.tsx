"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { RARITY_CONFIG } from "@/data/rarity";
import type { Rarity } from "@/types";

interface RarityBadgeProps {
  rarity: Rarity;
  size?: "sm" | "md" | "lg";
  showChance?: boolean;
  subtle?: boolean;
  /** Sem glow — ideal para grids compactos (ex.: roleta) */
  compact?: boolean;
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
  subtle = false,
  compact = false,
  className,
}: RarityBadgeProps) {
  const config = RARITY_CONFIG[rarity];

  return (
    <motion.span
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={cn(
        "inline-flex items-center justify-center rounded-full font-semibold uppercase tracking-wider whitespace-nowrap",
        compact ? "gap-1 px-1.5 py-0.5 text-[9px]" : "gap-1.5",
        !compact && sizeClasses[size],
        className
      )}
      style={{
        color: config.color,
        backgroundColor: `${config.color}${compact ? "18" : "20"}`,
        border: `1px solid ${config.color}${compact ? "28" : subtle ? "30" : "40"}`,
        boxShadow: compact ? "none" : subtle ? `0 0 6px ${config.glowColor}` : `0 0 12px ${config.glowColor}`,
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
