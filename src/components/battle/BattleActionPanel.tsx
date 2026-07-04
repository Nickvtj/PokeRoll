"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Crosshair, Sparkles, Swords, Target } from "lucide-react";
import { previewMove, TYPE_LABELS_PT } from "@/lib/tactical-battle-engine";
import { cn } from "@/lib/utils";
import { BATTLE_CLASSIC_THEME } from "@/data/battle-theme";
import { BattleLogLine } from "@/components/battle/BattleLogLine";
import type { BattleLogEntry, BattleState, MovePreview } from "@/types/battle";

interface BattleActionPanelProps {
  state: BattleState;
  bonuses: { battleDamage: number; critChance: number; defenseBoost?: number };
  onPickMove: (index: number) => void;
  onCancel: () => void;
  className?: string;
  recentLog?: BattleLogEntry[];
}

const EFF_LABEL: Record<string, string> = {
  super: "Super efetivo",
  weak: "Pouco efetivo",
  immune: "Sem efeito",
};

function shortEffLabel(preview: MovePreview): string | null {
  return EFF_LABEL[preview.effectiveness] ?? null;
}

const TYPE_BOTTOM_COLORS: Record<string, string> = {
  fire: "#e87850",
  water: "#6890f0",
  grass: "#78c850",
  electric: "#f8d030",
  ice: "#98d8d8",
  fighting: "#c03028",
  poison: "#a040a0",
  ground: "#e0c068",
  flying: "#a890f0",
  psychic: "#f85888",
  bug: "#a8b820",
  rock: "#b8a038",
  ghost: "#705898",
  dragon: "#7038f8",
  dark: "#705848",
  steel: "#b8b8d0",
  fairy: "#ee99ac",
  normal: "#a8a878",
};

const EFF_BADGE: Record<string, string> = {
  super: "bg-emerald-600 text-white border-emerald-800",
  weak: "bg-amber-600 text-white border-amber-800",
  immune: "bg-slate-600 text-white border-slate-800",
};

function MoveButton({ preview, onPick }: { preview: MovePreview; onPick: () => void }) {
  const { move } = preview;
  const typeLabel = TYPE_LABELS_PT[move.type] ?? move.type;
  const typeBg = TYPE_BOTTOM_COLORS[move.type] ?? TYPE_BOTTOM_COLORS.normal;
  const badge = shortEffLabel(preview);

  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      onClick={onPick}
      className={cn(
        "battle-gba-move-btn",
        preview.effectiveness === "super" && "battle-gba-move-btn-super",
        preview.effectiveness === "weak" && "battle-gba-move-btn-weak"
      )}
    >
      <div className="battle-gba-move-top">{move.name}</div>
      <div className="battle-gba-move-bottom" style={{ background: typeBg }}>
        <span className="battle-gba-move-type">{typeLabel}</span>
        <span className="battle-gba-move-pp">
          {move.category === "damage" ? `Poder ${move.power}` : "Status"}
        </span>
      </div>
      {badge && preview.effectiveness !== "normal" && (
        <span
          className={cn(
            "absolute top-1 right-1 text-[8px] font-bold px-1.5 py-0.5 rounded border uppercase leading-none",
            EFF_BADGE[preview.effectiveness] ?? EFF_BADGE.weak
          )}
        >
          {badge}
        </span>
      )}
    </motion.button>
  );
}

