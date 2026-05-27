"use client";

import dynamic from "next/dynamic";
import { useCallback, useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Disc3, Volume2, VolumeX } from "lucide-react";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { RarityBadge } from "@/components/ui/RarityBadge";
import { PanelSkeleton } from "@/components/ui/RouteLoading";
import { RARITY_CONFIG, RARITY_ORDER } from "@/data/rarity";
import { useGameStore } from "@/stores/game-store";
import { useEconomyStore } from "@/stores/economy-store";
import { useSoundEffects, playSpinTick } from "@/hooks/use-sound-effects";
import { useConfetti } from "@/hooks/use-confetti";
import type { SpinMultiplier } from "@/types";
import { cn } from "@/lib/utils";

const SpinMachine = dynamic(
  () => import("@/components/spin/SpinMachine").then((m) => m.SpinMachine),
  { loading: () => <PanelSkeleton label="Carregando máquina..." /> }
);

const RevealAnimation = dynamic(
  () => import("@/components/spin/RevealAnimation").then((m) => m.RevealAnimation),
  { ssr: false }
);

const MULTIPLIERS: SpinMultiplier[] = [1, 2, 3];

export default function SpinPage() {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const lastSoundKeyRef = useRef("");

  const isSpinning = useGameStore((s) => s.isSpinning);
  const spinMultiplier = useGameStore((s) => s.spinMultiplier);
  const spinSequences = useGameStore((s) => s.spinSequences);
  const lastSpinResults = useGameStore((s) => s.lastSpinResults);
  const showReveal = useGameStore((s) => s.showReveal);
  const spin = useGameStore((s) => s.spin);
  const finishReelSpin = useGameStore((s) => s.finishReelSpin);
  const closeReveal = useGameStore((s) => s.closeReveal);
  const setSpinMultiplier = useGameStore((s) => s.setSpinMultiplier);
  const spinSessionId = useGameStore((s) => s.spinSessionId);
  const profile = useGameStore((s) => s.profile);
  const canAffordSpin = useEconomyStore((s) => s.canAffordSpin);
  const getSpinCost = useEconomyStore((s) => s.getSpinCost);
  const freeSpins = useEconomyStore((s) => s.freeSpins);
  const coins = useEconomyStore((s) => s.coins);

  const spinCost = getSpinCost(spinMultiplier);
  const willUseFreeSpin = freeSpins >= spinMultiplier && coins < spinCost;
  const canAfford = canAffordSpin(spinMultiplier);

  const [noCoinsMsg, setNoCoinsMsg] = useState(false);

  const { playSpin, playNewPokemonWin, playDuplicate, playLegendary } = useSoundEffects();
  const { fireConfetti } = useConfetti();

  const handleSpin = useCallback(async () => {
    if (isSpinning) return;
    if (!canAffordSpin(spinMultiplier)) {
      setNoCoinsMsg(true);
      setTimeout(() => setNoCoinsMsg(false), 3000);
      return;
    }
    lastSoundKeyRef.current = "";
    if (soundEnabled) void playSpin();
    await spin();
  }, [isSpinning, spin, soundEnabled, playSpin, canAffordSpin, spinMultiplier]);

  const handleReelComplete = useCallback(() => {
    finishReelSpin();
  }, [finishReelSpin]);

  const lastTickRef = useRef(0);

  const handleReelTick = useCallback(() => {
    if (!soundEnabled) return;
    const now = Date.now();
    if (now - lastTickRef.current < 90) return;
    lastTickRef.current = now;
    void playSpinTick();
  }, [soundEnabled]);

  useEffect(() => {
    if (!showReveal || lastSpinResults.length === 0) return;

    const soundKey = lastSpinResults.map((r) => r.pokemon.id).join("-");
    if (lastSoundKeyRef.current === soundKey) return;
    lastSoundKeyRef.current = soundKey;

    const hasNew = lastSpinResults.some((r) => r.isNew);
    const hasLegendaryNew = lastSpinResults.some(
      (r) => r.isNew && r.rarity === "legendary"
    );
    const allDuplicate = lastSpinResults.every((r) => r.isDuplicate);

    if (soundEnabled) {
      if (hasLegendaryNew) {
        void playLegendary();
      } else if (hasNew) {
        void playNewPokemonWin();
      } else if (allDuplicate) {
        void playDuplicate();
      }
    }

    const rarityOrder = ["common", "uncommon", "rare", "epic", "legendary"] as const;
    const newResults = lastSpinResults.filter((r) => r.isNew);

    if (newResults.length > 0) {
      const best = newResults.reduce((a, b) =>
        rarityOrder.indexOf(b.rarity) > rarityOrder.indexOf(a.rarity) ? b : a
      );
      setTimeout(() => fireConfetti(best.rarity, true), 150);
    }
  }, [
    showReveal,
    lastSpinResults,
    soundEnabled,
    playNewPokemonWin,
    playDuplicate,
    playLegendary,
    fireConfetti,
  ]);

  const reels = spinSequences.length > 0
    ? spinSequences
    : Array.from({ length: spinMultiplier }, () => [] as typeof spinSequences[0]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 flex flex-col min-h-[calc(100dvh-7rem)] lg:min-h-[calc(100dvh-5rem)]">
      {/* Header compacto */}
      <div className="text-center space-y-2 mb-4 shrink-0">
        <h1 className="text-2xl font-bold flex items-center justify-center gap-2">
          <Disc3 className="w-6 h-6 text-indigo-400" />
          Roleta PokéRoll
        </h1>
        <p className="text-white/40 text-xs">
          {profile.totalSpins} spins realizados
        </p>

        {noCoinsMsg && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-400 text-sm font-semibold"
          >
            Moedas insuficientes! Jogue batalhas ou minigames para ganhar 🪙
          </motion.p>
        )}

        <div className="flex items-center justify-center gap-1.5">
          {MULTIPLIERS.map((m) => (
            <button
              key={m}
              onClick={() => setSpinMultiplier(m)}
              disabled={isSpinning}
              className={cn(
                "px-4 py-1.5 rounded-lg text-xs font-bold transition-all border",
                spinMultiplier === m
                  ? "bg-indigo-500/25 border-indigo-400/50 text-indigo-200"
                  : "glass border-white/10 text-white/45 hover:text-white",
                isSpinning && "opacity-50 cursor-not-allowed"
              )}
            >
              {m}x
            </button>
          ))}
        </div>
      </div>

      {/* Roleta — protagonista */}
      <div className="flex-1 flex flex-col items-center justify-center min-h-0 py-2">
        <div
          className={cn(
            "grid gap-3 w-full mx-auto",
            spinMultiplier === 1 && "max-w-md grid-cols-1",
            spinMultiplier === 2 && "max-w-xl grid-cols-2",
            spinMultiplier === 3 && "max-w-2xl grid-cols-3"
          )}
        >
          {reels.slice(0, spinMultiplier).map((sequence, i) => (
            <SpinMachine
              key={`reel-${i}-${spinSessionId}`}
              sequence={sequence}
              isSpinning={isSpinning && sequence.length > 0}
              result={lastSpinResults[i] ?? null}
              onSpinComplete={handleReelComplete}
              onReelTick={handleReelTick}
              compact={spinMultiplier > 1}
              reelIndex={i}
            />
          ))}
        </div>
      </div>

      {/* Controles compactos */}
      <div className="shrink-0 space-y-3 pt-2">
        <div className="flex flex-col items-center gap-2">
          <AnimatedButton
            variant="gold"
            size="lg"
            onClick={handleSpin}
            disabled={isSpinning || showReveal || !canAfford}
            loading={isSpinning}
            icon={!isSpinning ? <Disc3 className="w-5 h-5" /> : undefined}
            className="w-full max-w-xs flex-col !gap-0.5 !py-3"
          >
            {isSpinning ? (
              "GIRANDO..."
            ) : willUseFreeSpin ? (
              <span className="flex flex-col items-center leading-tight">
                <span>GIRAR GRÁTIS</span>
                <span className="text-[10px] font-normal opacity-80">
                  {freeSpins} restante{freeSpins > 1 ? "s" : ""}
                </span>
              </span>
            ) : (
              <span className="flex flex-col items-center leading-tight">
                <span>GIRAR {spinMultiplier > 1 ? `${spinMultiplier}x` : ""}</span>
                <span className={cn("text-[10px] font-bold", canAfford ? "opacity-80" : "text-red-200")}>
                  {canAfford ? `${spinCost} moedas` : `Precisa de ${spinCost}`}
                </span>
              </span>
            )}
          </AnimatedButton>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="flex items-center gap-1.5 text-[11px] text-white/35 hover:text-white/60 transition-colors"
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            Som {soundEnabled ? "ligado" : "desligado"}
          </button>
        </div>

        <div className="glass-card px-4 py-3">
          <p className="text-[10px] text-white/40 mb-2 font-medium">Chances de drop</p>
          <div className="flex items-center justify-between gap-1">
            {RARITY_ORDER.map((r) => (
              <div key={r} className="flex-1 text-center space-y-0.5 min-w-0">
                <RarityBadge rarity={r} size="sm" />
                <p className="text-[10px] text-white/35">{RARITY_CONFIG[r].chance}%</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <RevealAnimation
        results={lastSpinResults}
        show={showReveal}
        onClose={closeReveal}
      />
    </div>
  );
}
