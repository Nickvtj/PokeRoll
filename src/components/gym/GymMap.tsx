"use client";

import { useState } from "react";
import { GYMS } from "@/data/gyms";
import { useGymStore } from "@/stores/gym-store";
import { GymCard } from "@/components/gym/GymCard";
import { GymBattleScreen } from "@/components/gym/GymBattleScreen";
import { LeagueProgression } from "@/components/gym/LeagueProgression";
import type { GymId } from "@/types/gym";

export function GymMap({
  onBattleActiveChange,
}: {
  onBattleActiveChange?: (active: boolean) => void;
}) {
  const badges = useGymStore((s) => s.badges);
  const isGymUnlocked = useGymStore((s) => s.isGymUnlocked);
  const [activeGymId, setActiveGymId] = useState<GymId | null>(null);

  if (activeGymId) {
    return (
      <GymBattleScreen
        gymId={activeGymId}
        onExit={() => setActiveGymId(null)}
        onBattleActiveChange={onBattleActiveChange}
      />
    );
  }

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
            onChallenge={() => setActiveGymId(gym.id)}
          />
        ))}
      </div>
    </div>
  );
}
