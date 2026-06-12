"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Lock, Play, Sparkles, Trophy } from "lucide-react";
import { MinigameLobbyCard } from "@/components/minigame/MinigameLobbyCard";
import {
  FLAPPY_SKINS,
  getFlappySkin,
  isFlappySkinUnlocked,
} from "@/data/flappy-skins";
import {
  birdHitsPipe,
  calcFlappyAccountXp,
  calcFlappyCoins,
  FLAPPY_BIRD_SIZE,
  FLAPPY_BIRD_X_RATIO,
  FLAPPY_FLAP_VELOCITY,
  FLAPPY_GRAVITY,
  FLAPPY_PIPE_SPEED,
  getFlappyGroundY,
  tickFlappyPipes,
  type FlappyPipe,
} from "@/lib/flappy-zubat-engine";
import { drawFlappyScene } from "@/lib/flappy-zubat-render";
import { playBattleLoss, playFlappyFlap, playFlappyScore } from "@/lib/sound-engine";
import { playUiConfirm } from "@/lib/ui-sounds";
import { cn } from "@/lib/utils";

export interface FlappyZubatResult {
  score: number;
  coins: number;
  accountXp: number;
}

interface FlappyZubatGameProps {
  selectedSkinId: string;
  unlockedSkins: string[];
  bestScore: number;
  lifetimeCoins: number;
  onSelectSkin: (skinId: string) => void;
  onComplete: (result: FlappyZubatResult) => void;
  onReady?: (restart: () => void) => void;
}

type Phase = "lobby" | "playing" | "dead";

const CANVAS_W = 360;
const CANVAS_H = 520;

function skinProgress(
  skin: (typeof FLAPPY_SKINS)[number],
  bestScore: number,
  lifetimeCoins: number
): number | null {
  if (skin.unlockType === "score" && skin.unlockValue) {
    return Math.min(1, bestScore / skin.unlockValue);
  }
  if (skin.unlockType === "lifetime" && skin.unlockValue) {
    return Math.min(1, lifetimeCoins / skin.unlockValue);
  }
  return null;
}

