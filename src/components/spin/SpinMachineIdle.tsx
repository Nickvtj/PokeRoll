"use client";

import { useMemo } from "react";
import { POKEMON_LIST } from "@/data/pokemon";
import { cn } from "@/lib/utils";

const IDLE_IDS = [25, 6, 150, 133, 94, 131, 1, 4, 7, 144];

const IDLE_LAYOUT = {
  1: { imgSize: 88, duration: "8s", badge: "px-4 py-2 text-xs" },
  2: { imgSize: 72, duration: "7s", badge: "px-3.5 py-1.5 text-[11px]" },
  3: { imgSize: 60, duration: "6.5s", badge: "px-3 py-1 text-[10px]" },
} as const;

interface SpinMachineIdleProps {
  reelLayout?: 1 | 2 | 3;
}

export function SpinMachineIdle({ reelLayout = 1 }: SpinMachineIdleProps) {
  const layout = IDLE_LAYOUT[reelLayout];

  const track = useMemo(() => {
    const picks = IDLE_IDS.map((id) => POKEMON_LIST.find((p) => p.id === id)!).filter(Boolean);
    return [...picks, ...picks];
  }, []);

  return (
    <div
      className={cn(
        "relative mx-auto w-full rounded-2xl overflow-hidden border border-indigo-500/20 aspect-square",
        "bg-gradient-to-b from-indigo-950/40 via-slate-900/60 to-indigo-950/40"
      )}
    >
      <div
        className="absolute inset-0 z-10 pointer-events-none opacity-10"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.35) 2px, rgba(0,0,0,0.35) 4px)",
        }}
      />

      <div className="absolute inset-x-0 top-0 bottom-0 overflow-hidden">
        <div
          className="slot-idle-track flex flex-col items-center gap-3 py-2"
          style={{ animationDuration: layout.duration }}
        >
          {track.map((pokemon, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={`${pokemon.id}-${i}`}
              src={pokemon.image}
              alt=""
              width={layout.imgSize}
              height={layout.imgSize}
              className="pokemon-silhouette object-contain shrink-0"
              draggable={false}
            />
          ))}
        </div>
      </div>

      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center pointer-events-none">
        <div className={cn("rounded-full border border-white/10 bg-black/40", layout.badge)}>
          <p className="text-white/40 font-medium">Pronto para girar</p>
        </div>
      </div>

      <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-slate-900/90 to-transparent z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-slate-900/90 to-transparent z-10 pointer-events-none" />
    </div>
  );
}
