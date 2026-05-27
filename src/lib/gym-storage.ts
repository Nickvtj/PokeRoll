import { createDebouncedJsonPersist } from "@/lib/debounced-local-storage";
import type { GymState } from "@/types/gym";

const GYM_KEY = "pokeroll_gym";

const gymPersist = createDebouncedJsonPersist<GymState>(GYM_KEY);

export function getDefaultGymState(): GymState {
  return {
    badges: [],
    gymProgress: {},
    hallOfFame: [],
    eliteProgress: {},
    championDefeated: false,
    savedTeams: [],
    hallOfFameFinal: false,
  };
}

export function loadGymState(): GymState {
  if (typeof window === "undefined") return getDefaultGymState();
  try {
    const raw = localStorage.getItem(GYM_KEY);
    if (raw) return { ...getDefaultGymState(), ...JSON.parse(raw) };
  } catch {
    /* fallback */
  }
  return getDefaultGymState();
}

export function persistGymState(state: GymState): void {
  gymPersist.schedule(state);
}

export function flushGymState(): void {
  gymPersist.flush();
}

/** Grava imediatamente — uso ao receber dados remotos no boot. */
export function saveGymStateImmediate(state: GymState): void {
  gymPersist.writeImmediate(state);
}

/** @deprecated Prefer persistGymState */
export function saveGymState(state: GymState): void {
  persistGymState(state);
}

export { GYM_KEY };
