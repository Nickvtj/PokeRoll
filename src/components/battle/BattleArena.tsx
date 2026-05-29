"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Swords } from "lucide-react";
import { PokemonBattleCard, type BattleSelectionMode } from "@/components/battle/PokemonBattleCard";
import { BattleActionPanel } from "@/components/battle/BattleActionPanel";
import { BattleTurnBanner, battleSectionClass } from "@/components/battle/BattleTurnBanner";
import { BattleResultModal } from "@/components/battle/BattleResultModal";
import { BattleCoinFlipOverlay } from "@/components/battle/BattleCoinFlipOverlay";
import { PokeballIcon } from "@/components/ui/PokeballIcon";
import { BATTLE_CLASSIC_THEME } from "@/data/battle-theme";
import type { BattleCombatHighlight } from "@/hooks/use-tactical-battle";
import type { BattleTurnHighlight } from "@/components/battle/PokemonBattleCard";
import type { BattleState } from "@/types/battle";
import { cn } from "@/lib/utils";

interface BattleArenaProps {
  state: BattleState | null;
  combatHighlight?: BattleCombatHighlight | null;
  onContinue?: () => void;
  onPlayAgain?: () => void;
  continueLabel?: string;
  bonuses?: { battleDamage: number; critChance: number };
  onPickActor?: (slot: number) => void;
  onPickTarget?: (slot: number) => void;
  onPickMove?: (index: number) => void;
  onCancelSelection?: () => void;
}