export function BattleActionPanel({
  state,
  bonuses,
  onPickMove,
  onCancel,
  className,
  recentLog = [],
}: BattleActionPanelProps) {
  const phase = state.tacticalPhase;
  const pending = state.pendingSelection ?? {};

  const c = BATTLE_CLASSIC_THEME;
  const phaseHint = (() => {
    switch (phase) {
      case "player-pick-actor":
        return { icon: Sparkles, text: "Selecione qual Pokémon vai agir", color: c ? "text-[#7cc4e8]" : "text-cyan-300" };
      case "player-pick-target":
        return { icon: Target, text: "Escolha o alvo inimigo", color: c ? "text-[#f08878]" : "text-red-300" };
      case "player-pick-move":
        return { icon: Crosshair, text: "Escolha o golpe", color: c ? "text-[#f0c860]" : "text-amber-300" };
      case "executing":
      case "animating":
        return { icon: Swords, text: "Executando...", color: c ? "text-[#a0a8f0]" : "text-indigo-300" };
      case "enemy-turn":
        return { icon: Swords, text: "Turno do oponente", color: c ? "text-[#f08878]" : "text-red-400" };
      default:
        return null;
    }
  })();

  const actor =
    pending.actorSlot != null
      ? state.playerTeam.find((f) => f.slotIndex === pending.actorSlot)
      : null;
  const target =
    pending.targetSlot != null
      ? state.enemyTeam.find((f) => f.slotIndex === pending.targetSlot)
      : null;

  const movePreviews: MovePreview[] =
    phase === "player-pick-move" && actor && target
      ? (actor.equippedMoves ?? [])
          .map((move) =>
            previewMove(state, pending.actorSlot!, pending.targetSlot!, move, bonuses)
          )
          .sort((a, b) => {
            const rank = (p: MovePreview) =>
              p.effectiveness === "super" ? 0 : p.effectiveness === "normal" ? 1 : 2;
            return rank(a) - rank(b);
          })
      : [];

  const moveIndexByPreview = (preview: MovePreview): number =>
    (actor?.equippedMoves ?? []).findIndex((m) => m.id === preview.move.id);

  return (
    <div
      className={cn(
        "mt-3 relative z-20 shrink-0 battle-dialog-box",
        BATTLE_CLASSIC_THEME ? "battle-classic-dialog p-3" : "glass-card p-3",
        className
      )}
    >
      <AnimatePresence mode="wait">
        {phaseHint && (
          <motion.div
            key={phase}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 mb-2"
          >
            <phaseHint.icon className={cn("w-4 h-4 shrink-0", phaseHint.color)} />
            <p className={cn("text-xs font-bold flex-1", phaseHint.color)}>{phaseHint.text}</p>
            {state.roundNumber != null && (
              <span
                className={cn(
                  "text-[10px] tabular-nums",
                  c ? "text-[#8c98ac]/70" : "text-white/30"
                )}
              >
                R{state.roundNumber}
              </span>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {actor && target && phase === "player-pick-move" && (
        <p className={cn("text-[10px] mb-2 font-medium", c ? "text-[#8c98ac]" : "text-white/45")}>
          <span className={c ? "text-[#7cc4e8] font-bold" : "text-cyan-300/90"}>{actor.pokemon.name}</span>
          <span className={cn("mx-1", c ? "text-[#8c98ac]/60" : "text-white/25")}>vs</span>
          <span className={c ? "text-[#f08878] font-bold" : "text-red-300/90"}>{target.pokemon.name}</span>
        </p>
      )}

      {phase === "player-pick-move" && movePreviews.length > 0 && (
        <div className="battle-gba-move-grid">
          {movePreviews.map((preview) => (
            <MoveButton
              key={preview.move.id}
              preview={preview}
              onPick={() => onPickMove(moveIndexByPreview(preview))}
            />
          ))}
        </div>
      )}

      {(phase === "player-pick-target" || phase === "player-pick-move") && (
        <button
          type="button"
          onClick={onCancel}
          className={cn(
            "mt-2 flex items-center gap-1.5 text-[10px] transition-colors",
            c
              ? "text-[#8c98ac] hover:text-[#e8ecf4] font-bold"
              : "text-white/35 hover:text-white/60"
          )}
        >
          <ArrowLeft className="w-3 h-3" />
          {phase === "player-pick-move" ? "Trocar alvo" : "Trocar Pokémon"}
        </button>
      )}

      {phase === "player-pick-actor" && (
        <p
          className={cn(
            "leading-relaxed",
            c ? "battle-classic-dialog-text" : "text-[10px] text-white/40 italic"
          )}
        >
          Seu golpe, depois 1 do oponente, depois o seu. Escolha Pokémon, alvo e ataque.
        </p>
      )}

      {recentLog.length > 0 && (
        <div
          className={cn(
            "mt-2 pt-2 border-t space-y-1 max-h-[4.5rem] overflow-y-auto",
            c ? "border-white/10" : "border-indigo-500/15"
          )}
        >
          <AnimatePresence initial={false}>
            {recentLog.map((entry) => (
              <motion.p
                key={entry.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={cn(
                  "battle-dialog-line",
                  BATTLE_CLASSIC_THEME
                    ? "battle-classic-dialog-text"
                    : "text-[10px] leading-snug text-white/50"
                )}
              >
                <BattleLogLine entry={entry} />
              </motion.p>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
