"use client";

import { useEffect, useRef } from "react";
import {
  BATTLE_COIN_FLIP_MS,
  BATTLE_COIN_REVEAL_MS,
  BATTLE_FACE_OFF_MS,
} from "@/data/economy-balance";
import { advanceToCoinFlip, resolveCoinFlip } from "@/lib/battle-engine";
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

    const faceOffTimer = window.setTimeout(() => {
      setBattleState((prev) => (prev?.phase === "faceOff" ? advanceToCoinFlip(prev) : prev));
    }, BATTLE_FACE_OFF_MS);

    return () => {
      window.clearTimeout(faceOffTimer);
    };
  }, [battleState?.phase, setBattleState]);

  useEffect(() => {
    if (battleState?.phase !== "coinFlip") {
      soundsStartedRef.current = false;
      return;
    }

    const playerStarts = battleState.playerStarts ?? true;
    const spinSec = BATTLE_COIN_REVEAL_MS / 1000;

    if (!soundsStartedRef.current) {
      soundsStartedRef.current = true;
      void playBattleCoinToss();
      void playBattleCoinSpinSequence(spinSec);
    }

    const revealTimer = window.setTimeout(() => {
      void playBattleCoinResultReveal(playerStarts);
    }, BATTLE_COIN_REVEAL_MS);

    const resolveTimer = window.setTimeout(() => {
      setBattleState((prev) => (prev?.phase === "coinFlip" ? resolveCoinFlip(prev) : prev));
    }, BATTLE_COIN_FLIP_MS);

    return () => {
      window.clearTimeout(revealTimer);
      window.clearTimeout(resolveTimer);
    };
  }, [battleState?.phase, battleState?.playerStarts, setBattleState]);
}
