"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { StatusEffect } from "@/types/battle";

interface BattleAttackFxProps {
  moveType?: string;
  statusApplied?: StatusEffect | string;
  phase: "strike" | "flash" | "impact";
  side: "player" | "enemy";
}

export function BattleAttackFx({ moveType, statusApplied, phase, side }: BattleAttackFxProps) {
  if (!moveType && !statusApplied) return null;

  const type = moveType ?? "normal";
  const fxClass = `battle-atk-${type in TYPE_FX ? type : "default"}`;
  const active = phase === "flash" || phase === "impact";

  return (
    <div className={cn("battle-attack-fx pointer-events-none", active && fxClass)} aria-hidden>
      {active && (
        <>
          <span className="battle-attack-fx-burst" />
          <span className="battle-attack-fx-wave" />
          {type === "electric" && <span className="battle-attack-fx-bolt" />}
          {type === "fire" && <span className="battle-attack-fx-ember" />}
          {type === "water" && <span className="battle-attack-fx-splash" />}
        </>
      )}
      {statusApplied === "sleep" && active && (
        <motion.span
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: -8 }}
          className="battle-status-sleep-z"
        >
          Zzz
        </motion.span>
      )}
    </div>
  );
}

const TYPE_FX: Record<string, boolean> = {
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

interface StatusBadgeProps {
  effect: StatusEffect;
}

export function BattleStatusBadge({ effect }: StatusBadgeProps) {
  const config: Record<StatusEffect, { emoji: string; label: string; className: string }> = {
    burn: { emoji: "🔥", label: "Queimado", className: "battle-status-burn" },
    paralyze: { emoji: "⚡", label: "Paralisado", className: "battle-status-paralyze" },
    poison: { emoji: "☠️", label: "Envenenado", className: "battle-status-poison" },
    sleep: { emoji: "💤", label: "Dormindo", className: "battle-status-sleep" },
  };

  const c = config[effect];
  return (
    <span className={cn("battle-status-badge", c.className)}>
      <span aria-hidden>{c.emoji}</span>
      {c.label}
    </span>
  );
}

export function BattleSleepOverlay() {
  return (
    <div className="battle-sleep-overlay pointer-events-none" aria-hidden>
      <span className="battle-sleep-zzz">Z</span>
      <span className="battle-sleep-zzz battle-sleep-zzz-2">z</span>
      <span className="battle-sleep-zzz battle-sleep-zzz-3">z</span>
    </div>
  );
}
