"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { getPokemonNormalizedSpriteUrl } from "@/data/pokemon-sprites";
import { parseAvatarId, TRAINER_AVATARS } from "@/data/trainer-avatars";
import { usePreferencesStore } from "@/stores/preferences-store";
import { getAvatarBgOption } from "@/data/avatar-backgrounds";

interface TrainerAvatarDisplayProps {
  avatarId: string;
  username: string;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  xs: { box: "w-6 h-6 text-[10px]", image: 24 },
  sm: { box: "w-8 h-8 text-xs", image: 32 },
  md: { box: "w-16 h-16 text-xl", image: 64 },
  lg: { box: "w-24 h-24 text-4xl", image: 96 },
};

export function TrainerAvatarDisplay({
  avatarId,
  username,
  size = "md",
  className,
}: TrainerAvatarDisplayProps) {
  const sizes = sizeMap[size];
  const parsed = parseAvatarId(avatarId);
  const bgColor = usePreferencesStore((s) => s.avatarBgColor);
  const bgOption = getAvatarBgOption(bgColor);

  if (parsed.kind === "pokemon") {
    const pokemonId = Number(parsed.ref);
    if (pokemonId >= 1 && pokemonId <= 151) {
      return (
        <div
          className={cn(
            "rounded-full overflow-hidden border border-indigo-400/40 shrink-0",
            bgOption.bgClass,
            sizes.box,
            className
          )}
        >
          <Image
            src={getPokemonNormalizedSpriteUrl(pokemonId)}
            alt={`Pokémon ${pokemonId}`}
            width={sizes.image}
            height={sizes.image}
            className="object-contain w-full h-full p-0.5"
            loading="lazy"
          />
        </div>
      );
    }
  }

  if (parsed.kind === "trainer") {
    const trainer = TRAINER_AVATARS.find((a) => a.id === parsed.ref);
    if (trainer?.image) {
      return (
        <div
          className={cn(
            "rounded-full overflow-hidden border border-indigo-400/40 shrink-0",
            bgOption.bgClass,
            sizes.box,
            className
          )}
        >
          <Image
            src={trainer.image}
            alt={trainer.label}
            width={sizes.image}
            height={sizes.image}
            className="object-contain w-full h-full p-0.5"
            loading="lazy"
          />
        </div>
      );
    }
  }

  return (
    <div
      className={cn(
        "rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white border border-indigo-400/40 shrink-0",
        sizes.box,
        className
      )}
    >
      {username.charAt(0).toUpperCase()}
    </div>
  );
}
