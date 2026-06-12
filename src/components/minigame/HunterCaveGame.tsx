"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Coins, Ghost, Shield, Sparkles } from "lucide-react";
import { MinigameLobbyCard } from "@/components/minigame/MinigameLobbyCard";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { PokeballIcon } from "@/components/ui/PokeballIcon";
import {
  HUNTER_ENTRY_COST,
} from "@/data/economy-balance";
import { getPokemonById } from "@/data/pokemon";
import {
  addToPot,
  getRoundReward,
  rollHaunterIndex,
} from "@/lib/hunter-cave-engine";
import { playBattleLoss, playCoinGain } from "@/lib/sound-engine";
import { playUiConfirm } from "@/lib/ui-sounds";
import { isLocalAsset } from "@/lib/image-utils";
import { cn } from "@/lib/utils";

const HAUNTER = getPokemonById(93)!;

export interface HunterCaveResult {
  fled: boolean;
  pot: number;
  roundsCleared: number;
  entryCost: number;
}

interface HunterCaveGameProps {
  coins: number;
  bestPot: number;
  onStart: () => boolean;
  onComplete: (result: HunterCaveResult) => void;
  onReady?: (restart: () => void) => void;
}

type Phase = "idle" | "playing" | "reveal" | "haunter" | "ended";

