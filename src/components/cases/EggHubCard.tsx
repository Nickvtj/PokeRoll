"use client";

import { motion } from "framer-motion";
import { Coins, Lock } from "lucide-react";
import { EggVisual } from "@/components/cases/EggVisual";
import { getEggCardTheme } from "@/data/egg-styles";
import { RARITY_CONFIG } from "@/data/rarity";
import type { CapsuleDefinition } from "@/types/capsule";
import { cn } from "@/lib/utils";

interface EggHubCardProps {
  egg: CapsuleDefinition;
  canAfford: boolean;
  onSelect: () => void;
}

export function EggHubCard({ egg, canAfford, onSelect }: EggHubCardProps) {
  const cardTheme = getEggCardTheme(egg.id);

  return (
    <motion.button
      type="button"
      onClick={onSelect}
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      className={cn(
        "group relative w-full flex flex-col items-center rounded-2xl border px-3 pt-5 pb-4 overflow-hidden cursor-pointer",
        "bg-gradient-to-b transition-shadow",
        cardTheme.gradient,
        !canAfford && "opacity-80"
      )}
      style={{
        borderColor: cardTheme.borderColor,
        boxShadow: `0 4px 16px ${cardTheme.glow}`,
      }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.08),transparent_60%)] pointer-events-none" />

      <div className="mb-2 transition-transform duration-200 ease-out group-hover:-translate-y-2">
        <EggVisual egg={egg} size="md" />
      </div>

      <h3 className="relative font-bold text-xs sm:text-sm text-white text-center leading-tight">
        {egg.name}
      </h3>
      <p className="relative text-[9px] text-white/40 mt-1 line-clamp-2 text-center px-1">
        {egg.focus}
      </p>

      <span
        className={cn(
          "relative mt-2.5 inline-flex items-center gap-1 text-[11px] font-bold tabular-nums px-2.5 py-1 rounded-full",
          canAfford
            ? "bg-amber-500/20 text-amber-200 border border-amber-400/30"
            : "bg-red-500/15 text-red-300/90 border border-red-400/25"
        )}
      >
        {canAfford ? <Coins className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
        {egg.cost}
      </span>

      <div className="relative mt-2 flex flex-wrap justify-center gap-0.5">
        {(["common", "uncommon", "rare", "epic", "legendary"] as const)
          .filter((r) => (egg.dropRates[r] ?? 0) > 0)
          .map((r) => (
            <span
              key={r}
              className="text-[7px] font-bold px-1 py-px rounded"
              style={{
                color: RARITY_CONFIG[r].color,
                backgroundColor: `${RARITY_CONFIG[r].color}18`,
              }}
            >
              {egg.dropRates[r]}%
            </span>
          ))}
      </div>
    </motion.button>
  );
}
