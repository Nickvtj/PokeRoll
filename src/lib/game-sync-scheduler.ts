import {
  flushLocalCollection,
  flushLocalProfile,
  persistLocalCollection,
  persistLocalProfile,
  syncProfileToSupabase,
  recordSpinsToSupabase,
} from "@/lib/storage";
import type { CollectedPokemon, PlayerProfile } from "@/types";

const REMOTE_DEBOUNCE_MS = 600;

interface SpinRecord {
  pokemonId: number;
  isDuplicate: boolean;
}

interface PendingRemoteSpin {
  profile: PlayerProfile | null;
  spins: SpinRecord[];
}

let pendingRemote: PendingRemoteSpin = { profile: null, spins: [] };
let remoteTimer: ReturnType<typeof setTimeout> | null = null;

export interface SpinPersistPayload {
  collection: Record<number, CollectedPokemon>;
  profile: PlayerProfile;
  spins: SpinRecord[];
}

/** Persistência local (debounced) + fila remota, não bloqueia gameplay. */
export function queueSpinPersistence(payload: SpinPersistPayload): void {
  persistLocalCollection(payload.collection);
  persistLocalProfile(payload.profile);
  queueSpinRemoteSync(payload.profile, payload.spins);
}

function queueSpinRemoteSync(profile: PlayerProfile, spins: SpinRecord[]): void {
  pendingRemote.profile = profile;
  pendingRemote.spins.push(...spins);

  if (remoteTimer) clearTimeout(remoteTimer);
  remoteTimer = setTimeout(() => {
    remoteTimer = null;
    void flushSpinRemoteSync();
  }, REMOTE_DEBOUNCE_MS);
}

async function flushSpinRemoteSync(): Promise<void> {
  const snap = pendingRemote;
  pendingRemote = { profile: null, spins: [] };

  if (!snap.profile && snap.spins.length === 0) return;

  try {
    if (snap.spins.length > 0) {
      await recordSpinsToSupabase(snap.spins, snap.profile ?? undefined);
    } else if (snap.profile) {
      await syncProfileToSupabase(snap.profile);
    }
  } catch (error) {
    console.error("[PokéRoll] Falha ao sincronizar spin com Supabase:", error);
  }
}

export function flushSpinPersistence(): void {
  flushLocalCollection();
  flushLocalProfile();

  if (remoteTimer) {
    clearTimeout(remoteTimer);
    remoteTimer = null;
  }
  void flushSpinRemoteSync();
}

if (typeof window !== "undefined") {
  window.addEventListener("pagehide", flushSpinPersistence);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") flushSpinPersistence();
  });
}
