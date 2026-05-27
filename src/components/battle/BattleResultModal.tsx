"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Skull, Coins, Star, Gift, RotateCcw } from "lucide-react";
import { BattleLevelUpPanel } from "@/components/battle/BattleLevelUpPanel";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { playBattleLoss, playBattleWin } from "@/lib/sound-engine";
import type { BattleState } from "@/types/battle";

interface BattleResultModalProps {
  state: BattleState;
  onContinue: () => void;
  onPlayAgain?: () => void;
}

type ModalPhase = "intro" | "results";

const INTRO_HOLD_MS = 1600;

export function BattleResultModal({ state, onContinue, onPlayAgain }: BattleResultModalProps) {
  const won = state.phase === "victory";
  const canReplay = !!onPlayAgain;
  const levelUps = state.levelUps ?? [];
  const hasLevelUps = levelUps.length > 0;

  const [phase, setPhase] = useState<ModalPhase>("intro");
  const lastSoundKeyRef = useRef("");

  const phaseKey = `${state.phase}-${levelUps.map((l) => l.pokemonId).join(",")}`;

  useEffect(() => {
    setPhase("intro");

    if (lastSoundKeyRef.current !== phaseKey) {
      lastSoundKeyRef.current = phaseKey;
      if (won) {
        void playBattleWin();
      } else {
        void playBattleLoss();
      }
    }

    const introTimer = setTimeout(() => {
      setPhase("results");
    }, INTRO_HOLD_MS);

    return () => clearTimeout(introTimer);
  }, [phaseKey, won]);

  if (typeof window === "undefined") return null;
  if (state.phase !== "victory" && state.phase !== "defeat") return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
      >
        <div
          className="absolute inset-0 bg-black/70 backdrop-blur-md"
          onClick={phase === "results" && !canReplay ? onContinue : undefined}
        />
        <motion.div
          layout
          initial={{ scale: 0.85, y: 40 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", damping: 14 }}
          onClick={(e) => e.stopPropagation()}
          className="relative glass-card p-6 sm:p-8 text-center max-w-md w-full border border-white/10 max-h-[90dvh] overflow-hidden flex flex-col"
          style={{
            boxShadow: won
              ? "0 0 80px rgba(251,191,36,0.25)"
              : "0 0 60px rgba(100,116,139,0.2)",
          }}
        >
          <AnimatePresence mode="wait">
            {phase === "intro" ? (
              <motion.div
                key="intro"
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.3 }}
                className="space-y-4 py-2"
              >
                {won ? (
                  <>
                    <motion.div
                      animate={{ rotate: [0, 8, -8, 0], scale: [1, 1.08, 1] }}
                      transition={{ duration: 0.6 }}
                      className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center"
                    >
                      <Trophy className="w-9 h-9 text-white" />
                    </motion.div>
                    <h3 className="text-2xl font-bold text-amber-400">Vitória!</h3>
                    {state.gymMeta && state.gymMeta.stage < 5 && (
                      <p className="text-xs text-indigo-300/80">
                        Batalha {state.gymMeta.stage}/{state.gymMeta.totalStages} concluída.
                      </p>
                    )}
                    {state.gymMeta && state.gymMeta.stage === 5 && (
                      <p className="text-xs text-amber-400/90">
                        Líder derrotado! Insígnia registrada no time.
                      </p>
                    )}
                    {state.reward && (
                      <div className="flex flex-wrap justify-center gap-4 py-1">
                        {state.reward.coins > 0 && (
                          <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                            <Coins className="w-5 h-5" />
                            +{state.reward.coins}
                          </div>
                        )}
                        {state.reward.xp > 0 && (
                          <div className="flex items-center gap-1.5 text-indigo-400 font-bold">
                            <Star className="w-5 h-5" />
                            +{state.reward.xp} XP
                          </div>
                        )}
                        {state.reward.freeSpin && (
                          <div className="flex items-center gap-1.5 text-cyan-400 font-bold text-sm">
                            <Gift className="w-5 h-5" />
                            Spin grátis!
                          </div>
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <Skull className="w-14 h-14 text-slate-500 mx-auto" />
                    <h3 className="text-2xl font-bold text-slate-400">Derrota...</h3>
                    <p className="text-white/50 text-sm">
                      Seu time ganhou XP mesmo assim. Tente outra composição!
                    </p>
                  </>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="flex flex-col gap-4 min-h-0"
              >
                {hasLevelUps && (
                  <div className="min-h-0 overflow-y-auto overscroll-contain [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                    <BattleLevelUpPanel levelUps={levelUps} />
                  </div>
                )}

                <div className="shrink-0 flex flex-col gap-2">
                  {canReplay && (
                    <AnimatedButton
                      variant="gold"
                      onClick={onPlayAgain}
                      icon={<RotateCcw className="w-4 h-4" />}
                      className="w-full"
                    >
                      Jogar novamente
                    </AnimatedButton>
                  )}
                  <AnimatedButton
                    variant={canReplay ? "secondary" : won ? "gold" : "secondary"}
                    onClick={onContinue}
                    className="w-full"
                  >
                    {canReplay ? "Voltar" : "Continuar"}
                  </AnimatedButton>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}
