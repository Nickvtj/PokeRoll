"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { RARITY_CONFIG } from "@/data/rarity";
import type { BattleFighter } from "@/types/battle";

interface PokemonBattleCardProps {
  fighter: BattleFighter;
  isActive?: boolean;
  compact?: boolean;
}

export function PokemonBattleCard({
  fighter,
  isActive = false,
  compact = false,
}: PokemonBattleCardProps) {
  const config = RARITY_CONFIG[fighter.pokemon.rarity];
  const hpPercent = (fighter.currentHp / fighter.maxHp) * 100;
  const isKo = fighter.currentHp <= 0;

  return (
    <motion.div
      animate={
        isActive
          ? { scale: 1.05, boxShadow: `0 0 30px ${config.glowColor}` }
          : { scale: 1 }
      }
      className={cn(
        "glass-card relative overflow-hidden transition-all",
        compact ? "p-2" : "p-3",
        isKo && "opacity-40 grayscale",
        isActive && "ring-2",
      )}
      style={{
        borderColor: `${config.color}40`,
        ...(isActive ? { ringColor: config.color } : {}),
      }}
    >
      <div className={cn("relative mx-auto", compact ? "w-16 h-16" : "w-20 h-20")}>
        <Image
          src={fighter.pokemon.image}
          alt={fighter.pokemon.name}
          width={compact ? 64 : 80}
          height={compact ? 64 : 80}
          className="object-contain drop-shadow-lg"
          unoptimized
        />
      </div>

      <p
        className={cn("font-bold text-center truncate mt-1", compact ? "text-xs" : "text-sm")}
        style={{ color: config.color }}
      >
        {fighter.pokemon.name}
      </p>
      {fighter.battleLevel != null && fighter.battleLevel > 0 && (
        <p className="text-[9px] text-center text-indigo-400 font-semibold">
          Nv. {fighter.battleLevel}
        </p>
      )}

      {/* HP Bar */}
      <div className="mt-2">
        <div className="flex justify-between text-[10px] text-white/50 mb-0.5">
          <span>HP</span>
          <span>
            {fighter.currentHp}/{fighter.maxHp}
          </span>
        </div>
        <div className="h-2 rounded-full bg-white/10 overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            initial={false}
            animate={{ width: `${hpPercent}%` }}
            transition={{ duration: 0.4 }}
            style={{
              background:
                hpPercent > 50
                  ? "linear-gradient(90deg, #22c55e, #4ade80)"
                  : hpPercent > 25
                    ? "linear-gradient(90deg, #eab308, #facc15)"
                    : "linear-gradient(90deg, #ef4444, #f87171)",
            }}
          />
        </div>
      </div>
    </motion.div>
  );
}
