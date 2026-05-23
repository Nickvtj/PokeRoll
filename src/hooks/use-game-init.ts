"use client";

import { useEffect } from "react";
import { useGameStore } from "@/stores/game-store";

/** Inicializa dados do jogador ao montar a aplicação */
export function useGameInit() {
  const initialize = useGameStore((s) => s.initialize);
  const isLoading = useGameStore((s) => s.isLoading);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return { isLoading };
}
