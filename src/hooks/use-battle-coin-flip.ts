"use client";

import { useEffect } from "react";
import { resolveCoinFlip } from "@/lib/battle-engine";
import type { BattleState } from "@/types/battle";

const COIN_FLIP_MS = 2200;

/** Resolve fase coinFlip → fighting após animação. */
export function useBattleCoinFlip(
  battleState: BattleState | null,
  setBattleState: (updater: (prev: BattleState | null) => BattleState | null) => void
): void {
  useEffect(() => {
    if (battleState?.phase !== "coinFlip") return;

    const timer = window.setTimeout(() => {
      setBattleState((prev) => (prev?.phase === "coinFlip" ? resolveCoinFlip(prev) : prev));
    }, COIN_FLIP_MS);

    return () => clearTimeout(timer);
  }, [battleState?.phase, setBattleState]);
}
