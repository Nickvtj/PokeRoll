"use client";

import { GYMS } from "@/data/gyms";
import { useGymStore } from "@/stores/gym-store";
import { GymCard } from "@/components/gym/GymCard";
import { LeagueProgression } from "@/components/gym/LeagueProgression";

export function GymMap() {
  const badges = useGymStore((s) => s.badges);
  const isGymUnlocked = useGymStore((s) => s.isGymUnlocked);

  return (
    <div className="space-y-4">
      <LeagueProgression />
      <div className="grid gap-3">
        {GYMS.map((gym) => (
          <GymCard
            key={gym.id}
            gym={gym}
            unlocked={isGymUnlocked(gym.id)}
            hasBadge={badges.includes(gym.id)}
          />
        ))}
      </div>
    </div>
  );
}
