"use client";

import Image from "next/image";
import { Sparkles } from "lucide-react";
import { RarityBadge } from "@/components/ui/RarityBadge";
import { RARITY_CONFIG } from "@/data/rarity";
import type { Pokemon } from "@/types";
import { cn } from "@/lib/utils";

interface EggLootCardProps {
  pokemon?: Pokemon;
  variant?: "normal" | "shiny";
}

export function EggLootCard({ pokemon, variant = "normal" }: EggLootCardProps) {
  const isShiny = variant === "shiny";
  const meta = pokemon ? RARITY_CONFIG[pokemon.rarity] : null;

  return (
    <div
      className={cn(
        "group glass-card relative overflow-hidden transition-all duration-300",
        "hover:scale-[1.04] hover:-translate-y-0.5",
        isShiny ? "border-amber-400/35" : meta && `rarity-glow-${pokemon!.rarity}`
      )}
      style={
        isShiny
          ? { boxShadow: "0 0 24px rgba(251,191,36,0.25)" }
          : meta
            ? { borderColor: `${meta.color}35` }
            : undefined
      }
    >
      {!isShiny && meta && (
        <div
          className={cn("absolute inset-0 opacity-15 bg-gradient-to-t", meta.bgGradient)}
        />
      )}

      {pokemon && (
        <span className="absolute top-2 left-2 text-[9px] text-white/35 font-mono z-10">
          #{String(pokemon.id).padStart(3, "0")}
        </span>
      )}

      <div
        className={cn(
          "relative flex items-center justify-center p-3 pt-5",
          isShiny ? "h-28 bg-gradient-to-b from-amber-950/40 to-transparent" : "h-32"
        )}
      >
        {isShiny ? (
          <div className="flex flex-col items-center gap-2">
            <Sparkles className="w-10 h-10 text-amber-300" />
            <span className="text-[10px] font-black text-amber-200 uppercase tracking-wide">
              Shiny
            </span>
          </div>
        ) : (
          pokemon && (
            <Image
              src={pokemon.image}
              alt={pokemon.name}
              width={96}
              height={96}
              className="relative z-10 object-contain drop-shadow-xl group-hover:scale-110 transition-transform duration-300"
              unoptimized
            />
          )
        )}
      </div>

      <div className="flex flex-col items-center w-full px-3 pb-3 pt-1 gap-1.5 border-t border-white/5 bg-slate-950/40">
        <p className="text-xs font-bold text-white truncate text-center w-full">
          {isShiny ? "Shiny aleatório" : pokemon?.name}
        </p>
        {isShiny ? (
          <p className="text-[9px] text-amber-300/65 text-center">~0,1% de chance</p>
        ) : (
          pokemon && (
            <div className="flex justify-center w-full">
              <RarityBadge rarity={pokemon.rarity} size="sm" compact />
            </div>
          )
        )}
      </div>

      <div
        className="h-1 w-full"
        style={{ backgroundColor: isShiny ? "#fbbf24" : meta?.color ?? "#64748b" }}
      />
    </div>
  );
}
