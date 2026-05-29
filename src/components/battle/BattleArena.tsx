"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Swords } from "lucide-react";
import { PokemonBattleCard } from "@/components/battle/PokemonBattleCard";
import { BattleResultModal } from "@/components/battle/BattleResultModal";
import { BattleCoinFlipOverlay } from "@/components/battle/BattleCoinFlipOverlay";
import { PokeballIcon } from "@/components/ui/PokeballIcon";
import { BATTLE_CLASSIC_THEME } from "@/data/battle-theme";
import type { BattleCombatHighlight } from "@/hooks/use-battle-turn-loop";
import type { BattleTurnHighlight } from "@/components/battle/PokemonBattleCard";
import type { BattleState } from "@/types/battle";
import { cn } from "@/lib/utils";

interface BattleArenaProps {
  state: BattleState | null;
  combatHighlight?: BattleCombatHighlight | null;
  onContinue?: () => void;
  onPlayAgain?: () => void;
  continueLabel?: string;
}

export function BattleArena({
  state,
  combatHighlight = null,
  onContinue,
  onPlayAgain,
  continueLabel,
}: BattleArenaProps) {
  if (!state) {
    return (
      <div className="glass-card p-12 text-center text-white/40">
        <Swords className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p>Selecione seu time e inicie a batalha</p>
      </div>
    );
  }

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
      if (combatHighlight.phase === "flash" && flatIdx === combatHighlight.victimFlat) {
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
        <div>
          <p
            className={cn(
              BATTLE_CLASSIC_THEME
                ? "battle-classic-section-label battle-classic-enemy-label"
                : "text-xs text-red-400 font-bold uppercase tracking-wider mb-2"
            )}
          >
            Inimigos
          </p>
          <div className="grid grid-cols-3 gap-2 relative z-10">
            {state.enemyTeam.map((f, i) => (
              <PokemonBattleCard
                key={`enemy-${f.pokemon.id}-${i}`}
                fighter={f}
                turnHighlight={turnHighlight(f, 3, i)}
                compact
                side="enemy"
              />
            ))}
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

        <div>
          <p
            className={cn(
              BATTLE_CLASSIC_THEME
                ? "battle-classic-section-label battle-classic-player-label"
                : "text-xs text-cyan-400 font-bold uppercase tracking-wider mb-2"
            )}
          >
            Seu Time
          </p>
          <div className="grid grid-cols-3 gap-2 relative z-10">
            {state.playerTeam.map((f, i) => (
              <PokemonBattleCard
                key={`player-${f.pokemon.id}-${i}`}
                fighter={f}
                turnHighlight={turnHighlight(f, 0, i)}
                compact
                side="player"
              />
            ))}
          </div>
        </div>

        <div
          className={cn(
            "mt-4 relative z-10",
            BATTLE_CLASSIC_THEME ? "battle-classic-dialog h-28" : "glass-card p-3 h-28 overflow-y-auto space-y-1"
          )}
        >
          <AnimatePresence initial={false}>
            {state.log.slice(-6).map((entry) => (
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
