"use client";

import { MousePointerClick } from "lucide-react";
import { ClickMinigame } from "@/components/minigame/ClickMinigame";
import { GamePageShell } from "@/components/minigame/GamePageShell";
import {
  CLICK_BASE_COINS_MAX,
  CLICK_BASE_COINS_MIN,
  CLICK_GAME_DURATION_SEC,
} from "@/data/economy-balance";
import { getEconomyBonuses, useEconomyStore } from "@/stores/economy-store";
import { recordMinigameToSupabase } from "@/lib/economy-supabase";

export default function ClickRushGamePage() {
  const addCoins = useEconomyStore((s) => s.addCoins);
  const addXp = useEconomyStore((s) => s.addXp);
  const recordClickGame = useEconomyStore((s) => s.recordClickGame);
  const showRewardPopup = useEconomyStore((s) => s.showRewardPopup);
  const team = useEconomyStore((s) => s.team);
  const bonuses = getEconomyBonuses(team);

  const handleComplete = (score: number, coins: number, maxCombo: number) => {
    const xp = Math.max(4, Math.round(score / 15));
    if (coins > 0) addCoins(coins);
    addXp(xp);
    recordClickGame(coins);
    void recordMinigameToSupabase(score, coins, maxCombo);
    showRewardPopup({
      coins,
      xp,
      message: `Click Rush: ${score} pts · combo ${maxCombo} → +${coins} moedas`,
    });
  };

  return (
    <GamePageShell
      title="Click Rush"
      subtitle={`${CLICK_GAME_DURATION_SEC}s · ${CLICK_BASE_COINS_MIN}~${CLICK_BASE_COINS_MAX} moedas`}
      icon={<MousePointerClick className="w-7 h-7 text-cyan-400 shrink-0" />}
      tips={
        <>
          <p>⚡ Faça combos clicando sem pausa · bolas raras valem mais pontos</p>
          {bonuses.coinBonus > 0 && (
            <p className="text-amber-400">
              Meowth no time: +{Math.round(bonuses.coinBonus * 100)}% moedas
            </p>
          )}
          {bonuses.comboBonus > 0 && (
            <p className="text-cyan-400">
              Bônus de combo: +{Math.round(bonuses.comboBonus * 100)}%
            </p>
          )}
        </>
      }
    >
      <ClickMinigame onComplete={handleComplete} />
    </GamePageShell>
  );
}
