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

  const handleReelTick = useCallback(() => {
    if (soundEnabled) void playSpinTick();
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
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Disc3 className="w-8 h-8 text-indigo-400 animate-spinSlow" />
          Roleta PokéRoll
        </h1>
        <p className="text-white/50 text-sm">
          Spins realizados:{" "}
          <span className="text-indigo-400 font-semibold">{profile.totalSpins}</span>
          {" · "}
          <span className="text-amber-400">{coins} moedas</span>
        </p>

        {noCoinsMsg && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-400 text-sm font-semibold"
          >
            Moedas insuficientes! Jogue batalhas ou os minigames para ganhar 🪙
          </motion.p>
        )}

        <div className="flex items-center justify-center gap-2">
          {MULTIPLIERS.map((m) => (
            <button
              key={m}
              onClick={() => setSpinMultiplier(m)}
              disabled={isSpinning}
              className={cn(
                "px-5 py-2 rounded-xl text-sm font-bold transition-all duration-200 border",
                spinMultiplier === m
                  ? "bg-gradient-to-r from-indigo-500 to-purple-600 border-indigo-400/50 text-white shadow-lg shadow-indigo-500/30 scale-105"
                  : "glass border-white/10 text-white/50 hover:text-white hover:bg-white/5",
                isSpinning && "opacity-50 cursor-not-allowed"
              )}
            >
              {m}x
            </button>
          ))}
        </div>
      </div>

      <div
        className={cn(
          "grid gap-4 mx-auto",
          spinMultiplier === 1 && "max-w-md grid-cols-1",
          spinMultiplier === 2 && "max-w-lg grid-cols-2",
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

      <div className="flex flex-col items-center gap-4">
        <AnimatedButton
          variant="gold"
          size="xl"
          onClick={handleSpin}
          disabled={isSpinning || showReveal || !canAfford}
          loading={isSpinning}
          icon={!isSpinning ? <Disc3 className="w-6 h-6" /> : undefined}
          className="w-full max-w-sm flex-col !gap-1 !py-4"
        >
          {isSpinning ? (
            "GIRANDO..."
          ) : willUseFreeSpin ? (
            <span className="flex flex-col items-center leading-tight">
              <span>GIRAR GRÁTIS</span>
              <span className="text-xs font-normal opacity-80">
                {freeSpins} spin{freeSpins > 1 ? "s" : ""} restante{freeSpins > 1 ? "s" : ""}
              </span>
            </span>
          ) : (
            <span className="flex flex-col items-center leading-tight">
              <span>GIRAR {spinMultiplier > 1 ? `${spinMultiplier}x` : ""}</span>
              <span className={cn("text-sm font-bold", canAfford ? "opacity-90" : "text-red-200")}>
                {canAfford
                  ? `Custa ${spinCost} moedas`
                  : `Precisa de ${spinCost} moedas`}
              </span>
            </span>
          )}
        </AnimatedButton>

        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="flex items-center gap-2 text-sm text-white/40 hover:text-white/70 transition-colors"
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          Som {soundEnabled ? "ligado" : "desligado"}
        </button>
      </div>

      <div className="glass-card p-5 space-y-3">
        <h3 className="text-sm font-semibold text-white/70">Chances de Drop</h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {RARITY_ORDER.map((r) => (
            <div key={r} className="text-center space-y-1">
              <RarityBadge rarity={r} size="sm" />
              <p className="text-xs text-white/40">{RARITY_CONFIG[r].chance}%</p>
            </div>
          ))}
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
