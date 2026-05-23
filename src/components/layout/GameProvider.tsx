"use client";

import { Loader2 } from "lucide-react";
import { useGameInit } from "@/hooks/use-game-init";

export function GameProvider({ children }: { children: React.ReactNode }) {
  const { isLoading } = useGameInit();

  if (isLoading) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 text-indigo-400 animate-spin" />
        <p className="text-white/50 text-sm">Carregando PokéRoll...</p>
      </div>
    );
  }

  return <>{children}</>;
}
