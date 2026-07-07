"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Coins } from "lucide-react";
import { EGG_SPRITES } from "@/data/egg-styles";
import { EggBackBar } from "@/components/cases/EggBackBar";
import { EggHub } from "@/components/cases/EggHub";
import { PanelSkeleton } from "@/components/ui/RouteLoading";

const EggPreviewView = dynamic(
  () => import("@/components/cases/EggPreviewView").then((m) => ({ default: m.EggPreviewView })),
  { loading: () => <PanelSkeleton label="Carregando ovo..." /> }
);

const EggOpeningView = dynamic(
  () => import("@/components/cases/EggOpeningView").then((m) => ({ default: m.EggOpeningView })),
  { loading: () => <PanelSkeleton label="Preparando chocagem..." /> }
);

const EggResultView = dynamic(
  () => import("@/components/cases/EggResultView").then((m) => ({ default: m.EggResultView })),
  { loading: () => <PanelSkeleton label="Revelando resultado..." /> }
);
import { getCapsuleById, getCapsulePoolPokemon } from "@/data/capsules";
import {
  generateCapsuleStrip,
  resolveCapsuleCollection,
  rollCapsule,
  applyCapsuleHatchRewards,
} from "@/lib/capsule-algorithm";
import { isCapsuleUnlocked } from "@/data/capsule-balance";
import { getCapsuleSellPrice } from "@/lib/capsule-sell";
import { scheduleIdle } from "@/lib/route-prefetch";
import { useEconomyStore } from "@/stores/economy-store";
import { useGameStore } from "@/stores/game-store";
import { useConfetti } from "@/hooks/use-confetti";
import { useSoundEffects } from "@/hooks/use-sound-effects";
import type { CapsuleId, CapsuleRollResult, CapsuleStripItem } from "@/types/capsule";

type Phase = "hub" | "preview" | "opening" | "result";

