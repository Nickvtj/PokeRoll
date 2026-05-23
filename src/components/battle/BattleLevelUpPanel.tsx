"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import type { PokemonLevelUpResult } from "@/types/battle";

interface BattleLevelUpPanelProps {
  levelUps: PokemonLevelUpResult[];
}

export function BattleLevelUpPanel({ levelUps }: BattleLevelUpPanelProps) {
  if (levelUps.length === 0) return null;

  return (
    <div className="space-y-3 text-left">
      <p className="text-sm font-semibold text-indigo-300 text-center">XP do Time</p>
      {levelUps.map((entry, i) => {
        const needed = entry.xpNeeded ?? 100;
        const prevPct = needed > 0 ? (entry.previousXpInLevel / needed) * 100 : 0;
        return (
          <motion.div
            key={entry.pokemonId}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.15 }}
            className="glass-card p-3 flex items-center gap-3"
          >
            <Image
              src={entry.image}
              alt={entry.pokemonName}
              width={40}
              height={40}
              className="object-contain"
              unoptimized
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-bold truncate">{entry.pokemonName}</span>
                <span className="text-xs text-indigo-400 font-bold shrink-0">
                  Nv. {entry.newLevel}
                  {entry.leveledUp && (
                    <span className="text-amber-400 ml-1">↑</span>
                  )}
                </span>
              </div>
              <div className="flex justify-between text-[10px] text-white/40 mt-1">
                <span>+{entry.xpGained} XP</span>
                <span>
                  {entry.newXpInLevel}/{needed}
                </span>
              </div>
              <div className="progress-bar h-1.5 mt-1">
                <motion.div
                  className="progress-fill bg-gradient-to-r from-indigo-500 to-purple-500"
                  initial={{ width: `${prevPct}%` }}
                  animate={{ width: `${entry.xpPct}%` }}
                  transition={{ duration: 1, delay: 0.2 + i * 0.15, ease: "easeOut" }}
                />
              </div>
              {entry.leveledUp && (
                <motion.p
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8 + i * 0.1 }}
                  className="text-[10px] text-amber-400 font-bold mt-1"
                >
                  Subiu para Nv. {entry.newLevel}! +HP +ATK
                </motion.p>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
