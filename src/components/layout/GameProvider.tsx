"use client";

import { Loader2 } from "lucide-react";
import { useGameInit } from "@/hooks/use-game-init";
import { useEconomyStore } from "@/stores/economy-store";
import { useGymStore } from "@/stores/gym-store";
import { RewardPopup } from "@/components/ui/RewardPopup";
import { RewardAnimation } from "@/components/ui/RewardAnimation";
import { useEffect } from "react";

export function GameProvider({ children }: { children: React.ReactNode }) {
  const { isLoading } = useGameInit();
  const initializeEconomy = useEconomyStore((s) => s.initializeEconomy);
  const initializeGym = useGymStore((s) => s.initializeGym);

  useEffect(() => {
    initializeEconomy();
    initializeGym();
  }, [initializeEconomy, initializeGym]);

  if (isLoading) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 text-indigo-400 animate-spin" />
        <p className="text-white/50 text-sm">Carregando PokéRoll...</p>
      </div>
    );
  }

  return (
    <>
      {children}
      <RewardAnimation />
      <RewardPopup />
    </>
  );
}