export default function CasesPage() {
  const coins = useEconomyStore((s) => s.coins);
  const spendCoins = useEconomyStore((s) => s.spendCoins);
  const addCoins = useEconomyStore((s) => s.addCoins);
  const recordEggHatch = useEconomyStore((s) => s.recordEggHatch);
  const recordEggSellCoins = useEconomyStore((s) => s.recordEggSellCoins);
  const trainerLevel = useEconomyStore((s) => s.level);
  const collection = useGameStore((s) => s.collection);
  const commitCapsuleCatch = useGameStore((s) => s.commitCapsuleCatch);

  const [phase, setPhase] = useState<Phase>("hub");
  const [activeEggId, setActiveEggId] = useState<CapsuleId | null>(null);
  const [strip, setStrip] = useState<CapsuleStripItem[]>([]);
  const [result, setResult] = useState<CapsuleRollResult | null>(null);
  const [noCoinsMsg, setNoCoinsMsg] = useState(false);

  const resultRef = useRef<CapsuleRollResult | null>(null);
  const soundsPlayedRef = useRef(false);

  const { fireConfetti, fireShiny, fireNewPokemon } = useConfetti();
  const { playNewPokemonWin, playDuplicate, playLegendary, playShinyEpic } = useSoundEffects();

  const activeEgg = activeEggId ? getCapsuleById(activeEggId) : null;

  useEffect(() => {
    scheduleIdle(() => {
      // Prefetch best-effort: uma falha de chunk (build desatualizado) não deve quebrar a página
      void import("@/components/cases/EggPreviewView").catch(() => {});
      void import("@/components/cases/EggOpeningView").catch(() => {});
      void import("@/components/cases/EggResultView").catch(() => {});
    }, 2000);
  }, []);

  const resetToHub = useCallback(() => {
    setPhase("hub");
    setActiveEggId(null);
    setStrip([]);
    setResult(null);
    resultRef.current = null;
    soundsPlayedRef.current = false;
  }, []);

  const goBack = useCallback(() => {
    if (phase === "preview") {
      setPhase("hub");
      setActiveEggId(null);
    } else if (phase === "result") {
      resetToHub();
    }
  }, [phase, resetToHub]);

  const handleSelectEgg = useCallback((eggId: CapsuleId) => {
    if (!isCapsuleUnlocked(eggId, trainerLevel)) return;
    setActiveEggId(eggId);
    setPhase("preview");
  }, [trainerLevel]);

  const handleConfirmOpen = useCallback(() => {
    if (!activeEggId || phase !== "preview") return;
    const egg = getCapsuleById(activeEggId);
    if (!isCapsuleUnlocked(activeEggId, trainerLevel)) return;
    if (coins < egg.cost) {
      setNoCoinsMsg(true);
      window.setTimeout(() => setNoCoinsMsg(false), 2800);
      return;
    }
    if (!spendCoins(egg.cost)) return;
    recordEggHatch();

    const roll = rollCapsule(activeEggId);
    const collectedIds = new Set(Object.keys(collection).map(Number));
    const existing = collection[roll.pokemon.id];
    const resolved = resolveCapsuleCollection(
      roll,
      collectedIds,
      existing?.hasShiny ?? false
    );

    applyCapsuleHatchRewards(resolved, useEconomyStore.getState());

    const pool = getCapsulePoolPokemon(activeEggId);
    const reel = generateCapsuleStrip(resolved.pokemon, pool, resolved.isShiny);

    resultRef.current = resolved;
    setResult(resolved);
    setStrip(reel);
    setPhase("opening");
  }, [activeEggId, phase, coins, spendCoins, collection, recordEggHatch, trainerLevel]);

  const handleOpeningComplete = useCallback(() => {
    setPhase("result");
  }, []);

  const handleResultSounds = useCallback(() => {
    if (soundsPlayedRef.current) return;
    soundsPlayedRef.current = true;

    const r = resultRef.current;
    if (!r) return;

    const { pokemon, isShiny, isNew, isNewShinyUnlock, isDuplicate } = r;
    const rarity = pokemon.rarity;

    if (isNew || isNewShinyUnlock) {
      commitCapsuleCatch(pokemon.id, isShiny);
    }

    if (isNewShinyUnlock || (isShiny && isDuplicate)) {
      void playShinyEpic();
      window.setTimeout(() => fireShiny(), 120);
      return;
    }

    if (isNew || isNewShinyUnlock) {
      if (rarity === "legendary") {
        void playLegendary();
        window.setTimeout(() => fireConfetti(rarity, true), 120);
      } else if (rarity === "epic") {
        void playNewPokemonWin();
        window.setTimeout(() => fireConfetti(rarity, true), 120);
      } else {
        void playNewPokemonWin();
        window.setTimeout(() => fireNewPokemon(rarity), 120);
      }
      return;
    }

    if (isDuplicate) {
      void playDuplicate();
      if (rarity === "legendary" || rarity === "epic") {
        window.setTimeout(() => fireConfetti(rarity, true), 120);
      }
    }
  }, [
    commitCapsuleCatch,
    playShinyEpic,
    playLegendary,
    playNewPokemonWin,
    playDuplicate,
    fireShiny,
    fireConfetti,
    fireNewPokemon,
  ]);

  const handleSell = useCallback(() => {
    const r = resultRef.current;
    if (!r) return;
    const sellPrice = getCapsuleSellPrice(r.pokemon.rarity, r.isShiny);
    addCoins(sellPrice);
    recordEggSellCoins(sellPrice);
    resetToHub();
  }, [addCoins, recordEggSellCoins, resetToHub]);

  const handleKeepDuplicate = useCallback(() => {
    const r = resultRef.current;
    if (!r) return;
    commitCapsuleCatch(r.pokemon.id, r.isShiny);
    resetToHub();
  }, [commitCapsuleCatch, resetToHub]);

  const showBack = phase === "preview" || phase === "result";

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 lg:py-8 space-y-5">
      {showBack ? (
        <EggBackBar onBack={goBack} />
      ) : (
        <header className="space-y-2">
          <h1 className="text-2xl lg:text-3xl font-bold flex items-center gap-2.5">
            <Image
              src={EGG_SPRITES["10km"]}
              alt=""
              width={36}
              height={36}
              className="object-contain drop-shadow-[0_4px_10px_rgba(167,139,250,0.35)]"
            />
            Ovos Pokémon
          </h1>
          <p className="text-sm text-white/50 max-w-2xl leading-relaxed">
            Escolha um ovo temático para caçar formas base. Todo ovo concede doces da família
            ao chocar. Duplicatas podem ser vendidas; shiny vale{" "}
            <span className="text-amber-300/90">5×</span> no preço.
          </p>
        </header>
      )}

      {phase === "hub" && (
        <>
          <div className="glass-card px-4 py-3 border border-amber-500/15 inline-flex items-center gap-2 text-sm">
            <Coins className="w-4 h-4 text-amber-400" />
            <span className="text-amber-200/90 font-bold tabular-nums">{coins}</span>
            <span className="text-white/40">moedas</span>
          </div>

          {noCoinsMsg && (
            <p className="text-center text-sm text-red-300/90 animate-pulse">
              Moedas insuficientes para este ovo.
            </p>
          )}

          <EggHub coins={coins} trainerLevel={trainerLevel} onSelectEgg={handleSelectEgg} />
        </>
      )}

      {phase === "preview" && activeEgg && (
        <EggPreviewView
          egg={activeEgg}
          coins={coins}
          collectedIds={new Set(Object.keys(collection).map(Number))}
          onOpen={handleConfirmOpen}
        />
      )}

      {phase === "opening" && activeEgg && result && (
        <EggOpeningView
          egg={activeEgg}
          strip={strip}
          winnerRarity={result.pokemon.rarity}
          winnerIsShiny={result.isShiny}
          onComplete={handleOpeningComplete}
        />
      )}

      {phase === "result" && result && (
        <EggResultView
          result={result}
          onSell={handleSell}
          onKeepDuplicate={handleKeepDuplicate}
          onContinue={resetToHub}
          onPlaySounds={handleResultSounds}
        />
      )}
    </div>
  );
}
