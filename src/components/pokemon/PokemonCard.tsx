"use client";

import { memo } from "react";
import Image from "next/image";
import { Lock, Sparkles } from "lucide-react";
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
  sm: { card: "p-2", image: 84, imageBox: "h-[7.5rem]", text: "text-xs", lock: "w-6 h-6" },
  md: { card: "p-3", image: 96, imageBox: "h-28", text: "text-sm", lock: "w-7 h-7" },
  lg: { card: "p-4", image: 128, imageBox: "h-36", text: "text-base", lock: "w-9 h-9" },
};

export const PokemonCard = memo(function PokemonCard({
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
    !collected && "opacity-80",
    onClick && collected && "cursor-pointer",
    animate && collected && "transition-transform duration-300 hover:scale-[1.03] hover:-translate-y-1"
  );

  const cardStyle = collected ? { borderColor: `${config.color}30` } : undefined;

  return (
    <div onClick={onClick} className={cardClassName} style={cardStyle}>
      {duplicateCount > 1 && (
        <div className="absolute top-2 right-2 z-10 flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/60 text-xs text-amber-400">
          x{duplicateCount}
        </div>
      )}

      <span className="absolute top-2 left-2 text-xs text-white/40 font-mono z-10">
        #{String(pokemon.id).padStart(3, "0")}
      </span>

      {collected ? (
        <>
          <div className={cn("relative flex items-center justify-center mb-2", sizes.imageBox)}>
            <Image
              src={pokemon.image}
              alt={pokemon.name}
              width={sizes.image}
              height={sizes.image}
              loading="lazy"
              className="object-contain drop-shadow-lg group-hover:scale-110 transition-transform duration-300"
            />
          </div>
          <div className="text-center space-y-1.5">
            <p className={cn("font-semibold truncate", sizes.text)}>{pokemon.name}</p>
            <RarityBadge rarity={pokemon.rarity} size="sm" />
          </div>
        </>
      ) : (
        <div
          className={cn(
            "relative flex flex-col items-center justify-center gap-2.5 text-center",
            sizes.imageBox,
            "mb-1"
          )}
          aria-hidden
        >
          <div className="absolute inset-0 rounded-full bg-gradient-to-b from-indigo-500/10 via-transparent to-purple-500/10 blur-xl scale-125" />
          <div className="relative w-16 h-16 rounded-full bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
            <Lock className={cn("text-white/20", sizes.lock)} />
          </div>
          <Sparkles className="w-3 h-3 text-white/15 absolute top-2 right-4" />
          <p className="relative text-[10px] text-white/25 uppercase tracking-widest font-medium">
            Não encontrado
          </p>
        </div>
      )}

      {collected && pokemon.rarity === "legendary" && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400/10 to-transparent animate-shimmer pointer-events-none" />
      )}
    </div>
  );
});
