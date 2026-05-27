"use client";

import { GYMS } from "@/data/gyms";
import { useGymStore } from "@/stores/gym-store";
import { GymBadge } from "@/components/gym/GymBadge";

export function LeagueProgression() {
  const badges = useGymStore((s) => s.badges);

  return (
    <div className="glass-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold">Insígnias de Kanto</h3>
        <span className="text-xs text-indigo-300">{badges.length}/8</span>
      </div>
      <div className="grid grid-cols-8 gap-1.5 sm:gap-2">
        {GYMS.map((g) => (
          <div key={g.id} className="flex justify-center">
            <GymBadge
              gymId={g.id}
              name={g.badgeName}
              earned={badges.includes(g.id)}
              color={g.themeColor}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