function FlappySkinPicker({
  selectedSkinId,
  unlockedSkins,
  bestScore,
  lifetimeCoins,
  onSelectSkin,
}: {
  selectedSkinId: string;
  unlockedSkins: string[];
  bestScore: number;
  lifetimeCoins: number;
  onSelectSkin: (id: string) => void;
}) {
  const selected = getFlappySkin(selectedSkinId);

  return (
    <div className="space-y-3">
      <div
        className="relative overflow-hidden rounded-2xl border border-white/10 glass-card"
        style={{
          background: `linear-gradient(135deg, ${selected.scene.skyTop} 0%, ${selected.scene.skyMid} 55%, ${selected.scene.skyBot} 100%)`,
        }}
      >
        <div className="absolute inset-0 opacity-30 pointer-events-none bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.15),transparent_45%)]" />
        <div className="relative px-4 py-3 flex items-center justify-between border-b border-white/10">
          <p className="text-[11px] font-bold uppercase tracking-wider text-white/70">
            Escolher Pokémon
          </p>
          {bestScore > 0 && (
            <span className="text-[10px] font-bold text-amber-300 flex items-center gap-1 tabular-nums">
              <Trophy className="w-3 h-3" /> Recorde {bestScore}
            </span>
          )}
        </div>

        <div className="relative p-4 flex flex-col sm:flex-row gap-4 items-center">
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            className="relative w-28 h-28 shrink-0 rounded-2xl border border-white/15 bg-black/25 flex items-center justify-center shadow-lg"
            style={{ boxShadow: `0 0 32px ${selected.accent}44` }}
          >
            <Image
              src={selected.spriteUrl}
              alt=""
              width={96}
              height={96}
              className="w-20 h-20 object-contain drop-shadow-lg"
              unoptimized
            />
          </motion.div>

          <div className="flex-1 text-center sm:text-left min-w-0">
            <p className="text-[10px] text-white/45 uppercase tracking-wider">
              #{String(selected.dexNo).padStart(3, "0")}
            </p>
            <h3 className="text-xl font-black" style={{ color: selected.accent }}>
              {selected.label}
            </h3>
            <p className="text-xs text-white/55 mt-1">{selected.scene.location}</p>
            <div className="mt-2 inline-flex items-center gap-1 px-2.5 py-1 rounded-full border border-white/15 bg-white/5 text-[10px] font-bold text-white/70 uppercase">
              <Sparkles className="w-3 h-3 text-amber-300" /> Skin ativa
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {FLAPPY_SKINS.map((s) => {
          const unlocked = isFlappySkinUnlocked(s, bestScore, lifetimeCoins, unlockedSkins);
          const selectedCard = selectedSkinId === s.id;
          const progress = skinProgress(s, bestScore, lifetimeCoins);

          return (
            <button
              key={s.id}
              type="button"
              disabled={!unlocked}
              onClick={() => onSelectSkin(s.id)}
              className={cn(
                "relative text-left rounded-xl border p-2.5 transition-all duration-200 glass-card",
                unlocked && !selectedCard && "border-white/10 hover:border-white/25 hover:bg-white/5",
                selectedCard &&
                  unlocked &&
                  "border-indigo-400/50 shadow-[0_0_20px_rgba(99,102,241,0.25)]",
                !unlocked && "border-white/5 opacity-75 cursor-not-allowed"
              )}
            >
              {selectedCard && unlocked && (
                <span className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" strokeWidth={3} />
                </span>
              )}

              <div className="flex items-start gap-2">
                <div
                  className={cn(
                    "relative w-12 h-12 shrink-0 rounded-xl border flex items-center justify-center",
                    unlocked ? "border-white/15 bg-black/20" : "border-white/5 bg-black/30"
                  )}
                  style={unlocked ? { boxShadow: `0 0 12px ${s.accent}33` } : undefined}
                >
                  <Image
                    src={s.spriteUrl}
                    alt=""
                    width={40}
                    height={40}
                    className={cn("w-9 h-9 object-contain", !unlocked && "brightness-0 opacity-35")}
                    unoptimized
                  />
                  {!unlocked && (
                    <Lock className="absolute w-4 h-4 text-white/40 drop-shadow" />
                  )}
                </div>

                <div className="min-w-0 flex-1 pt-0.5">
                  <p className="text-[11px] text-white/50 tabular-nums">#{String(s.dexNo).padStart(3, "0")}</p>
                  <p
                    className={cn(
                      "text-xs font-bold truncate",
                      unlocked ? "text-white" : "text-white/35"
                    )}
                  >
                    {s.label}
                  </p>
                  {!unlocked && (
                    <>
                      <p className="text-[11px] text-white/45 leading-tight mt-0.5 line-clamp-2">
                        {s.unlockLabel}
                      </p>
                      {progress != null && progress > 0 && (
                        <div className="mt-1.5 h-1 rounded-full bg-white/10 overflow-hidden">
                          <div
                            className="h-full bg-indigo-400 transition-all"
                            style={{ width: `${progress * 100}%` }}
                          />
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function FlappyZubatGame({
  selectedSkinId,
  unlockedSkins,
  bestScore,
  lifetimeCoins,
  onSelectSkin,
  onComplete,
  onReady,
}: FlappyZubatGameProps) {
  const [phase, setPhase] = useState<Phase>("lobby");
  const [displayScore, setDisplayScore] = useState(0);
  const [flash, setFlash] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const spriteRef = useRef<HTMLImageElement | null>(null);
  const endedRef = useRef(false);

  const birdYRef = useRef(CANVAS_H / 2);
  const velRef = useRef(0);
  const pipesRef = useRef<FlappyPipe[]>([]);
  const scoreRef = useRef(0);
  const wingRef = useRef(0);
  const scrollRef = useRef(0);
  const pipeIdRef = useRef(0);
  const lastSpawnRef = useRef(0);
  const lastTsRef = useRef(0);

  const skin = getFlappySkin(selectedSkinId);

  useEffect(() => {
    const img = new window.Image();
    img.src = skin.spriteUrl;
    img.onload = () => {
      spriteRef.current = img;
    };
    return () => {
      spriteRef.current = null;
    };
  }, [skin.spriteUrl]);

  const startGame = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    endedRef.current = false;
    birdYRef.current = CANVAS_H / 2;
    velRef.current = FLAPPY_FLAP_VELOCITY * 0.6;
    pipesRef.current = [];
    scoreRef.current = 0;
    wingRef.current = 0;
    scrollRef.current = 0;
    pipeIdRef.current = 0;
    lastSpawnRef.current = performance.now();
    lastTsRef.current = performance.now();
    setDisplayScore(0);
    setFlash(false);
    setPhase("playing");
    playUiConfirm();
  }, []);

  const restartRun = useCallback(() => {
    startGame();
  }, [startGame]);

  useEffect(() => {
    onReady?.(restartRun);
  }, [onReady, restartRun]);

  const endRun = useCallback(
    (score: number) => {
      if (endedRef.current) return;
      endedRef.current = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      setPhase("dead");
      setFlash(true);
      window.setTimeout(() => setFlash(false), 160);
      void playBattleLoss();
      const coins = calcFlappyCoins(score);
      const accountXp = calcFlappyAccountXp(score);
      window.setTimeout(() => {
        onComplete({ score, coins, accountXp });
      }, 620);
    },
    [onComplete]
  );

  const flap = useCallback(() => {
    if (phase !== "playing") return;
    velRef.current = FLAPPY_FLAP_VELOCITY;
    void playFlappyFlap();
  }, [phase]);

  const gameLoop = useCallback(
    (ts: number) => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!canvas || !ctx || phase !== "playing") return;

      const dt = Math.min(32, ts - lastTsRef.current);
      lastTsRef.current = ts;
      const dtScale = dt / 16.67;
      // scroll medido em pixels, na mesma velocidade dos canos (parallax coerente)
      scrollRef.current += FLAPPY_PIPE_SPEED * dtScale;

      velRef.current += FLAPPY_GRAVITY * dtScale;
      birdYRef.current += velRef.current * dtScale;
      wingRef.current += dt * 0.018;

      const tick = tickFlappyPipes(
        pipesRef.current,
        dt,
        CANVAS_W,
        CANVAS_H,
        pipeIdRef.current,
        lastSpawnRef.current,
        ts
      );
      pipesRef.current = tick.pipes;
      pipeIdRef.current = tick.nextId;
      lastSpawnRef.current = tick.lastSpawn;
      if (tick.scoreDelta > 0) {
        scoreRef.current += tick.scoreDelta;
        setDisplayScore(scoreRef.current);
        void playFlappyScore();
      }

      const birdX = CANVAS_W * FLAPPY_BIRD_X_RATIO;
      const groundY = getFlappyGroundY(CANVAS_H);

      if (
        birdYRef.current - FLAPPY_BIRD_SIZE / 2 <= 0 ||
        birdYRef.current + FLAPPY_BIRD_SIZE / 2 >= groundY
      ) {
        birdYRef.current = Math.min(birdYRef.current, groundY - FLAPPY_BIRD_SIZE / 2);
        endRun(scoreRef.current);
        return;
      }

      for (const pipe of pipesRef.current) {
        if (birdHitsPipe(birdX, birdYRef.current, FLAPPY_BIRD_SIZE, pipe)) {
          endRun(scoreRef.current);
          return;
        }
      }

      drawFlappyScene(
        ctx,
        CANVAS_W,
        CANVAS_H,
        birdYRef.current,
        velRef.current,
        wingRef.current,
        pipesRef.current,
        spriteRef.current,
        scrollRef.current,
        skin
      );

      rafRef.current = requestAnimationFrame(gameLoop);
    },
    [phase, endRun, skin]
  );

  useEffect(() => {
    if (phase !== "playing") return;
    rafRef.current = requestAnimationFrame(gameLoop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [phase, gameLoop]);

  useEffect(() => {
    if (phase !== "playing") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "ArrowUp") {
        e.preventDefault();
        flap();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, flap]);

  return (
    <div className="space-y-4">
      {phase === "lobby" && (
        <>
          <FlappySkinPicker
            selectedSkinId={selectedSkinId}
            unlockedSkins={unlockedSkins}
            bestScore={bestScore}
            lifetimeCoins={lifetimeCoins}
            onSelectSkin={onSelectSkin}
          />

          <MinigameLobbyCard
            accent="indigo"
            icon={<Play className="w-7 h-7 fill-current" />}
            title="Flappy Zubat"
            description={
              <>
                Voe por <span className="text-white font-semibold">{skin.scene.location}</span>.
                Toque ou pressione espaço para bater as asas e desviar dos obstáculos.
              </>
            }
            buttonLabel="DECOLAR"
            buttonIcon={<Play className="w-4 h-4 fill-current" />}
            onStart={startGame}
          />
        </>
      )}

      {(phase === "playing" || phase === "dead") && (
        <div
          ref={wrapRef}
          className="relative mx-auto rounded-2xl overflow-hidden border border-white/15 max-w-[360px]"
          style={{
            aspectRatio: `${CANVAS_W}/${CANVAS_H}`,
            boxShadow: `0 0 48px ${skin.accent}33`,
          }}
        >
          <canvas
            ref={canvasRef}
            width={CANVAS_W}
            height={CANVAS_H}
            onPointerDown={flap}
            className="w-full h-full touch-none cursor-pointer pixel-art"
          />

          <motion.div
            key={displayScore}
            initial={{ scale: 1.35, y: -2 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 420, damping: 18 }}
            className="absolute top-4 inset-x-0 flex justify-center pointer-events-none"
          >
            <span
              className="text-4xl font-black tabular-nums"
              style={{
                color: "#fff",
                textShadow: `0 2px 0 rgba(0,0,0,0.5), 0 0 14px ${skin.accent}aa`,
              }}
            >
              {displayScore}
            </span>
          </motion.div>

          {phase === "playing" && displayScore === 0 && (
            <motion.p
              animate={{ opacity: [0.35, 0.7, 0.35] }}
              transition={{ duration: 1.6, repeat: Infinity }}
              className="absolute top-1/3 inset-x-0 text-center text-[11px] text-white/70 pointer-events-none uppercase tracking-[0.2em]"
            >
              Toque para voar
            </motion.p>
          )}

          <AnimatePresence>
            {flash && (
              <motion.div
                key="flash"
                initial={{ opacity: 0.75 }}
                animate={{ opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                className="absolute inset-0 bg-white pointer-events-none"
              />
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
