"use client";

import { useEffect, useRef } from "react";
import {
  advanceToCoinFlip,
  resolveCoinFlip,
} from "@/lib/battle-engine";
import { getBattleCeremonyTimings } from "@/lib/battle-ceremony";
import {
  playBattleCoinResultReveal,
  playBattleCoinSpinSequence,
  playBattleCoinToss,
} from "@/lib/sound-engine";
import type { BattleState } from "@/types/battle";

/** Resolve fase coinFlip → fighting após animação. */
export function useBattleCoinFlip(
  battleState: BattleState | null,
  setBattleState: (updater: (prev: BattleState | null) => BattleState | null) => void
): void {
  const soundsStartedRef = useRef(false);
  useEffect(() => {
    if (battleState?.phase !== "faceOff") {
      return undefined;
    }

    const { faceOffMs } = getBattleCeremonyTimings();

    const faceOffTimer = window.setTimeout(() => {
      setBattleState((prev) => (prev?.phase === "faceOff" ? advanceToCoinFlip(prev) : prev));
    }, faceOffMs);

    return () => {
      window.clearTimeout(faceOffTimer);
    };
  }, [battleState?.phase, setBattleState]);

  useEffect(() => {
    if (battleState?.phase !== "coinFlip") {
      soundsStartedRef.current = false;
      return;
    }

    const timings = getBattleCeremonyTimings();
    const playerStarts = battleState.playerStarts ?? true;
    const spinSec = timings.coinRevealMs / 1000;

    if (!soundsStartedRef.current && !timings.skipSounds) {
      soundsStartedRef.current = true;
      void playBattleCoinToss();
      void playBattleCoinSpinSequence(spinSec);
    } else if (!soundsStartedRef.current) {
      soundsStartedRef.current = true;
    }

    const revealTimer = window.setTimeout(() => {
      if (!timings.skipSounds) {
        void playBattleCoinResultReveal(playerStarts);
      }
    }, timings.coinRevealMs);

    const resolveTimer = window.setTimeout(() => {
      setBattleState((prev) => (prev?.phase === "coinFlip" ? resolveCoinFlip(prev) : prev));
    }, timings.coinFlipMs);

    return () => {
      window.clearTimeout(revealTimer);
      window.clearTimeout(resolveTimer);
    };
  }, [battleState?.phase, battleState?.playerStarts, setBattleState]);
}
