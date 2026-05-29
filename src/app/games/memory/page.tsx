"use client";

import { useRef } from "react";
import { Brain } from "lucide-react";
import {
  PokeMemoryGame,
  type MemoryGameResult,
} from "@/components/minigame/PokeMemoryGame";
import { GamePageShell } from "@/components/minigame/GamePageShell";
import {
  MEMORY_COINS_PER_PAIR,
  MEMORY_GAME_DURATION_SEC,
  MEMORY_PAIR_COUNT,
} from "@/data/economy-balance";
import { calcMemoryReward } from "@/lib/memory-minigame-engine";
import { getEconomyBonuses, useEconomyStore } from "@/stores/economy-store";
import { recordMinigameToSupabase } from "@/lib/economy-supabase";

export default function MemoryGamePage() {
  const addCoins = useEconomyStore((s) => s.addCoins);
  const addXp = useEconomyStore((s) => s.addXp);
  const recordClickGame = useEconomyStore((s) => s.recordClickGame);
  const showRewardPopup = useEconomyStore((s) => s.showRewardPopup);
  const team = useEconomyStore((s) => s.team);
  const bonuses = getEconomyBonuses(team);
  const restartRef = useRef<(() => void) | null>(null);

  const handleComplete = (result: MemoryGameResult) => {
    const { coins, accountXp } = calcMemoryReward(
      result.moves,
      result.pairsFound,
      result.completed,
      bonuses.coinBonus
    );
    if (coins > 0) addCoins(coins);
    if (accountXp > 0) addXp(accountXp);

    recordClickGame(coins);
    void recordMinigameToSupabase(result.moves * 10, coins, result.pairsFound);

    const label = result.completed
      ? `Completo em ${result.moves} jogadas`
      : result.timedOut
        ? `Tempo esgotado · ${result.pairsFound}/${result.totalPairs} pares`
        : `${result.pairsFound} pares`;

    showRewardPopup(
      {
        coins,
        xp: accountXp,
        message: `Poké-Memory: ${label} → +${coins} moedas`,
      },
      () => restartRef.current?.()
    );
  };

  return (
    <GamePageShell
      title="Poké-Memory"
      subtitle={`${MEMORY_PAIR_COUNT} pares · ${MEMORY_GAME_DURATION_SEC}s · ${MEMORY_COINS_PER_PAIR} moeda/par ao completar`}
      icon={<Brain className="w-7 h-7 text-violet-400 shrink-0" />}
      tips={
        <>
          <p>Memorize a posição dos Pokémon. Erros desviram as cartas e custam tempo.</p>
          {bonuses.coinBonus > 0 && (
            <p className="text-amber-400">
              Meowth no time: +{Math.round(bonuses.coinBonus * 100)}% moedas
            </p>
          )}
        </>
      }
    >
      <PokeMemoryGame
        onComplete={handleComplete}
        onReady={(restart) => {
          restartRef.current = restart;
        }}
      />
    </GamePageShell>
  );
}
