"use client";

import { motion } from "framer-motion";
import { Sparkles, Stars } from "lucide-react";
import { RARITY_CONFIG } from "@/data/rarity";
import type { Rarity } from "@/types";
import { cn } from "@/lib/utils";

interface EggCelebrationProps {
  rarity: Rarity;
  isShiny: boolean;
}

const TIER_LABEL: Partial<Record<Rarity, string>> & { shiny: string } = {
  rare: "Raro!",
  epic: "Épico!",
  legendary: "Lendário!",
  shiny: "Shiny!",
};

export function EggCelebration({ rarity, isShiny }: EggCelebrationProps) {
  const meta = RARITY_CONFIG[rarity];
  const isHighTier =
    isShiny || rarity === "legendary" || rarity === "epic" || rarity === "rare";

  if (!isHighTier) return null;

  const color = isShiny ? "#fbbf24" : meta.color;
  const label = isShiny ? TIER_LABEL.shiny : TIER_LABEL[rarity];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center"
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: isShiny || rarity === "legendary" ? 8 : 12, repeat: Infinity, ease: "linear" }}
        className="absolute w-56 h-56 opacity-25"
        style={{
          background: `conic-gradient(from 0deg, transparent, ${color}, transparent, ${color}, transparent)`,
          borderRadius: "50%",
          filter: "blur(8px)",
        }}
      />

      {(isShiny || rarity === "legendary") && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 1.2, repeat: Infinity }}
          className="absolute inset-0"
          style={{
            background: `radial-gradient(circle at center, ${color}30 0%, transparent 55%)`,
          }}
        />
      )}

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
        className={cn(
          "relative flex items-center gap-2 px-4 py-2 rounded-full border font-black uppercase tracking-widest text-sm",
          isShiny || rarity === "legendary" ? "text-base" : "text-xs"
        )}
        style={{
          color,
          borderColor: `${color}60`,
          backgroundColor: `${color}18`,
          boxShadow: `0 0 40px ${color}40`,
        }}
      >
        {isShiny ? (
          <Stars className="w-5 h-5" />
        ) : (
          <Sparkles className="w-4 h-4" />
        )}
        {label}
      </motion.div>
    </motion.div>
  );
}
