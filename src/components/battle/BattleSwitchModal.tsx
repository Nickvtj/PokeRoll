"use client";

/* eslint-disable @next/next/no-img-element */

import { motion } from "framer-motion";
import { Backpack } from "lucide-react";
import { getPokemonGbaSpriteUrl } from "@/data/pokemon-sprites";
import { playUiConfirm } from "@/lib/ui-sounds";
import { cn } from "@/lib/utils";
import type { BattleFighter } from "@/types/battle";

interface BattleSwitchModalProps {
  bench: BattleFighter[];
  faintedName?: string;
  onPick: (benchIndex: number) => void;
}

function hpColor(pct: number): string {
  if (pct > 50) return "var(--gba-hp-high)";
  if (pct > 25) return "var(--gba-hp-mid)";
  return "var(--gba-hp-low)";
}

export function BattleSwitchModal({ bench, faintedName, onPick }: BattleSwitchModalProps) {
  return (
    <motion.div
      className="battle-switch-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      aria-modal
      role="dialog"
    >
      <motion.div
        className="battle-switch-panel"
        initial={{ opacity: 0, y: 18, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 420, damping: 30 }}
      >
        <div className="battle-switch-header">
          <Backpack className="w-4 h-4 shrink-0" />
          <span>
            {faintedName ? `${faintedName} desmaiou!` : "Pokémon desmaiou!"} Escolha o próximo
          </span>
        </div>

        <div className="battle-switch-grid">
          {bench.map((fighter, index) => {
            const ko = fighter.currentHp <= 0;
            const pct = Math.max(0, (fighter.currentHp / fighter.maxHp) * 100);
            return (
              <button
                key={`${fighter.pokemon.id}-${index}`}
                type="button"
                disabled={ko}
                onClick={() => {
                  if (ko) return;
                  playUiConfirm();
                  onPick(index);
                }}
                className={cn("battle-switch-card", ko && "battle-switch-card-ko")}
              >
                <img
                  src={getPokemonGbaSpriteUrl(fighter.pokemon.id, { back: false })}
                  alt={fighter.pokemon.name}
                  draggable={false}
                  className="battle-switch-sprite"
                />
                <div className="battle-switch-info">
                  <div className="battle-switch-name-row">
                    <span className="truncate">{fighter.pokemon.name}</span>
                    {fighter.battleLevel != null && fighter.battleLevel > 0 && (
                      <span className="battle-switch-level">Lv{fighter.battleLevel}</span>
                    )}
                  </div>
                  <div className="battle-switch-hp-track">
                    <div
                      className="battle-switch-hp-fill"
                      style={{ width: `${pct}%`, background: hpColor(pct) }}
                    />
                  </div>
                  <span className="battle-switch-hp-text">
                    {ko ? "Desmaiado" : `${fighter.currentHp}/${fighter.maxHp} HP`}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}
