"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { EggLootCard } from "@/components/cases/EggLootCard";
import { RARITY_CONFIG } from "@/data/rarity";
import type { Pokemon, Rarity } from "@/types";
import { cn } from "@/lib/utils";

interface EggPreviewRaritySectionProps {
  rarity: Rarity;
  mons: Pokemon[];
  dropRate: number;
  collectedIds: Set<number>;
  defaultOpen?: boolean;
}

export function EggPreviewRaritySection({
  rarity,
  mons,
  dropRate,
  collectedIds,
  defaultOpen = false,
}: EggPreviewRaritySectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const meta = RARITY_CONFIG[rarity];

  return (
    <section
      className="glass-card border border-white/8 overflow-hidden"
      style={{ borderColor: `${meta.color}18` }}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-3 p-4 sm:p-5 hover:bg-white/[0.02] transition-colors text-left"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className="w-2 h-8 rounded-full shrink-0"
            style={{ backgroundColor: meta.color, boxShadow: `0 0 12px ${meta.glowColor}` }}
          />
          <div className="min-w-0">
            <h3
              className="text-sm font-black uppercase tracking-wide"
              style={{ color: meta.color }}
            >
              {meta.label}
            </h3>
            <p className="text-[10px] text-white/35">
              {dropRate}%, {mons.length} espécies
            </p>
          </div>
        </div>
        <ChevronDown
          className={cn(
            "w-5 h-5 text-white/35 shrink-0 transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>

      {open && (
        <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-0 border-t border-white/5">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 pt-4">
            {mons.map((p) => (
              <EggLootCard
                key={p.id}
                pokemon={p}
                owned={collectedIds.has(p.id)}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
