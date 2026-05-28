"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Swords } from "lucide-react";
import { PokemonBattleCard } from "@/components/battle/PokemonBattleCard";
import { BattleResultModal } from "@/components/battle/BattleResultModal";
import { BattleCoinFlipOverlay } from "@/components/battle/BattleCoinFlipOverlay";
import { getActiveFighterIndex } from "@/lib/battle-engine";
import type { BattleState } from "@/types/battle";

interface BattleArenaProps {
  state: BattleState | null;
  onContinue?: () => void;
  onPlayAgain?: () => void;
  continueLabel?: string;
}

export function BattleArena({ state, onContinue, onPlayAgain, continueLabel }: BattleArenaProps) {
  if (!state) {
    return (
      <div className="glass-card p-12 text-center text-white/40">
        <Swords className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p>Selecione seu time e inicie a batalha</p>
      </div>
    );
  }

  const strikerIdx =
    state.phase === "fighting" ? getActiveFighterIndex(state) : null;

  const turnHighlight = (
    f: (typeof state.playerTeam)[0],
    teamOffset: number,
    slot: number
  ): "attack" | "none" => {
    const flatIdx = teamOffset + slot;
    if (strikerIdx === flatIdx && f.currentHp > 0) return "attack";
    return "none";
  };

  const showModal =
    (state.phase === "victory" || state.phase === "defeat") && onContinue;

  return (
    <>
      <div className="relative space-y-4 min-h-[420px]">
        {state.phase === "coinFlip" && (
          <BattleCoinFlipOverlay playerStarts={state.playerStarts ?? true} />
        )}

        {state.gymMeta && (
          <div
            className="glass-card px-3 py-2 text-center text-xs font-bold border"
            style={{
              borderColor: `${state.gymMeta.themeColor}40`,
              color: state.gymMeta.themeColor,
            }}
          >
            {state.gymMeta.gymName} · {state.gymMeta.trainerName}
            {state.gymMeta.stage > 0 && (
              <span className="text-white/50 font-normal">
                {" "}
                ({state.gymMeta.stage}/{state.gymMeta.totalStages})
              </span>
            )}
          </div>
        )}

        <div className={state.phase === "coinFlip" ? "opacity-40 pointer-events-none" : ""}>
          <div>
            <p className="text-xs text-red-400 font-bold uppercase tracking-wider mb-2">
              Inimigos
            </p>
            <div className="grid grid-cols-3 gap-2">
              {state.enemyTeam.map((f, i) => (
                <PokemonBattleCard
                  key={`enemy-${f.pokemon.id}-${i}`}
                  fighter={f}
                  turnHighlight={turnHighlight(f, 3, i)}
                  compact
                />
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="text-indigo-400 font-black text-sm"
            >
              VS
            </motion.span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
          </div>

          <div>
            <p className="text-xs text-cyan-400 font-bold uppercase tracking-wider mb-2">
              Seu Time
            </p>
            <div className="grid grid-cols-3 gap-2">
              {state.playerTeam.map((f, i) => (
                <PokemonBattleCard
                  key={`player-${f.pokemon.id}-${i}`}
                  fighter={f}
                  turnHighlight={turnHighlight(f, 0, i)}
                  compact
                />
              ))}
            </div>
          </div>

          <div className="glass-card p-3 h-28 overflow-y-auto space-y-1 mt-4">
            <AnimatePresence initial={false}>
              {state.log.slice(-6).map((entry) => (
                <motion.p
                  key={entry.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-xs text-white/60"
                >
                  {entry.message}
                </motion.p>
              ))}
            </AnimatePresence>
          </div>

          {state.phase === "fighting" && (
            <p className="text-[10px] text-center text-white/30 mt-2">
              Quem brilha é quem vai atacar agora
            </p>
          )}
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
