"use client";

import { Trophy } from "lucide-react";
import { ACHIEVEMENTS } from "@/data/achievements";
import { useEconomyStore } from "@/stores/economy-store";
import { cn } from "@/lib/utils";

export function AchievementsPanel() {
  const unlockedAchievements = useEconomyStore((s) => s.unlockedAchievements ?? []);
  const unlocked = new Set(unlockedAchievements);

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
