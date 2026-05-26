"use client";

import { useEffect } from "react";
import type { AchievementStats } from "@/data/achievements";
import { useEconomyStore } from "@/stores/economy-store";
import { useGameStore } from "@/stores/game-store";

export function useAchievementSync(enabled: boolean) {
  const refreshAchievements = useEconomyStore((s) => s.refreshAchievements);
  const getUniqueCount = useGameStore((s) => s.getUniqueCount);
  const totalSpins = useGameStore((s) => s.profile.totalSpins);
  const coins = useEconomyStore((s) => s.coins);
  const level = useEconomyStore((s) => s.level);
  const battleWins = useEconomyStore((s) => s.battleWins);
  const clickGamesPlayed = useEconomyStore((s) => s.clickGamesPlayed);
  const dailyStreak = useEconomyStore((s) => s.dailyStreak);

  useEffect(() => {
    if (!enabled) return;

    const stats: AchievementStats = {
      uniquePokemon: getUniqueCount(),
      totalSpins,
      battleWins,
      clickGames: clickGamesPlayed,
      level,
      dailyStreak,
      coins,
    };
    refreshAchievements(stats);
  }, [
    enabled,
    refreshAchievements,
    getUniqueCount,
    totalSpins,
    battleWins,
    clickGamesPlayed,
    level,
    dailyStreak,
    coins,
  ]);
}

export function useDuplicateRewardGuard() {
  useEffect(() => {
    const grant = () => useGameStore.getState().grantDuplicateRewards();

    window.addEventListener("pagehide", grant);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") grant();
    });

    return () => {
      window.removeEventListener("pagehide", grant);
    };
  }, []);
}
