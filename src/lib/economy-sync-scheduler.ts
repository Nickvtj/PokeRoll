import { saveEconomy } from "@/lib/economy-storage";
import { syncEconomyToSupabase } from "@/lib/economy-supabase";
import type { EconomyState } from "@/types/economy";

let pendingRemote: EconomyState | null = null;
let remoteTimer: ReturnType<typeof setTimeout> | null = null;

const REMOTE_DEBOUNCE_MS = 600;

/** Persistência local imediata; Supabase em lote para não travar a UI */
export function persistEconomy(economy: EconomyState): void {
  saveEconomy(economy);
  pendingRemote = economy;

  if (remoteTimer) clearTimeout(remoteTimer);
  remoteTimer = setTimeout(() => {
    remoteTimer = null;
    if (!pendingRemote) return;
    const snap = pendingRemote;
    pendingRemote = null;
    void syncEconomyToSupabase(snap);
  }, REMOTE_DEBOUNCE_MS);
}

export function flushEconomyPersistence(): void {
  if (remoteTimer) {
    clearTimeout(remoteTimer);
    remoteTimer = null;
  }
  if (!pendingRemote) return;
  const snap = pendingRemote;
  pendingRemote = null;
  void syncEconomyToSupabase(snap);
}

if (typeof window !== "undefined") {
  window.addEventListener("pagehide", flushEconomyPersistence);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") flushEconomyPersistence();
  });
}
