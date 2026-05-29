import { create } from "zustand";
import { GYM_MAP, GYMS, isEliteLeagueUnlocked, isGymUnlocked } from "@/data/gyms";
import { getLevelCap } from "@/data/pokemon-xp-curve";
import { getDefaultGymState, loadGymState, persistGymState, saveGymStateImmediate } from "@/lib/gym-storage";
import { loadGymFromSupabase, syncGymToSupabase } from "@/lib/gym-supabase";
import { useEconomyStore } from "@/stores/economy-store";
import type {
  EliteId,
  GymId,
  GymProgressEntry,
  GymState,
  PerfectRunBonus,
  SavedTeam,
} from "@/types/gym";
import { GYM_LEADER_COIN_REWARD } from "@/data/gym-badges";

interface GymStore extends GymState {
  initializeGym: () => void;
  sync: () => void;
  getLevelCap: () => number;
  getBadgeCount: () => number;
  hasBadge: (gymId: GymId) => boolean;
  isGymUnlocked: (gymId: GymId) => boolean;
  isEliteUnlocked: () => boolean;
  getGymProgress: (gymId: GymId) => GymProgressEntry;
  recordGymStageWin: (
    gymId: GymId,
    stage: number,
    teamIds: number[],
    bonus: PerfectRunBonus
  ) => { badgeEarned: boolean; newHallEntries: number[] };
  recordEliteWin: (
    eliteId: EliteId,
    teamIds: number[],
    bonus: PerfectRunBonus
  ) => { championDefeated: boolean };
  getHallOfFameForGym: (gymId: GymId) => number[];
  getHallOfFameBorder: (pokemonId: number) => GymId[];
  canClaimGymCoins: (gymId: GymId) => boolean;
  claimGymCoinReward: (gymId: GymId) => number;
  saveTeam: (name: string, pokemonIds: number[]) => void;
  deleteSavedTeam: (id: string) => void;
  loadSavedTeam: (id: string) => number[] | null;
}

function defaultProgress(): GymProgressEntry {
  return { cleared: false, bestStars: 0, attempts: 0, perfectClears: 0, coinRewardClaimed: false };
}

function calcPerfectRun(
  won: boolean,
  playerDeaths: number,
  turnCount: number,
  teamAvgLevel: number,
  recommendedLevel: number
): PerfectRunBonus {
  const noDeaths = won && playerDeaths === 0;
  const fastClear = won && turnCount <= 18;
  const underleveled = won && teamAvgLevel < recommendedLevel - 2;
  let stars = won ? 1 : 0;
  if (noDeaths) stars++;
  if (fastClear) stars++;
  if (underleveled) stars++;
  const rank: PerfectRunBonus["rank"] =
    stars >= 4 ? "S" : stars >= 3 ? "A" : stars >= 2 ? "B" : "C";
  return {
    noDeaths,
    fastClear,
    underleveled,
    typeChallenge: false,
    stars: Math.min(4, stars),
    rank,
  };
}

export { calcPerfectRun };

