"use client";

import { motion } from "framer-motion";
import { MousePointerClick } from "lucide-react";
import { ClickMinigame } from "@/components/minigame/ClickMinigame";
import { CoinCounter } from "@/components/ui/CoinCounter";
import {
  CLICK_DAILY_SOFT_CAP,
  CLICK_FATIGUE_START,
  CLICK_GAME_DURATION_SEC,
} from "@/data/economy-balance";
import { getEconomyBonuses, useEconomyStore } from "@/stores/economy-store";
import { recordMinigameToSupabase } from "@/lib/economy-supabase";

export default function MinigamePage() {
  const addCoins = useEconomyStore((s) => s.addCoins);
  const addXp = useEconomyStore((s) => s.addXp);
  const recordClickGame = useEconomyStore((s) => s.recordClickGame);
  const showRewardPopup = useEconomyStore((s) => s.showRewardPopup);
  const clickGamesToday = useEconomyStore((s) => s.clickGamesToday);
  const clickCoinsEarnedToday = useEconomyStore((s) => s.clickCoinsToday);
  const team = useEconomyStore((s) => s.team);

  const handleComplete = (score: number, coins: number, maxCombo: number) => {
    if (coins > 0) {
      addCoins(coins);
      addXp(Math.round(score / 10));
    }
    recordClickGame(coins);
    void recordMinigameToSupabase(score, coins, maxCombo);
    showRewardPopup({
      coins,
      xp: Math.round(score / 10),
      message:
        coins > 0
          ? `Minigame: ${score} pts → +${coins} moedas`
          : "Limite diário de moedas do minigame atingido",
    });
  };

  const bonuses = getEconomyBonuses(team);

  return (
    <div className="max-w-lg mx-auto px-4 py-8 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <MousePointerClick className="w-8 h-8 text-cyan-400" />
            Click Rush
          </h1>
          <p className="text-white/50 text-sm mt-1">
            Casual · {CLICK_GAME_DURATION_SEC}s · 1~3 🪙
          </p>
        </div>
        <CoinCounter size="sm" />
      </motion.div>

      <ClickMinigame onComplete={handleComplete} />

      <div className="glass-card p-4 text-xs text-white/40 space-y-1">
        <p>🎮 Partidas hoje: {clickGamesToday}</p>
        <p>
          🪙 Moedas do minigame hoje: {clickCoinsEarnedToday}/{CLICK_DAILY_SOFT_CAP}
        </p>
        <p>⚠️ Após {CLICK_FATIGUE_START} partidas, recompensa reduz 50%</p>
        {bonuses.coinBonus > 0 && (
          <p className="text-amber-400">
            Meowth no time: +{Math.round(bonuses.coinBonus * 100)}% moedas
          </p>
        )}
        {bonuses.comboBonus > 0 && (
          <p className="text-cyan-400">
            Bônus de combo do time: +{Math.round(bonuses.comboBonus * 100)}%
          </p>
        )}
      </div>
    </div>
  );
}
