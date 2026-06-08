"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { MousePointerClick, Timer, Snowflake, Zap, Star } from "lucide-react";
import { PokeballIcon } from "@/components/ui/PokeballIcon";
import {
  GreatBallIcon,
  UltraBallIcon,
  MasterBallIcon,
} from "@/components/ui/PokeBallIcons";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { ComboCounter } from "@/components/minigame/ComboCounter";
import {
  CLICK_BASE_COINS_MAX,
  CLICK_BASE_COINS_MIN,
  CLICK_GAME_DURATION_SEC,
  CLICK_MAX_TIME_SEC,
  CLICK_TIME_BONUS_SEC,
  type BallType,
} from "@/data/economy-balance";
import { POKEMON_MAP } from "@/data/pokemon";
import {
  calcClickGameRewardBreakdown,
  calcClickScore,
  maybeSpawnRareEvent,
  rollBallType,
  spawnBall,
  type ClickGameRewardBreakdown,
  type RareEvent,
  type SpawnedBall,
} from "@/lib/minigame-engine";
import { getEconomyBonuses, useEconomyStore } from "@/stores/economy-store";
import { playClickCombo, playClickPop, playClickRare, playClickFreeze, playClickDouble, playClickFrenzy, playClickBonusActive } from "@/lib/sound-engine";
import { cn } from "@/lib/utils";

interface ClickMinigameProps {
  onComplete: (score: number, reward: ClickGameRewardBreakdown, maxCombo: number) => void;
  onReady?: (restart: () => void) => void;
}

