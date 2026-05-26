"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { PokeballIcon } from "@/components/ui/PokeballIcon";
import { RarityBadge } from "@/components/ui/RarityBadge";
import {
  CAPTURE_SHAKE_MS,
} from "@/data/economy-balance";
import {
  calcCaptureReward,
  evaluateCaptureHit,
  getCaptureConfig,
  getCaptureCoinsForRarity,
  getRarityColor,
  pickWildPokemon,
  rollZoneCenter,
  type CaptureHitQuality,
} from "@/lib/capture-minigame-engine";
import { getEconomyBonuses, useEconomyStore } from "@/stores/economy-store";
import type { Pokemon } from "@/types";
import { cn } from "@/lib/utils";

export interface CaptureGameResult {
  captured: boolean;
  goodHits: number;
  perfectHits: number;
  totalShakes: number;
  coins: number;
  accountXp: number;
  bonusPokemonXp: number;
  pokemon: Pokemon;
}

interface CapturaPerfeitaGameProps {
  onComplete: (result: CaptureGameResult) => void;
}

type Phase = "idle" | "playing" | "shake" | "done";

export function CapturaPerfeitaGame({ onComplete }: CapturaPerfeitaGameProps) {
  const team = useEconomyStore((s) => s.team);
  const bonuses = getEconomyBonuses(team);

  const [phase, setPhase] = useState<Phase>("idle");
  const [wild, setWild] = useState<Pokemon | null>(null);
  const [round, setRound] = useState(0);
  const [goodHits, setGoodHits] = useState(0);
  const [perfectHits, setPerfectHits] = useState(0);
  const [cursor, setCursor] = useState(50);
  const [zoneCenter, setZoneCenter] = useState(50);
  const [lastQuality, setLastQuality] = useState<CaptureHitQuality | null>(null);
  const [captured, setCaptured] = useState(false);

  const cursorRef = useRef(50);
  const rafRef = useRef<number | null>(null);
  const endedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);

  onCompleteRef.current = onComplete;

  const config = wild ? getCaptureConfig(wild.rarity) : null;

  const finishGame = useCallback(
    (success: boolean, hits: number, perfects: number, pokemon: Pokemon, shakes: number) => {
      if (endedRef.current) return;
      endedRef.current = true;

      const { coins, accountXp, bonusPokemonXp } = calcCaptureReward(
        success,
        pokemon.rarity,
        perfects,
        shakes,
        bonuses.coinBonus
      );

      setCaptured(success);
      setPhase("done");

      onCompleteRef.current({
        captured: success,
        goodHits: hits,
        perfectHits: perfects,
        totalShakes: shakes,
        coins,
        accountXp,
        bonusPokemonXp,
        pokemon,
      });
    },
    [bonuses.coinBonus]
  );

  const startGame = () => {
    const pokemon = pickWildPokemon();
    endedRef.current = false;
    setWild(pokemon);
    setRound(0);
    setGoodHits(0);
    setPerfectHits(0);
    setLastQuality(null);
    setCaptured(false);
    setZoneCenter(rollZoneCenter());
    setCursor(50);
    cursorRef.current = 50;
    setPhase("playing");
  };

  useEffect(() => {
    if (phase !== "playing" || !wild || !config) return;

    const speed = config.speed;
    let start = performance.now();

    const tick = (now: number) => {
      const elapsed = (now - start) / 1000;
      const pos = 50 + 50 * Math.sin(elapsed * speed * 2.8);
      cursorRef.current = pos;
      setCursor(pos);
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [phase, round, wild, config]);

  const handleTap = () => {
    if (phase !== "playing" || !wild || !config || endedRef.current) return;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    const quality = evaluateCaptureHit(cursorRef.current, zoneCenter, config.zonePct);
    setLastQuality(quality);
    setPhase("shake");

    if (quality === "miss") {
      setTimeout(() => {
        finishGame(false, goodHits, perfectHits, wild, config.shakes);
      }, CAPTURE_SHAKE_MS + 200);
      return;
    }

    const nextGood = goodHits + 1;
    const nextPerfect = perfectHits + (quality === "perfect" ? 1 : 0);
    setGoodHits(nextGood);
    setPerfectHits(nextPerfect);

    const isLastRound = round + 1 >= config.shakes;

    setTimeout(() => {
      if (isLastRound) {
        finishGame(true, nextGood, nextPerfect, wild, config.shakes);
        return;
      }
      setRound((r) => r + 1);
      setZoneCenter(rollZoneCenter());
      setLastQuality(null);
      setPhase("playing");
    }, CAPTURE_SHAKE_MS);
  };

  if (phase === "idle") {
    return (
      <div className="glass-card p-8 text-center space-y-4">
        <PokeballIcon size={48} className="mx-auto" />
        <h3 className="text-xl font-bold">Captura Perfeita</h3>
        <p className="text-white/50 text-sm leading-relaxed">
          Um Pokémon selvagem aparece. Acerte o timing na zona verde enquanto a Pokébola
          balança — quanto mais raro, mais difícil e mais moedas.
        </p>
        <p className="text-xs text-amber-400/90">
          Recompensa ao capturar: Comum 1 · Incomum 2 · Raro 3 · Épico 4 · Lendário 5 🪙
        </p>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={startGame}
          className="px-8 py-3 rounded-2xl bg-gradient-to-r from-emerald-400 to-cyan-500 font-bold text-slate-900"
        >
          ENCONTRAR POKÉMON!
        </motion.button>
      </div>
    );
  }

  if (!wild || !config) return null;

  const zoneHalf = config.zonePct / 2;
  const perfectHalf = zoneHalf * 0.38;

  return (
    <div className="space-y-4">
      <div className="glass-card p-4 flex items-center justify-between">
        <div>
          <p className="text-[10px] text-white/40 uppercase tracking-wider">Selvagem</p>
          <p className="font-bold">{wild.name}</p>
          <RarityBadge rarity={wild.rarity} size="sm" />
        </div>
        <div className="text-right text-xs text-white/50">
          <p>
            Balanço {Math.min(round + (phase === "shake" ? 1 : 0), config.shakes)}/{config.shakes}
          </p>
          <p className={getRarityColor(wild.rarity)}>
            {config.shakes} acertos · captura = {getCaptureCoinsForRarity(wild.rarity)} 🪙
          </p>
        </div>
      </div>

      <div className="glass-card p-6 relative overflow-hidden min-h-[280px] flex flex-col items-center justify-center gap-4">
        <AnimatePresence mode="wait">
          {phase !== "done" ? (
            <motion.div
              key="wild"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{
                scale: phase === "shake" ? [1, 1.05, 0.98, 1.02, 1] : 1,
                opacity: 1,
                x: phase === "shake" && lastQuality === "miss" ? [0, -8, 8, -4, 0] : 0,
              }}
              transition={{ duration: phase === "shake" ? 0.5 : 0.3 }}
              className="relative"
            >
              <Image
                src={wild.image}
                alt={wild.name}
                width={120}
                height={120}
                className="object-contain drop-shadow-lg"
                priority
              />
              {phase === "shake" && (
                <motion.div
                  initial={{ scale: 0, y: 20 }}
                  animate={{ scale: 1, y: 60 }}
                  className="absolute left-1/2 -translate-x-1/2"
                >
                  <PokeballIcon size={36} />
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="result"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center space-y-3"
            >
              <Image
                src={wild.image}
                alt={wild.name}
                width={96}
                height={96}
                className={cn("object-contain mx-auto", !captured && "opacity-60 grayscale")}
              />
              <p className={cn("text-lg font-bold", captured ? "text-emerald-400" : "text-orange-400")}>
                {captured ? "Capturado!" : "O Pokémon fugiu!"}
              </p>
              <p className="text-xs text-white/50">
                {goodHits}/{config.shakes} acertos
                {perfectHits > 0 && ` · ${perfectHits} perfeito${perfectHits > 1 ? "s" : ""}`}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {phase === "playing" && (
          <p className="text-xs text-cyan-300/80 animate-pulse">Toque na zona verde!</p>
        )}

        {phase === "shake" && lastQuality && (
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "text-sm font-bold",
              lastQuality === "perfect" && "text-amber-400",
              lastQuality === "good" && "text-emerald-400",
              lastQuality === "miss" && "text-red-400"
            )}
          >
            {lastQuality === "perfect" && "Perfeito! ✨"}
            {lastQuality === "good" && "Boa captura!"}
            {lastQuality === "miss" && "Escapou..."}
          </motion.p>
        )}
      </div>

      {(phase === "playing" || phase === "shake") && (
        <button
          type="button"
          onClick={handleTap}
          disabled={phase === "shake"}
          className={cn(
            "w-full glass-card p-4 touch-none select-none transition-opacity",
            phase === "shake" && "opacity-60 pointer-events-none"
          )}
        >
          <p className="text-[10px] text-white/40 mb-2 text-center uppercase tracking-wider">
            Timing de captura
          </p>
          <div className="relative h-10 rounded-full bg-white/10 border border-white/10 overflow-hidden">
            <div
              className="absolute top-0 bottom-0 bg-emerald-500/35 border-x border-emerald-400/50"
              style={{
                left: `${zoneCenter - zoneHalf}%`,
                width: `${config.zonePct}%`,
              }}
            />
            <div
              className="absolute top-0 bottom-0 bg-amber-400/25"
              style={{
                left: `${zoneCenter - perfectHalf}%`,
                width: `${perfectHalf * 2}%`,
              }}
            />
            <div
              className="absolute top-1 bottom-1 w-1.5 rounded-full bg-white shadow-lg shadow-white/50"
              style={{ left: `calc(${cursor}% - 3px)` }}
            />
          </div>
          <p className="text-[10px] text-white/35 mt-2 text-center">
            Centro dourado = timing perfeito · verde = captura ok
          </p>
        </button>
      )}

      {phase === "done" && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={startGame}
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-400 to-cyan-500 font-bold text-slate-900"
        >
          Jogar novamente
        </motion.button>
      )}
    </div>
  );
}