export function BattleArena({
  state,
  combatHighlight = null,
  onContinue,
  onPlayAgain,
  continueLabel,
  bonuses = { battleDamage: 0, critChance: 0 },
  onPickActor,
  onPickTarget,
  onPickMove,
  onCancelSelection,
}: BattleArenaProps) {
  if (!state) {
    return (
      <div className="glass-card p-12 text-center text-white/40">
        <Swords className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p>Selecione seu time e inicie a batalha</p>
      </div>
    );
  }

  const tactical = state.tacticalMode && state.phase === "fighting";
  const phase = state.tacticalPhase;
  const pending = state.pendingSelection ?? {};

  const turnHighlight = (
    f: (typeof state.playerTeam)[0],
    teamOffset: number,
    slot: number
  ): BattleTurnHighlight => {
    if (f.currentHp <= 0) return "none";

    if (combatHighlight) {
      const flatIdx = teamOffset + slot;
      if (combatHighlight.phase === "strike" && flatIdx === combatHighlight.strikerFlat) {
        return "attack";
      }
      if (
        (combatHighlight.phase === "flash" || combatHighlight.phase === "impact") &&
        flatIdx === combatHighlight.victimFlat
      ) {
        return "defend";
      }
      if (
        flatIdx === combatHighlight.strikerFlat ||
        flatIdx === combatHighlight.victimFlat
      ) {
        return "idle-dim";
      }
      return "idle-dim";
    }

    return "none";
  };

  const playerSelectionMode = (slot: number): BattleSelectionMode => {
    if (
      !tactical ||
      phase === "executing" ||
      phase === "animating" ||
      phase === "enemy-turn"
    ) {
      return "none";
    }
    if (phase === "player-pick-actor") return "pick-actor";
    if (phase === "player-pick-target" || phase === "player-pick-move") {
      if (pending.actorSlot === slot) return "selected-actor";
    }
    return "none";
  };

  const enemySelectionMode = (slot: number): BattleSelectionMode => {
    if (!tactical || phase !== "player-pick-target") return "none";
    return "pick-target";
  };

  const showModal =
    (state.phase === "victory" || state.phase === "defeat") && onContinue;

  const arenaContent = (
    <>
      {state.phase === "coinFlip" && (
        <BattleCoinFlipOverlay playerStarts={state.playerStarts ?? true} />
      )}

      {state.gymMeta && (
        <div
          className={cn(
            BATTLE_CLASSIC_THEME
              ? "battle-classic-gym-banner"
              : "glass-card px-3 py-2 text-center text-xs font-bold border"
          )}
          style={
            BATTLE_CLASSIC_THEME
              ? { color: state.gymMeta.themeColor }
              : {
                  borderColor: `${state.gymMeta.themeColor}40`,
                  color: state.gymMeta.themeColor,
                }
          }
        >
          {state.gymMeta.gymName} · {state.gymMeta.trainerName}
          {state.gymMeta.stage > 0 && (
            <span className={BATTLE_CLASSIC_THEME ? "text-white/45 font-normal" : "text-white/50 font-normal"}>
              {" "}
              ({state.gymMeta.stage}/{state.gymMeta.totalStages})
            </span>
          )}
        </div>
      )}

      <div className={state.phase === "coinFlip" ? "opacity-40 pointer-events-none" : ""}>
        {tactical && <BattleTurnBanner phase={phase} />}

        <div
          className={cn(
            "rounded-xl transition-all duration-300 p-1 -m-1",
            tactical && battleSectionClass("enemy", phase)
          )}
        >
          <p
            className={cn(
              BATTLE_CLASSIC_THEME
                ? "battle-classic-section-label battle-classic-enemy-label"
                : "text-xs text-red-400 font-bold uppercase tracking-wider mb-2",
              phase === "player-pick-target" && "animate-pulse"
            )}
          >
            {phase === "player-pick-target" ? "🎯 Escolha o alvo" : "Inimigos"}
          </p>
          <div className="grid grid-cols-3 gap-2 relative z-10">
            {state.enemyTeam.map((f, i) => {
              const slot = f.slotIndex ?? i;
              const flatIdx = 3 + slot;
              const isVictim = combatHighlight?.victimFlat === flatIdx;

              return (
                <PokemonBattleCard
                  key={`enemy-${f.pokemon.id}-${i}`}
                  fighter={f}
                  turnHighlight={turnHighlight(f, 3, slot)}
                  selectionMode={
                    pending.targetSlot === slot ? "selected-target" : enemySelectionMode(slot)
                  }
                  compact
                  side="enemy"
                  selectable={tactical && phase === "player-pick-target" && f.currentHp > 0}
                  onSelect={() => onPickTarget?.(slot)}
                  moveType={isVictim ? combatHighlight?.moveType : undefined}
                  attackPhase={isVictim ? combatHighlight?.phase : undefined}
                  statusApplied={isVictim ? combatHighlight?.statusApplied : undefined}
                />
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-center gap-3 my-4 relative z-10">
          {!BATTLE_CLASSIC_THEME && (
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
          )}
          {BATTLE_CLASSIC_THEME ? (
            <div className="battle-classic-vs flex items-center gap-1.5">
              <PokeballIcon size={14} />
              VS
            </div>
          ) : (
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="text-indigo-400 font-black text-sm"
            >
              VS
            </motion.span>
          )}
          {!BATTLE_CLASSIC_THEME && (
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
          )}
        </div>

        <div
          className={cn(
            "rounded-xl transition-all duration-300 p-1 -m-1",
            tactical && battleSectionClass("player", phase)
          )}
        >
          <p
            className={cn(
              BATTLE_CLASSIC_THEME
                ? "battle-classic-section-label battle-classic-player-label"
                : "text-xs text-cyan-400 font-bold uppercase tracking-wider mb-2",
              phase === "player-pick-actor" && "animate-pulse"
            )}
          >
            {phase === "player-pick-actor" ? "👆 Escolha quem ataca" : "Seu Time"}
          </p>
          <div className="grid grid-cols-3 gap-2 relative z-10">
            {state.playerTeam.map((f, i) => {
              const slot = f.slotIndex ?? i;
              const flatIdx = slot;
              const isStriker = combatHighlight?.strikerFlat === flatIdx;
              const isVictim = combatHighlight?.victimFlat === flatIdx;

              return (
                <PokemonBattleCard
                  key={`player-${f.pokemon.id}-${i}`}
                  fighter={f}
                  turnHighlight={turnHighlight(f, 0, slot)}
                  selectionMode={playerSelectionMode(slot)}
                  compact
                  side="player"
                  selectable={
                    tactical &&
                    f.currentHp > 0 &&
                    ((phase === "player-pick-actor" && f.status?.effect !== "sleep") ||
                      ((phase === "player-pick-target" || phase === "player-pick-move") &&
                        pending.actorSlot === slot))
                  }
                  onSelect={() => onPickActor?.(slot)}
                  moveType={
                    isVictim || isStriker ? combatHighlight?.moveType : undefined
                  }
                  attackPhase={
                    isVictim || isStriker ? combatHighlight?.phase : undefined
                  }
                  statusApplied={isVictim ? combatHighlight?.statusApplied : undefined}
                />
              );
            })}
          </div>
        </div>

        {tactical && onPickMove && onCancelSelection && (
          <BattleActionPanel
            state={state}
            bonuses={bonuses}
            onPickMove={onPickMove}
            onCancel={onCancelSelection}
          />
        )}

        <div
          className={cn(
            "mt-3 relative z-10",
            BATTLE_CLASSIC_THEME ? "battle-classic-dialog h-24" : "glass-card p-3 h-24 overflow-y-auto space-y-1"
          )}
        >
          <AnimatePresence initial={false}>
            {state.log.slice(-5).map((entry) => (
              <motion.p
                key={entry.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className={cn(
                  BATTLE_CLASSIC_THEME ? "battle-classic-dialog-text" : "text-xs text-white/60"
                )}
              >
                {entry.message}
              </motion.p>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </>
  );

  return (
    <>
      <div
        className={cn(
          "relative w-full flex flex-col justify-center py-2",
          "min-h-[calc(100dvh-7.5rem)] md:min-h-[calc(100dvh-5.5rem)] lg:min-h-[calc(100dvh-6rem)]"
        )}
      >
        <div
          className={cn(
            "relative space-y-4 w-full",
            BATTLE_CLASSIC_THEME && "battle-classic-arena"
          )}
        >
          {arenaContent}
        </div>
      </div>

      {showModal && (
        <BattleResultModal
          state={state}
          onContinue={onContinue}
          onPlayAgain={onPlayAgain}
          continueLabel={continueLabel}
        />
      )}
    </>
  );
}
