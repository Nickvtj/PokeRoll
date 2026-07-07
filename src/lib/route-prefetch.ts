import { scheduleIdle } from "@/lib/schedule-idle";

export { scheduleIdle };

export const MAIN_NAV_ROUTES = [
  "/battle",
  "/games",
  "/spin",
  "/cases",
  "/album",
  "/mochila",
  "/profile",
] as const;

export const MINIGAME_ROUTES = [
  "/games/captura",
  "/games/click-rush",
  "/games/memory",
  "/games/jitsu",
  "/games/hunter-cave",
  "/games/flappy-zubat",
] as const;

const MINIGAME_CHUNK_LOADERS = [
  () => import("@/components/minigame/CapturaPerfeitaGame"),
  () => import("@/components/minigame/ClickMinigame"),
  () => import("@/components/minigame/PokeMemoryGame"),
  () => import("@/components/minigame/PokeJitsuGame"),
  () => import("@/components/minigame/HunterCaveGame"),
  () => import("@/components/minigame/FlappyZubatGame"),
] as const;

export function prefetchRoutes(
  router: { prefetch: (href: string) => void },
  routes: readonly string[]
): void {
  for (const href of routes) {
    router.prefetch(href);
  }
}

/** Baixa os chunks dos minigames em background (após prefetch das rotas). */
export function preloadMinigameChunks(): void {
  for (const load of MINIGAME_CHUNK_LOADERS) {
    void load();
  }
}

/** Prefetch de rotas principais + minigames em duas ondas para não competir com a UI. */
export function prefetchAppRoutes(
  router: { prefetch: (href: string) => void },
  options?: { includeMinigames?: boolean }
): void {
  prefetchRoutes(router, MAIN_NAV_ROUTES);

  if (options?.includeMinigames !== false) {
    scheduleIdle(() => {
      prefetchRoutes(router, MINIGAME_ROUTES);
      preloadMinigameChunks();
    }, 3500);
  }
}
