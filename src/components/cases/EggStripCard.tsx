"use client";

import { memo } from "react";
import Image from "next/image";
import { Sparkles } from "lucide-react";
import { RARITY_CONFIG } from "@/data/rarity";
import { isLocalAsset } from "@/lib/image-utils";
import { getSpinResultImage } from "@/lib/pokemon-display";
import type { CapsuleStripItem } from "@/types/capsule";
import { cn } from "@/lib/utils";

interface EggStripCardProps {
  item: CapsuleStripItem;
}

export const EggStripCard = memo(function EggStripCard({ item }: EggStripCardProps) {
  const meta = RARITY_CONFIG[item.pokemon.rarity];
  const isGold = item.isGoldSlot;
  const imageSrc = item.isShiny
    ? getSpinResultImage(item.pokemon.id, true)
    : item.pokemon.image;

  return (
    <div
      className={cn(
        "relative shrink-0 w-32 h-[10.5rem] rounded-xl border-2 overflow-hidden",
        isGold ? "bg-gradient-to-b from-amber-950/80 to-slate-950" : "bg-slate-950/90"
      )}
      style={{
        borderColor: isGold ? "rgba(251,191,36,0.65)" : `${meta.color}50`,
        boxShadow: isGold
          ? "0 0 20px rgba(251,191,36,0.35)"
          : `0 0 14px ${meta.glowColor}`,
      }}
    >
      {!isGold && (
        <div className={cn("absolute inset-0 opacity-20 bg-gradient-to-t", meta.bgGradient)} />
      )}
      {isGold && (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(251,191,36,0.2),transparent_70%)]" />
      )}

      {(item.isShiny || isGold) && (
        <Sparkles className="absolute top-1.5 right-1.5 w-3.5 h-3.5 text-amber-300 z-10" />
      )}

      <div className="relative flex flex-col items-center justify-center h-[calc(100%-4px)] px-2 py-3">
        <Image
          src={imageSrc}
          alt={item.pokemon.name}
          width={80}
          height={80}
          className={cn(
            "object-contain drop-shadow-lg",
            item.isShiny && "drop-shadow-[0_0_12px_rgba(251,191,36,0.45)]",
            isGold && !item.isShiny && "opacity-75 saturate-125"
          )}
          unoptimized={!isLocalAsset(imageSrc)}
        />
        <p
          className={cn(
            "text-[9px] font-bold truncate w-full text-center mt-1.5",
            isGold ? "text-amber-200/90" : "text-white/75"
          )}
        >
          {isGold && !item.isShiny ? "★ Shiny?" : item.pokemon.name}
        </p>
      </div>

      <div
        className="absolute bottom-0 left-0 right-0 h-1"
        style={{ backgroundColor: isGold ? "#fbbf24" : meta.color }}
      />
    </div>
  );
});
