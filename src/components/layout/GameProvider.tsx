"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useGameInit } from "@/hooks/use-game-init";
import { useAchievementSync, useDuplicateRewardGuard } from "@/hooks/use-achievement-sync";
import { useEconomyStore } from "@/stores/economy-store";
import { useGymStore } from "@/stores/gym-store";
import { useGameStore } from "@/stores/game-store";
import { usePreferencesStore } from "@/stores/preferences-store";
import { useEffect } from "react";
import { prefetchAppRoutes } from "@/lib/route-prefetch";
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

const AchievementUnlockToast = dynamic(
  () =>
    import("@/components/ui/AchievementUnlockToast").then((m) => ({
      default: m.AchievementUnlockToast,
    })),
  { ssr: false }
);

const BattleSurrenderGuard = dynamic(
  () =>
    import("@/components/layout/BattleSurrenderGuard").then((m) => ({
      default: m.BattleSurrenderGuard,
    })),
  { ssr: false }
);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isLoading } = useGameInit();
  const initializeEconomy = useEconomyStore((s) => s.initializeEconomy);
  const initializeGym = useGymStore((s) => s.initializeGym);
  const initializePreferences = usePreferencesStore((s) => s.initializePreferences);

  useAchievementSync(!isLoading);
  useDuplicateRewardGuard();

  useEffect(() => {
    initializePreferences();
    initializeEconomy();
    initializeGym();
  }, [initializePreferences, initializeEconomy, initializeGym]);

  useEffect(() => {
    if (isLoading) return;

    const runPreload = () => {
      const team = useEconomyStore.getState().team;
      const collectedIds = Object.keys(useGameStore.getState().collection).map(Number);
      preloadPrioritySpritesDeferred(team, collectedIds);
    };

    const warmRoutes = () => {
      prefetchAppRoutes(router);
      runPreload();
    };

    if ("requestIdleCallback" in window) {
      const idleId = window.requestIdleCallback(warmRoutes, { timeout: 2000 });
      return () => window.cancelIdleCallback(idleId);
    }

    const t = window.setTimeout(warmRoutes, 800);
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
      <AchievementUnlockToast />
      <BattleSurrenderGuard />
    </>
  );
}
