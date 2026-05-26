"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { PokeballIcon } from "@/components/ui/PokeballIcon";
import {
  GreatBallIcon,
  UltraBallIcon,
  MasterBallIcon,
} from "@/components/ui/PokeBallIcons";
import { ComboCounter } from "@/components/minigame/ComboCounter";
import {
  CLICK_BASE_COINS_MAX,
  CLICK_BASE_COINS_MIN,
  CLICK_GAME_DURATION_SEC,
  type BallType,
} from "@/data/economy-balance";
import { POKEMON_MAP } from "@/data/pokemon";
import {
  calcClickGameReward,
  calcClickScore,
  maybeSpawnRareEvent,
  spawnBall,
  type RareEvent,
  type SpawnedBall,
} from "@/lib/minigame-engine";
import { getEconomyBonuses, useEconomyStore } from "@/stores/economy-store";
import { cn } from "@/lib/utils";

interface ClickMinigameProps {
  onComplete: (score: number, coins: number, maxCombo: number) => void;
}

export function ClickMinigame({ onComplete }: ClickMinigameProps) {
  const [playing, setPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(CLICK_GAME_DURATION_SEC);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [balls, setBalls] = useState<SpawnedBall[]>([]);
  const [rareEvents, setRareEvents] = useState<RareEvent[]>([]);
  const [popups, setPopups] = useState<{ id: string; x: number; y: number; text: string }[]>([]);

  const comboTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scoreRef = useRef(0);
  const maxComboRef = useRef(0);
  const endedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);

  const team = useEconomyStore((s) => s.team);
  const clickGamesToday = useEconomyStore((s) => s.clickGamesToday);
  const clickCoinsToday = useEconomyStore((s) => s.clickCoinsToday);

  const bonuses = getEconomyBonuses(team);

  onCompleteRef.current = onComplete;
  scoreRef.current = score;
  maxComboRef.current = maxCombo;

  const finishGame = useCallback(() => {
    if (endedRef.current) return;
    endedRef.current = true;
    setPlaying(false);

    const { coins } = calcClickGameReward(
      scoreRef.current,
      clickGamesToday,
      clickCoinsToday,
      bonuses.coinBonus
    );
    onCompleteRef.current(scoreRef.current, coins, maxComboRef.current);
  }, [clickGamesToday, clickCoinsToday, bonuses.coinBonus]);

  const start = () => {
    endedRef.current = false;
    setPlaying(true);
    setTimeLeft(CLICK_GAME_DURATION_SEC);
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setBalls([]);
    setRareEvents([]);
    setPopups([]);
    scoreRef.current = 0;
    maxComboRef.current = 0;
  };

  useEffect(() => {
    if (!playing) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          finishGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [playing, finishGame]);

  useEffect(() => {
    if (!playing) return;

    const interval = setInterval(() => {
      const now = Date.now();
      setBalls((prev) => {
        const alive = prev.filter((b) => now - b.createdAt < b.lifetime);
        return Math.random() < 0.55 ? [...alive.slice(-10), spawnBall()] : alive;
      });
      setRareEvents((prev) => {
        const alive = prev.filter((r) => now - r.createdAt < r.lifetime);
        const rare = maybeSpawnRareEvent();
        return rare ? [...alive.slice(-2), rare] : alive;
      });
    }, 280);

    return () => clearInterval(interval);
  }, [playing]);

  useEffect(() => {
    if (!playing) return;
    const interval = setInterval(() => {
      setPopups((prev) => prev.slice(-6));
    }, 400);
    return () => clearInterval(interval);
  }, [playing]);

  const resetComboTimer = () => {
    if (comboTimeout.current) clearTimeout(comboTimeout.current);
    comboTimeout.current = setTimeout(() => setCombo(0), 900);
  };

  const handleBallClick = (ball: SpawnedBall) => {
    const points = calcClickScore(ball.type, combo + 1, bonuses.comboBonus);
    const newCombo = combo + 1;
    setScore((s) => {
      const next = s + points;
      scoreRef.current = next;
      return next;
    });
    setCombo(newCombo);
    setMaxCombo((m) => {
      const next = Math.max(m, newCombo);
      maxComboRef.current = next;
      return next;
    });
    setBalls((prev) => prev.filter((b) => b.id !== ball.id));
    setPopups((prev) => [
      ...prev.slice(-8),
      { id: `pop-${Date.now()}`, x: ball.x, y: ball.y, text: `+${points}` },
    ]);
    resetComboTimer();
  };

  const handleRareClick = (event: RareEvent) => {
    setScore((s) => {
      const next = s + 50;
      scoreRef.current = next;
      return next;
    });
    setRareEvents((prev) => prev.filter((r) => r.id !== event.id));
    setPopups((prev) => [
      ...prev.slice(-8),
      { id: `pop-${Date.now()}`, x: event.x, y: event.y, text: "+50 RARO!" },
    ]);
  };

  if (!playing) {
    return (
      <div className="glass-card p-8 text-center space-y-4">
        <PokeballIcon size={48} className="mx-auto" />
        <h3 className="text-xl font-bold">Click Rush!</h3>
        <p className="text-white/50 text-sm">
          Clique nas Pokébolas em {CLICK_GAME_DURATION_SEC}s · Ganhe {CLICK_BASE_COINS_MIN}~
          {CLICK_BASE_COINS_MAX} moedas
        </p>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={start}
          className="px-8 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 font-bold text-slate-900"
        >
          COMEÇAR!
        </motion.button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between glass-card px-4 py-2">
        <div className="text-sm">
          <span className="text-white/50">Tempo: </span>
          <span className={cn("font-bold", timeLeft <= 5 ? "text-red-400" : "text-white")}>
            {timeLeft}s
          </span>
        </div>
        <ComboCounter combo={combo} maxCombo={maxCombo} />
        <div className="text-sm font-bold text-amber-400">{score} pts</div>
      </div>

      <div
        className="relative glass-card rounded-2xl overflow-hidden select-none touch-none"
        style={{ height: 360 }}
      >
        <AnimatePresence>
          {balls.map((ball) => (
            <motion.button
              key={ball.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              onClick={() => handleBallClick(ball)}
              className="absolute w-12 h-12 flex items-center justify-center"
              style={{ left: `${ball.x}%`, top: `${ball.y}%` }}
            >
              <BallVisual type={ball.type} />
            </motion.button>
          ))}
          {rareEvents.map((event) => {
            const pokemon = POKEMON_MAP[event.pokemonId];
            if (!pokemon) return null;
            return (
              <motion.button
                key={event.id}
                initial={{ x: "-100%" }}
                animate={{ x: `${event.x}%` }}
                exit={{ opacity: 0 }}
                onClick={() => handleRareClick(event)}
                className="absolute flex items-center gap-1 px-2 py-1 rounded-full bg-amber-500/20 border border-amber-400/50"
                style={{ top: `${event.y}%` }}
              >
                <Image src={pokemon.image} alt="" width={32} height={32} unoptimized />
                <span className="text-[10px] text-amber-400 font-bold">RARO!</span>
              </motion.button>
            );
          })}
          {popups.map((p) => (
            <motion.span
              key={p.id}
              initial={{ opacity: 1, y: 0 }}
              animate={{ opacity: 0, y: -30 }}
              className="absolute text-amber-400 font-bold text-sm pointer-events-none"
              style={{ left: `${p.x}%`, top: `${p.y}%` }}
            >
              {p.text}
            </motion.span>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

function BallVisual({ type }: { type: BallType }) {
  switch (type) {
    case "great":
      return <GreatBallIcon size={44} />;
    case "ultra":
      return <UltraBallIcon size={44} />;
    case "master":
      return <MasterBallIcon size={44} />;
    default:
      return <PokeballIcon size={44} />;
  }
}
