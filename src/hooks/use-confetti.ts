"use client";

import { useCallback } from "react";
import { fireCelebrationConfetti, fireShinyConfetti } from "@/lib/confetti";
import type { Rarity } from "@/types";

export function useConfetti() {
  const fireConfetti = useCallback((rarity: Rarity, isNew = true) => {
    fireCelebrationConfetti(rarity, isNew);
  }, []);

  const fireShiny = useCallback(() => {
    fireShinyConfetti();
  }, []);

  return { fireConfetti, fireShiny };
}
