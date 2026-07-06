"use client";

import { Award, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { GYMS } from "@/data/gyms";
import { useGymStore } from "@/stores/gym-store";
import { GymBadge } from "@/components/gym/GymBadge";
import { ProfileSection } from "@/components/profile/ProfileSection";

export function ProfileBadgesPanel() {
  const badges = useGymStore((s) => s.badges);
  const championDefeated = useGymStore((s) => s.championDefeated);

  const earned = GYMS.filter((g) => badges.includes(g.id));
  const missing = GYMS.filter((g) => !badges.includes(g.id));

  return (
    <ProfileSection
      title="Insígnias Kanto"
      description="Conquistadas ao vencer os líderes de ginásio."
      icon={Award}
      iconClassName="text-amber-400"
    >
      {earned.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs text-emerald-400/90 uppercase tracking-wider font-semibold">
            Conquistadas
          </p>
          <div className="grid grid-cols-4 sm:grid-cols-4 gap-4">
            {earned.map((g) => (
              <div key={g.id} className="flex flex-col items-center gap-1.5">
                <GymBadge gymId={g.id} name={g.badgeName} earned color={g.themeColor} size="md" />
                <p className="text-[11px] text-white/55 text-center leading-tight">{g.badgeName}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {missing.length > 0 && (
        <div className={cn("space-y-3", earned.length > 0 && "mt-8 pt-6 border-t border-white/10")}>
          <p className="text-xs text-white/45 uppercase tracking-wider font-semibold">
            Faltam conquistar
          </p>
          <div className="grid grid-cols-4 sm:grid-cols-4 gap-4">
            {missing.map((g) => (
              <div key={g.id} className="flex flex-col items-center gap-1.5 opacity-65">
                <GymBadge gymId={g.id} name={g.badgeName} earned={false} color={g.themeColor} size="md" />
                <p className="text-[11px] text-white/40 text-center leading-tight">{g.leaderName}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {championDefeated && (
        <p className="text-center text-sm text-amber-400 font-semibold pt-3 border-t border-white/10 flex items-center justify-center gap-2">
          <Trophy className="w-4 h-4" />
          Campeão da Liga · Hall of Fame
        </p>
      )}
    </ProfileSection>
  );
}
