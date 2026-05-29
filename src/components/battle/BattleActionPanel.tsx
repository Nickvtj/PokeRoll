"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Crosshair, Sparkles, Swords, Target } from "lucide-react";
import { previewMove, getEffectivenessText, TYPE_LABELS_PT } from "@/lib/tactical-battle-engine";
import { cn } from "@/lib/utils";
import { BATTLE_CLASSIC_THEME } from "@/data/battle-theme";
import type { BattleState, MovePreview } from "@/types/battle";

interface BattleActionPanelProps {
  state: BattleState;
  bonuses: { battleDamage: number; critChance: number };
  onPickMove: (index: number) => void;
  onCancel: () => void;
}

const EFFECTIVENESS_STYLE: Record<string, string> = {
  super: "text-emerald-300 border-emerald-400/50 bg-emerald-500/15",
  weak: "text-amber-300/90 border-amber-400/40 bg-amber-500/10",
  immune: "text-slate-400 border-slate-400/30 bg-slate-500/10",
  normal: "text-cyan-200/90 border-cyan-400/35 bg-cyan-500/10",
};

function MoveButton({
  preview,
  onPick,
}: {
  preview: MovePreview;
  onPick: () => void;
}) {
  const { move } = preview;
  const isSuper = preview.effectiveness === "super";
  const effText = getEffectivenessText(preview);
  const effClass = EFFECTIVENESS_STYLE[preview.effectiveness] ?? EFFECTIVENESS_STYLE.normal;
  const typeLabel = TYPE_LABELS_PT[move.type] ?? move.type;

  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      onClick={onPick}
      className={cn(
        "w-full text-left rounded-xl border p-3 transition-all relative overflow-hidden",
        BATTLE_CLASSIC_THEME ? "battle-prep-card hover:border-indigo-400/50" : "glass-card hover:border-white/25",
        isSuper && "border-emerald-400/60 ring-2 ring-emerald-400/35 shadow-[0_0_20px_rgba(52,211,153,0.15)]"
      )}
    >
      {isSuper && (
        <span className="absolute top-0 right-0 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest bg-emerald-500 text-emerald-950 rounded-bl-lg">
          Super efetivo
        </span>
      )}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className={cn("text-sm font-bold truncate", isSuper ? "text-emerald-100" : "text-white")}>
            {move.name}
          </p>
          <p className="text-[10px] text-white/45 capitalize mt-0.5">
            {typeLabel}
            {move.category === "damage" ? ` · Poder ${move.power}` : " · Status"}
          </p>
        </div>
        <Swords className={cn("w-4 h-4 shrink-0 mt-0.5", isSuper ? "text-emerald-300" : "text-indigo-300")} />
      </div>

      <div className={cn("mt-2 rounded-lg border px-2 py-1 text-[10px] font-bold uppercase tracking-wide", effClass)}>
        {effText}
        {preview.estimatedDamage[1] > 0 && (
          <span className="font-normal normal-case ml-1 opacity-80">
            · ~{preview.estimatedDamage[0]}–{preview.estimatedDamage[1]} dmg
          </span>
        )}
        {preview.statusChance > 0 && move.statusEffect && (
          <span className="font-normal normal-case ml-1 opacity-80">
            · {Math.round(preview.statusChance * 100)}% {move.statusEffect}
          </span>
        )}
      </div>
    </motion.button>
  );
}

export function BattleActionPanel({ state, bonuses, onPickMove, onCancel }: BattleActionPanelProps) {
  const phase = state.tacticalPhase;
  const pending = state.pendingSelection ?? {};

  const phaseHint = (() => {
    switch (phase) {
      case "player-pick-actor":
        return { icon: Sparkles, text: "Selecione qual Pokémon vai agir", color: "text-cyan-300" };
      case "player-pick-target":
        return { icon: Target, text: "Escolha o alvo inimigo", color: "text-red-300" };
      case "player-pick-move":
        return { icon: Crosshair, text: "Escolha o golpe", color: "text-amber-300" };
      case "executing":
      case "animating":
        return { icon: Swords, text: "Executando...", color: "text-indigo-300" };
      case "enemy-turn":
        return { icon: Swords, text: "Turno do oponente (1 golpe)", color: "text-red-400" };
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
          .map((move, i) =>
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
        "mt-3 relative z-20 shrink-0",
        BATTLE_CLASSIC_THEME ? "battle-classic-dialog p-3" : "glass-card p-3"
      )}
    >
      <AnimatePresence mode="wait">
        {phaseHint && (
          <motion.div
            key={phase}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="flex items-center gap-2 mb-2"
          >
            <phaseHint.icon className={cn("w-4 h-4 shrink-0", phaseHint.color)} />
            <p className={cn("text-xs font-bold", phaseHint.color)}>{phaseHint.text}</p>
            {state.roundNumber != null && (
              <span className="text-[10px] text-white/35 ml-auto tabular-nums">
                Rodada {state.roundNumber}
              </span>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {phase === "player-pick-target" && actor && (
        <p className="text-[10px] text-cyan-300/70 mb-2">
          {actor.pokemon.name} selecionado — toque nele de novo para trocar
        </p>
      )}

      {actor && target && phase === "player-pick-move" && (
        <p className="text-[10px] text-white/50 mb-2">
          {actor.pokemon.name} → {target.pokemon.name}
        </p>
      )}

      {phase === "player-pick-move" && movePreviews.length > 0 && (
        <div className="grid gap-2 sm:grid-cols-2">
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
          className="mt-2 flex items-center gap-1.5 text-[10px] text-white/40 hover:text-white/70 transition-colors"
        >
          <ArrowLeft className="w-3 h-3" />
          Voltar
        </button>
      )}

      {phase === "player-pick-actor" && (
        <p className="text-[10px] text-white/40 leading-relaxed">
          Seu golpe → 1 golpe do oponente → seu golpe. Escolha Pokémon, alvo e ataque.
        </p>
      )}
    </div>
  );
}
