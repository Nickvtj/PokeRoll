"use client";

import { useRef } from "react";
import { Ghost } from "lucide-react";
import {
  HunterCaveGame,
  type HunterCaveResult,
} from "@/components/minigame/HunterCaveGame";
import { GamePageShell } from "@/components/minigame/GamePageShell";
import { HUNTER_ENTRY_COST } from "@/data/economy-balance";
import { calcHunterFleeReward } from "@/lib/hunter-cave-engine";
import { recordMinigameToSupabase } from "@/lib/economy-supabase";
import { getEconomyBonuses, useEconomyStore } from "@/stores/economy-store";

export default function HunterCavePage() {
  const coins = useEconomyStore((s) => s.coins);
  const spendCoins = useEconomyStore((s) => s.spendCoins);
  const addCoins = useEconomyStore((s) => s.addCoins);
  const addXp = useEconomyStore((s) => s.addXp);
  const recordClickGame = useEconomyStore((s) => s.recordClickGame);
  const updateHighScore = useEconomyStore((s) => s.updateHighScore);
  const showRewardPopup = useEconomyStore((s) => s.showRewardPopup);
  const highScores = useEconomyStore((s) => s.highScores);
  const team = useEconomyStore((s) => s.team);
  const bonuses = getEconomyBonuses(team);
  const restartRef = useRef<(() => void) | null>(null);

  const handleStart = () => spendCoins(HUNTER_ENTRY_COST);

  const handleComplete = (result: HunterCaveResult) => {
    if (result.fled && result.pot > 0) {
      const reward = calcHunterFleeReward(result.pot, bonuses.coinBonus);
      addCoins(reward.coins);
      addXp(reward.accountXp);
      recordClickGame(reward.coins);
      const isNewRecord = updateHighScore("hunterCave", result.pot);
      void recordMinigameToSupabase(result.pot, reward.coins, result.roundsCleared);

      showRewardPopup(
        {
          outcome: "win",
          coins: reward.coins,
          xp: reward.accountXp,
          message: [
            `Escapou na rodada ${result.roundsCleared}!`,
            `Lucro: +${reward.profit} moedas`,
            isNewRecord ? "Novo recorde de fuga!" : null,
          ]
            .filter(Boolean)
            .join(" · "),
          isNewRecord,
          onClosePath: "/games",
          closeLabel: "Voltar",
        },
        () => restartRef.current?.()
      );
      return;
    }

    void recordMinigameToSupabase(0, 0, result.roundsCleared);
    showRewardPopup(
      {
        outcome: "loss",
        message: `Haunter levou tudo! Perdeu ${result.entryCost} moedas na rodada ${Math.max(1, result.roundsCleared + 1)}.`,
        onClosePath: "/games",
        closeLabel: "Voltar",
      },
      () => restartRef.current?.()
    );
  };

  return (
    <GamePageShell
      title="Caverna dos Hunter"
      subtitle={`Aposta ${HUNTER_ENTRY_COST} moedas · acumule moedas sem limite ou fuja antes do Haunter`}
      icon={<Ghost className="w-7 h-7 text-violet-400 shrink-0" />}
    >
      <HunterCaveGame
        coins={coins}
        bestPot={highScores?.hunterCave ?? 0}
        onStart={handleStart}
        onComplete={handleComplete}
        onReady={(restart) => {
          restartRef.current = restart;
        }}
      />
    </GamePageShell>
  );
}
