"use client";

import { useMemo } from "react";
import Image from "next/image";
import { POKEMON_MAP, TOTAL_POKEMON } from "@/data/pokemon";
import { useGymStore } from "@/stores/gym-store";
import { cn } from "@/lib/utils";
import type { GymId } from "@/types/gym";

interface PokemonHallOfFameProps {
  gymId: GymId;
  themeColor: string;
}

export function PokemonHallOfFame({ gymId, themeColor }: PokemonHallOfFameProps) {
  const hallOfFame = useGymStore((s) => s.hallOfFame);
  const winners = useMemo(() => {
    const ids = hallOfFame
      .filter((e) => e.gymId === gymId)
      .map((e) => e.pokemonId);
    return [...new Set(ids)];
  }, [hallOfFame, gymId]);

  if (winners.length === 0) {
    return (
      <p className="text-[10px] text-white/30 text-center py-3">
        Nenhum campeão ainda. Vença o líder para registrar!
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-[10px] text-white/50 font-semibold">
        Pokémons campeões ({winners.length}/{TOTAL_POKEMON})
      </p>
      <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
        {winners.map((id) => {
          const p = POKEMON_MAP[id];
          if (!p) return null;
          return (
            <div
              key={id}
              title={p.name}
              className={cn(
                "w-10 h-10 rounded-lg border p-0.5 relative",
                "ring-1 ring-offset-1 ring-offset-transparent"
              )}
              style={{
                borderColor: `${themeColor}60`,
                boxShadow: `0 0 10px ${themeColor}30`,
                ringColor: themeColor,
              }}
            >
              <Image
                src={p.image}
                alt={p.name}
                width={36}
                height={36}
                className="object-contain w-full h-full"
                unoptimized
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
