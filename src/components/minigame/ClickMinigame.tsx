"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Bomb, Heart, MousePointerClick, Timer, Snowflake, Zap, Star } from "lucide-react";
import { PokeballIcon } from "@/components/ui/PokeballIcon";
import {
  GreatBallIcon,
  UltraBallIcon,
  MasterBallIcon,
} from "@/components/ui/PokeBallIcons";
import { MinigameLobbyCard } from "@/components/minigame/MinigameLobbyCard";
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
import { isLocalAsset } from "@/lib/image-utils";
import { cn } from "@/lib/utils";

const CLICK_STARTING_LIVES = 2;

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
  const [lives, setLives] = useState(CLICK_STARTING_LIVES);

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
    setLives(CLICK_STARTING_LIVES);
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
    if (ball.kind === "bomb") {
      void playClickRare();
      setBalls((prev) => prev.filter((b) => b.id !== ball.id));
      setPopups((prev) => [
        ...prev.slice(-8),
        { id: `pop-${Date.now()}`, x: ball.x, y: ball.y, text: "BOOM! -1 vida" },
      ]);
      setLives((current) => {
        const next = current - 1;
        if (next <= 0) {
          window.setTimeout(() => finishGame(), 450);
        }
        return Math.max(0, next);
      });
      setCombo(0);
      return;
    }

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
      <MinigameLobbyCard
        accent="cyan"
        icon={<MousePointerClick className="w-8 h-8" />}
        title="Click Rush"
        description={
          <>
            Pokébolas surgem na arena, clique o máximo em {CLICK_GAME_DURATION_SEC}s. Você tem{" "}
            {CLICK_STARTING_LIVES} vidas; evite a bomba! Combos, congelamento, dobro de pontos e
            Frenesi Master te esperam. Recompensa: {CLICK_BASE_COINS_MIN}~{CLICK_BASE_COINS_MAX}{" "}
            moedas.
          </>
        }
        buttonLabel="ENTRAR NA ARENA"
        onStart={start}
      />
    );
  }

  return (
    <div className="relative rounded-2xl border border-cyan-400/25 bg-slate-950/80 p-3 sm:p-4 space-y-3 shadow-[0_0_40px_rgba(99,102,241,0.12)]">
      <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />
      <div className="flex items-center justify-between gap-2 px-1">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-cyan-300/55 font-bold">Click Rush</p>
          <p className="text-xs text-white/35">Arena ativa</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <div className="flex items-center gap-2 rounded-xl bg-black/25 border border-white/10 px-3 py-1.5">
            <Timer className={cn("w-4 h-4", timeLeft <= 5 ? "text-red-400" : "text-cyan-300")} />
            <span className={cn("font-black tabular-nums", timeLeft <= 5 ? "text-red-400" : "text-white")}>
              {timeLeft}s
            </span>
          </div>
          <div className="flex items-center gap-0.5" title="Vidas">
            {Array.from({ length: CLICK_STARTING_LIVES }).map((_, i) => (
              <Heart
                key={i}
                className={cn(
                  "w-4 h-4",
                  i < lives ? "text-rose-400 fill-rose-400/70" : "text-white/15"
                )}
              />
            ))}
          </div>
          <ComboCounter combo={combo} maxCombo={maxCombo} />
          <div className="rounded-xl bg-amber-500/10 border border-amber-400/25 px-3 py-1.5">
            <span className="text-amber-300 font-black tabular-nums">{score} pts</span>
          </div>
        </div>
      </div>
      {(freezeActive || doubleActive) && (
        <div className="flex gap-2 justify-center flex-wrap px-1">
          {freezeActive && (
            <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-200 bg-cyan-500/15 border border-cyan-400/30 px-2.5 py-1 rounded-full">
              Congelado
            </span>
          )}
          {doubleActive && (
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-200 bg-amber-500/15 border border-amber-400/30 px-2.5 py-1 rounded-full">
              2x pontos
            </span>
          )}
        </div>
      )}

      <div
        className={cn(
          "relative overflow-hidden rounded-xl border-2 select-none touch-none transition-all duration-500",
          "bg-gradient-to-b from-indigo-950/80 via-slate-900 to-black",
          freezeActive && "border-cyan-400/60 shadow-[inset_0_0_60px_rgba(34,211,238,0.15)]",
          doubleActive && "border-amber-400/60 shadow-[inset_0_0_60px_rgba(251,191,36,0.15)]",
          !freezeActive && !doubleActive && "border-cyan-500/20 shadow-[inset_0_0_80px_rgba(99,102,241,0.1)]"
        )}
        style={{ height: 520 }}
      >
        <div className="absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-black/50 to-transparent z-[5] pointer-events-none flex items-center justify-center">
          <span className="text-[9px] uppercase tracking-[0.3em] text-cyan-300/40 font-bold">Tap Zone</span>
        </div>
        <div className="absolute inset-0 opacity-40 pointer-events-none bg-[radial-gradient(circle_at_30%_20%,rgba(99,102,241,0.25),transparent_40%),radial-gradient(circle_at_70%_80%,rgba(34,211,238,0.12),transparent_35%)]" />
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={`orb-${i}`}
            className="absolute w-2 h-2 rounded-full bg-white/10 pointer-events-none"
            animate={{
              y: [0, -20, 0],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{ duration: 3 + i * 0.4, repeat: Infinity, delay: i * 0.3 }}
            style={{ left: `${12 + i * 14}%`, top: `${18 + (i % 3) * 22}%` }}
          />
        ))}
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
              ) : ball.kind === "bomb" ? (
                <SpecialBallVisual icon={<Bomb className="w-5 h-5 text-red-300" />} color="bg-red-500/45" ring="ring-red-500/80" />
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
                <Image
                  src={pokemon.image}
                  alt=""
                  width={32}
                  height={32}
                  unoptimized={!isLocalAsset(pokemon.image)}
                />
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
