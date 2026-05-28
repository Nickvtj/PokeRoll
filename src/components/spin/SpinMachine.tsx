"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { RARITY_CONFIG } from "@/data/rarity";
import { StickerBadge } from "@/components/ui/StickerBadge";
import { SpinMachineIdle } from "@/components/spin/SpinMachineIdle";
import type { Pokemon, SpinResult } from "@/types";
import { cn } from "@/lib/utils";

interface SpinMachineProps {
  sequence: Pokemon[];
  isSpinning: boolean;
  result?: SpinResult | null;
  onSpinComplete: () => void;
  onReelTick?: () => void;
  compact?: boolean;
  reelIndex?: number;
}

export function SpinMachine({
  sequence,
  isSpinning,
  result,
  onSpinComplete,
  onReelTick,
  compact = false,
  reelIndex = 0,
}: SpinMachineProps) {
  const [displayPokemon, setDisplayPokemon] = useState<Pokemon | null>(null);
  const [localSpinning, setLocalSpinning] = useState(false);
  const rafRef = useRef<number | null>(null);
  const startTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasCompletedRef = useRef(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const dotsRef = useRef<(HTMLDivElement | null)[]>([]);
  const spinningRef = useRef(false);
  const onReelTickRef = useRef(onReelTick);
  const onSpinCompleteRef = useRef(onSpinComplete);

  onReelTickRef.current = onReelTick;
  onSpinCompleteRef.current = onSpinComplete;

  const cancelSpinLoop = useCallback(() => {
    if (startTimerRef.current) {
      clearTimeout(startTimerRef.current);
      startTimerRef.current = null;
    }
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const applyPokemonToDom = useCallback((pokemon: Pokemon, playTick = false) => {
    if (imgRef.current) {
      imgRef.current.src = pokemon.image;
      imgRef.current.alt = pokemon.name;
    }
    const config = RARITY_CONFIG[pokemon.rarity];
    if (frameRef.current) {
      frameRef.current.style.borderColor = `${config.color}60`;
      frameRef.current.style.boxShadow = spinningRef.current
        ? `0 0 40px ${config.glowColor}, inset 0 0 30px rgba(0,0,0,0.5)`
        : `0 0 20px ${config.glowColor}`;
    }
    (["common", "uncommon", "rare", "epic", "legendary"] as const).forEach((r, i) => {
      const dot = dotsRef.current[i];
      if (!dot) return;
      const active = pokemon.rarity === r;
      dot.style.opacity = active ? "1" : "0.3";
      dot.style.transform = active ? "scale(1.3)" : "scale(1)";
      dot.style.boxShadow = active ? `0 0 8px ${RARITY_CONFIG[r].glowColor}` : "none";
    });
    if (playTick) onReelTickRef.current?.();
  }, []);

  useEffect(() => {
    if (!isSpinning || sequence.length === 0) {
      if (!isSpinning) setLocalSpinning(false);
      return;
    }

    hasCompletedRef.current = false;
    cancelSpinLoop();
    spinningRef.current = true;
    setLocalSpinning(true);

    const finalPokemon = sequence[sequence.length - 1];
    const totalSteps = sequence.length;
    let index = 0;
    let delay = 80 + reelIndex * 30;
    let accumulated = 0;
    let lastTime = 0;

    applyPokemonToDom(sequence[0]);

    const finish = () => {
      if (hasCompletedRef.current) return;
      hasCompletedRef.current = true;
      spinningRef.current = false;
      setLocalSpinning(false);
      setDisplayPokemon(finalPokemon);
      onSpinCompleteRef.current();
    };

    const step = (time: number) => {
      if (lastTime === 0) lastTime = time;
      accumulated += time - lastTime;
      lastTime = time;

      while (accumulated >= delay && index < totalSteps) {
        applyPokemonToDom(sequence[index], index > 0);
        index++;
        accumulated -= delay;
        delay = Math.min(delay + 15, 350);
      }

      if (index >= totalSteps) {
        finish();
        return;
      }

      rafRef.current = requestAnimationFrame(step);
    };

    startTimerRef.current = setTimeout(() => {
      startTimerRef.current = null;
      lastTime = 0;
      accumulated = 0;
      rafRef.current = requestAnimationFrame(step);
    }, 100 + reelIndex * 150);

    return cancelSpinLoop;
  }, [isSpinning, sequence, reelIndex, cancelSpinLoop, applyPokemonToDom]);

  const showResult = !localSpinning && !isSpinning && result;
  const pokemon = showResult ? result.pokemon : (displayPokemon ?? sequence[0]);

  if (!pokemon) {
    return (
      <div className={cn("relative mx-auto", compact ? "w-full" : "w-full max-w-md")}>
        <div className="glass-card p-1 rounded-3xl">
          <div className={cn("slot-machine-bg rounded-[22px] relative overflow-hidden", compact ? "p-3" : "p-6")}>
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-60" />
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-60" />
            <div className={cn("relative mx-auto", compact ? "max-w-[140px]" : "max-w-[280px]")}>
              <SpinMachineIdle compact={compact} />
            </div>
            <div className={cn("flex justify-center gap-1.5", compact ? "mt-2" : "mt-4")}>
              {(["common", "uncommon", "rare", "epic", "legendary"] as const).map((r) => (
                <div
                  key={r}
                  className={cn("rounded-full opacity-20", compact ? "w-2 h-2" : "w-3 h-3")}
                  style={{ backgroundColor: RARITY_CONFIG[r].color }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const config = RARITY_CONFIG[pokemon.rarity];
  const imgSize = compact ? 90 : 180;

  return (
    <div className={cn("relative mx-auto", compact ? "w-full" : "w-full max-w-md")}>
      <div className="glass-card p-1 rounded-3xl">
        <div className={cn("slot-machine-bg rounded-[22px] relative overflow-hidden", compact ? "p-3" : "p-6")}>
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-60" />
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-60" />

          <div className={cn("relative mx-auto", compact ? "max-w-[140px]" : "max-w-[280px]")}>
            {showResult && (
              <div className="absolute -top-2 -right-2 z-30 flex flex-col items-end gap-1">
                {result.isNewShinyUnlock && (
                  <span className="px-1.5 py-0.5 rounded-md bg-amber-500/30 border border-amber-400/40 text-[8px] font-black text-amber-200 uppercase">
                    ✨ Shiny
                  </span>
                )}
                <StickerBadge variant={result.isNew ? "new" : "duplicate"} size="sm" />
              </div>
            )}

            <div
              ref={frameRef}
              className={cn(
                "relative mx-auto w-full rounded-2xl overflow-hidden border-2 transition-colors duration-300 aspect-square"
              )}
              style={{
                borderColor: `${config.color}60`,
                boxShadow: localSpinning
                  ? `0 0 40px ${config.glowColor}, inset 0 0 30px rgba(0,0,0,0.5)`
                  : `0 0 20px ${config.glowColor}`,
              }}
            >
              <div
                className="absolute inset-0 z-10 pointer-events-none opacity-10"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)",
                }}
              />

              <div
                className="absolute inset-0 flex flex-col items-center justify-center p-2"
                style={{
                  background: `radial-gradient(circle at center, ${config.color}15 0%, transparent 70%)`,
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  ref={imgRef}
                  src={pokemon.image}
                  alt={pokemon.name}
                  width={imgSize}
                  height={imgSize}
                  className="object-contain drop-shadow-2xl"
                  decoding="async"
                />
                {!localSpinning && (
                  <p
                    className={cn(
                      "mt-1 font-bold truncate max-w-full px-1",
                      compact ? "text-xs" : "text-lg"
                    )}
                    style={{ color: config.color }}
                  >
                    {pokemon.name}
                  </p>
                )}
              </div>

              {localSpinning && (
                <div
                  className="absolute inset-0 z-20 pointer-events-none slot-shimmer"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)",
                    width: "50%",
                  }}
                />
              )}
            </div>
          </div>

          <div className={cn("flex justify-center gap-1.5", compact ? "mt-2" : "mt-4")}>
            {(["common", "uncommon", "rare", "epic", "legendary"] as const).map((r, i) => (
              <div
                key={r}
                ref={(el) => {
                  dotsRef.current[i] = el;
                }}
                className={cn("rounded-full transition-all duration-300", compact ? "w-2 h-2" : "w-3 h-3")}
                style={{
                  backgroundColor: RARITY_CONFIG[r].color,
                  opacity: pokemon.rarity === r ? 1 : 0.3,
                  transform: pokemon.rarity === r ? "scale(1.3)" : "scale(1)",
                  boxShadow:
                    pokemon.rarity === r ? `0 0 8px ${RARITY_CONFIG[r].glowColor}` : "none",
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