export function HunterCaveGame({
  coins,
  bestPot,
  onStart,
  onComplete,
  onReady,
}: HunterCaveGameProps) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [pot, setPot] = useState(0);
  const [round, setRound] = useState(0);
  const [haunterIndex, setHaunterIndex] = useState<number | null>(null);
  const [pickedIndex, setPickedIndex] = useState<number | null>(null);
  const [openedIndices, setOpenedIndices] = useState<number[]>([]);
  const [shake, setShake] = useState(false);
  const endedRef = useRef(false);

  const resetToIdle = useCallback(() => {
    endedRef.current = false;
    setPhase("idle");
    setPot(0);
    setRound(0);
    setHaunterIndex(null);
    setPickedIndex(null);
    setOpenedIndices([]);
    setShake(false);
  }, []);

  const startRun = useCallback(() => {
    if (!onStart()) return;
    endedRef.current = false;
    setPot(0);
    setRound(1);
    setHaunterIndex(rollHaunterIndex());
    setPickedIndex(null);
    setOpenedIndices([]);
    setShake(false);
    setPhase("playing");
    playUiConfirm();
  }, [onStart]);

  useEffect(() => {
    onReady?.(resetToIdle);
  }, [onReady, resetToIdle]);

  const beginNextRound = useCallback(() => {
    const nextRound = round + 1;
    setRound(nextRound);
    setHaunterIndex(rollHaunterIndex());
    setPickedIndex(null);
    setOpenedIndices([]);
    setPhase("playing");
  }, [round]);

  const flee = useCallback(() => {
    if (phase !== "playing" || pot <= 0 || endedRef.current) return;
    endedRef.current = true;
    setPhase("ended");
    void playCoinGain();
    onComplete({
      fled: true,
      pot,
      roundsCleared: round,
      entryCost: HUNTER_ENTRY_COST,
    });
  }, [phase, pot, round, onComplete]);

  const pickBall = useCallback(
    async (index: number) => {
      if (phase !== "playing" || haunterIndex == null || endedRef.current) return;

      setPickedIndex(index);
      setPhase("reveal");

      if (index === haunterIndex) {
        await new Promise((r) => setTimeout(r, 420));
        setShake(true);
        setPhase("haunter");
        void playBattleLoss();
        await new Promise((r) => setTimeout(r, 1400));
        endedRef.current = true;
        setPhase("ended");
        onComplete({
          fled: false,
          pot: 0,
          roundsCleared: round - 1,
          entryCost: HUNTER_ENTRY_COST,
        });
        return;
      }

      const reward = getRoundReward(round);
      void playCoinGain();
      setOpenedIndices([index]);
      await new Promise((r) => setTimeout(r, 680));
      setPot((p) => addToPot(p, reward));
      await new Promise((r) => setTimeout(r, 420));
      beginNextRound();
    },
    [phase, haunterIndex, round, beginNextRound, onComplete]
  );

  const profit = pot - HUNTER_ENTRY_COST;
  const canAfford = coins >= HUNTER_ENTRY_COST;

  if (phase === "idle") {
    return (
      <MinigameLobbyCard
        accent="violet"
        icon={<Ghost className="w-8 h-8" />}
        title="Caverna dos Hunter"
        description="Pokébolas misteriosas escondem moedas — ou um Haunter faminto. Fuja a tempo ou perca tudo."
        buttonLabel={canAfford ? "ENTRAR NA CAVERNA" : "Moedas insuficientes"}
        onStart={startRun}
        disabled={!canAfford}
      >
        <div className="relative rounded-xl border border-violet-500/20 bg-violet-500/5 px-4 py-3 text-sm space-y-1 max-w-xs mx-auto">
          <p className="text-white/45">
            Entrada:{" "}
            <span className="text-amber-300 font-bold">{HUNTER_ENTRY_COST} moedas</span>
          </p>
          {bestPot > 0 && (
            <p className="text-white/35 text-xs">
              Melhor fuga: <span className="text-emerald-300 font-semibold">{bestPot} moedas</span>
            </p>
          )}
        </div>
      </MinigameLobbyCard>
    );
  }

  return (
    <motion.div
      animate={shake ? { x: [0, -10, 10, -8, 8, -4, 0] } : { x: 0 }}
      transition={{ duration: 0.45 }}
      className={cn(
        "relative rounded-2xl overflow-hidden border border-violet-500/30 min-h-[440px] shadow-[0_0_48px_rgba(88,28,135,0.2)]",
        phase === "haunter" && "grayscale-[0.85] contrast-90"
      )}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 90% 70% at 50% 100%, rgba(88,28,135,0.45), transparent 65%), radial-gradient(ellipse 50% 35% at 15% 15%, rgba(99,102,241,0.25), transparent 55%), linear-gradient(180deg, #0a0618 0%, #1e1b4b 40%, #0c0a1a 100%)",
        }}
      />
      <motion.div
        className="absolute inset-0 pointer-events-none opacity-30"
        animate={{ opacity: [0.15, 0.35, 0.15] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 50% 60%, rgba(139,92,246,0.35), transparent 70%)",
        }}
      />
      <div
        className="absolute top-0 inset-x-0 h-16 pointer-events-none opacity-20"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, transparent, transparent 18px, rgba(167,139,250,0.15) 18px, rgba(167,139,250,0.15) 20px)",
        }}
      />

      <div className="relative z-10 p-5 sm:p-6 flex flex-col min-h-[420px]">
        <>
            <div className="flex items-center justify-between gap-2 mb-6">
              <div className="text-left">
                <p className="text-[10px] uppercase tracking-wider text-white/35 font-bold">
                  Rodada {Math.max(1, round)}
                </p>
                <p className="text-xs text-white/50">
                  Investido:{" "}
                  <span className="text-rose-300/90 font-semibold">{HUNTER_ENTRY_COST}</span>
                </p>
              </div>
              <motion.div
                key={pot}
                initial={{ scale: 1.08 }}
                animate={{ scale: 1 }}
                className="glass-card px-3 py-2 rounded-xl border border-amber-500/25 text-center min-w-[7rem]"
              >
                <p className="text-[9px] uppercase text-white/40 font-bold tracking-wider">Pote</p>
                <p className="text-lg font-black text-amber-300 tabular-nums flex items-center justify-center gap-1">
                  <Coins className="w-4 h-4" />
                  {pot}
                </p>
                {pot > 0 && (
                  <p
                    className={cn(
                      "text-[10px] font-semibold tabular-nums",
                      profit >= 0 ? "text-emerald-400" : "text-rose-400"
                    )}
                  >
                    {profit >= 0 ? "+" : ""}
                    {profit} lucro
                  </p>
                )}
              </motion.div>
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-wider text-white/35 font-bold">Pote</p>
                <p className="text-xs text-emerald-300/80 font-semibold">Sem limite</p>
              </div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center gap-6">
              <p className="text-xs text-violet-200/60 font-medium text-center">
                {phase === "playing"
                  ? "Escolha uma Pokébola..."
                  : phase === "reveal"
                    ? "Abrindo..."
                    : phase === "haunter"
                      ? "Haunter apareceu!"
                      : ""}
              </p>

              <div className="flex items-center justify-center gap-3 sm:gap-6 py-2">
                {[0, 1, 2, 3].map((i) => {
                  const isHaunterReveal =
                    (phase === "reveal" || phase === "haunter") &&
                    pickedIndex === i &&
                    haunterIndex === i;
                  const isSafeReveal =
                    phase === "reveal" && pickedIndex === i && haunterIndex !== i;
                  const isOpened = openedIndices.includes(i);

                  return (
                    <motion.button
                      key={i}
                      type="button"
                      disabled={phase !== "playing"}
                      onClick={() => void pickBall(i)}
                      whileHover={phase === "playing" ? { y: -6, scale: 1.06 } : undefined}
                      whileTap={phase === "playing" ? { scale: 0.94 } : undefined}
                      animate={
                        phase === "playing"
                          ? { scale: [1, 1.04, 1], opacity: [0.85, 1, 0.85] }
                          : { scale: 1, opacity: 1 }
                      }
                      transition={
                        phase === "playing"
                          ? { duration: 2.2, repeat: Infinity, delay: i * 0.15 }
                          : { duration: 0.25 }
                      }
                      className={cn(
                        "relative w-[4.75rem] h-[4.75rem] sm:w-[5.25rem] sm:h-[5.25rem] rounded-2xl flex items-center justify-center transition-all",
                        phase === "playing" &&
                          "cursor-pointer bg-gradient-to-b from-violet-950/60 to-black/40 border border-violet-400/30 hover:border-amber-400/50 hover:shadow-[0_0_32px_rgba(251,191,36,0.25)] hover:-translate-y-1",
                        phase !== "playing" && "cursor-default bg-black/25 border border-white/10",
                        isSafeReveal && "border-emerald-400/55 shadow-[0_0_32px_rgba(52,211,153,0.4)]",
                        isHaunterReveal && "border-violet-300/60 shadow-[0_0_40px_rgba(139,92,246,0.5)]"
                      )}
                    >
                      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-12 h-2 rounded-full bg-black/50 blur-sm pointer-events-none" />
                      <AnimatePresence mode="wait">
                        {isHaunterReveal ? (
                          <motion.div
                            key="haunter"
                            initial={{ scale: 0, rotate: -20, opacity: 0 }}
                            animate={{ scale: 1.15, rotate: 0, opacity: 1 }}
                            className="relative"
                          >
                            <Image
                              src={HAUNTER.image}
                              alt=""
                              width={56}
                              height={56}
                              className="object-contain drop-shadow-[0_0_16px_rgba(139,92,246,0.8)]"
                              unoptimized={!isLocalAsset(HAUNTER.image)}
                            />
                            <motion.div
                              animate={{ opacity: [0.4, 1, 0.4] }}
                              transition={{ duration: 0.5, repeat: Infinity }}
                              className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444]"
                            />
                          </motion.div>
                        ) : isSafeReveal || isOpened ? (
                          <motion.div
                            key="coins"
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="flex flex-col items-center"
                          >
                            <Sparkles className="w-5 h-5 text-amber-300 mb-0.5" />
                            <span className="text-sm font-black text-amber-300 tabular-nums">
                              +{getRoundReward(round)}
                            </span>
                          </motion.div>
                        ) : (
                          <motion.div key="ball" exit={{ scale: 0.6, opacity: 0 }}>
                            <PokeballIcon size={44} />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.button>
                  );
                })}
              </div>

              {phase === "haunter" && (
                <motion.p
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-violet-200 text-sm font-bold italic"
                >
                  Ke ke ke... perdeu tudo!
                </motion.p>
              )}
            </div>

            <div className="mt-auto pt-4">
              <AnimatedButton
                variant="primary"
                size="lg"
                disabled={phase !== "playing" || pot <= 0}
                onClick={flee}
                icon={<Shield className="w-4 h-4" />}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-500 border-emerald-400/30"
              >
                FUGIR DA CAVERNA · Levar {pot} moedas
              </AnimatedButton>
            </div>
        </>
      </div>
    </motion.div>
  );
}
