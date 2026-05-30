"use client";

import dynamic from "next/dynamic";
import { useRef } from "react";
import { MousePointerClick } from "lucide-react";
import { GamePageShell } from "@/components/minigame/GamePageShell";
import { MinigameGameSkeleton } from "@/components/ui/RouteLoading";
import {
  CLICK_BASE_COINS_MAX,
  CLICK_BASE_COINS_MIN,
  CLICK_GAME_DURATION_SEC,
} from "@/data/economy-balance";
import { useEconomyStore } from "@/stores/economy-store";
import { recordMinigameToSupabase } from "@/lib/economy-supabase";
import type { ClickGameRewardBreakdown } from "@/lib/minigame-engine";

const ClickMinigame = dynamic(
  () =>
    import("@/components/minigame/ClickMinigame").then((m) => ({
      default: m.ClickMinigame,
    })),
  { loading: () => <MinigameGameSkeleton /> }
);

export default function ClickRushGamePage() {
  const addCoins = useEconomyStore((s) => s.addCoins);
  const addXp = useEconomyStore((s) => s.addXp);
  const recordClickGame = useEconomyStore((s) => s.recordClickGame);
  const updateHighScore = useEconomyStore((s) => s.updateHighScore);
  const showRewardPopup = useEconomyStore((s) => s.showRewardPopup);
  const restartRef = useRef<(() => void) | null>(null);

  const handleComplete = (score: number, reward: ClickGameRewardBreakdown, maxCombo: number) => {
    const { coins, baseCoins, comboBonus } = reward;
    const xp = Math.max(4, Math.round(score / 15));

    const isNewRecord = updateHighScore("clickRush", score);

    if (coins > 0) addCoins(coins);
    addXp(xp);
    recordClickGame(coins);
    void recordMinigameToSupabase(score, coins, maxCombo);

    const rewardParts = [`${baseCoins} por pontos`];
    if (comboBonus > 0) rewardParts.push(`+${comboBonus} combo`);

    showRewardPopup(
      {
        coins,
        xp,
        message: isNewRecord
          ? `NOVO RECORDE! ${score} pts · combo ${maxCombo} → +${coins} moedas`
          : `Click Rush: ${score} pts · combo ${maxCombo} (${rewardParts.join(" · ")}) → +${coins} moedas`,
        isNewRecord,
        onClosePath: "/games",
        closeLabel: "Voltar",
      },
      () => restartRef.current?.()
    );
  };

  return (
    <GamePageShell
      title="Click Rush"
      subtitle={`${CLICK_GAME_DURATION_SEC}s de cliques rápidos · ${CLICK_BASE_COINS_MIN}~${CLICK_BASE_COINS_MAX} moedas por desempenho`}
      icon={<MousePointerClick className="w-7 h-7 text-cyan-400 shrink-0" />}
    >
      <ClickMinigame
        onComplete={handleComplete}
        onReady={(restart) => {
          restartRef.current = restart;
        }}
      />
    </GamePageShell>
  );
}
