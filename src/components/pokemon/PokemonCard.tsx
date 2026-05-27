"use client";

import Image from "next/image";
import { Lock, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import { RarityBadge } from "@/components/ui/RarityBadge";
import { RARITY_CONFIG } from "@/data/rarity";
import type { Pokemon } from "@/types";

interface PokemonCardProps {
  pokemon: Pokemon;
  collected?: boolean;
  duplicateCount?: number;
  onClick?: () => void;
  size?: "sm" | "md" | "lg";
  animate?: boolean;
}

const sizeConfig = {
  sm: { card: "p-2", image: 84, imageBox: "h-[7.5rem]", text: "text-xs", lock: "w-7 h-7" },
  md: { card: "p-3", image: 96, imageBox: "h-28", text: "text-sm", lock: "w-8 h-8" },
  lg: { card: "p-4", image: 128, imageBox: "h-36", text: "text-base", lock: "w-10 h-10" },
};

export function PokemonCard({
  pokemon,
  collected = false,
  duplicateCount = 0,
  onClick,
  size = "md",
  animate = true,
}: PokemonCardProps) {
  const config = RARITY_CONFIG[pokemon.rarity];
  const sizes = sizeConfig[size];

  const cardClassName = cn(
    "glass-card relative overflow-hidden group",
    sizes.card,
    collected && `rarity-glow-${pokemon.rarity}`,
    !collected && "opacity-75",
    onClick && collected && "cursor-pointer",
    animate && collected && "transition-transform duration-300 hover:scale-[1.03] hover:-translate-y-1"
  );

  const cardStyle = collected
    ? { borderColor: `${config.color}30` }
    : undefined;

  return (
    <div onClick={onClick} className={cardClassName} style={cardStyle}>
      {duplicateCount > 1 && (
        <div className="absolute top-2 right-2 z-10 flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/60 text-xs text-amber-400">
          <Copy className="w-3 h-3" />
          x{duplicateCount}
        </div>
      )}

      <span className="absolute top-2 left-2 text-xs text-white/40 font-mono">
        #{String(pokemon.id).padStart(3, "0")}
      </span>

      <div className={cn("relative flex items-center justify-center mb-2", sizes.imageBox)}>
        {collected ? (
          <Image
            src={pokemon.image}
            alt={pokemon.name}
            width={sizes.image}
            height={sizes.image}
            loading="lazy"
            className="object-contain drop-shadow-lg group-hover:scale-110 transition-transform duration-300"
          />
        ) : (
          <div
            className={cn(
              "pokemon-missing-slot flex flex-col items-center justify-center gap-1 w-full max-w-[85%] aspect-square"
            )}
            aria-hidden
          >
            <span className="text-2xl font-black text-white/10 select-none">?</span>
            <Lock className={cn("text-white/25", sizes.lock)} />
          </div>
        )}
      </div>

      <div className="text-center space-y-1.5">
        <p className={cn("font-semibold truncate", sizes.text)}>
          {collected ? pokemon.name : "???"}
        </p>
        {collected && <RarityBadge rarity={pokemon.rarity} size="sm" />}
      </div>

      {collected && pokemon.rarity === "legendary" && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400/10 to-transparent animate-shimmer pointer-events-none" />
      )}
    </div>
  );
}
