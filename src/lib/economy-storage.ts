import { STORAGE_KEYS } from "@/lib/supabase";
import type { EconomyState } from "@/types/economy";
import { STARTING_COINS } from "@/data/economy-balance";

const ECONOMY_KEY = "pokeroll_economy";

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

export function saveEconomy(economy: EconomyState): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(ECONOMY_KEY, JSON.stringify(economy));
}

export { ECONOMY_KEY };
