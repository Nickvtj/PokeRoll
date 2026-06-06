"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Coins, Star, Gift, RotateCcw, Skull, Trophy } from "lucide-react";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { useEconomyStore } from "@/stores/economy-store";
import { fireJitsuVictoryConfetti, fireMinigameRecordConfetti } from "@/lib/confetti";
import { playBattleLoss, playBattleWin, playCoinGain, playReward } from "@/lib/sound-engine";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export function RewardPopup() {
  const router = useRouter();
  const show = useEconomyStore((s) => s.showReward);
  const reward = useEconomyStore((s) => s.lastReward);
  const onPlayAgain = useEconomyStore((s) => s.rewardPlayAgain);
  const close = useEconomyStore((s) => s.closeRewardPopup);

  const won = reward?.outcome === "win";
  const lost = reward?.outcome === "loss";
  const hasOutcome = won || lost;

  useEffect(() => {
    if (!show || !reward) return;
    if (reward.isNewRecord) fireMinigameRecordConfetti();
    else if (won) fireJitsuVictoryConfetti();

    if (won) void playBattleWin();
    else if (lost) void playBattleLoss();
    else if (reward.coins && reward.coins > 0) void playCoinGain();
    else void playReward();
  }, [show, reward, won, lost]);

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
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md pointer-events-none" />
          <motion.div
            initial={{ scale: 0.85, y: 40 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 14 }}
            onClick={(e) => e.stopPropagation()}
            className={cn(
              "relative glass-card p-6 sm:p-8 text-center space-y-4 max-w-sm w-full border max-h-[90dvh] overflow-y-auto",
              won && "border-amber-500/30",
              lost && "border-white/10",
              !hasOutcome && "border-amber-500/30"
            )}
            style={{
              boxShadow: won
                ? "0 0 80px rgba(251,191,36,0.25)"
                : lost
                  ? "0 0 60px rgba(100,116,139,0.2)"
                  : "0 0 60px rgba(251,191,36,0.3)",
            }}
          >
            {won ? (
              <motion.div
                animate={{ rotate: [0, 8, -8, 0], scale: [1, 1.08, 1] }}
                transition={{ duration: 0.6 }}
                className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center"
              >
                <Trophy className="w-9 h-9 text-white" />
              </motion.div>
            ) : lost ? (
              <Skull className="w-14 h-14 text-slate-500 mx-auto" />
            ) : (
              <motion.div
                animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                transition={{ duration: 0.6 }}
                className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center"
              >
                <Gift className="w-8 h-8 text-white" />
              </motion.div>
            )}

            <h3
              className={cn(
                "text-2xl font-bold",
                won && "text-amber-400",
                lost && "text-slate-400",
                !hasOutcome && "text-amber-400"
              )}
            >
              {won ? "Vitória!" : lost ? "Derrota..." : "Recompensa!"}
            </h3>

            <p className="text-white/60 text-sm leading-relaxed">{reward.message}</p>

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

            <div className="flex flex-col gap-2 pt-1">
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
                variant={onPlayAgain ? "secondary" : won ? "gold" : "secondary"}
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
