"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Coins, Star, Gift, RotateCcw } from "lucide-react";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { useEconomyStore } from "@/stores/economy-store";
import { fireMinigameRecordConfetti } from "@/lib/confetti";
import { playCoinGain, playReward } from "@/lib/sound-engine";
import { useRouter } from "next/navigation";

export function RewardPopup() {
  const router = useRouter();
  const show = useEconomyStore((s) => s.showReward);
  const reward = useEconomyStore((s) => s.lastReward);
  const onPlayAgain = useEconomyStore((s) => s.rewardPlayAgain);
  const close = useEconomyStore((s) => s.closeRewardPopup);

  useEffect(() => {
    if (!show || !reward) return;
    if (reward.isNewRecord) fireMinigameRecordConfetti();
    if (reward.coins && reward.coins > 0) {
      void playCoinGain();
    } else {
      void playReward();
    }
  }, [show, reward]);

  const handlePlayAgain = () => {
    const replay = onPlayAgain;
    close();
    replay?.();
  };

  const handleClose = () => {
    const path = reward?.onClosePath;
    close();
    if (path) router.push(path);
  };

  return (
    <AnimatePresence>
      {show && reward && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[10000] flex items-center justify-center p-4 pointer-events-auto"
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-none" />
          <motion.div
            initial={{ scale: 0.5, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", damping: 12 }}
            onClick={(e) => e.stopPropagation()}
            className="relative glass-card p-8 text-center space-y-4 max-w-xs w-full border border-amber-500/30"
            style={{ boxShadow: "0 0 60px rgba(251,191,36,0.3)" }}
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
              transition={{ duration: 0.6 }}
              className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center"
            >
              <Gift className="w-8 h-8 text-white" />
            </motion.div>

            <h3 className="text-xl font-bold text-amber-400">Recompensa!</h3>
            <p className="text-white/70 text-sm">{reward.message}</p>

            <div className="flex justify-center gap-4 flex-wrap">
              {reward.coins != null && reward.coins > 0 && (
                <div className="flex items-center gap-1 text-amber-400 font-bold">
                  <Coins className="w-5 h-5" />
                  +{reward.coins}
                </div>
              )}
              {reward.xp != null && reward.xp > 0 && (
                <div className="flex items-center gap-1 text-indigo-400 font-bold">
                  <Star className="w-5 h-5" />
                  +{reward.xp} XP
                </div>
              )}
              {reward.freeSpin && (
                <span className="text-cyan-400 font-bold text-sm">+1 Spin grátis!</span>
              )}
            </div>

            <div className="flex flex-col gap-2">
              {onPlayAgain && (
                <AnimatedButton
                  variant="gold"
                  onClick={handlePlayAgain}
                  icon={<RotateCcw className="w-4 h-4" />}
                  className="w-full"
                >
                  Jogar novamente
                </AnimatedButton>
              )}
              <AnimatedButton
                variant={onPlayAgain ? "secondary" : "gold"}
                onClick={handleClose}
                className="w-full"
              >
                {reward.closeLabel ?? (reward.onClosePath ? "Voltar" : onPlayAgain ? "Fechar" : "Coletar")}
              </AnimatedButton>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
