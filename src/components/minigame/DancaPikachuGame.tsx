"use client";

import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Music,
  Heart,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import Image from "next/image";
import { playCaptureHit, playCaptureMiss, playCapturePerfect, playDanceBGM } from "@/lib/sound-engine";

// --- Tipos e Constantes ---

type LaneId = string;

interface LaneConfig {
  id: LaneId;
  keys: string[];
  label: string;
  Icon?: LucideIcon;
  color: string;
  glow: string;
  bg: string;
  borderGlow: string;
  track: string;
}

interface Note {
  id: string;
  laneId: LaneId;
  timing: number;
  hit: boolean;
  missed: boolean;
}

interface GameConfig {
  lanes: LaneConfig[];
  travelTime: number;
  baseSpawnRate: number;
  hitWindow: number;
}

const LANE_STYLES = {
  purple: {
    color: "text-purple-400",
    glow: "shadow-[0_0_35px_rgba(168,85,247,0.9)]",
    bg: "bg-purple-500/40",
    borderGlow: "border-purple-400",
    track: "bg-purple-400 shadow-[0_0_14px_rgba(168,85,247,0.85)]",
  },
  cyan: {
    color: "text-cyan-400",
    glow: "shadow-[0_0_35px_rgba(34,211,238,0.9)]",
    bg: "bg-cyan-500/40",
    borderGlow: "border-cyan-400",
    track: "bg-cyan-400 shadow-[0_0_14px_rgba(34,211,238,0.85)]",
  },
  emerald: {
    color: "text-emerald-400",
    glow: "shadow-[0_0_35px_rgba(52,211,153,0.9)]",
    bg: "bg-emerald-500/40",
    borderGlow: "border-emerald-400",
    track: "bg-emerald-400 shadow-[0_0_14px_rgba(52,211,153,0.85)]",
  },
  rose: {
    color: "text-rose-400",
    glow: "shadow-[0_0_35px_rgba(251,113,133,0.9)]",
    bg: "bg-rose-500/40",
    borderGlow: "border-rose-400",
    track: "bg-rose-400 shadow-[0_0_14px_rgba(251,113,133,0.85)]",
  },
} as const;

const GAME_CONFIG: GameConfig = {
  lanes: [
    {
      id: "left",
      keys: ["ArrowLeft"],
      label: "←",
      Icon: ArrowLeft,
      ...LANE_STYLES.purple,
    },
    {
      id: "down",
      keys: ["ArrowDown"],
      label: "↓",
      Icon: ArrowDown,
      ...LANE_STYLES.cyan,
    },
    {
      id: "up",
      keys: ["ArrowUp"],
      label: "↑",
      Icon: ArrowUp,
      ...LANE_STYLES.emerald,
    },
    {
      id: "right",
      keys: ["ArrowRight"],
      label: "→",
      Icon: ArrowRight,
      ...LANE_STYLES.rose,
    },
  ],
  travelTime: 1350,
  baseSpawnRate: 520,
  hitWindow: 200,
};

/** Centro do alvo: bottom-12 (48px) + metade do botão (28px) */
const TARGET_CENTER_FROM_BOTTOM = 76;
const NOTE_HALF_HEIGHT = 28;

const NOTE_PATTERNS = [
  ["left", "right", "left", "right"],
  ["up", "down", "up", "down"],
  ["left", "down", "right", "up"],
  ["left", "left", "right", "right"],
  ["up", "down", "down", "up"],
];

