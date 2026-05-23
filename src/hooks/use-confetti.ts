"use client";

import { useCallback } from "react";
import { fireCelebrationConfetti } from "@/lib/confetti";
import type { Rarity } from "@/types";

export function useConfetti() {
  const fireConfetti = useCallback((rarity: Rarity, isNew = true) => {
    fireCelebrationConfetti(rarity, isNew);
  }, []);

  return { fireConfetti };
}
