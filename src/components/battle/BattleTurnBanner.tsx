"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Shield, Swords, User } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TacticalPhase } from "@/types/battle";

const STEPS = [
  { id: "actor", label: "Pokémon" },
  { id: "target", label: "Alvo" },
  { id: "move", label: "Golpe" },
] as const;

function stepIndex(phase?: TacticalPhase): number {
  switch (phase) {
    case "player-pick-actor":
      return 0;
    case "player-pick-target":
      return 1;
    case "player-pick-move":
      return 2;
    default:
      return -1;
  }
}

export function BattleTurnBanner({ phase }: { phase?: TacticalPhase }) {
  const isPlayerTurn =
    phase === "player-pick-actor" ||
    phase === "player-pick-target" ||
    phase === "player-pick-move";
  const isEnemyTurn = phase === "enemy-turn";
  const isAnimating = phase === "executing" || phase === "animating";
  const currentStep = stepIndex(phase);

  return (
    <div className="space-y-2 mb-3 relative z-20">
      <AnimatePresence mode="wait">
        {isPlayerTurn && (
          <motion.div
            key="player-turn"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="battle-turn-banner battle-turn-banner-player"
          >
            <User className="w-4 h-4 shrink-0" />
            <span>SEU TURNO</span>
            <span className="battle-turn-banner-sub">Escolha sua ação</span>
          </motion.div>
        )}
        {isEnemyTurn && (
          <motion.div
            key="enemy-turn"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="battle-turn-banner battle-turn-banner-enemy"
          >
            <Shield className="w-4 h-4 shrink-0" />
            <span>TURNO DO OPONENTE</span>
          </motion.div>
        )}
        {isAnimating && (
          <motion.div
            key="animating"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="battle-turn-banner battle-turn-banner-action"
          >
            <Swords className="w-4 h-4 shrink-0" />
            <span>ATACANDO...</span>
          </motion.div>
        )}
      </AnimatePresence>

      {currentStep >= 0 && (
        <div className="flex items-center justify-center gap-1.5">
          {STEPS.map((step, i) => {
            const active = i === currentStep;
            const done = i < currentStep;
            return (
              <div key={step.id} className="flex items-center gap-1.5">
                <span
                  className={cn(
                    "battle-turn-step",
                    active && "battle-turn-step-active",
                    done && "battle-turn-step-done"
                  )}
                >
                  {i + 1}. {step.label}
                </span>
                {i < STEPS.length - 1 && (
                  <ChevronRight className="w-3 h-3 text-white/20 shrink-0" aria-hidden />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function battleSectionClass(
  side: "player" | "enemy",
  phase?: TacticalPhase
): string {
  const pickPlayer = phase === "player-pick-actor";
  const pickEnemy = phase === "player-pick-target" || phase === "player-pick-move";
  const enemyTurn = phase === "enemy-turn" || phase === "executing" || phase === "animating";

  if (side === "player") {
    if (pickPlayer) return "battle-section-highlight-player";
    if (pickEnemy) return "battle-section-selected-player";
    if (enemyTurn) return "battle-section-dim";
  } else {
    if (pickEnemy) return "battle-section-highlight-enemy";
    if (pickPlayer) return "battle-section-dim";
    if (enemyTurn) return "battle-section-highlight-enemy-pulse";
  }
  return "";
}