export function DancaPikachuGame({
  onComplete,
  onReady,
}: {
  onComplete: (score: number) => void;
  onReady?: (restart: () => void) => void;
}) {
  const [phase, setPhase] = useState<"idle" | "playing" | "ended">("idle");
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [lives, setLives] = useState(3);
  const [notes, setNotes] = useState<Note[]>([]);
  const [lastHitQuality, setLastHitQuality] = useState<string | null>(null);
  const [pikachuAction, setPikachuAction] = useState<LaneId | "idle">("idle");
  const [discoMode, setDiscoMode] = useState(0);
  const [laneFlashes, setLaneFlashes] = useState<Record<LaneId, number>>({});
  const [loseLifeAnimation, setLoseLifeAnimation] = useState(false);
  const [dancingPokemonIds, setDancingPokemonIds] = useState<number[]>([]);
  const [lastLaneHit, setLastLaneHit] = useState<LaneId | null>(null);

  const gameLoopRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const lastNoteTimeRef = useRef<number>(0);
  const scoreRef = useRef(0);
  const pikachuTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const flashTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const patternIndexRef = useRef(0);
  const patternPosRef = useRef(0);
  const bgmRef = useRef<{ stop: () => void } | null>(null);

  const keyToLane = useMemo(() => {
    const map: Record<string, LaneId> = {};
    for (const lane of GAME_CONFIG.lanes) {
      for (const key of lane.keys) map[key] = lane.id;
    }
    return map;
  }, []);

  scoreRef.current = score;

  const finishGame = useCallback(() => {
    setPhase("ended");
    if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    if (bgmRef.current) bgmRef.current.stop();
    onComplete(scoreRef.current);
  }, [onComplete]);

  const startGame = useCallback(() => {
    setPhase("playing");
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setLives(3);
    setNotes([]);
    setLaneFlashes({});
    setDiscoMode(0);
    setDancingPokemonIds([]);
    setLastLaneHit(null);
    startTimeRef.current = performance.now();
    lastNoteTimeRef.current = 0;
    patternIndexRef.current = 0;
    patternPosRef.current = 0;

    void playDanceBGM().then((bgm) => {
      bgmRef.current = bgm;
    });
  }, []);

  useEffect(() => {
    onReady?.(startGame);
    return () => {
      if (bgmRef.current) bgmRef.current.stop();
      if (pikachuTimeoutRef.current) clearTimeout(pikachuTimeoutRef.current);
      if (flashTimeoutRef.current) clearTimeout(flashTimeoutRef.current);
    };
  }, [onReady, startGame]);

  const flashLane = useCallback((laneId: LaneId) => {
    const t = performance.now();
    setLaneFlashes((prev) => ({ ...prev, [laneId]: t }));
    setLastLaneHit(laneId);
    
    if (flashTimeoutRef.current) clearTimeout(flashTimeoutRef.current);
    flashTimeoutRef.current = setTimeout(() => {
      setLastLaneHit(null);
      setLaneFlashes((prev) => {
        if (prev[laneId] !== t) return prev;
        const next = { ...prev };
        delete next[laneId];
        return next;
      });
    }, 450);
  }, []);

  const handleInput = useCallback(
    (laneId: LaneId) => {
      if (phase !== "playing") return;

      const currentTime = performance.now() - startTimeRef.current;

      setNotes((prev) => {
        let foundHit = false;
        const nextNotes = prev.map((note) => {
          if (!note.hit && !note.missed && note.laneId === laneId) {
            const diff = Math.abs(note.timing - currentTime);
            if (diff < GAME_CONFIG.hitWindow && !foundHit) {
              foundHit = true;
              note.hit = true;

              const quality = diff < GAME_CONFIG.hitWindow / 2.5 ? "PERFECT" : "GOOD";
              setLastHitQuality(quality);
              setPikachuAction(laneId);
              setDiscoMode((d) => d + 1);
              flashLane(laneId);

              if (pikachuTimeoutRef.current) clearTimeout(pikachuTimeoutRef.current);
              pikachuTimeoutRef.current = setTimeout(() => {
                setPikachuAction("idle");
                setLastHitQuality(null);
              }, 350);

              setCombo((c) => {
                const next = c + 1;
                setMaxCombo((m) => Math.max(m, next));

                // Adiciona novos pokémons dançantes a cada 10 de combo
                if (next % 10 === 0 && next > 0) {
                  setDancingPokemonIds((currentIds) => {
                    if (currentIds.length >= 8) return currentIds;
                    const pool = [1, 4, 7, 39, 133, 150, 151, 52, 113, 143];
                    const newId = pool[Math.floor(Math.random() * pool.length)];
                    return [...currentIds, newId];
                  });
                }

                setScore((s) => {
                  let points = quality === "PERFECT" ? 100 : 50;
                  if (next >= 10) points = Math.round(points * 1.5);
                  if (next >= 25) points = Math.round(points * 2);
                  if (next >= 50) points = Math.round(points * 2.5);
                  return s + points;
                });

                return next;
              });

              if (quality === "PERFECT") void playCapturePerfect();
              else void playCaptureHit();

              return note;
            }
          }
          return note;
        });

        // Removido o reset do combo aqui para evitar frustração com toques extras.
        // O combo agora só reseta no tick() quando uma nota passa direto (miss).
        return nextNotes;
      });
    },
    [phase, flashLane]
  );

  useEffect(() => {
    const downHandler = (e: KeyboardEvent) => {
      if (["ArrowLeft", "ArrowDown", "ArrowUp", "ArrowRight"].includes(e.key)) {
        e.preventDefault();
      }
      if (phase !== "playing") return;

      const laneId = keyToLane[e.key] ?? keyToLane[e.code];
      if (laneId) handleInput(laneId);
    };
    window.addEventListener("keydown", downHandler);
    return () => window.removeEventListener("keydown", downHandler);
  }, [handleInput, phase, keyToLane]);

  useEffect(() => {
    if (phase !== "playing") return;

    const tick = (now: number) => {
      const currentTime = now - startTimeRef.current;

      let spawnRate = GAME_CONFIG.baseSpawnRate;
      if (currentTime > 8000) spawnRate *= 0.88;
      if (currentTime > 16000) spawnRate *= 0.82;
      if (currentTime > 28000) spawnRate *= 0.75;
      spawnRate = Math.max(240, spawnRate);

      if (currentTime - lastNoteTimeRef.current > spawnRate) {
        const currentPattern = NOTE_PATTERNS[patternIndexRef.current % NOTE_PATTERNS.length];
        const laneId = currentPattern[patternPosRef.current % currentPattern.length];

        patternPosRef.current++;
        if (patternPosRef.current % currentPattern.length === 0) {
          patternIndexRef.current++;
        }

        setNotes((prev) => [
          ...prev,
          {
            id: Math.random().toString(36).slice(2, 11),
            laneId,
            timing: currentTime + GAME_CONFIG.travelTime,
            hit: false,
            missed: false,
          },
        ]);
        lastNoteTimeRef.current = currentTime;
      }

      setNotes((prev) => {
        let missedCount = 0;
        const next = prev.map((note) => {
          if (!note.hit && !note.missed && currentTime > note.timing + GAME_CONFIG.hitWindow / 2) {
            note.missed = true;
            missedCount++;
            void playCaptureMiss();
          }
          return note;
        });

        if (missedCount > 0) {
          setCombo(0);
          setLoseLifeAnimation(true);
          setTimeout(() => setLoseLifeAnimation(false), 300);

          setLives((l) => {
            const nextL = l - missedCount;
            if (nextL <= 0) {
              setTimeout(() => finishGame(), 50);
              return 0;
            }
            return nextL;
          });
        }

        return next.filter((n) => currentTime < n.timing + 1000);
      });

      gameLoopRef.current = requestAnimationFrame(tick);
    };

    gameLoopRef.current = requestAnimationFrame(tick);
    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    };
  }, [phase, finishGame]);

  if (phase === "idle") {
    return (
      <div className="glass-card p-8 text-center space-y-4 border border-white/10">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-yellow-500/15 border border-yellow-500/30 flex items-center justify-center">
          <Music className="w-7 h-7 text-yellow-400" />
        </div>
        <h3 className="text-xl font-bold">Dança Pikachu</h3>
        <p className="text-white/50 text-sm leading-relaxed">
          Siga o ritmo com as setas do teclado. Acerte no centro dos alvos — a base acende como
          numa discoteca. Você tem 3 vidas: perdeu 3 notas, o show acaba!
        </p>
        <AnimatedButton variant="primary" size="lg" onClick={startGame} className="w-full max-w-xs mx-auto">
          COMEÇAR!
        </AnimatedButton>
      </div>
    );
  }

  const discoColor = [
    "from-purple-500/20",
    "from-cyan-500/20",
    "from-emerald-500/20",
    "from-rose-500/20",
    "from-amber-500/20",
    "from-pink-500/20",
  ][discoMode % 6];

  const travelTime = GAME_CONFIG.travelTime;

  return (
    <div className="flex flex-col gap-4 w-full max-w-md mx-auto h-[620px]">
      <div
        className={cn(
          "w-full flex justify-between items-center glass-card p-4 h-[72px] border border-white/10 transition-all duration-300",
          loseLifeAnimation && "border-rose-500/50 bg-rose-500/10"
        )}
      >
        <div className="flex gap-1.5 w-24">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              animate={
                loseLifeAnimation && i === lives
                  ? { scale: [1, 0.5, 1], opacity: [1, 0.3, 1] }
                  : {}
              }
              transition={{ duration: 0.3 }}
            >
              <Heart
                className={cn(
                  "w-5 h-5 transition-all duration-300",
                  i < lives
                    ? "text-rose-500 fill-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.6)]"
                    : "text-white/5"
                )}
              />
            </motion.div>
          ))}
        </div>
        <div className="text-center flex-1">
          <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest">
            Pontos
          </p>
          <p className="text-xl font-black text-amber-400 drop-shadow-sm tabular-nums">
            {score}
          </p>
        </div>
        <div className="text-right w-24">
          <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest">
            Combo
          </p>
          <motion.p
            animate={combo > maxCombo * 0.8 ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 0.3 }}
            className={cn(
              "text-xl font-black tabular-nums",
              combo >= 50
                ? "text-pink-400"
                : combo >= 25
                  ? "text-orange-400"
                  : combo >= 10
                    ? "text-yellow-400"
                    : "text-emerald-400"
            )}
          >
            {combo}
          </motion.p>
          {combo >= 10 && (
            <motion.p
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-[10px] font-bold text-amber-300 tracking-tight"
            >
              {combo >= 50 ? "2.5x" : combo >= 25 ? "2x" : "1.5x"}
            </motion.p>
          )}
        </div>
      </div>

      <div
        className={cn(
          "relative flex-1 glass-card bg-slate-950/80 overflow-hidden flex flex-col border border-white/5 transition-colors duration-300 bg-gradient-to-b to-transparent",
          discoColor
        )}
      >
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            animate={{
              opacity: discoMode > 0 ? [0.15, 0.45, 0.15] : [0.1, 0.2, 0.1],
            }}
            transition={{ duration: discoMode > 0 ? 0.4 : 2, repeat: Infinity }}
            className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_100%,rgba(255,255,255,0.15),transparent_60%)]"
          />
        </div>

        <div className="absolute top-16 left-0 right-0 flex justify-center z-10 pointer-events-none">
          <motion.div
            animate={
              pikachuAction !== "idle"
                ? {
                    y: [-10, -60, -10],
                    scale: [1, 1.4, 0.9, 1],
                    rotate:
                      pikachuAction === "left"
                        ? -25
                        : pikachuAction === "right"
                          ? 25
                          : pikachuAction === "up"
                            ? -5
                            : 5,
                    filter: ["brightness(1)", "brightness(1.6)", "brightness(1)"],
                  }
                : loseLifeAnimation
                  ? {
                      x: [-20, 20, -10, 10, 0],
                      filter: ["brightness(1)", "brightness(0.7)", "brightness(1)"],
                    }
                  : { y: [0, -12, 0], scale: [1, 1.05, 1] }
            }
            transition={{
              duration: loseLifeAnimation ? 0.4 : pikachuAction !== "idle" ? 0.3 : 1.5,
              repeat: pikachuAction === "idle" && !loseLifeAnimation ? Infinity : 0,
              ease: "easeOut",
            }}
          >
            <Image
              src="/sprites/25.png"
              alt="Pikachu"
              width={150}
              height={150}
              className="object-contain drop-shadow-[0_0_30px_rgba(250,204,21,0.6)]"
              unoptimized
            />
          </motion.div>

          <AnimatePresence>
            {lastHitQuality && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.5 }}
                animate={{ opacity: 1, y: -50, scale: 1.3 }}
                exit={{ opacity: 0 }}
                className="absolute top-0 flex flex-col items-center"
              >
                <p
                  className={cn(
                    "font-black text-4xl italic tracking-tighter drop-shadow-xl select-none",
                    lastHitQuality === "PERFECT" ? "text-amber-400" : "text-emerald-400"
                  )}
                >
                  {lastHitQuality}
                </p>
                {combo > 0 && (
                  <motion.p
                    initial={{ scale: 0.5 }}
                    animate={{ scale: 1 }}
                    className="text-xl font-black text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]"
                  >
                    {combo}x
                  </motion.p>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Outros Pokémons Dançantes (Platéia) */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {dancingPokemonIds.map((id, index) => {
              // Posições fixas para os slots da platéia
              const slots = [
                { x: -140, y: 80, rot: -10 },
                { x: 140, y: 80, rot: 10 },
                { x: -130, y: 180, rot: -15 },
                { x: 130, y: 180, rot: 15 },
                { x: -150, y: 280, rot: -5 },
                { x: 150, y: 280, rot: 5 },
                { x: -110, y: 40, rot: -20 },
                { x: 110, y: 40, rot: 20 },
              ];
              const pos = slots[index % slots.length];
              
              return (
                <motion.div
                  key={`audience-${index}-${id}`}
                  initial={{ opacity: 0, scale: 0, x: pos.x, y: pos.y + 50 }}
                  animate={{ 
                    opacity: 0.65, 
                    scale: 0.75,
                    x: pos.x,
                    y: pos.y,
                    rotate: pos.rot,
                  }}
                  className="absolute left-1/2 top-0"
                >
                  <motion.div
                    animate={{
                      y: [0, -15, 0],
                      scale: [1, 1.1, 0.95, 1],
                      rotate: [pos.rot, pos.rot + 5, pos.rot - 5, pos.rot],
                    }}
                    transition={{
                      duration: 1.2,
                      repeat: Infinity,
                      delay: index * 0.15,
                      ease: "easeInOut"
                    }}
                  >
                    <Image
                      src={`/sprites/${id}.png`}
                      alt="Dancing Audience"
                      width={70}
                      height={70}
                      className="object-contain filter brightness-110 drop-shadow-[0_0_12px_rgba(255,255,255,0.2)]"
                      unoptimized
                    />
                  </motion.div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Efeito de Flash na Tela ao acertar - Na cor da pista */}
        <AnimatePresence>
          {Object.entries(laneFlashes).map(([laneId, timestamp]) => {
            const lane = GAME_CONFIG.lanes.find((l) => l.id === laneId);
            if (!lane) return null;
            return (
              <motion.div
                key={`flash-${laneId}-${timestamp}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.15 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className={cn("absolute inset-0 pointer-events-none z-40", lane.bg)}
              />
            );
          })}
        </AnimatePresence>

        {/* Pistas: nota e alvo na mesma coluna = alinhamento perfeito */}
        <div
          className="absolute inset-0 grid"
          style={{ gridTemplateColumns: `repeat(${GAME_CONFIG.lanes.length}, minmax(0, 1fr))` }}
        >
          {GAME_CONFIG.lanes.map((lane) => {
            const Icon = lane.Icon;
            const isPikachuLane = pikachuAction === lane.id;
            const flashAt = laneFlashes[lane.id];
            const isDiscoHit = flashAt != null && performance.now() - flashAt < 450;
            const laneNotes = notes.filter((n) => n.laneId === lane.id && !n.hit);

            return (
              <div
                key={lane.id}
                className="relative h-full border-x border-white/5 overflow-hidden"
              >
                {/* Trilho vertical — acende na cor da pista ao acertar */}
                <div
                  className={cn(
                    "absolute top-2 bottom-[5.5rem] left-1/2 -translate-x-1/2 rounded-full transition-all duration-300",
                    isDiscoHit || isPikachuLane
                      ? cn("w-[3px] opacity-95", lane.track)
                      : "w-px opacity-25 bg-white/35"
                  )}
                />

                {/* Notas desta pista */}
                {laneNotes.map((note) => (
                  <NoteVisual
                    key={note.id}
                    note={note}
                    startTime={startTimeRef.current}
                    travelTime={travelTime}
                    lane={lane}
                  />
                ))}

                {/* Alvo / base */}
                <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-14 h-14 z-20">
                  <motion.div
                    animate={
                      isDiscoHit
                        ? {
                            scale: [1, 1.45, 1.15],
                            boxShadow: [
                              "0 0 0px transparent",
                              "0 0 40px rgba(255,255,255,0.8)",
                              "0 0 20px rgba(255,255,255,0.3)",
                            ],
                          }
                        : isPikachuLane
                          ? { scale: 1.2 }
                          : { scale: 1 }
                    }
                    transition={{ duration: 0.35, ease: "easeOut" }}
                    className={cn(
                      "relative w-full h-full rounded-2xl border-2 flex items-center justify-center transition-colors",
                      isDiscoHit
                        ? cn("border-white/80", lane.bg, lane.glow)
                        : isPikachuLane
                          ? cn("border-white/40 bg-white/15", lane.glow)
                          : "border-white/10 bg-white/[0.03]"
                    )}
                  >
                    {Icon ? (
                      <Icon
                        className={cn(
                          "w-8 h-8 transition-all duration-100",
                          isDiscoHit || isPikachuLane ? cn("opacity-100", lane.color) : "opacity-25 text-white/40"
                        )}
                      />
                    ) : (
                      <span
                        className={cn(
                          "text-xl font-black transition-all",
                          isDiscoHit || isPikachuLane ? lane.color : "text-white/25"
                        )}
                      >
                        {lane.label}
                      </span>
                    )}
                  </motion.div>

                  <AnimatePresence>
                    {isDiscoHit && (
                      <>
                        <motion.div
                          initial={{ scale: 0.6, opacity: 1 }}
                          animate={{ scale: 2.8, opacity: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.45 }}
                          className={cn(
                            "absolute inset-0 rounded-2xl border-2 pointer-events-none",
                            lane.borderGlow
                          )}
                        />
                        <motion.div
                          initial={{ opacity: 0.9 }}
                          animate={{ opacity: 0 }}
                          transition={{ duration: 0.35 }}
                          className={cn(
                            "absolute -inset-3 rounded-3xl blur-md pointer-events-none",
                            lane.bg
                          )}
                        />
                      </>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function NoteVisual({
  note,
  startTime,
  travelTime,
  lane,
}: {
  note: Note;
  startTime: number;
  travelTime: number;
  lane: LaneConfig;
}) {
  const [progress, setProgress] = useState(0);
  const rafRef = useRef<number>();

  useEffect(() => {
    const update = (now: number) => {
      const elapsed = now - startTime;
      const remaining = note.timing - elapsed;
      const p = 1 - remaining / travelTime;
      setProgress(Math.min(1.15, Math.max(0, p)));

      if (p < 1.15) {
        rafRef.current = requestAnimationFrame(update);
      }
    };
    rafRef.current = requestAnimationFrame(update);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [note.timing, startTime, travelTime]);

  const Icon = lane.Icon;
  const hitTop = `calc(${progress * 100}% - ${TARGET_CENTER_FROM_BOTTOM + NOTE_HALF_HEIGHT}px)`;

  return (
    <div
      className={cn(
        "absolute left-1/2 -translate-x-1/2 w-14 h-14 flex items-center justify-center z-10",
        note.missed ? "opacity-0" : "opacity-100"
      )}
      style={{ top: hitTop }}
    >
      <div
        className={cn(
          "w-14 h-14 rounded-2xl flex items-center justify-center border-2 border-white/25 shadow-lg",
          lane.bg
        )}
      >
        {Icon ? (
          <Icon className={cn("w-8 h-8", lane.color)} />
        ) : (
          <span className={cn("text-xl font-black", lane.color)}>{lane.label}</span>
        )}
      </div>
    </div>
  );
}
