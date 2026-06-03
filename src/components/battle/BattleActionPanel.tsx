"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Crosshair, Sparkles, Swords, Target } from "lucide-react";
import { previewMove, getEffectivenessText, TYPE_LABELS_PT } from "@/lib/tactical-battle-engine";
import { cn } from "@/lib/utils";
import { BATTLE_CLASSIC_THEME } from "@/data/battle-theme";
import type { BattleState, MovePreview } from "@/types/battle";

interface BattleActionPanelProps {
  state: BattleState;
  bonuses: { battleDamage: number; critChance: number; defenseBoost?: number };
  onPickMove: (index: number) => void;
  onCancel: () => void;
  className?: string;
}

const EFFECTIVENESS_STYLE: Record<string, string> = {
  super: "text-emerald-300 border-emerald-400/50 bg-emerald-500/15",
  weak: "text-amber-300/90 border-amber-400/40 bg-amber-500/10",
  immune: "text-slate-400 border-slate-400/30 bg-slate-500/10",
  normal: "text-cyan-200/90 border-cyan-400/35 bg-cyan-500/10",
};

const TYPE_COLORS: Record<string, string> = {
  fire: "from-orange-600/20 to-orange-900/40 border-orange-500/50",
  water: "from-blue-600/20 to-blue-900/40 border-blue-500/50",
  grass: "from-green-600/20 to-green-900/40 border-green-500/50",
  electric: "from-yellow-400/20 to-yellow-700/40 border-yellow-400/50",
  ice: "from-cyan-400/20 to-cyan-700/40 border-cyan-400/50",
  fighting: "from-red-600/20 to-red-900/40 border-red-500/50",
  poison: "from-purple-600/20 to-purple-900/40 border-purple-500/50",
  ground: "from-amber-700/20 to-amber-900/40 border-amber-600/50",
  flying: "from-indigo-400/20 to-indigo-700/40 border-indigo-400/50",
  psychic: "from-pink-500/20 to-pink-800/40 border-pink-400/50",
  bug: "from-lime-600/20 to-lime-900/40 border-lime-500/50",
  rock: "from-stone-600/20 to-stone-900/40 border-stone-500/50",
  ghost: "from-violet-700/20 to-violet-900/40 border-violet-600/50",
  dragon: "from-indigo-700/20 to-indigo-900/40 border-indigo-600/50",
  dark: "from-slate-800/40 to-black/60 border-slate-700/50",
  steel: "from-gray-500/20 to-gray-700/40 border-gray-400/50",
  fairy: "from-pink-300/20 to-pink-500/40 border-pink-300/50",
  normal: "from-slate-500/20 to-slate-700/40 border-slate-400/50",
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
  const typeStyle = TYPE_COLORS[move.type] || TYPE_COLORS.normal;

  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.02, brightness: 1.1 }}
      whileTap={{ scale: 0.97 }}
      onClick={onPick}
      className={cn(
        "w-full text-left rounded-xl border p-3 transition-all relative overflow-hidden bg-gradient-to-br",
        BATTLE_CLASSIC_THEME ? "hover:brightness-125" : "hover:border-white/40",
        typeStyle,
        isSuper && "ring-2 ring-white/20 shadow-[0_0_15px_rgba(255,255,255,0.1)]"
      )}
    >
      {isSuper && (
        <span className="absolute top-0 right-0 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest bg-white text-black rounded-bl-lg animate-pulse">
          Super efetivo
        </span>
      )}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className={cn("text-sm font-bold truncate text-white shadow-sm")}>
            {move.name}
          </p>
          <p className="text-[10px] text-white/70 font-medium capitalize mt-0.5">
            {typeLabel}
            {move.category === "damage" ? ` · Poder ${move.power}` : " · Status"}
          </p>
        </div>
        <Swords className={cn("w-4 h-4 shrink-0 mt-0.5 text-white/80")} />
      </div>

      <div className={cn("mt-2 rounded-lg border px-2 py-1 text-[10px] font-bold uppercase tracking-wide bg-black/20 backdrop-blur-sm", effClass)}>
        {effText}
        {preview.estimatedDamage[1] > 0 && (
          <span className="font-normal normal-case ml-1 opacity-90">
            · ~{preview.estimatedDamage[0]}–{preview.estimatedDamage[1]} dmg
          </span>
        )}
      </div>
    </motion.button>
  );
}

export function BattleActionPanel({ state, bonuses, onPickMove, onCancel, className }: BattleActionPanelProps) {
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
        BATTLE_CLASSIC_THEME ? "battle-classic-dialog p-3" : "glass-card p-3",
        className
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
