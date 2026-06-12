"use client";

import dynamic from "next/dynamic";
import { useCallback, useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Coins, Disc3, Stars } from "lucide-react";
import { SHINY_CHANCE } from "@/data/pokemon-sprites";
import { SpinMachine } from "@/components/spin/SpinMachine";
import { SpinLeverButton } from "@/components/spin/SpinLeverButton";
import { RarityBadge } from "@/components/ui/RarityBadge";
import { RARITY_CONFIG, RARITY_ORDER } from "@/data/rarity";
import { useGameStore } from "@/stores/game-store";
import { useEconomyStore } from "@/stores/economy-store";
import { usePreferencesStore } from "@/stores/preferences-store";
import { useSoundEffects, playSpinTick } from "@/hooks/use-sound-effects";
import { useConfetti } from "@/hooks/use-confetti";
import type { SpinMultiplier } from "@/types";
import { cn } from "@/lib/utils";

const RevealAnimation = dynamic(
  () => import("@/components/spin/RevealAnimation").then((m) => m.RevealAnimation),
  { ssr: false }
);

const MULTIPLIERS: SpinMultiplier[] = [1, 2, 3];

export default function SpinPage() {
  const soundEnabled = usePreferencesStore((s) => s.soundEnabled);
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

  const { playSpin, playNewPokemonWin, playDuplicate, playLegendary, playShinyEpic } =
    useSoundEffects();
  const { fireConfetti, fireShiny } = useConfetti();

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

  const handleSpinAgain = useCallback(async () => {
    if (!canAffordSpin(spinMultiplier)) return;
    closeReveal();
    await handleSpin();
  }, [canAffordSpin, spinMultiplier, closeReveal, handleSpin]);

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

    const soundKey = lastSpinResults
      .map((r) => `${r.pokemon.id}-${r.isShiny ? "s" : "n"}-${r.isNewShinyUnlock ? "u" : ""}`)
      .join("-");
    if (lastSoundKeyRef.current === soundKey) return;
    lastSoundKeyRef.current = soundKey;

    const hasNewShiny = lastSpinResults.some((r) => r.isNewShinyUnlock);
    const hasNew = lastSpinResults.some((r) => r.isNew);
    const hasLegendaryNew = lastSpinResults.some(
      (r) => r.isNew && r.rarity === "legendary" && !r.isNewShinyUnlock
    );
    const allDuplicate = lastSpinResults.every(
      (r) => r.isDuplicate && !r.isNewShinyUnlock
    );

    if (soundEnabled) {
      if (hasNewShiny) {
        void playShinyEpic();
      } else if (hasLegendaryNew) {
        void playLegendary();
      } else if (hasNew) {
        void playNewPokemonWin();
      } else if (allDuplicate) {
        void playDuplicate();
      }
    }

    if (hasNewShiny) {
      setTimeout(() => fireShiny(), 150);
      return;
    }

    const rarityOrder = ["common", "uncommon", "rare", "epic", "legendary"] as const;
    const newResults = lastSpinResults.filter((r) => r.isNew);

    if (newResults.length > 0) {
      const best = newResults.reduce((a, b) =>
        rarityOrder.indexOf(b.rarity) > rarityOrder.indexOf(a.rarity) ? b : a
      );
      if (
        best.rarity === "legendary" ||
        best.rarity === "epic" ||
        lastSpinResults.some((r) => r.isNewShinyUnlock)
      ) {
        setTimeout(() => fireConfetti(best.rarity, true), 150);
      }
    }
  }, [
    showReveal,
    lastSpinResults,
    soundEnabled,
    playNewPokemonWin,
    playDuplicate,
    playLegendary,
    playShinyEpic,
    fireConfetti,
    fireShiny,
  ]);

  const reels = spinSequences.length > 0
    ? spinSequences
    : Array.from({ length: spinMultiplier }, () => [] as typeof spinSequences[0]);

  return (
    <div
      className={cn(
        "mx-auto px-4 py-8 space-y-6",
        spinMultiplier === 1 && "max-w-lg",
        spinMultiplier === 2 && "max-w-2xl",
        spinMultiplier === 3 && "max-w-3xl"
      )}
    >
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Disc3 className="w-8 h-8 text-indigo-400" />
          Roleta
        </h1>
        <p className="text-white/50 text-sm">
          Gire e complete seu álbum · {profile.totalSpins} giros realizados
        </p>
      </div>

      {noCoinsMsg && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-red-400 text-sm font-semibold text-center"
        >
          <span className="inline-flex items-center justify-center gap-1">
            Moedas insuficientes! Jogue batalhas ou minigames para ganhar
            <Coins className="w-4 h-4" />
          </span>
        </motion.p>
      )}

      <div className="glass-card p-1.5 flex gap-1">
        {MULTIPLIERS.map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setSpinMultiplier(m)}
            disabled={isSpinning}
            className={cn(
              "relative flex-1 py-2.5 rounded-xl text-sm font-bold transition-colors",
              spinMultiplier === m ? "text-indigo-300" : "text-white/40 hover:text-white/70",
              isSpinning && "opacity-50 cursor-not-allowed"
            )}
          >
            {spinMultiplier === m && (
              <motion.div
                layoutId="spin-multiplier-bg"
                className="absolute inset-0 bg-indigo-500/20 border border-indigo-500/30 rounded-xl"
                transition={{ type: "spring", damping: 20, stiffness: 300 }}
              />
            )}
            <span className="relative z-10">{m}x</span>
          </button>
        ))}
      </div>

      <div className="glass-card p-4 sm:p-6">
        <div
          className={cn(
            "grid w-full mx-auto justify-items-center",
            spinMultiplier === 1 && "max-w-md grid-cols-1 gap-3",
            spinMultiplier === 2 && "grid-cols-2 gap-4",
            spinMultiplier === 3 && "grid-cols-3 gap-3 sm:gap-4"
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
              reelLayout={spinMultiplier}
              reelIndex={i}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-col items-center gap-4 w-full">
        <SpinLeverButton
          onClick={handleSpin}
          disabled={isSpinning || showReveal || !canAfford}
          loading={isSpinning}
          canAfford={canAfford}
          spinCost={spinCost}
          spinMultiplier={spinMultiplier}
          willUseFreeSpin={willUseFreeSpin}
          freeSpins={freeSpins}
        />

        <div className="glass-card p-4 sm:p-5 space-y-4 w-full">
          <p className="text-xs font-semibold text-white/45 text-center uppercase tracking-wider">
            Chances por raridade
          </p>
          <div className="flex flex-wrap justify-center gap-x-3 gap-y-4 sm:gap-x-4 px-1">
            {RARITY_ORDER.map((r) => (
              <div key={r} className="flex flex-col items-center gap-1.5 w-[4.75rem] sm:w-[5.25rem]">
                <RarityBadge rarity={r} compact />
                <p className="text-[10px] text-white/35 tabular-nums text-center">{RARITY_CONFIG[r].chance}%</p>
              </div>
            ))}
            <div className="flex flex-col items-center gap-1.5 w-[4.75rem] sm:w-[5.25rem]">
              <span className="inline-flex items-center justify-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase shiny-rainbow-badge whitespace-nowrap">
                <Stars className="w-2.5 h-2.5 shrink-0" />
                Shiny
              </span>
              <p className="text-[10px] text-white/35 tabular-nums text-center">{(SHINY_CHANCE * 100).toFixed(1)}%</p>
            </div>
          </div>
        </div>
      </div>

      <RevealAnimation
        results={lastSpinResults}
        show={showReveal}
        onClose={closeReveal}
        onSpinAgain={handleSpinAgain}
        canSpinAgain={canAfford}
        spinCost={spinCost}
        spinMultiplier={spinMultiplier}
        willUseFreeSpin={willUseFreeSpin}
      />
    </div>
  );
}
