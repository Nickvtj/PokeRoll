"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { playLevelUp, playXpBarFill } from "@/lib/sound-engine";
import type { PokemonLevelUpResult } from "@/types/battle";
import { isLocalAsset } from "@/lib/image-utils";
import { cn } from "@/lib/utils";

export const BAR_DURATION = 1;
export const STAGGER = 0.15;

interface BattleLevelUpPanelProps {
  levelUps: PokemonLevelUpResult[];
}

interface XpFillBarProps {
  prevPct: number;
  targetPct: number;
  barDelay: number;
  pokemonId: number;
  leveledUp: boolean;
  luckyEggBoosted?: boolean;
}

function XpFillBar({
  prevPct,
  targetPct,
  barDelay,
  pokemonId,
  leveledUp,
  luckyEggBoosted,
}: XpFillBarProps) {
  const levelUpPlayedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    const soundTimer = window.setTimeout(() => {
      if (!cancelled) void playXpBarFill(BAR_DURATION);
    }, barDelay * 1000);

    return () => {
      cancelled = true;
      clearTimeout(soundTimer);
    };
  }, [barDelay, pokemonId]);

  return (
    <motion.div
      className={cn(
        "progress-fill h-full rounded-full",
        luckyEggBoosted
          ? "bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 shadow-[0_0_10px_rgba(251,191,36,0.45)]"
          : "bg-gradient-to-r from-indigo-500 to-purple-500"
      )}
      initial={{ width: `${prevPct}%` }}
      animate={{ width: `${targetPct}%` }}
      transition={{ duration: BAR_DURATION, delay: barDelay, ease: [0, 0, 0.58, 1] }}
      style={{ animation: "none" }}
      onAnimationComplete={() => {
        if (!leveledUp || levelUpPlayedRef.current) return;
        levelUpPlayedRef.current = true;
        void playLevelUp();
      }}
    />
  );
}

export function getXpSequenceDurationMs(levelUps: PokemonLevelUpResult[]): number {
  if (levelUps.length === 0) return 0;
  const lastIndex = levelUps.length - 1;
  const lastDelay = lastIndex * (BAR_DURATION + STAGGER);
  const last = levelUps[lastIndex];
  return (lastDelay + BAR_DURATION + (last.leveledUp ? 0.4 : 0.15)) * 1000;
}

export function BattleLevelUpPanel({ levelUps }: BattleLevelUpPanelProps) {
  if (levelUps.length === 0) return null;

  return (
    <div className="space-y-3 text-left">
      {levelUps.map((entry, i) => {
        const needed = entry.xpNeeded ?? 100;
        const prevPct = needed > 0 ? (entry.previousXpInLevel / needed) * 100 : 0;
        const barDelay = i * (BAR_DURATION + STAGGER);
        const luckyEggBoosted = entry.luckyEggBoosted ?? false;

        return (
          <motion.div
            key={entry.pokemonId}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * STAGGER }}
            className="glass-card p-3 flex items-center gap-3 overflow-hidden"
          >
            <Image
              src={entry.image}
              alt={entry.pokemonName}
              width={40}
              height={40}
              className="object-contain shrink-0"
              unoptimized={!isLocalAsset(entry.image)}
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
                <span className={cn(luckyEggBoosted && "text-amber-300 font-semibold")}>
                  +{entry.xpGained} XP{luckyEggBoosted ? ", 2× Lucky Egg" : ""}
                </span>
                <span>
                  {entry.newXpInLevel}/{needed}
                </span>
              </div>
              <div
                className={cn(
                  "progress-bar h-1.5 mt-1 overflow-hidden rounded-full",
                  luckyEggBoosted && "ring-1 ring-amber-400/30"
                )}
              >
                <XpFillBar
                  prevPct={prevPct}
                  targetPct={entry.xpPct}
                  barDelay={barDelay}
                  pokemonId={entry.pokemonId}
                  leveledUp={entry.leveledUp}
                  luckyEggBoosted={luckyEggBoosted}
                />
              </div>
              {entry.leveledUp && (
                <motion.p
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: barDelay + BAR_DURATION + 0.1 }}
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
