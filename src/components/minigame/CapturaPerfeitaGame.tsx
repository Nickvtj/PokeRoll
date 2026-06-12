"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Coins, Sparkles, Target } from "lucide-react";
import { MinigameLobbyCard } from "@/components/minigame/MinigameLobbyCard";
import { PokeballIcon } from "@/components/ui/PokeballIcon";
import { RarityBadge } from "@/components/ui/RarityBadge";
import {
  calcStreakReward,
  evaluateCaptureHit,
  getCaptureConfig,
  getRarityArenaBackground,
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

    setTimeout(() => spawnNext(), 850);
  };

  if (phase === "idle") {
    return (
      <MinigameLobbyCard
        accent="emerald"
        icon={<Target className="w-8 h-8" />}
        title="Captura Perfeita"
        description="Acerte o timing e capture Pokémon em sequência. Zona verde ou centro dourado = 1 moeda por acerto. Errou? A sequência termina."
        buttonLabel="ENCONTRAR POKÉMON!"
        onStart={startGame}
      />
    );
  }

  if (!wild || !config) return null;

  const zoneHalf = config.zonePct / 2;
  const perfectHalf = zoneHalf * 0.38;
  const streak = caught.length;
  const arenaStyle = getRarityArenaBackground(wild.rarity);

  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-2xl border border-emerald-500/20 glass-card p-4">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.12),transparent_55%)] pointer-events-none" />
        <div className="relative flex items-center justify-between gap-3">
          <div className="rounded-xl bg-emerald-500/10 border border-emerald-400/25 px-3 py-2 min-w-[4.5rem]">
            <p className="text-[10px] text-emerald-200/60 uppercase tracking-wider font-bold">
              Sequência
            </p>
            <p className="text-3xl font-black text-emerald-300 tabular-nums leading-none mt-0.5">
              {streak}
            </p>
          </div>
          <div className="text-center flex-1 min-w-0">
            <p className="font-black text-lg truncate drop-shadow-sm">{wild.name}</p>
            <RarityBadge rarity={wild.rarity} size="sm" />
          </div>
          <div className="text-right text-xs space-y-1">
            <p className="text-emerald-300 flex items-center justify-end gap-0.5 font-semibold">
              +1 <Coins className="w-3 h-3" /> zona verde
            </p>
            <p className="text-amber-300 flex items-center justify-end gap-0.5 font-semibold">
              +1 <Coins className="w-3 h-3" /> perfeito
            </p>
            {perfectHits > 0 && (
              <p className="text-amber-200/80 text-[10px]">
                {perfectHits} perfeito{perfectHits > 1 ? "s" : ""}
              </p>
            )}
          </div>
        </div>
      </div>

      {streak > 0 && (
        <div className="flex gap-1.5 justify-center flex-wrap px-2 py-1 rounded-full border border-white/5 bg-white/[0.03] max-w-fit mx-auto">
          {caught.slice(-8).map((p, i) => (
            <Image
              key={`catch-${caught.length - 8 + i}-${p.id}`}
              src={p.image}
              alt={p.name}
              width={28}
              height={28}
              className="object-contain opacity-90 drop-shadow"
              unoptimized={!isLocalAsset(p.image)}
            />
          ))}
        </div>
      )}

      <div
        className={cn(
          "relative overflow-hidden rounded-2xl border min-h-[280px] flex flex-col items-center justify-center",
          arenaStyle.border
        )}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: arenaStyle.gradient }}
        />
        <div
          className="absolute inset-x-0 bottom-0 h-24 pointer-events-none opacity-50"
          style={{ background: `linear-gradient(to top, ${arenaStyle.glow}, transparent)` }}
        />
        <motion.div
          className="absolute w-44 h-44 rounded-full border pointer-events-none"
          style={{ borderColor: `${arenaStyle.glow}` }}
          animate={{ scale: [1, 1.08, 1], opacity: [0.25, 0.5, 0.25] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        />

        <AnimatePresence mode="wait">
          <motion.div
            key={pokemonKey}
            initial={{ scale: 0.85, opacity: 0, y: 12 }}
            animate={{
              scale: ballAnim === "hit" ? [1, 1, 0.15] : ballAnim === "miss" ? 1 : 1,
              opacity: ballAnim === "hit" ? [1, 1, 0] : ballAnim === "miss" ? 1 : 1,
              x: ballAnim === "miss" ? [0, 24, 72] : 0,
              y: ballAnim === "none" ? [0, -6, 0] : ballAnim === "hit" ? [0, -4, 0] : 0,
              rotate: ballAnim === "hit" ? [0, -6, 6, -4, 0] : 0,
            }}
            transition={{
              duration: ballAnim === "hit" ? 0.75 : ballAnim === "miss" ? 0.5 : 0.35,
              times: ballAnim === "hit" ? [0, 0.45, 1] : undefined,
              y: ballAnim === "none" ? { duration: 2.2, repeat: Infinity, ease: "easeInOut" } : undefined,
            }}
            className="relative z-10 flex flex-col items-center"
          >
            <div
              className="relative rounded-full p-3 bg-black/25 border border-white/10"
              style={{ boxShadow: `0 0 40px ${arenaStyle.glow}` }}
            >
              <Image
                src={wild.image}
                alt={wild.name}
                width={128}
                height={128}
                className="object-contain drop-shadow-[0_8px_24px_rgba(0,0,0,0.45)]"
                priority
              />
            </div>
          </motion.div>
        </AnimatePresence>

        {ballAnim !== "none" && (
          <motion.div
            initial={{ left: "50%", x: "-50%", y: 120, scale: 0.5, rotate: 0, opacity: 1 }}
            animate={
              ballAnim === "hit"
                ? {
                    y: [120, -8, 12],
                    scale: [0.5, 1.05, 0.3],
                    rotate: [0, -720, -720],
                    opacity: [1, 1, 0],
                  }
                : {
                    y: [120, -12, 48],
                    x: ["-50%", "-50%", "calc(-50% + 96px)"],
                    rotate: [0, 180, 420],
                    opacity: [1, 1, 0],
                  }
            }
            transition={{
              duration: ballAnim === "hit" ? 0.72 : 0.58,
              ease: "easeInOut",
              times: ballAnim === "hit" ? [0, 0.58, 1] : [0, 0.45, 1],
            }}
            className="absolute z-20 pointer-events-none"
          >
            <motion.div
              animate={ballAnim === "hit" ? { scale: [1, 1.15, 0.85] } : undefined}
              transition={{ duration: 0.72, times: [0, 0.58, 1] }}
            >
              <PokeballIcon size={48} />
            </motion.div>
            {ballAnim === "hit" && (
              <motion.div
                initial={{ scale: 0, opacity: 0.8 }}
                animate={{ scale: [0, 2.2], opacity: [0.8, 0] }}
                transition={{ delay: 0.42, duration: 0.35 }}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full border-2 border-white/60"
              />
            )}
          </motion.div>
        )}

        {phase === "playing" && ballAnim === "none" && (
          <p className="relative z-10 text-xs text-cyan-200/90 font-semibold mt-4 animate-pulse">
            Toque na zona verde!
          </p>
        )}

        {lastQuality && phase === "animating" && (
          <motion.p
            initial={{ opacity: 0, y: 6, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className={cn(
              "relative z-10 text-base font-black mt-3 px-4 py-1 rounded-full border",
              lastQuality === "perfect" && "text-amber-300 border-amber-400/40 bg-amber-500/10",
              lastQuality === "good" && "text-emerald-300 border-emerald-400/40 bg-emerald-500/10",
              lastQuality === "miss" && "text-red-300 border-red-400/40 bg-red-500/10"
            )}
          >
            {lastQuality === "perfect" && (
              <span className="inline-flex items-center gap-1">
                Perfeito! +1 moeda
                <Sparkles className="w-4 h-4" />
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
            "w-full relative overflow-hidden rounded-2xl border border-white/10 p-4 touch-none select-none transition-opacity",
            "bg-gradient-to-b from-slate-900/90 to-slate-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]",
            phase === "animating" && "opacity-60 pointer-events-none"
          )}
        >
          <p className="text-[10px] uppercase tracking-wider text-white/35 font-bold mb-2 text-center">
            Barra de timing
          </p>
          <div className="relative h-14 rounded-xl bg-slate-950/90 border border-white/10 overflow-hidden shadow-[inset_0_0_24px_rgba(0,0,0,0.6)]">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />

            <div
              className="absolute top-0 bottom-0 bg-emerald-500/35 border-x-2 border-emerald-300/50 shadow-[0_0_20px_rgba(16,185,129,0.35)]"
              style={{
                left: `${zoneCenter - zoneHalf}%`,
                width: `${config.zonePct}%`,
              }}
            >
              <div className="absolute inset-0 bg-emerald-400/15 animate-pulse" />
            </div>

            <div
              className="absolute top-1.5 bottom-1.5 rounded-lg bg-amber-400/45 border border-amber-200/60 shadow-[0_0_24px_rgba(251,191,36,0.45)]"
              style={{
                left: `${zoneCenter - perfectHalf}%`,
                width: `${perfectHalf * 2}%`,
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-white/15 to-transparent rounded-lg" />
            </div>

            <div
              ref={cursorThumbRef}
              className="absolute top-0 bottom-0 w-1 z-20"
              style={{ left: "calc(50% - 2px)" }}
            >
              <div className="h-full w-full bg-white shadow-[0_0_18px_rgba(255,255,255,0.9)] relative">
                <div className="absolute top-[-5px] left-[-3px] right-[-3px] h-2.5 bg-white rounded-full shadow-[0_0_12px_white]" />
                <div className="absolute bottom-[-5px] left-[-3px] right-[-3px] h-2.5 bg-white rounded-full shadow-[0_0_12px_white]" />
              </div>
            </div>
          </div>
        </button>
      )}
    </div>
  );
}