export function ClickMinigame({ onComplete, onReady }: ClickMinigameProps) {
  const [playing, setPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(CLICK_GAME_DURATION_SEC);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [balls, setBalls] = useState<SpawnedBall[]>([]);
  const [rareEvents, setRareEvents] = useState<RareEvent[]>([]);
  const [popups, setPopups] = useState<{ id: string; x: number; y: number; text: string }[]>([]);

  // Novos estados de bônus
  const [freezeActive, setFreezeActive] = useState(false);
  const [doubleActive, setDoubleActive] = useState(false);

  const comboTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const freezeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const freezeUntilRef = useRef(0);
  const scoreRef = useRef(0);
  const maxComboRef = useRef(0);
  const endedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  const rareSpawnCooldown = useRef(0);
  const timeBallsSpawned = useRef(0); // Limite de bolas de tempo por jogo

  const team = useEconomyStore((s) => s.team);
  const bonuses = getEconomyBonuses(team);

  onCompleteRef.current = onComplete;
  scoreRef.current = score;
  maxComboRef.current = maxCombo;

  const finishGame = useCallback(() => {
    if (endedRef.current) return;
    endedRef.current = true;
    setPlaying(false);

    const reward = calcClickGameRewardBreakdown(
      scoreRef.current,
      maxComboRef.current,
      bonuses.coinBonus
    );
    onCompleteRef.current(scoreRef.current, reward, maxComboRef.current);
  }, [bonuses.coinBonus]);

  const start = useCallback(() => {
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
    rareSpawnCooldown.current = 0;
    timeBallsSpawned.current = 0;
    freezeUntilRef.current = 0;
    if (freezeTimerRef.current) clearTimeout(freezeTimerRef.current);
  }, []);

  const extendFreeze = useCallback((extraMs: number) => {
    const now = Date.now();
    const base = Math.max(now, freezeUntilRef.current);
    freezeUntilRef.current = base + extraMs;
    setFreezeActive(true);
    if (freezeTimerRef.current) clearTimeout(freezeTimerRef.current);
    freezeTimerRef.current = setTimeout(() => {
      setFreezeActive(false);
      freezeUntilRef.current = 0;
      freezeTimerRef.current = null;
    }, freezeUntilRef.current - now);
  }, []);

  useEffect(() => {
    onReady?.(start);
  }, [onReady, start]);

  useEffect(() => {
    if (!playing || freezeActive) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [playing, freezeActive]);

  useEffect(() => {
    if (playing && timeLeft === 0) {
      finishGame();
    }
  }, [playing, timeLeft, finishGame]);

  useEffect(() => {
    if (!playing) return;

    const interval = setInterval(() => {
      setBalls((prev) => {
        const now = Date.now();
        let alive = prev.filter((b) => now - b.createdAt < b.lifetime);
        while (alive.length < 5) {
          const next = spawnBall(alive);
          if (next.kind === "time") {
            if (timeBallsSpawned.current >= 2) {
              next.kind = "normal";
              next.type = rollBallType();
            } else {
              timeBallsSpawned.current++;
            }
          }
          alive = [...alive, next];
        }
        if (Math.random() < 0.44) {
          const next = spawnBall(alive);
          if (next.kind === "time") {
            if (timeBallsSpawned.current >= 2) {
              next.kind = "normal";
              next.type = rollBallType();
            } else {
              timeBallsSpawned.current++;
            }
          }
          alive = [...alive.slice(-14), next];
        }
        return alive;
      });
    }, 480);

    return () => clearInterval(interval);
  }, [playing]);

  useEffect(() => {
    if (!playing) return;

    const interval = setInterval(() => {
      const now = Date.now();
      setRareEvents((prev) => {
        const alive = prev.filter((r) => now - r.createdAt < r.lifetime);
        if (alive.length > 0 || now < rareSpawnCooldown.current) return alive;
        const rare = maybeSpawnRareEvent();
        if (rare) {
          rareSpawnCooldown.current = now + 4000;
          return [rare];
        }
        return alive;
      });
    }, 800);

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
    // Efeito: Bônus de Tempo
    if (ball.kind === "time") {
      void playClickRare();
      setTimeLeft((t) => Math.min(CLICK_MAX_TIME_SEC, t + CLICK_TIME_BONUS_SEC));
      setBalls((prev) => prev.filter((b) => b.id !== ball.id));
      setPopups((prev) => [
        ...prev.slice(-8),
        { id: `pop-${Date.now()}`, x: ball.x, y: ball.y, text: `+${CLICK_TIME_BONUS_SEC}s!` },
      ]);
      resetComboTimer();
      return;
    }

    // Efeito: Congelar Tempo (3 segundos)
    if (ball.kind === "freeze") {
      void playClickFreeze();
      extendFreeze(3000);
      setBalls((prev) => prev.filter((b) => b.id !== ball.id));
      setPopups((prev) => [
        ...prev.slice(-8),
        { id: `pop-${Date.now()}`, x: ball.x, y: ball.y, text: "CONGELADO!" },
      ]);
      return;
    }

    // Efeito: Pontos em Dobro (5 segundos)
    if (ball.kind === "double") {
      void playClickDouble();
      setDoubleActive(true);
      setTimeout(() => setDoubleActive(false), 5000);
      setBalls((prev) => prev.filter((b) => b.id !== ball.id));
      setPopups((prev) => [
        ...prev.slice(-8),
        { id: `pop-${Date.now()}`, x: ball.x, y: ball.y, text: "2X PONTOS!" },
      ]);
      return;
    }

    // Efeito: Frenesi (Limpa tela + 100 pontos)
    if (ball.kind === "frenzy") {
      void playClickFrenzy();
      setScore((s) => {
        const next = s + 100;
        scoreRef.current = next;
        return next;
      });
      setBalls([]);
      setPopups((prev) => [
        ...prev.slice(-8),
        { id: `pop-${Date.now()}`, x: ball.x, y: ball.y, text: "+100 FRENESI!" },
      ]);
      return;
    }

    const newCombo = combo + 1;
    if (freezeActive || doubleActive) {
      void playClickBonusActive();
    } else {
      void playClickPop();
    }
    if (newCombo >= 3 && newCombo % 3 === 0) void playClickCombo(newCombo);

    let points = calcClickScore(ball.type, newCombo, bonuses.comboBonus);
    if (doubleActive) points *= 2; // Aplica o dobro se ativo

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
    void playClickRare();
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
        <div className="mx-auto w-14 h-14 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center">
          <MousePointerClick className="w-7 h-7 text-cyan-400" />
        </div>
        <h3 className="text-xl font-bold">Click Rush</h3>
        <p className="text-white/50 text-sm leading-relaxed">
          Pokébolas aparecem na tela. Clique o máximo que conseguir em{" "}
          {CLICK_GAME_DURATION_SEC} segundos. Combos aumentam sua pontuação! Itens especiais: +
          {CLICK_TIME_BONUS_SEC}s extras, congela o tempo, pontos em dobro e Frenesi Master.
          Recompensa: {CLICK_BASE_COINS_MIN}~{CLICK_BASE_COINS_MAX} moedas conforme seu desempenho.
        </p>
        <AnimatedButton variant="primary" size="lg" onClick={start} className="w-full max-w-xs mx-auto">
          COMEÇAR!
        </AnimatedButton>
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
        className={cn(
          "relative glass-card rounded-2xl overflow-hidden select-none touch-none transition-all duration-500",
          freezeActive && "ring-4 ring-blue-400 shadow-[inset_0_0_50px_rgba(56,189,248,0.3)]",
          doubleActive && "ring-4 ring-yellow-400 shadow-[inset_0_0_50px_rgba(250,204,21,0.3)]"
        )}
        style={{ height: 520 }}
      >
        {/* Overlay de Gelo */}
        <AnimatePresence>
          {freezeActive && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-10 pointer-events-none"
              style={{
                background: "linear-gradient(45deg, rgba(186,230,253,0.2) 0%, transparent 100%)",
                backdropFilter: "contrast(1.1) brightness(1.2) saturate(0.8)",
              }}
            >
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/ice-crystals.png')] opacity-30" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Overlay de Raios/Brilho */}
        <AnimatePresence>
          {doubleActive && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.1, 0.3, 0.1] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, repeat: Infinity }}
              className="absolute inset-0 z-10 pointer-events-none bg-yellow-400/5 shadow-[0_0_100px_rgba(250,204,21,0.2)_inset]"
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {balls.map((ball) => (
            <motion.button
              key={ball.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              onClick={() => handleBallClick(ball)}
              className={cn(
                "absolute flex items-center justify-center",
                ball.kind !== "normal" ? "w-[5.25rem] h-[5.25rem] z-20" : "w-16 h-16 z-10"
              )}
              style={{ left: `${ball.x}%`, top: `${ball.y}%` }}
            >
              {ball.kind === "time" ? (
                <SpecialBallVisual icon={<Timer className="w-5 h-5 text-amber-300" />} color="bg-amber-400/40" ring="ring-amber-400/70" />
              ) : ball.kind === "freeze" ? (
                <SpecialBallVisual icon={<Snowflake className="w-5 h-5 text-blue-300" />} color="bg-blue-400/40" ring="ring-cyan-400/70" />
              ) : ball.kind === "double" ? (
                <SpecialBallVisual icon={<Zap className="w-5 h-5 text-yellow-300" />} color="bg-yellow-400/40" ring="ring-yellow-400/70" />
              ) : ball.kind === "frenzy" ? (
                <SpecialBallVisual icon={<Star className="w-5 h-5 text-purple-300" />} color="bg-purple-400/40" ring="ring-purple-400/80" />
              ) : (
                <BallVisual type={ball.type} />
              )}
            </motion.button>
          ))}
          {rareEvents.map((event) => {
            const pokemon = POKEMON_MAP[event.pokemonId];
            if (!pokemon) return null;
            return (
              <button
                key={event.id}
                onClick={() => handleRareClick(event)}
                className="absolute flex items-center gap-1 px-2 py-1 rounded-full bg-amber-500/20 border border-amber-400/50 animate-pulse hover:scale-105 transition-transform"
                style={{ left: `${event.x}%`, top: `${event.y}%` }}
              >
                <Image src={pokemon.image} alt="" width={32} height={32} unoptimized />
                <span className="text-[10px] text-amber-400 font-bold">RARO!</span>
              </button>
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
      return <GreatBallIcon size={58} />;
    case "ultra":
      return <UltraBallIcon size={58} />;
    case "master":
      return <MasterBallIcon size={58} />;
    default:
      return <PokeballIcon size={58} />;
  }
}

function SpecialBallVisual({
  icon,
  color,
  ring,
}: {
  icon: React.ReactNode;
  color: string;
  ring: string;
}) {
  return (
    <div className="relative">
      <div className={cn("absolute -inset-2 rounded-full blur-lg animate-pulse opacity-80", color)} />
      <div
        className={cn(
          "relative flex flex-col items-center rounded-full p-1 ring-2 ring-offset-2 ring-offset-slate-950",
          ring
        )}
      >
        <PokeballIcon size={62} />
        <div className="absolute -bottom-1 -right-1 drop-shadow-lg bg-slate-900 rounded-full p-1 border-2 border-white/20 shadow-lg">
          {icon}
        </div>
      </div>
    </div>
  );
}
