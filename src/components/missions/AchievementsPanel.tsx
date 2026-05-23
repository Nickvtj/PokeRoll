"use client";

import { Trophy } from "lucide-react";
import { ACHIEVEMENTS, getUnlockedAchievements } from "@/data/achievements";
import { useEconomyStore } from "@/stores/economy-store";
import { useGameStore } from "@/stores/game-store";
import { cn } from "@/lib/utils";

export function AchievementsPanel() {
  const getUniqueCount = useGameStore((s) => s.getUniqueCount);
  const profile = useGameStore((s) => s.profile);
  const coins = useEconomyStore((s) => s.coins);
  const level = useEconomyStore((s) => s.level);
  const battleWins = useEconomyStore((s) => s.battleWins);
  const clickGamesPlayed = useEconomyStore((s) => s.clickGamesPlayed);
  const dailyStreak = useEconomyStore((s) => s.dailyStreak);

  const stats = {
    uniquePokemon: getUniqueCount(),
    totalSpins: profile.totalSpins,
    battleWins,
    clickGames: clickGamesPlayed,
    level,
    dailyStreak,
    coins,
  };

  const unlocked = new Set(getUnlockedAchievements(stats));

  return (
    <div className="glass-card p-5 space-y-4">
      <h3 className="font-bold flex items-center gap-2">
        <Trophy className="w-5 h-5 text-amber-400" />
        Conquistas ({unlocked.size}/{ACHIEVEMENTS.length})
      </h3>

      <div className="grid grid-cols-2 gap-2">
        {ACHIEVEMENTS.map((a) => {
          const done = unlocked.has(a.id);
          return (
            <div
              key={a.id}
              className={cn(
                "p-3 rounded-xl border text-center transition-all",
                done
                  ? "bg-amber-500/10 border-amber-500/30"
                  : "bg-white/5 border-white/10 opacity-40"
              )}
            >
              <span className="text-2xl">{a.icon}</span>
              <p className="text-xs font-bold mt-1">{a.label}</p>
              <p className="text-[10px] text-white/40 mt-0.5">{a.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
