"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, Coins, Lock } from "lucide-react";
import { EggVisual } from "@/components/cases/EggVisual";
import { EggLootCard } from "@/components/cases/EggLootCard";
import { EggPreviewRaritySection } from "@/components/cases/EggPreviewRaritySection";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { getCapsulePoolPokemon } from "@/data/capsules";
import { getEggCardTheme } from "@/data/egg-styles";
import { RARITY_ORDER } from "@/data/rarity";
import type { CapsuleDefinition } from "@/types/capsule";
import type { Pokemon, Rarity } from "@/types";
import { cn } from "@/lib/utils";

interface EggPreviewViewProps {
  egg: CapsuleDefinition;
  coins: number;
  onOpen: () => void;
}

export function EggPreviewView({ egg, coins, onOpen }: EggPreviewViewProps) {
  const canAfford = coins >= egg.cost;
  const [shinyOpen, setShinyOpen] = useState(false);
  const cardTheme = getEggCardTheme(egg.id);

  const poolByRarity = useMemo(() => {
    const pool = getCapsulePoolPokemon(egg.id);
    const grouped = {} as Record<Rarity, Pokemon[]>;
    for (const r of RARITY_ORDER) grouped[r] = [];
    for (const p of pool) grouped[p.rarity].push(p);
    for (const r of RARITY_ORDER) {
      grouped[r].sort((a, b) => a.id - b.id);
    }
    return grouped;
  }, [egg.id]);

  const activeRarities = RARITY_ORDER.filter(
    (r) => (egg.dropRates[r] ?? 0) > 0 && poolByRarity[r].length > 0
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div
        className="glass-card p-5 sm:p-7 border overflow-hidden relative"
        style={{ borderColor: cardTheme.borderColor }}
      >
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at 20% 0%, ${cardTheme.glow} 0%, transparent 55%)`,
          }}
        />
        <div className="relative flex flex-col sm:flex-row items-center gap-6 sm:gap-10">
          <div className="transition-transform duration-200 ease-out hover:-translate-y-2">
            <EggVisual egg={egg} size="lg" />
          </div>
          <div className="flex-1 text-center sm:text-left space-y-2">
            <h2 className="text-2xl font-black text-white">{egg.name}</h2>
            <p className="text-sm text-white/55 leading-relaxed max-w-lg">{egg.description}</p>
            <p className="text-xs text-white/35">{egg.focus}</p>
          </div>
        </div>

        <div className="relative mt-7 flex justify-center sm:justify-start">
          <AnimatedButton
            variant="primary"
            size="lg"
            disabled={!canAfford}
            className="min-w-[220px]"
            icon={canAfford ? <Coins className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
            onClick={onOpen}
          >
            Chocar ovo · {egg.cost}
          </AnimatedButton>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-white/10" />
          <p className="text-xs font-bold text-white/40 uppercase tracking-widest shrink-0">
            Possíveis nascimentos
          </p>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        <p className="text-[10px] text-white/30 text-center">
          Toque na raridade para expandir ou recolher
        </p>

        {activeRarities.map((rarity) => (
          <EggPreviewRaritySection
            key={rarity}
            rarity={rarity}
            mons={poolByRarity[rarity]}
            dropRate={egg.dropRates[rarity]}
          />
        ))}

        <section className="glass-card border border-amber-400/20 overflow-hidden">
          <button
            type="button"
            onClick={() => setShinyOpen((v) => !v)}
            className="w-full flex items-center justify-between gap-3 p-4 sm:p-5 hover:bg-white/[0.02] transition-colors text-left"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-2 h-8 rounded-full bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.5)] shrink-0" />
              <div className="min-w-0">
                <h3 className="text-sm font-black uppercase tracking-wide text-amber-300">
                  Shiny secreto
                </h3>
                <p className="text-[10px] text-white/35">~0,1% · qualquer espécie do ovo</p>
              </div>
            </div>
            <ChevronDown
              className={cn(
                "w-5 h-5 text-white/35 shrink-0 transition-transform duration-200",
                shinyOpen && "rotate-180"
              )}
            />
          </button>
          {shinyOpen && (
            <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-0 border-t border-white/5">
              <div className="pt-4 max-w-[10rem]">
                <EggLootCard variant="shiny" />
              </div>
            </div>
          )}
        </section>
      </div>
    </motion.div>
  );
}
