"use client";

import { useRef, useCallback } from "react";
import { Bird } from "lucide-react";
import {
  FlappyZubatGame,
  type FlappyZubatResult,
} from "@/components/minigame/FlappyZubatGame";
import { GamePageShell } from "@/components/minigame/GamePageShell";
import { getFlappySkin } from "@/data/flappy-skins";
import { applyMinigameCoinBonus } from "@/lib/minigame-rewards";
import { recordMinigameToSupabase } from "@/lib/economy-supabase";
import { getEconomyBonuses, useEconomyStore } from "@/stores/economy-store";

export default function FlappyZubatPage() {
  const addCoins = useEconomyStore((s) => s.addCoins);
  const addXp = useEconomyStore((s) => s.addXp);
  const recordClickGame = useEconomyStore((s) => s.recordClickGame);
  const recordFlappyRun = useEconomyStore((s) => s.recordFlappyRun);
  const setFlappySkin = useEconomyStore((s) => s.setFlappySkin);
  const showRewardPopup = useEconomyStore((s) => s.showRewardPopup);
  const flappy = useEconomyStore((s) => s.flappyZubat);
  const highScores = useEconomyStore((s) => s.highScores);
  const lifetimeCoins = useEconomyStore((s) => s.lifetimeCoinsEarned ?? 0);
  const team = useEconomyStore((s) => s.team);
  const bonuses = getEconomyBonuses(team);
  const restartRef = useRef<(() => void) | null>(null);

  const handleComplete = (result: FlappyZubatResult) => {
    const coinsWithBonus = applyMinigameCoinBonus(result.coins, bonuses.coinBonus);

    if (coinsWithBonus > 0) addCoins(coinsWithBonus);
    if (result.accountXp > 0) addXp(result.accountXp);
    recordClickGame(coinsWithBonus);

    const { newSkins, isNewRecord } = recordFlappyRun(result.score);
    void recordMinigameToSupabase(result.score, coinsWithBonus, result.score);

    const skinUnlockMsg =
      newSkins.length > 0
        ? newSkins
            .map((id) => `Skin ${getFlappySkin(id).label} desbloqueada!`)
            .join(" · ")
        : null;

    showRewardPopup(
      {
        coins: coinsWithBonus > 0 ? coinsWithBonus : undefined,
        xp: result.accountXp > 0 ? result.accountXp : undefined,
        message: [
          `${result.score} pts`,
          coinsWithBonus > 0 ? `+${coinsWithBonus} moedas` : "Sem moedas desta vez",
          skinUnlockMsg,
          isNewRecord ? "Novo recorde!" : null,
        ]
          .filter(Boolean)
          .join(" · "),
        isNewRecord,
        onClosePath: "/games",
        closeLabel: "Voltar",
      },
      () => restartRef.current?.()
    );
  };

  const handleReady = useCallback((restart: () => void) => {
    restartRef.current = restart;
  }, []);

  return (
    <GamePageShell
      title="Flappy Zubat"
      subtitle="Voe pela torre assombrada · desbloqueie skins · até 18 moedas por partida"
      icon={<Bird className="w-7 h-7 text-indigo-400 shrink-0" />}
    >
      <FlappyZubatGame
        selectedSkinId={flappy?.selectedSkin ?? "zubat"}
        unlockedSkins={flappy?.unlockedSkins ?? ["zubat"]}
        bestScore={highScores?.flappyZubat ?? 0}
        lifetimeCoins={lifetimeCoins}
        onSelectSkin={setFlappySkin}
        onComplete={handleComplete}
        onReady={handleReady}
      />
    </GamePageShell>
  );
}
