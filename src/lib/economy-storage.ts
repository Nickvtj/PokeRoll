import { createDebouncedJsonPersist } from "@/lib/debounced-local-storage";
import type { EconomyState } from "@/types/economy";
import { STARTING_COINS } from "@/data/economy-balance";

const ECONOMY_KEY = "pokeroll_economy";

const economyPersist = createDebouncedJsonPersist<EconomyState>(ECONOMY_KEY);

export function getDefaultEconomy(): EconomyState {
  return {
    coins: STARTING_COINS,
    xp: 0,
    level: 1,
    freeSpins: 0,
    rank: 1,
    battleWins: 0,
    totalBattles: 0,
    clickGamesPlayed: 0,
    clickCoinsToday: 0,
    clickGamesToday: 0,
    lastClickGameDate: "",
    dailyStreak: 0,
    lastLoginDate: "",
    missionProgress: {},
    missionsClaimed: [],
    lastMissionDate: "",
    team: [],
    favoritePokemon: [],
    pokemonBattleXp: {},
    welcomeClaimed: false,
    unlockedAchievements: [],
    selectedAvatarId: "default",
    luckyEggExpiresAt: null,
    luckyEggCount: 0,
    rareCandyCount: 0,
  };
}

export function loadEconomy(): EconomyState {
  if (typeof window === "undefined") return getDefaultEconomy();
  try {
    const raw = localStorage.getItem(ECONOMY_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<EconomyState>;
      const isLegacy = !("welcomeClaimed" in parsed);
      return {
        ...getDefaultEconomy(),
        ...parsed,
        welcomeClaimed: isLegacy ? true : parsed.welcomeClaimed ?? false,
      };
    }
  } catch {
    /* fallback */
  }
  return getDefaultEconomy();
}

export function persistEconomyLocal(economy: EconomyState): void {
  economyPersist.schedule(economy);
}

export function flushEconomyLocal(): void {
  economyPersist.flush();
}

/** Grava imediatamente — uso em merge remoto ou flush crítico. */
export function saveEconomyImmediate(economy: EconomyState): void {
  economyPersist.writeImmediate(economy);
}

/** @deprecated Prefer persistEconomyLocal via economy-sync-scheduler */
export function saveEconomy(economy: EconomyState): void {
  persistEconomyLocal(economy);
}

export { ECONOMY_KEY };
