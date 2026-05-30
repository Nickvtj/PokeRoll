"use client";

import { useRef } from "react";
import { Target } from "lucide-react";
import {
  CapturaPerfeitaGame,
  type CaptureGameResult,
} from "@/components/minigame/CapturaPerfeitaGame";
import { GamePageShell } from "@/components/minigame/GamePageShell";
import { getEconomyBonuses, useEconomyStore } from "@/stores/economy-store";
import { recordMinigameToSupabase } from "@/lib/economy-supabase";
import { POKEMON_MAP } from "@/data/pokemon";
import { fireHighScoreConfetti } from "@/lib/confetti";

export default function CapturaGamePage() {
  const addCoins = useEconomyStore((s) => s.addCoins);
  const addXp = useEconomyStore((s) => s.addXp);
  const grantPokemonXp = useEconomyStore((s) => s.grantPokemonXp);
  const recordClickGame = useEconomyStore((s) => s.recordClickGame);
  const updateHighScore = useEconomyStore((s) => s.updateHighScore);
  const highScores = useEconomyStore((s) => s.highScores);
  const showRewardPopup = useEconomyStore((s) => s.showRewardPopup);
  const team = useEconomyStore((s) => s.team);
  const bonuses = getEconomyBonuses(team);
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
      bonusMsg = ` · +${bonusPokemonXp} XP em ${POKEMON_MAP[targetId]?.name ?? "time"}`;
    }

    recordClickGame(coins);
    const score = streak * 100 + perfectHits * 50;
    
    // Verifica recorde
    const isNewRecord = updateHighScore("perfectCapture", score);
    if (isNewRecord) fireHighScoreConfetti();
    
    void recordMinigameToSupabase(score, coins, perfectHits);

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
        message: `${headline} ${names} → +${coins} 🪙${bonusMsg}`,
      },
      () => restartRef.current?.()
    );
  };

  const currentRecord = highScores?.perfectCapture ?? 0;

  return (
    <GamePageShell
      title="Captura Perfeita"
      subtitle="Capture em sequência · perfeito = 2 moedas, bom = 1 moeda"
      icon={<Target className="w-7 h-7 text-emerald-400 shrink-0" />}
      tips={
        <>
          {currentRecord > 0 && (
            <p className="text-amber-400 font-bold mb-1">Seu recorde: {currentRecord} pts 🏆</p>
          )}
          <p>Centro dourado = perfeito (2 moedas). Zona verde = capturado (1 moeda).</p>
          {bonuses.coinBonus > 0 && (
            <p className="text-amber-400">
              Meowth no time: +{Math.round(bonuses.coinBonus * 100)}% moedas
            </p>
          )}
        </>
      }
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
