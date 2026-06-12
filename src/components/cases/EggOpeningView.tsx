"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { EggVisual } from "@/components/cases/EggVisual";
import { EggStripCard } from "@/components/cases/EggStripCard";
import { CAPSULE_WINNER_INDEX } from "@/lib/capsule-algorithm";
import { playCapsuleReveal, playSpinTick } from "@/lib/sound-engine";
import type { CapsuleDefinition, CapsuleStripItem } from "@/types/capsule";

const CARD_WIDTH = 128;
const CARD_GAP = 10;
const SLOT_WIDTH = CARD_WIDTH + CARD_GAP;
const PADDING_LEFT = 24;
const DURATION_MS = 6500;
const WINDOW_BUFFER = 8;

function easeOutQuint(t: number): number {
  return 1 - Math.pow(1 - t, 5);
}

function computeWindow(
  cardIndex: number,
  containerWidth: number,
  stripLength: number
): { start: number; end: number } {
  const visibleSlots = Math.ceil(containerWidth / SLOT_WIDTH) + 2;
  const start = Math.max(0, cardIndex - WINDOW_BUFFER);
  const end = Math.min(stripLength, cardIndex + visibleSlots + WINDOW_BUFFER);
  return { start, end: Math.max(end, start + 1) };
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
  const windowRef = useRef({ start: 0, end: 24 });

  onCompleteRef.current = onComplete;

  const [ready, setReady] = useState(false);
  const [windowRange, setWindowRange] = useState({ start: 0, end: 24 });

  const cancelAnim = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const syncWindow = useCallback(
    (cardIndex: number, containerWidth: number) => {
      const next = computeWindow(cardIndex, containerWidth, strip.length);
      if (
        next.start !== windowRef.current.start ||
        next.end !== windowRef.current.end
      ) {
        windowRef.current = next;
        setWindowRange(next);
      }
    },
    [strip.length]
  );

  useEffect(() => {
    completedRef.current = false;
    lastCardRef.current = -1;
    lastTickRef.current = 0;
    const initial = { start: 0, end: Math.min(strip.length, 24) };
    windowRef.current = initial;
    setWindowRange(initial);
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
    syncWindow(0, containerWidth);

    let startTime: number | null = null;

    const finish = () => {
      if (completedRef.current) return;
      completedRef.current = true;
      stripEl.style.transform = `translateX(${targetX}px)`;
      syncWindow(CAPSULE_WINNER_INDEX, containerWidth);
      void playCapsuleReveal(winnerRarity, winnerIsShiny);
      window.setTimeout(() => onCompleteRef.current(), 120);
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

      if (cardIndex !== lastCardRef.current) {
        lastCardRef.current = cardIndex;
        syncWindow(cardIndex, containerWidth);

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
  }, [ready, winnerRarity, winnerIsShiny, cancelAnim, syncWindow]);

  const { start, end } = windowRange;
  const leftSpacer = start * SLOT_WIDTH;
  const rightSpacer = (strip.length - end) * SLOT_WIDTH;
  const visibleStrip = strip.slice(start, end);

  return (
    <div className="space-y-5 page-enter">
      <div className="glass-card p-4 border border-white/10 flex flex-col items-center gap-2">
        <EggVisual egg={egg} size="sm" cracking />
        <p className="text-caption text-white/50 uppercase tracking-widest">Chocando</p>
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
          style={{ paddingLeft: PADDING_LEFT, paddingRight: PADDING_LEFT }}
        >
          {leftSpacer > 0 && (
            <div aria-hidden className="shrink-0" style={{ width: leftSpacer }} />
          )}
          <div className="flex items-center shrink-0" style={{ gap: CARD_GAP }}>
            {visibleStrip.map((item, i) => (
              <EggStripCard
                key={`${item.pokemon.id}-${start + i}`}
                item={item}
              />
            ))}
          </div>
          {rightSpacer > 0 && (
            <div aria-hidden className="shrink-0" style={{ width: rightSpacer }} />
          )}
        </div>
      </div>

      <p className="text-center text-caption text-white/45 animate-pulse">
        O ovo está prestes a abrir...
      </p>
    </div>
  );
}
