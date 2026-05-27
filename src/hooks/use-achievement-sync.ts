"use client";

import { useEffect, useRef } from "react";
import type { AchievementStats } from "@/data/achievements";
import { useEconomyStore } from "@/stores/economy-store";
import { useGameStore } from "@/stores/game-store";

const ACHIEVEMENT_DEBOUNCE_MS = 400;

export function useAchievementSync(enabled: boolean) {
  const refreshAchievements = useEconomyStore((s) => s.refreshAchievements);
  const getUniqueCount = useGameStore((s) => s.getUniqueCount);
  const totalSpins = useGameStore((s) => s.profile.totalSpins);
  const coins = useEconomyStore((s) => s.coins);
  const level = useEconomyStore((s) => s.level);
  const battleWins = useEconomyStore((s) => s.battleWins);
  const clickGamesPlayed = useEconomyStore((s) => s.clickGamesPlayed);
  const dailyStreak = useEconomyStore((s) => s.dailyStreak);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!enabled) return;

    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
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
    }, ACHIEVEMENT_DEBOUNCE_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
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

    const onVisibility = () => {
      if (document.visibilityState === "hidden") grant();
    };

    window.addEventListener("pagehide", grant);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.removeEventListener("pagehide", grant);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);
}
