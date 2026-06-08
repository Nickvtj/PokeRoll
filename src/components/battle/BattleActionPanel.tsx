"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Crosshair, Sparkles, Swords, Target } from "lucide-react";
import { previewMove, getEffectivenessText, TYPE_LABELS_PT } from "@/lib/tactical-battle-engine";
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

const EFF_BADGE: Record<string, string> = {
  super: "text-emerald-100 bg-emerald-500/45 ring-emerald-300/50",
  weak: "text-amber-100 bg-amber-500/35 ring-amber-300/40",
  immune: "text-slate-200 bg-slate-500/35 ring-slate-300/30",
  normal: "text-white/50 bg-white/10 ring-white/15",
};

const EFF_LABEL: Record<string, string> = {
  super: "Super efetivo",
  weak: "Pouco efetivo",
  immune: "Sem efeito",
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

function shortEffLabel(preview: MovePreview): string | null {
  return EFF_LABEL[preview.effectiveness] ?? null;
}

function MoveButton({ preview, onPick }: { preview: MovePreview; onPick: () => void }) {
  const { move } = preview;
  const typeLabel = TYPE_LABELS_PT[move.type] ?? move.type;
  const typeStyle = TYPE_COLORS[move.type] || TYPE_COLORS.normal;
  const badge = shortEffLabel(preview);
  const badgeClass = EFF_BADGE[preview.effectiveness] ?? EFF_BADGE.normal;

  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      onClick={onPick}
      className={cn(
        "w-full text-left rounded-xl border p-3 transition-all relative overflow-hidden bg-gradient-to-br",
        typeStyle,
        preview.effectiveness === "super" && "ring-2 ring-emerald-400/45",
        preview.effectiveness === "weak" && "ring-1 ring-amber-400/35"
      )}
    >
      {badge && (
        <span
          className={cn(
            "absolute top-2 right-2 text-[9px] font-bold px-2 py-1 rounded-md ring-1 uppercase tracking-wide",
            badgeClass
          )}
        >
          {badge}
        </span>
      )}
      <p className="text-sm font-bold truncate text-white pr-12">{move.name}</p>
      <p className="text-[10px] text-white/60 mt-0.5">
        {typeLabel}
        {move.category === "damage" ? ` · Poder ${move.power}` : " · Status"}
        {preview.estimatedDamage[1] > 0 && (
          <span className="text-white/40"> · ~{preview.estimatedDamage[0]}–{preview.estimatedDamage[1]}</span>
        )}
      </p>
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
        return { icon: Swords, text: "Turno do oponente", color: "text-red-400" };
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
              <span className="text-[10px] text-white/30 tabular-nums">R{state.roundNumber}</span>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {actor && target && phase === "player-pick-move" && (
        <p className="text-[10px] text-white/45 mb-2 font-medium">
          <span className="text-cyan-300/90">{actor.pokemon.name}</span>
          <span className="text-white/25 mx-1">vs</span>
          <span className="text-red-300/90">{target.pokemon.name}</span>
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
          className="mt-2 flex items-center gap-1.5 text-[10px] text-white/35 hover:text-white/60 transition-colors"
        >
          <ArrowLeft className="w-3 h-3" />
          {phase === "player-pick-move" ? "Trocar alvo" : "Trocar Pokémon"}
        </button>
      )}

      {phase === "player-pick-actor" && (
        <p className="text-[10px] text-white/40 leading-relaxed italic">
          Seu golpe, depois 1 do oponente, depois o seu. Escolha Pokémon, alvo e ataque.
        </p>
      )}

      {recentLog.length > 0 && (
        <div className="mt-2 pt-2 border-t border-indigo-500/15 space-y-1 max-h-[4.5rem] overflow-y-auto">
          <AnimatePresence initial={false}>
            {recentLog.map((entry) => (
              <motion.p
                key={entry.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={cn(
                  "text-[10px] leading-snug battle-dialog-line",
                  BATTLE_CLASSIC_THEME ? "battle-classic-dialog-text" : "text-white/50"
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
