"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { EggVisual } from "@/components/cases/EggVisual";
import { EggStripCard } from "@/components/cases/EggStripCard";
import { CAPSULE_WINNER_INDEX } from "@/lib/capsule-algorithm";
import { playCapsuleReveal, playSpinTick } from "@/lib/sound-engine";
import type { CapsuleDefinition, CapsuleStripItem } from "@/types/capsule";

const CARD_WIDTH = 128;
const CARD_GAP = 10;
const SLOT_WIDTH = CARD_WIDTH + CARD_GAP;
const PADDING_LEFT = 24;
const DURATION_MS = 10000;

function easeOutQuint(t: number): number {
  return 1 - Math.pow(1 - t, 5);
}

interface EggOpeningViewProps {
  egg: CapsuleDefinition;
  strip: CapsuleStripItem[];
  winnerRarity: string;
  winnerIsShiny: boolean;
  onComplete: () => void;
}

export function EggOpeningView({
  egg,
  strip,
  winnerRarity,
  winnerIsShiny,
  onComplete,
}: EggOpeningViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const completedRef = useRef(false);
  const lastCardRef = useRef(-1);
  const lastTickRef = useRef(0);
  const onCompleteRef = useRef(onComplete);

  onCompleteRef.current = onComplete;

  const [ready, setReady] = useState(false);

  const cancelAnim = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  useEffect(() => {
    completedRef.current = false;
    lastCardRef.current = -1;
    lastTickRef.current = 0;
    setReady(false);

    const startTimer = window.setTimeout(() => setReady(true), 80);
    return () => {
      window.clearTimeout(startTimer);
      cancelAnim();
    };
  }, [strip, cancelAnim]);

  useEffect(() => {
    if (!ready || !containerRef.current || !stripRef.current) return;

    const container = containerRef.current;
    const stripEl = stripRef.current;
    const containerWidth = container.offsetWidth;
    const center = containerWidth / 2;

    const winnerLeft = PADDING_LEFT + CAPSULE_WINNER_INDEX * SLOT_WIDTH;
    const winnerCenter = winnerLeft + CARD_WIDTH / 2;
    const targetX = center - winnerCenter;

    const startCenter = PADDING_LEFT + CARD_WIDTH / 2;
    const startX = center - startCenter;

    stripEl.style.transform = `translateX(${startX}px)`;

    let startTime: number | null = null;

    const finish = () => {
      if (completedRef.current) return;
      completedRef.current = true;
      stripEl.style.transform = `translateX(${targetX}px)`;
      void playCapsuleReveal(winnerRarity, winnerIsShiny);
      window.setTimeout(() => onCompleteRef.current(), 500);
    };

    const tick = (time: number) => {
      if (startTime === null) startTime = time;
      const elapsed = time - startTime;
      const progress = Math.min(1, elapsed / DURATION_MS);
      const eased = easeOutQuint(progress);
      const x = startX + (targetX - startX) * eased;

      stripEl.style.transform = `translateX(${x}px)`;

      const scrolled = startX - x;
      const cardIndex = Math.floor(Math.max(0, scrolled) / SLOT_WIDTH);

      if (cardIndex !== lastCardRef.current && cardIndex > 0) {
        lastCardRef.current = cardIndex;
        const now = Date.now();
        if (now - lastTickRef.current > 45 + progress * progress * 220) {
          lastTickRef.current = now;
          const pitch = 340 - progress * 160 + (cardIndex % 3) * 22;
          void playSpinTick(pitch);
        }
      }

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        finish();
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return cancelAnim;
  }, [ready, winnerRarity, winnerIsShiny, cancelAnim]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-5"
    >
      <div className="glass-card p-4 border border-white/10 flex flex-col items-center gap-2">
        <EggVisual egg={egg} size="sm" cracking />
        <p className="text-[10px] text-white/40 uppercase tracking-widest">Chocando</p>
        <h2 className="text-lg font-black text-white">{egg.name}</h2>
      </div>

      <div
        ref={containerRef}
        className="relative w-full overflow-hidden rounded-2xl border border-white/10 bg-slate-950/70 py-5"
      >
        <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-slate-950 to-transparent z-20 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-slate-950 to-transparent z-20 pointer-events-none" />

        <div className="absolute left-1/2 top-0 bottom-0 w-0.5 -translate-x-1/2 bg-gradient-to-b from-transparent via-amber-300 to-transparent z-30 pointer-events-none" />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[8.25rem] h-[10rem] border-2 border-amber-400/50 rounded-xl z-10 pointer-events-none shadow-[0_0_35px_rgba(251,191,36,0.18)]" />

        <div
          ref={stripRef}
          className="flex items-center will-change-transform"
          style={{ gap: CARD_GAP, paddingLeft: PADDING_LEFT, paddingRight: PADDING_LEFT }}
        >
          {strip.map((item, i) => (
            <EggStripCard key={`${item.pokemon.id}-${i}`} item={item} />
          ))}
        </div>
      </div>

      <p className="text-center text-[10px] text-white/30 animate-pulse">
        O ovo está prestes a abrir...
      </p>
    </motion.div>
  );
}
