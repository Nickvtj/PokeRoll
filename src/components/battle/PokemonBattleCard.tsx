"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { BATTLE_CLASSIC_THEME } from "@/data/battle-theme";
import { RARITY_CONFIG } from "@/data/rarity";
import type { BattleFighter } from "@/types/battle";

export type BattleTurnHighlight = "attack" | "defend" | "idle-dim" | "none";

interface PokemonBattleCardProps {
  fighter: BattleFighter;
  turnHighlight?: BattleTurnHighlight;
  compact?: boolean;
  side?: "enemy" | "player";
}

function classicHpFillClass(hpPercent: number): string {
  if (hpPercent > 50) return "battle-classic-hp-fill-high";
  if (hpPercent > 25) return "battle-classic-hp-fill-mid";
  return "battle-classic-hp-fill-low";
}

export function PokemonBattleCard({
  fighter,
  turnHighlight = "none",
  compact = false,
  side = "player",
}: PokemonBattleCardProps) {
  const config = RARITY_CONFIG[fighter.pokemon.rarity];
  const hpPercent = (fighter.currentHp / fighter.maxHp) * 100;
  const isKo = fighter.currentHp <= 0;
  const isStriking = turnHighlight === "attack" && !isKo;
  const isFlashing = turnHighlight === "defend" && !isKo;
  const isDimmed = turnHighlight === "idle-dim" && !isKo;
  const isActive = isStriking || isFlashing;

  return (
    <motion.div
      key={isFlashing ? "flash" : isStriking ? "strike" : "idle"}
      animate={
        isKo
          ? { opacity: 0.4, scale: 1, x: 0, y: 0, filter: "brightness(1)" }
          : isStriking
            ? {
                y: [0, fighter.isPlayer ? -16 : 16, 0],
                scale: [1, 1.05, 1],
                filter: ["brightness(1)", "brightness(1.2)", "brightness(1)"],
              }
            : isFlashing
              ? {
                  opacity: [1, 0.15, 1, 0.15, 1, 0.15, 1],
                  filter: [
                    "brightness(1)",
                    "brightness(2.4)",
                    "brightness(1)",
                    "brightness(2.4)",
                    "brightness(1)",
                    "brightness(2.4)",
                    "brightness(1)",
                  ],
                  x: 0,
                  y: 0,
                  scale: 1,
                }
              : isDimmed
                ? { opacity: 0.5, scale: 0.97, x: 0, y: 0, filter: "brightness(0.85)" }
                : { opacity: 1, scale: 1, x: 0, y: 0, filter: "brightness(1)" }
      }
      transition={
        isFlashing
          ? { duration: 0.62, ease: "linear" }
          : isStriking
            ? { duration: 0.22, ease: "easeOut" }
            : { duration: 0.2 }
      }
      className={cn(
        "relative overflow-hidden",
        BATTLE_CLASSIC_THEME
          ? cn(
              "battle-classic-card z-[1]",
              side === "enemy" ? "battle-classic-card-enemy" : "battle-classic-card-player",
              isActive && "battle-classic-card-active",
              compact ? "p-2" : "p-3"
            )
          : cn(
              "glass-card",
              compact ? "p-2" : "p-3"
            ),
        isKo && "grayscale",
        isStriking && "z-10",
        isFlashing && "z-10",
        isDimmed && !BATTLE_CLASSIC_THEME && "z-0"
      )}
      style={
        BATTLE_CLASSIC_THEME
          ? undefined
          : {
              borderColor: `${config.color}40`,
            }
      }
    >
      {BATTLE_CLASSIC_THEME && fighter.battleLevel != null && fighter.battleLevel > 0 && (
        <span className="battle-classic-level">Lv.{fighter.battleLevel}</span>
      )}

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
        className={cn(
          "font-bold text-center truncate mt-1",
          compact ? "text-xs" : "text-sm"
        )}
        style={{ color: config.color }}
      >
        {fighter.pokemon.name}
      </p>

      {!BATTLE_CLASSIC_THEME && fighter.battleLevel != null && fighter.battleLevel > 0 && (
        <p className="text-[9px] text-center text-indigo-400 font-semibold">
          Nv. {fighter.battleLevel}
        </p>
      )}

      <div className="mt-2">
        <div
          className={cn(
            "flex justify-between mb-0.5",
            BATTLE_CLASSIC_THEME ? "text-[9px] font-semibold text-white/45" : "text-[10px] text-white/50"
          )}
        >
          <span>HP</span>
          <span>
            {fighter.currentHp}/{fighter.maxHp}
          </span>
        </div>
        <div
          className={cn(
            BATTLE_CLASSIC_THEME ? "battle-classic-hp-track" : "h-2 rounded-full bg-white/10 overflow-hidden"
          )}
        >
          <motion.div
            className={cn(
              "h-full",
              BATTLE_CLASSIC_THEME
                ? classicHpFillClass(hpPercent)
                : "rounded-full"
            )}
            initial={false}
            animate={{ width: `${hpPercent}%` }}
            transition={{
              duration: isFlashing ? 0.35 : 0.25,
              delay: isFlashing ? 0.08 : 0,
              ease: "easeOut",
            }}
            style={
              BATTLE_CLASSIC_THEME
                ? undefined
                : {
                    background:
                      hpPercent > 50
                        ? "linear-gradient(90deg, #22c55e, #4ade80)"
                        : hpPercent > 25
                          ? "linear-gradient(90deg, #eab308, #facc15)"
                          : "linear-gradient(90deg, #ef4444, #f87171)",
                  }
            }
          />
        </div>
      </div>
    </motion.div>
  );
}
