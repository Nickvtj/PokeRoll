"use client";

import { useCallback, useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Disc3, Volume2, VolumeX } from "lucide-react";
import { SpinMachine } from "@/components/spin/SpinMachine";
import { RevealAnimation } from "@/components/spin/RevealAnimation";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { RarityBadge } from "@/components/ui/RarityBadge";
import { RARITY_CONFIG, RARITY_ORDER } from "@/data/rarity";
import { useGameStore } from "@/stores/game-store";
import { useSoundEffects } from "@/hooks/use-sound-effects";
import { useConfetti } from "@/hooks/use-confetti";
import type { SpinMultiplier } from "@/types";
import { cn } from "@/lib/utils";

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
  const profile = useGameStore((s) => s.profile);

  const { playSpin, playNewPokemonWin, playDuplicate, playLegendary } = useSoundEffects();
  const { fireConfetti } = useConfetti();

  const handleSpin = useCallback(async () => {
    if (isSpinning) return;
    lastSoundKeyRef.current = "";
    if (soundEnabled) void playSpin();
    await spin();
  }, [isSpinning, spin, soundEnabled, playSpin]);

  const handleReelComplete = useCallback(() => {
    finishReelSpin();
  }, [finishReelSpin]);

  // Som e confetti disparam quando o modal abre (funciona em 1x, 2x e 3x)
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

    // Confetti para cada Pokémon NOVO (z-index acima do modal)
    const rarityOrder = ["common", "uncommon", "rare", "epic", "legendary"] as const;
    const newResults = lastSpinResults.filter((r) => r.isNew);

    if (newResults.length > 0) {
      const best = newResults.reduce((a, b) =>
        rarityOrder.indexOf(b.rarity) > rarityOrder.indexOf(a.rarity) ? b : a
      );
      // Pequeno delay para confetti aparecer junto com o modal
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
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Disc3 className="w-8 h-8 text-indigo-400 animate-spinSlow" />
          Roleta PokéRoll
        </h1>
        <p className="text-white/50 text-sm">
          Spins realizados:{" "}
          <span className="text-indigo-400 font-semibold">{profile.totalSpins}</span>
        </p>

        {/* Seletor 1x / 2x / 3x */}
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
      </motion.div>

      {/* Máquina(s) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className={cn(
          "grid gap-4 mx-auto",
          spinMultiplier === 1 && "max-w-md grid-cols-1",
          spinMultiplier === 2 && "max-w-lg grid-cols-2",
          spinMultiplier === 3 && "max-w-2xl grid-cols-3"
        )}
      >
        {reels.slice(0, spinMultiplier).map((sequence, i) => (
          <SpinMachine
            key={`reel-${i}-${sequence.length}`}
            sequence={sequence}
            isSpinning={isSpinning}
            result={lastSpinResults[i] ?? null}
            onSpinComplete={handleReelComplete}
            compact={spinMultiplier > 1}
            reelIndex={i}
          />
        ))}
      </motion.div>

      <div className="flex flex-col items-center gap-4">
        <AnimatedButton
          variant="gold"
          size="xl"
          onClick={handleSpin}
          disabled={isSpinning}
          loading={isSpinning}
          icon={!isSpinning ? <Disc3 className="w-6 h-6" /> : undefined}
          className="w-full max-w-xs"
        >
          {isSpinning
            ? "GIRANDO..."
            : spinMultiplier === 1
              ? "SPIN!"
              : `SPIN ${spinMultiplier}x!`}
        </AnimatedButton>

        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="flex items-center gap-2 text-sm text-white/40 hover:text-white/70 transition-colors"
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          Som {soundEnabled ? "ligado" : "desligado"}
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card p-5 space-y-3"
      >
        <h3 className="text-sm font-semibold text-white/70">Chances de Drop</h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {RARITY_ORDER.map((r) => (
            <div key={r} className="text-center space-y-1">
              <RarityBadge rarity={r} size="sm" />
              <p className="text-xs text-white/40">{RARITY_CONFIG[r].chance}%</p>
            </div>
          ))}
        </div>
      </motion.div>

      <RevealAnimation
        results={lastSpinResults}
        show={showReveal}
        onClose={closeReveal}
      />
    </div>
  );
}
