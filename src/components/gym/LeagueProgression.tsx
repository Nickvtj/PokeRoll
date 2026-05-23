"use client";

import { GYMS } from "@/data/gyms";
import { getLevelCapLabel } from "@/data/pokemon-xp-curve";
import { useGymStore } from "@/stores/gym-store";
import { GymBadge } from "@/components/gym/GymBadge";

export function LeagueProgression() {
  const badges = useGymStore((s) => s.badges);
  const championDefeated = useGymStore((s) => s.championDefeated);
  const getLevelCap = useGymStore((s) => s.getLevelCap);

  return (
    <div className="glass-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold">Liga Kanto</h3>
        <span className="text-xs text-indigo-300">{badges.length}/8 insígnias</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {GYMS.map((g) => (
          <GymBadge
            key={g.id}
            gymId={g.id}
            name={g.badgeName}
            earned={badges.includes(g.id)}
            color={g.themeColor}
          />
        ))}
      </div>
      <p className="text-[10px] text-white/40">
        {getLevelCapLabel(badges.length, championDefeated)} · Cap atual: Nv.{getLevelCap()}
      </p>
    </div>
  );
}