export const useGymStore = create<GymStore>((set, get) => ({
  ...getDefaultGymState(),

  initializeGym: () => {
    const data = loadGymState();
    set({ ...data });
    void loadGymFromSupabase().then((remote) => {
      if (remote) {
        set({ ...remote });
        saveGymStateImmediate(remote);
      }
    });
  },

  sync: () => {
    const snap = getGymSnapshot(get());
    persistGymState(snap);
    void syncGymToSupabase(snap);
  },

  getLevelCap: () =>
    getLevelCap(get().badges.length, get().championDefeated),

  getBadgeCount: () => get().badges.length,

  hasBadge: (gymId) => get().badges.includes(gymId),

  isGymUnlocked: (gymId) => {
    return isGymUnlocked(gymId, get().badges);
  },

  isEliteUnlocked: () => {
    return isEliteLeagueUnlocked(useEconomyStore.getState().level, get().badges);
  },

  getGymProgress: (gymId) => get().gymProgress[gymId] ?? defaultProgress(),

  recordGymStageWin: (gymId, stage, teamIds, bonus) => {
    const isLeader = stage === 5;
    let badgeEarned = false;
    const newHallEntries: number[] = [];
    const now = new Date().toISOString();

    set((s) => {
      const gymProgress = { ...s.gymProgress };
      const prev = gymProgress[gymId] ?? defaultProgress();
      gymProgress[gymId] = {
        ...prev,
        attempts: prev.attempts + 1,
        bestStars: Math.max(prev.bestStars, bonus.stars),
        perfectClears: prev.perfectClears + (bonus.noDeaths ? 1 : 0),
        ...(isLeader
          ? { cleared: true, firstClearAt: prev.firstClearAt ?? now }
          : {}),
      };

      let badges = [...s.badges];
      if (isLeader && !badges.includes(gymId)) {
        badges = [...badges, gymId];
        badgeEarned = true;
      }

      const hallOfFame = [...s.hallOfFame];
      if (isLeader) {
        for (const pokemonId of teamIds) {
          const exists = hallOfFame.some(
            (e) => e.gymId === gymId && e.pokemonId === pokemonId
          );
          if (!exists) {
            hallOfFame.push({ gymId, pokemonId, clearedAt: now, stars: bonus.stars });
            newHallEntries.push(pokemonId);
          }
        }
      }

      return { gymProgress, badges, hallOfFame };
    });

    get().sync();
    return { badgeEarned, newHallEntries };
  },

  recordEliteWin: (eliteId, teamIds, bonus) => {
    let championDefeated = false;
    const now = new Date().toISOString();
    const isChampion = eliteId === "champion";

    set((s) => {
      const eliteProgress = { ...s.eliteProgress };
      const prev = eliteProgress[eliteId] ?? defaultProgress();
      eliteProgress[eliteId] = {
        ...prev,
        cleared: true,
        attempts: prev.attempts + 1,
        bestStars: Math.max(prev.bestStars, bonus.stars),
        perfectClears: prev.perfectClears + (bonus.noDeaths ? 1 : 0),
        firstClearAt: prev.firstClearAt ?? now,
      };

      if (isChampion) championDefeated = true;

      return {
        eliteProgress,
        championDefeated: s.championDefeated || isChampion,
        hallOfFameFinal: s.hallOfFameFinal || isChampion,
      };
    });

    get().sync();
    return { championDefeated };
  },

  getHallOfFameForGym: (gymId) => {
    const ids = get()
      .hallOfFame.filter((e) => e.gymId === gymId)
      .map((e) => e.pokemonId);
    return [...new Set(ids)];
  },

  getHallOfFameBorder: (pokemonId) => {
    const gymIds = get()
      .hallOfFame.filter((e) => e.pokemonId === pokemonId)
      .map((e) => e.gymId);
    return [...new Set(gymIds)];
  },

  canClaimGymCoins: (gymId) => {
    const progress = get().gymProgress[gymId];
    return !!progress?.cleared && !progress?.coinRewardClaimed;
  },

  claimGymCoinReward: (gymId) => {
    if (!get().canClaimGymCoins(gymId)) return 0;

    set((s) => {
      const gymProgress = { ...s.gymProgress };
      const prev = gymProgress[gymId] ?? defaultProgress();
      gymProgress[gymId] = { ...prev, coinRewardClaimed: true };
      return { gymProgress };
    });

    get().sync();
    return GYM_LEADER_COIN_REWARD;
  },

  saveTeam: (name, pokemonIds) => {
    const team: SavedTeam = {
      id: `team-${Date.now()}`,
      name,
      pokemonIds: pokemonIds.slice(0, 3),
      createdAt: new Date().toISOString(),
    };
    set((s) => ({ savedTeams: [...s.savedTeams, team].slice(-8) }));
    get().sync();
  },

  deleteSavedTeam: (id) => {
    set((s) => ({ savedTeams: s.savedTeams.filter((t) => t.id !== id) }));
    get().sync();
  },

  loadSavedTeam: (id) => {
    const team = get().savedTeams.find((t) => t.id === id);
    return team ? team.pokemonIds : null;
  },
}));

function getGymSnapshot(state: GymStore): GymState {
  return {
    badges: state.badges,
    gymProgress: state.gymProgress,
    hallOfFame: state.hallOfFame,
    eliteProgress: state.eliteProgress,
    championDefeated: state.championDefeated,
    savedTeams: state.savedTeams,
    hallOfFameFinal: state.hallOfFameFinal,
  };
}

export { GYM_MAP, GYMS };
