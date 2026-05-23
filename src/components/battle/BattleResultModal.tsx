"use client";

import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Skull } from "lucide-react";
import { BattleLevelUpPanel } from "@/components/battle/BattleLevelUpPanel";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import type { BattleState } from "@/types/battle";

interface BattleResultModalProps {
  state: BattleState;
  onContinue: () => void;
}

export function BattleResultModal({ state, onContinue }: BattleResultModalProps) {
  if (typeof window === "undefined") return null;
  if (state.phase !== "victory" && state.phase !== "defeat") return null;

  const won = state.phase === "victory";

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
          onClick={onContinue}
        />
        <motion.div
          initial={{ scale: 0.85, y: 40 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", damping: 14 }}
          onClick={(e) => e.stopPropagation()}
          className="relative glass-card p-6 sm:p-8 text-center space-y-4 max-w-md w-full border border-white/10 max-h-[90dvh] overflow-y-auto"
          style={{
            boxShadow: won
              ? "0 0 80px rgba(251,191,36,0.25)"
              : "0 0 60px rgba(100,116,139,0.2)",
          }}
        >
          {won ? (
            <>
              <Trophy className="w-14 h-14 text-amber-400 mx-auto" />
              <h3 className="text-2xl font-bold text-amber-400">Vitória!</h3>
              {state.reward && (
                <p className="text-white/60 text-sm">
                  +{state.reward.coins} moedas · +{state.reward.xp} XP conta
                  {state.reward.freeSpin && " · Spin grátis!"}
                </p>
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

          {state.levelUps && state.levelUps.length > 0 && (
            <BattleLevelUpPanel levelUps={state.levelUps} />
          )}

          <AnimatedButton variant={won ? "gold" : "secondary"} onClick={onContinue} className="w-full">
            Continuar
          </AnimatedButton>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}
