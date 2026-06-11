"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Check, Lock, Play, Sparkles, Trophy } from "lucide-react";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
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
  tickFlappyPipes,
  type FlappyPipe,
} from "@/lib/flappy-zubat-engine";
import { drawFlappyScene } from "@/lib/flappy-zubat-render";
import { playBattleLoss, playJitsuRoundWin } from "@/lib/sound-engine";
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
      <div className="relative overflow-hidden rounded-xl border-4 border-[#306850] bg-[#081820] shadow-[inset_0_0_0_2px_#0f380f,0_0_24px_rgba(155,188,15,0.12)]">
        <div
          className="absolute inset-0 opacity-[0.07] pointer-events-none"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(155,188,15,0.5) 2px, rgba(155,188,15,0.5) 3px)",
          }}
        />
        <div className="relative px-4 py-3 flex items-center justify-between border-b-2 border-[#306850] bg-[#0f2847]/80">
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#9bbc0f]">
            PC · Escolher Pokemon
          </p>
          {bestScore > 0 && (
            <span className="text-[10px] font-bold text-[#8bac0f] flex items-center gap-1 tabular-nums font-mono">
              <Trophy className="w-3 h-3" /> REC {bestScore}
            </span>
          )}
        </div>

        <div className="relative p-4 flex flex-col sm:flex-row gap-4 items-center">
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
            className="relative w-28 h-28 shrink-0 rounded-lg border-2 border-[#306850] bg-[#0f380f]/60 flex items-center justify-center"
            style={{ boxShadow: `inset 0 0 20px ${selected.accent}33` }}
          >
            <Image
              src={selected.spriteUrl}
              alt=""
              width={96}
              height={96}
              className="pixel-art w-20 h-20 object-contain drop-shadow-[2px_2px_0_#0f380f]"
              unoptimized
            />
          </motion.div>

          <div className="flex-1 text-center sm:text-left min-w-0">
            <p className="text-[10px] font-mono text-[#8bac0f]/70 uppercase tracking-wider">
              No. {String(selected.dexNo).padStart(3, "0")}
            </p>
            <h3 className="text-lg font-black text-[#e8f5e9]" style={{ color: selected.accent }}>
              {selected.label}
            </h3>
            <p className="text-[11px] text-[#9bbc0f]/55 mt-1 font-mono">
              Torre Lavender · Rota Noturna
            </p>
            <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded border border-[#306850] bg-[#0f380f]/40 text-[9px] font-bold text-[#9bbc0f] uppercase">
              <Sparkles className="w-3 h-3" /> Skin ativa
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
                "relative text-left rounded-xl border-2 p-2.5 transition-all duration-200",
                "bg-[#081820]",
                unlocked && !selectedCard && "border-[#306850] hover:border-[#8bac0f]/50 hover:bg-[#0f2847]/80",
                selectedCard && unlocked && "border-[#9bbc0f] bg-[#0f380f]/50 shadow-[0_0_16px_rgba(155,188,15,0.2)]",
                !unlocked && "border-[#1a1a2e] opacity-90 cursor-not-allowed"
              )}
            >
              {selectedCard && unlocked && (
                <span className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-[#9bbc0f] flex items-center justify-center">
                  <Check className="w-3 h-3 text-[#081820]" strokeWidth={3} />
                </span>
              )}

              <div className="flex items-start gap-2">
                <div
                  className={cn(
                    "relative w-12 h-12 shrink-0 rounded-lg border flex items-center justify-center",
                    unlocked ? "border-[#306850] bg-[#0f380f]/40" : "border-[#303030] bg-black/40"
                  )}
                >
                  <Image
                    src={s.spriteUrl}
                    alt=""
                    width={40}
                    height={40}
                    className={cn(
                      "pixel-art w-9 h-9 object-contain",
                      !unlocked && "brightness-0 opacity-35"
                    )}
                    unoptimized
                  />
                  {!unlocked && (
                    <Lock className="absolute w-4 h-4 text-white/40 drop-shadow" />
                  )}
                </div>

                <div className="min-w-0 flex-1 pt-0.5">
                  <p className="text-[9px] font-mono text-[#8bac0f]/50">
                    #{String(s.dexNo).padStart(3, "0")}
                  </p>
                  <p
                    className={cn(
                      "text-xs font-black truncate",
                      unlocked ? "text-[#e8f5e9]" : "text-white/35"
                    )}
                  >
                    {s.label}
                  </p>
                  {!unlocked && (
                    <>
                      <p className="text-[8px] text-white/30 leading-tight mt-0.5 line-clamp-2">
                        {s.unlockLabel}
                      </p>
                      {progress != null && progress > 0 && (
                        <div className="mt-1.5 h-1 rounded-full bg-[#0f380f] overflow-hidden">
                          <div
                            className="h-full bg-[#8bac0f] transition-all"
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
    img.crossOrigin = "anonymous";
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
      void playBattleLoss();
      const coins = calcFlappyCoins(score);
      const accountXp = calcFlappyAccountXp(score);
      window.setTimeout(() => {
        onComplete({ score, coins, accountXp });
      }, 400);
    },
    [onComplete]
  );

  const flap = useCallback(() => {
    if (phase !== "playing") return;
    velRef.current = FLAPPY_FLAP_VELOCITY;
  }, [phase]);

  const gameLoop = useCallback(
    (ts: number) => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!canvas || !ctx || phase !== "playing") return;

      const dt = Math.min(32, ts - lastTsRef.current);
      lastTsRef.current = ts;
      scrollRef.current += dt;

      velRef.current += FLAPPY_GRAVITY * (dt / 16.67);
      birdYRef.current += velRef.current * (dt / 16.67);
      wingRef.current += dt * 0.012;

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
        void playJitsuRoundWin("AGUA");
      }

      const birdX = CANVAS_W * FLAPPY_BIRD_X_RATIO;

      if (
        birdYRef.current - FLAPPY_BIRD_SIZE / 2 <= 0 ||
        birdYRef.current + FLAPPY_BIRD_SIZE / 2 >= CANVAS_H
      ) {
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
        wingRef.current,
        pipesRef.current,
        scoreRef.current,
        spriteRef.current,
        scrollRef.current
      );

      rafRef.current = requestAnimationFrame(gameLoop);
    },
    [phase, endRun]
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

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border-2 border-[#306850] bg-[#081820]/90 p-5 text-center space-y-3"
          >
            <p className="text-[#9bbc0f]/70 text-sm font-mono leading-relaxed">
              Voe pela rota noturna ate a Torre Lavender.
              <br />
              Toque ou pressione espaco para bater as asas.
            </p>
            <AnimatedButton
              variant="primary"
              size="lg"
              onClick={startGame}
              icon={<Play className="w-4 h-4 fill-current" />}
              className="w-full max-w-xs mx-auto !bg-[#306850] hover:!from-[#306850] hover:!to-[#8bac0f] !border-[#9bbc0f]/40 font-black tracking-wider"
            >
              DECOLAR
            </AnimatedButton>
          </motion.div>
        </>
      )}

      {(phase === "playing" || phase === "dead") && (
        <div
          ref={wrapRef}
          className="relative mx-auto rounded-lg overflow-hidden border-4 border-[#306850] shadow-[0_0_32px_rgba(15,56,15,0.35),inset_0_0_0_2px_#0f380f] max-w-[360px]"
          style={{ aspectRatio: `${CANVAS_W}/${CANVAS_H}` }}
        >
          <canvas
            ref={canvasRef}
            width={CANVAS_W}
            height={CANVAS_H}
            onPointerDown={flap}
            className="w-full h-full touch-none cursor-pointer bg-[#081820] pixel-art"
          />
          {phase === "playing" && (
            <p className="absolute bottom-2 inset-x-0 text-center text-[9px] text-[#9bbc0f]/50 pointer-events-none font-mono uppercase tracking-wider">
              Toque para voar
            </p>
          )}
        </div>
      )}
    </div>
  );
}
