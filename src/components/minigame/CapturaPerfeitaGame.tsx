"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Coins, Sparkles, Target } from "lucide-react";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { PokeballIcon } from "@/components/ui/PokeballIcon";
import { RarityBadge } from "@/components/ui/RarityBadge";
import {
  calcStreakReward,
  evaluateCaptureHit,
  getCaptureConfig,
  pickWildPokemon,
  rollZoneCenter,
  type CaptureHitQuality,
} from "@/lib/capture-minigame-engine";
import {
  playCaptureHit,
  playCaptureMiss,
  playCapturePerfect,
  playCaptureThrow,
} from "@/lib/sound-engine";
import { getEconomyBonuses, useEconomyStore } from "@/stores/economy-store";
import type { Pokemon } from "@/types";
import { isLocalAsset } from "@/lib/image-utils";
import { cn } from "@/lib/utils";

export interface CaptureGameResult {
  captured: boolean;
  streak: number;
  caughtPokemon: Pokemon[];
  goodHits: number;
  perfectHits: number;
  totalShakes: number;
  coins: number;
  accountXp: number;
  bonusPokemonXp: number;
  pokemon: Pokemon;
  endedOnMiss: boolean;
}

interface CapturaPerfeitaGameProps {
  onComplete: (result: CaptureGameResult) => void;
  onReady?: (restart: () => void) => void;
}

type Phase = "idle" | "playing" | "animating" | "done";

type BallAnim = "none" | "hit" | "miss";

