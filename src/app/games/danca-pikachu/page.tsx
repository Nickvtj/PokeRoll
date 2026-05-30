"use client";

import dynamic from "next/dynamic";
import { useRef } from "react";
import { Music } from "lucide-react";
import { GamePageShell } from "@/components/minigame/GamePageShell";
import { MinigameGameSkeleton } from "@/components/ui/RouteLoading";
import { getEconomyBonuses, useEconomyStore } from "@/stores/economy-store";
import { recordMinigameToSupabase } from "@/lib/economy-supabase";

const DancaPikachuGame = dynamic(
  () =>
    import("@/components/minigame/DancaPikachuGame").then((m) => ({
      default: m.DancaPikachuGame,
    })),
  { loading: () => <MinigameGameSkeleton /> }
);

export default function DancaPikachuPage() {
  const addCoins = useEconomyStore((s) => s.addCoins);
  const addXp = useEconomyStore((s) => s.addXp);
  const updateHighScore = useEconomyStore((s) => s.updateHighScore);
  const showRewardPopup = useEconomyStore((s) => s.showRewardPopup);
  const team = useEconomyStore((s) => s.team);
  const bonuses = getEconomyBonuses(team);

  const restartRef = useRef<(() => void) | null>(null);

  const handleComplete = (score: number) => {
    const baseCoins = Math.floor(score / 300);
    const coinBonus = Math.round(baseCoins * bonuses.coinBonus);
    const totalCoins = baseCoins + coinBonus;

    const xp = Math.max(5, Math.floor(score / 80));

    const isNewRecord = updateHighScore("dancaPikachu", score);

    if (totalCoins > 0) addCoins(totalCoins);
    addXp(xp);

    void recordMinigameToSupabase(score, totalCoins, 0);

    showRewardPopup(
      {
        coins: totalCoins,
        xp,
        message: isNewRecord
          ? `NOVO RECORDE NA DANÇA! ${score} pts → +${totalCoins} moedas ✨`
          : `Show encerrado! Você fez ${score} pontos e ganhou +${totalCoins} moedas.`,
        isNewRecord,
        closeLabel: "Voltar",
        onClosePath: "/games",
      },
      () => restartRef.current?.()
    );
  };

  return (
    <GamePageShell
      title="Dança Pikachu"
      subtitle="Reflexos · Ritmo · 1 moeda / 300 pts"
      icon={<Music className="w-7 h-7 text-yellow-400 shrink-0" />}
    >
      <DancaPikachuGame
        onComplete={handleComplete}
        onReady={(restart) => {
          restartRef.current = restart;
        }}
      />
    </GamePageShell>
  );
}
