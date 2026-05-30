"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useGameInit } from "@/hooks/use-game-init";
import { useAchievementSync, useDuplicateRewardGuard } from "@/hooks/use-achievement-sync";
import { useEconomyStore } from "@/stores/economy-store";
import { useGymStore } from "@/stores/gym-store";
import { useGameStore } from "@/stores/game-store";
import { useEffect } from "react";
import { preloadPrioritySpritesDeferred } from "@/lib/sprite-preload";

const WelcomeModal = dynamic(
  () => import("@/components/ui/WelcomeModal").then((m) => ({ default: m.WelcomeModal })),
  { ssr: false }
);

const RewardAnimation = dynamic(
  () => import("@/components/ui/RewardAnimation").then((m) => ({ default: m.RewardAnimation })),
  { ssr: false }
);

const RewardPopup = dynamic(
  () => import("@/components/ui/RewardPopup").then((m) => ({ default: m.RewardPopup })),
  { ssr: false }
);

const PREFETCH_AFTER_INIT = ["/profile", "/games", "/battle"] as const;

export function GameProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isLoading } = useGameInit();
  const initializeEconomy = useEconomyStore((s) => s.initializeEconomy);
  const initializeGym = useGymStore((s) => s.initializeGym);

  useAchievementSync(!isLoading);
  useDuplicateRewardGuard();

  useEffect(() => {
    initializeEconomy();
    initializeGym();
  }, [initializeEconomy, initializeGym]);

  useEffect(() => {
    if (isLoading) return;

    const runPreload = () => {
      const team = useEconomyStore.getState().team;
      const collectedIds = Object.keys(useGameStore.getState().collection).map(Number);
      preloadPrioritySpritesDeferred(team, collectedIds);
    };

    const prefetchRoutes = () => {
      for (const href of PREFETCH_AFTER_INIT) {
        router.prefetch(href);
      }
    };

    if ("requestIdleCallback" in window) {
      const idleId = window.requestIdleCallback(() => {
        prefetchRoutes();
        runPreload();
      }, { timeout: 3000 });
      return () => window.cancelIdleCallback(idleId);
    }

    const t = window.setTimeout(() => {
      prefetchRoutes();
      runPreload();
    }, 1500);
    return () => window.clearTimeout(t);
  }, [isLoading, router]);

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
      <WelcomeModal />
      <RewardAnimation />
      <RewardPopup />
    </>
  );
}
