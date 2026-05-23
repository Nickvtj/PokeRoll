import type { GymState } from "@/types/gym";

const GYM_KEY = "pokeroll_gym";

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

export function saveGymState(state: GymState): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(GYM_KEY, JSON.stringify(state));
}

export { GYM_KEY };
