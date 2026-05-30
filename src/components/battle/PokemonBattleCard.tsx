"use client";

import { motion } from "framer-motion";
import { useEffect } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { BATTLE_CLASSIC_THEME } from "@/data/battle-theme";
import { RARITY_CONFIG } from "@/data/rarity";
import {
  BattleAttackFx,
  BattleSleepOverlay,
  BattleStatusBadge,
} from "@/components/battle/BattleAttackFx";
import { battleAudio } from "@/lib/battle-audio";
import type { BattleFighter } from "@/types/battle";

export type BattleTurnHighlight = "attack" | "defend" | "idle-dim" | "none";

export type BattleSelectionMode =
  | "pick-actor"
  | "pick-target"
  | "selected-actor"
  | "selected-target"
  | "none";

interface PokemonBattleCardProps {
  fighter: BattleFighter;
  turnHighlight?: BattleTurnHighlight;
  selectionMode?: BattleSelectionMode;
  compact?: boolean;
  side?: "enemy" | "player";
  onSelect?: () => void;
  selectable?: boolean;
  moveType?: string;
  attackPhase?: "strike" | "flash" | "impact";
  statusApplied?: string;
}

function classicHpFillClass(hpPercent: number): string {
  if (hpPercent > 50) return "battle-classic-hp-fill-high";
  if (hpPercent > 25) return "battle-classic-hp-fill-mid";
  return "battle-classic-hp-fill-low";
}

export function PokemonBattleCard({
  fighter,
  turnHighlight = "none",
  selectionMode = "none",
  compact = false,
  side = "player",
  onSelect,
  selectable = false,
  moveType,
  attackPhase,
  statusApplied,
}: PokemonBattleCardProps) {
  const config = RARITY_CONFIG[fighter.pokemon.rarity];
  const hpPercent = (fighter.currentHp / fighter.maxHp) * 100;
  const isKo = fighter.currentHp <= 0;
  const isStriking = turnHighlight === "attack" && !isKo;
  const isFlashing = turnHighlight === "defend" && !isKo;
  const isDimmed = turnHighlight === "idle-dim" && !isKo;
  const isActive = isStriking || isFlashing;
  const isSleeping = fighter.status?.effect === "sleep" && !isKo;
  const isSelectable = selectable && !isKo && onSelect;

  const selectionRing =
    selectionMode === "pick-actor" || selectionMode === "pick-target"
      ? "battle-card-selectable"
      : selectionMode === "selected-actor"
        ? "battle-card-selected-actor"
        : selectionMode === "selected-target"
          ? "battle-card-selected-target"
          : "";

  const typeFxClass =
    isFlashing && moveType ? `battle-card-hit-${moveType in HIT_TYPES ? moveType : "default"}` : "";

  // Tocar sons baseados na fase da animação
  useEffect(() => {
    if (isStriking) {
      battleAudio.playAttack(moveType || "normal");
    }
  }, [isStriking, moveType]);

  return (
    <motion.div
      role={isSelectable ? "button" : undefined}
      tabIndex={isSelectable ? 0 : undefined}
      onClick={isSelectable ? onSelect : undefined}
      onKeyDown={
        isSelectable
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelect?.();
              }
            }
          : undefined
      }
      key={isFlashing ? `flash-${moveType}` : isStriking ? "strike" : "idle"}
      animate={
        isKo
          ? { opacity: 0.4, scale: 1, x: 0, y: 0, filter: "brightness(1)" }
          : isStriking
            ? {
                y: side === "player" ? [0, -40, 0] : [0, 40, 0],
                scale: [1, 1.15, 1],
                filter: ["brightness(1)", "brightness(1.5)", "brightness(1)"],
                zIndex: 50,
              }
            : isFlashing
              ? {
                  x: [0, -8, 8, -6, 6, -4, 4, 0],
                  scale: [1, 0.9, 1.1, 1],
                  filter: [
                    "brightness(1)",
                    "brightness(3)",
                    "brightness(1)",
                    "brightness(2.5)",
                    "brightness(1)",
                  ],
                }
              : isDimmed
                ? { opacity: 0.45, scale: 0.96, x: 0, y: 0, filter: "brightness(0.8)" }
                : isSelectable
                  ? { opacity: 1, scale: 1.02, y: 0, filter: "brightness(1.1)" }
                  : { opacity: 1, scale: 1, x: 0, y: 0, filter: "brightness(1)" }
      }
      transition={
        isFlashing
          ? { duration: 0.4, ease: "easeInOut" }
          : isStriking
            ? { duration: 0.25, ease: "backOut" }
            : isSelectable
              ? { duration: 0.3 }
              : { duration: 0.2 }
      }
      className={cn(
        "relative overflow-hidden w-full text-left",
        BATTLE_CLASSIC_THEME
          ? cn(
              "battle-classic-card z-[1]",
              side === "enemy" ? "battle-classic-card-enemy" : "battle-classic-card-player",
              isActive && "battle-classic-card-active",
              compact ? "p-2" : "p-3"
            )
          : cn("glass-card", compact ? "p-2" : "p-3"),
        isKo && "grayscale cursor-default",
        isStriking && "z-10",
        isFlashing && "z-10",
        isDimmed && !BATTLE_CLASSIC_THEME && "z-0",
        selectionRing,
        typeFxClass,
        isSleeping && "battle-card-asleep",
        isSelectable && "cursor-pointer battle-card-tap-hint",
        !isSelectable && "cursor-default"
      )}
      style={
        BATTLE_CLASSIC_THEME
          ? undefined
          : {
              borderColor: `${config.color}40`,
            }
      }
    >
      {isFlashing && moveType && attackPhase && (
        <BattleAttackFx
          moveType={moveType}
          statusApplied={statusApplied}
          phase={attackPhase}
          side={side}
        />
      )}

      {isSleeping && <BattleSleepOverlay />}

      {fighter.status && !isKo && fighter.status.effect !== "sleep" && (
        <div className="absolute top-1 right-1 z-20">
          <BattleStatusBadge effect={fighter.status.effect} />
        </div>
      )}

      {BATTLE_CLASSIC_THEME && fighter.battleLevel != null && fighter.battleLevel > 0 && (
        <span className="battle-classic-level">Lv.{fighter.battleLevel}</span>
      )}

      <div className={cn("relative mx-auto", compact ? "w-16 h-16" : "w-20 h-20")}>
        <Image
          src={fighter.pokemon.image}
          alt={fighter.pokemon.name}
          width={compact ? 64 : 80}
          height={compact ? 64 : 80}
          className={cn(
            "object-contain drop-shadow-lg relative z-[2]",
            isSleeping && "opacity-60 saturate-50"
          )}
          unoptimized
        />
      </div>

      <p
        className={cn(
          "font-bold text-center truncate mt-1 relative z-[2]",
          compact ? "text-xs" : "text-sm"
        )}
        style={{ color: config.color }}
      >
        {fighter.pokemon.name}
      </p>

      {!BATTLE_CLASSIC_THEME && fighter.battleLevel != null && fighter.battleLevel > 0 && (
        <p className="text-[9px] text-center text-indigo-400 font-semibold relative z-[2]">
          Nv. {fighter.battleLevel}
        </p>
      )}

      <div className="mt-2 relative z-[2]">
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
              BATTLE_CLASSIC_THEME ? classicHpFillClass(hpPercent) : "rounded-full"
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

const HIT_TYPES: Record<string, boolean> = {
  fire: true,
  water: true,
  electric: true,
  grass: true,
  ice: true,
  poison: true,
  psychic: true,
  ghost: true,
  fighting: true,
  normal: true,
  default: true,
};
