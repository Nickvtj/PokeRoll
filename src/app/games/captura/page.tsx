"use client";

import { Target } from "lucide-react";
import { CapturaPerfeitaGame, type CaptureGameResult } from "@/components/minigame/CapturaPerfeitaGame";
import { GamePageShell } from "@/components/minigame/GamePageShell";
import { getEconomyBonuses, useEconomyStore } from "@/stores/economy-store";
import { recordMinigameToSupabase } from "@/lib/economy-supabase";
import { POKEMON_MAP } from "@/data/pokemon";

export default function CapturaGamePage() {
  const addCoins = useEconomyStore((s) => s.addCoins);
  const addXp = useEconomyStore((s) => s.addXp);
  const grantPokemonXp = useEconomyStore((s) => s.grantPokemonXp);
  const recordClickGame = useEconomyStore((s) => s.recordClickGame);
  const showRewardPopup = useEconomyStore((s) => s.showRewardPopup);
  const team = useEconomyStore((s) => s.team);
  const bonuses = getEconomyBonuses(team);

  const handleComplete = (result: CaptureGameResult) => {
    const { captured, goodHits, perfectHits, totalShakes, coins, accountXp, bonusPokemonXp, pokemon } =
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
    const score = captured ? 200 + perfectHits * 50 + goodHits * 20 : goodHits * 30;
    void recordMinigameToSupabase(score, coins, perfectHits);

    showRewardPopup({
      coins,
      xp: accountXp,
      message: `${captured ? "Capturado" : "Escapou"}: ${pokemon.name} (${goodHits}/${totalShakes}) → +${coins} 🪙${bonusMsg}`,
    });
  };

  return (
    <GamePageShell
      title="Captura Perfeita"
      subtitle="1~5 moedas conforme raridade capturada"
      icon={<Target className="w-7 h-7 text-emerald-400 shrink-0" />}
      tips={
        <>
          <p>✨ Moedas pela raridade: Comum 1 · Incomum 2 · Raro 3 · Épico 4 · Lendário 5</p>
          {bonuses.coinBonus > 0 && (
            <p className="text-amber-400">
              Meowth no time: +{Math.round(bonuses.coinBonus * 100)}% moedas
            </p>
          )}
        </>
      }
    >
      <CapturaPerfeitaGame onComplete={handleComplete} />
    </GamePageShell>
  );
}