export function CapturaPerfeitaGame({ onComplete, onReady }: CapturaPerfeitaGameProps) {
  const team = useEconomyStore((s) => s.team);
  const bonuses = getEconomyBonuses(team);

  const [phase, setPhase] = useState<Phase>("idle");
  const [wild, setWild] = useState<Pokemon | null>(null);
  const [caught, setCaught] = useState<Pokemon[]>([]);
  const [goodHits, setGoodHits] = useState(0);
  const [perfectHits, setPerfectHits] = useState(0);
  const [zoneCenter, setZoneCenter] = useState(50);
  const [lastQuality, setLastQuality] = useState<CaptureHitQuality | null>(null);
  const [ballAnim, setBallAnim] = useState<BallAnim>("none");
  const [pokemonKey, setPokemonKey] = useState(0);

  const cursorRef = useRef(50);
  const cursorThumbRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const endedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  const caughtRef = useRef<Pokemon[]>([]);
  const goodRef = useRef(0);
  const perfectRef = useRef(0);

  onCompleteRef.current = onComplete;
  caughtRef.current = caught;
  goodRef.current = goodHits;
  perfectRef.current = perfectHits;

  const config = wild ? getCaptureConfig(wild.rarity) : null;

  const setCursorPosition = useCallback((pos: number) => {
    cursorRef.current = pos;
    const el = cursorThumbRef.current;
    if (el) el.style.left = `calc(${pos}% - 3px)`;
  }, []);

  const spawnNext = useCallback(() => {
    const pokemon = pickWildPokemon();
    setWild(pokemon);
    setZoneCenter(rollZoneCenter());
    setCursorPosition(50);
    setBallAnim("none");
    setLastQuality(null);
    setPokemonKey((k) => k + 1);
    setPhase("playing");
  }, [setCursorPosition]);

  const finishGame = useCallback(
    (missed: boolean, lastPokemon: Pokemon) => {
      if (endedRef.current) return;
      endedRef.current = true;

      const streak = caughtRef.current;
      const { coins, accountXp, bonusPokemonXp } = calcStreakReward(
        streak,
        perfectRef.current,
        bonuses.coinBonus
      );

      setPhase("done");

      onCompleteRef.current({
        captured: streak.length > 0,
        streak: streak.length,
        caughtPokemon: [...streak],
        goodHits: goodRef.current,
        perfectHits: perfectRef.current,
        totalShakes: streak.length,
        coins,
        accountXp,
        bonusPokemonXp,
        pokemon: lastPokemon,
        endedOnMiss: missed,
      });
    },
    [bonuses.coinBonus]
  );

  const startGame = useCallback(() => {
    endedRef.current = false;
    setCaught([]);
    caughtRef.current = [];
    setGoodHits(0);
    setPerfectHits(0);
    goodRef.current = 0;
    perfectRef.current = 0;
    spawnNext();
  }, [spawnNext]);

  useEffect(() => {
    onReady?.(startGame);
  }, [onReady, startGame]);

  useEffect(() => {
    if (phase !== "playing" || !wild || !config) return;

    const speed = config.speed;
    const start = performance.now();

    const tick = (now: number) => {
      const elapsed = (now - start) / 1000;
      const pos = 50 + 50 * Math.sin(elapsed * speed * 2.8);
      setCursorPosition(pos);
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [phase, wild, config, pokemonKey, setCursorPosition]);

  const handleTap = () => {
    if (phase !== "playing" || !wild || !config || endedRef.current) return;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    void playCaptureThrow();

    const quality = evaluateCaptureHit(cursorRef.current, zoneCenter, config.zonePct);
    setLastQuality(quality);
    setPhase("animating");

    if (quality === "miss") {
      setBallAnim("miss");
      void playCaptureMiss();
      setTimeout(() => finishGame(true, wild), 650);
      return;
    }

    if (quality === "perfect") {
      void playCapturePerfect();
    } else {
      void playCaptureHit();
    }

    setBallAnim("hit");

    const nextGood = goodRef.current + 1;
    const nextPerfect = perfectRef.current + (quality === "perfect" ? 1 : 0);
    goodRef.current = nextGood;
    perfectRef.current = nextPerfect;
    setGoodHits(nextGood);
    setPerfectHits(nextPerfect);

    const nextCaught = [...caughtRef.current, wild];
    caughtRef.current = nextCaught;
    setCaught(nextCaught);

    setTimeout(() => spawnNext(), 700);
  };

  if (phase === "idle") {
    return (
      <div className="glass-card p-8 text-center space-y-4">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
          <Target className="w-7 h-7 text-emerald-400" />
        </div>
        <h3 className="text-xl font-bold">Captura Perfeita</h3>
        <p className="text-white/50 text-sm leading-relaxed">
          Acerte o timing e capture Pokémon em sequência. Centro dourado ou zona verde =
          1 moeda cada. Errou? A sequência termina.
        </p>
        <AnimatedButton variant="primary" size="lg" onClick={startGame} className="w-full max-w-xs mx-auto">
          ENCONTRAR POKÉMON!
        </AnimatedButton>
      </div>
    );
  }

  if (!wild || !config) return null;

  const zoneHalf = config.zonePct / 2;
  const perfectHalf = zoneHalf * 0.38;
  const streak = caught.length;

  return (
    <div className="space-y-4">
      <div className="glass-card p-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] text-white/40 uppercase tracking-wider">Sequência</p>
          <p className="text-2xl font-black text-emerald-400">{streak}</p>
        </div>
        <div className="text-center flex-1 min-w-0">
          <p className="font-bold truncate">{wild.name}</p>
          <RarityBadge rarity={wild.rarity} size="sm" />
        </div>
        <div className="text-right text-xs text-white/50">
          <p className="text-emerald-400 flex items-center justify-end gap-0.5">
            +1 <Coins className="w-3 h-3" /> na zona verde
          </p>
          <p className="text-amber-400 flex items-center justify-end gap-0.5">
            +1 <Coins className="w-3 h-3" /> no perfeito
          </p>
          {perfectHits > 0 && (
            <p className="text-amber-300">{perfectHits} perfeito{perfectHits > 1 ? "s" : ""}</p>
          )}
        </div>
      </div>

      {streak > 0 && (
        <div className="flex gap-1 justify-center flex-wrap px-2">
          {caught.slice(-6).map((p, i) => (
            <Image
              key={`catch-${caught.length - 6 + i}-${p.id}`}
              src={p.image}
              alt={p.name}
              width={32}
              height={32}
              className="object-contain opacity-80"
              unoptimized={!isLocalAsset(p.image)}
            />
          ))}
        </div>
      )}

      <div className="glass-card p-6 relative overflow-hidden min-h-[260px] flex flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={pokemonKey}
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{
              scale: ballAnim === "hit" ? 0 : 1,
              opacity: ballAnim === "hit" ? 0 : 1,
              x: ballAnim === "miss" ? [0, 30, 80] : 0,
            }}
            transition={{ duration: ballAnim === "hit" ? 0.45 : 0.35 }}
            className="relative flex flex-col items-center"
          >
            <Image
              src={wild.image}
              alt={wild.name}
              width={120}
              height={120}
              className="object-contain drop-shadow-lg"
              priority
            />
          </motion.div>
        </AnimatePresence>

        {ballAnim !== "none" && (
          <motion.div
            initial={{ y: -40, x: "-50%", opacity: 1, scale: 1 }}
            animate={
              ballAnim === "hit"
                ? { y: 20, opacity: 0, scale: 0.5 }
                : { y: 10, x: "calc(-50% + 90px)", opacity: 0, rotate: 45 }
            }
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="absolute left-1/2 top-1/2 pointer-events-none"
          >
            <PokeballIcon size={40} />
          </motion.div>
        )}

        {phase === "playing" && ballAnim === "none" && (
          <p className="text-xs text-cyan-300/80 animate-pulse mt-3">Toque na zona verde!</p>
        )}

        {lastQuality && phase === "animating" && (
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "text-sm font-bold mt-2",
              lastQuality === "perfect" && "text-amber-400",
              lastQuality === "good" && "text-emerald-400",
              lastQuality === "miss" && "text-red-400"
            )}
          >
            {lastQuality === "perfect" && (
              <span className="inline-flex items-center gap-1">
                Perfeito! +2 moedas
                <Sparkles className="w-3.5 h-3.5" />
              </span>
            )}
            {lastQuality === "good" && "Capturado!"}
            {lastQuality === "miss" && "Escapou..."}
          </motion.p>
        )}
      </div>

      {(phase === "playing" || phase === "animating") && (
        <button
          type="button"
          onClick={handleTap}
          disabled={phase === "animating"}
          className={cn(
            "w-full glass-card p-4 touch-none select-none transition-opacity",
            phase === "animating" && "opacity-60 pointer-events-none"
          )}
        >
          <div className="relative h-12 rounded-2xl bg-slate-950/80 border-2 border-white/5 overflow-hidden shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]">
            {/* Brilho de fundo da barra */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse" />
            
            {/* Zona Verde (Captura) */}
            <div
              className="absolute top-0 bottom-0 bg-emerald-500/30 border-x-2 border-emerald-400/50 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
              style={{
                left: `${zoneCenter - zoneHalf}%`,
                width: `${config.zonePct}%`,
              }}
            >
              <div className="absolute inset-0 bg-emerald-400/10 animate-pulse" />
            </div>

            {/* Zona Dourada (Perfeito) */}
            <div
              className="absolute top-1 bottom-1 bg-amber-400/40 rounded-lg border border-amber-300/60 shadow-[0_0_20px_rgba(251,191,36,0.4)]"
              style={{
                left: `${zoneCenter - perfectHalf}%`,
                width: `${perfectHalf * 2}%`,
              }}
            >
               <div className="absolute inset-0 bg-gradient-to-t from-white/10 to-transparent" />
            </div>

            {/* Cursor (Thumb) */}
            <div
              ref={cursorThumbRef}
              className="absolute top-0 bottom-0 w-1.5 z-20"
              style={{ left: "calc(50% - 3px)" }}
            >
              <div className="h-full w-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.8)] relative">
                <div className="absolute top-[-4px] left-[-2px] right-[-2px] h-2 bg-white rounded-full shadow-[0_0_10px_white]" />
                <div className="absolute bottom-[-4px] left-[-2px] right-[-2px] h-2 bg-white rounded-full shadow-[0_0_10px_white]" />
              </div>
            </div>
          </div>
        </button>
      )}
    </div>
  );
}
