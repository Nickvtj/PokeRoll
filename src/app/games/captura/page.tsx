"use client";

import { useRef } from "react";
import { Target } from "lucide-react";
import {
  CapturaPerfeitaGame,
  type CaptureGameResult,
} from "@/components/minigame/CapturaPerfeitaGame";
import { GamePageShell } from "@/components/minigame/GamePageShell";
import { useEconomyStore } from "@/stores/economy-store";
import { recordMinigameToSupabase } from "@/lib/economy-supabase";
import { POKEMON_MAP } from "@/data/pokemon";

export default function CapturaGamePage() {
  const addCoins = useEconomyStore((s) => s.addCoins);
  const addXp = useEconomyStore((s) => s.addXp);
  const grantPokemonXp = useEconomyStore((s) => s.grantPokemonXp);
  const recordClickGame = useEconomyStore((s) => s.recordClickGame);
  const updateHighScore = useEconomyStore((s) => s.updateHighScore);
  const showRewardPopup = useEconomyStore((s) => s.showRewardPopup);
  const team = useEconomyStore((s) => s.team);
  const restartRef = useRef<(() => void) | null>(null);

  const handleComplete = (result: CaptureGameResult) => {
    const { streak, caughtPokemon, perfectHits, coins, accountXp, bonusPokemonXp, pokemon, endedOnMiss } =
      result;

    if (coins > 0) addCoins(coins);
    if (accountXp > 0) addXp(accountXp);

    let bonusMsg = "";
    if (bonusPokemonXp > 0 && team.length > 0) {
      const targetId = team[Math.floor(Math.random() * team.length)];
      grantPokemonXp(targetId, bonusPokemonXp);
      bonusMsg = `, +${bonusPokemonXp} XP em ${POKEMON_MAP[targetId]?.name ?? "time"}`;
    }

    recordClickGame(coins);
    if (streak >= 5) {
      useEconomyStore.getState().incrementMission("perfect_capture");
    }

    const isNewRecord = updateHighScore("perfectCapture", streak);

    void recordMinigameToSupabase(streak, coins, perfectHits);

    const names =
      caughtPokemon.length > 0
        ? caughtPokemon
            .slice(-3)
            .map((p) => p.name)
            .join(", ")
        : pokemon.name;

    const headline = isNewRecord
      ? `NOVO RECORDE! Sequência de ${streak}!`
      : streak === 0
        ? `Errou! Nenhuma captura desta vez.`
        : endedOnMiss
          ? `Sequência de ${streak}! Parou em ${pokemon.name}.`
          : `Sequência de ${streak} Pokémon!`;

    showRewardPopup(
      {
        coins,
        xp: accountXp,
        message: `${headline} ${names}, +${coins} moedas${bonusMsg}`,
        isNewRecord,
        onClosePath: "/games",
        closeLabel: "Voltar",
      },
      () => restartRef.current?.()
    );
  };

  return (
    <GamePageShell
      title="Captura Perfeita"
      subtitle="Capture em sequência, 1 moeda por acerto (dourado ou verde)"
      icon={<Target className="w-7 h-7 text-emerald-400 shrink-0" />}
    >
      <CapturaPerfeitaGame
        onComplete={handleComplete}
        onReady={(restart) => {
          restartRef.current = restart;
        }}
      />
    </GamePageShell>
  );
}
