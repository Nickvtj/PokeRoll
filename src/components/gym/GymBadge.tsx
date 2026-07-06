"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { getBadgeImage } from "@/data/gym-badges";
import { GYM_MAP } from "@/data/gyms";
import type { GymId } from "@/types/gym";

interface GymBadgeProps {
  gymId: GymId;
  name: string;
  earned: boolean;
  color: string;
  size?: "2xs" | "xs" | "sm" | "md" | "lg";
}

const sizeMap = {
  "2xs": { box: "w-4 h-4", img: 14 },
  xs: { box: "w-6 h-6", img: 20 },
  sm: { box: "w-10 h-10", img: 32 },
  md: { box: "w-14 h-14", img: 44 },
  lg: { box: "w-20 h-20", img: 64 },
};

export function GymBadge({ gymId, name, earned, color, size = "sm" }: GymBadgeProps) {
  const s = sizeMap[size];

  return (
    <div
      title={name}
      className={cn(
        "rounded-xl border flex items-center justify-center transition-all overflow-hidden p-0.5",
        s.box,
        earned ? "opacity-100 shadow-lg" : "opacity-25 grayscale border-white/10 bg-white/5"
      )}
      style={
        earned
          ? {
              borderColor: `${color}80`,
              boxShadow: `0 0 16px ${color}40`,
              backgroundColor: `${color}15`,
            }
          : undefined
      }
    >
      <Image
        src={getBadgeImage(gymId)}
        alt={name}
        width={s.img}
        height={s.img}
        className="object-contain drop-shadow-md"
        unoptimized
      />
    </div>
  );
}

interface PokemonGymBadgesProps {
  gymIds: GymId[];
  size?: "xs" | "sm";
  max?: number;
}

export function PokemonGymBadges({ gymIds, size = "xs", max = 4 }: PokemonGymBadgesProps) {
  if (gymIds.length === 0) return null;

  const shown = gymIds.slice(0, max);
  const extra = gymIds.length - shown.length;

  return (
    <div className="flex flex-wrap items-center gap-0.5 justify-center">
      {shown.map((id) => {
        const gym = GYM_MAP[id];
        return (
          <GymBadge
            key={id}
            gymId={id}
            name={gym.badgeName}
            earned
            color={gym.themeColor}
            size={size}
          />
        );
      })}
      {extra > 0 && (
        <span className="text-[8px] text-white/40 font-bold">+{extra}</span>
      )}
    </div>
  );
}
