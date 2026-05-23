"use client";

import { motion } from "framer-motion";
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
  sm: { card: "p-2", image: 64, text: "text-xs" },
  md: { card: "p-3", image: 96, text: "text-sm" },
  lg: { card: "p-4", image: 128, text: "text-base" },
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
    !collected && "opacity-60",
    onClick && collected && "cursor-pointer"
  );

  const cardStyle = collected
    ? { borderColor: `${config.color}30` }
    : undefined;

  const content = (
    <>
      {duplicateCount > 1 && (
        <div className="absolute top-2 right-2 z-10 flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/60 text-xs text-amber-400">
          <Copy className="w-3 h-3" />
          x{duplicateCount}
        </div>
      )}

      <span className="absolute top-2 left-2 text-xs text-white/40 font-mono">
        #{String(pokemon.id).padStart(3, "0")}
      </span>

      <div className="relative flex items-center justify-center h-28 mb-2">
        {collected ? (
          <Image
            src={pokemon.image}
            alt={pokemon.name}
            width={sizes.image}
            height={sizes.image}
            className="object-contain drop-shadow-lg group-hover:scale-110 transition-transform duration-300"
            unoptimized
          />
        ) : (
          <div className="relative flex items-center justify-center">
            <Image
              src={pokemon.image}
              alt="???"
              width={sizes.image}
              height={sizes.image}
              className="object-contain brightness-0 opacity-20 blur-sm scale-90"
              unoptimized
            />
            <Lock className="absolute w-8 h-8 text-white/30" />
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
    </>
  );

  if (!animate) {
    return (
      <div onClick={onClick} className={cardClassName} style={cardStyle}>
        {content}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={collected ? { scale: 1.03, y: -4 } : {}}
      transition={{ duration: 0.3 }}
      onClick={onClick}
      className={cardClassName}
      style={cardStyle}
    >
      {content}
    </motion.div>
  );
}
