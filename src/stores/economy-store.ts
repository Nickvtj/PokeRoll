import { create } from "zustand";
import {
  DAILY_LOGIN_COINS,
  DAILY_MISSIONS,
  DUPLICATE_COIN_REWARD,
  SPIN_COST_PER_REEL,
  STARTING_COINS,
  XP_PER_LEVEL,
} from "@/data/economy-balance";
import { getTeamPassiveBonuses } from "@/data/pokemon-stats";
import {
  addPokemonXp,
  getXpProgress,
  POKEMON_BATTLE_XP_LOSS,
  POKEMON_BATTLE_XP_WIN,
  POKEMON_XP_PER_LEVEL,
} from "@/data/pokemon-battle-level";
import { POKEMON_MAP } from "@/data/pokemon";
import { loadEconomy, saveEconomy, getDefaultEconomy } from "@/lib/economy-storage";
import {
  loadEconomyFromSupabase,
  syncEconomyToSupabase,
} from "@/lib/economy-supabase";
import type { EconomyState, RewardPayload } from "@/types/economy";
import type { PokemonLevelUpResult } from "@/types/battle";

interface EconomyStore extends EconomyState {
  lastReward: RewardPayload | null;
  showReward: boolean;
  coinAnimation: "gain" | "loss" | null;

  initializeEconomy: () => void;
  addCoins: (amount: number, reason?: string) => void;
  spendCoins: (amount: number) => boolean;
  addXp: (amount: number) => void;
  useFreeSpin: () => boolean;
  grantFreeSpin: (count?: number) => void;

  canAffordSpin: (multiplier: number) => boolean;
  getSpinCost: (multiplier: number) => number;
  payForSpin: (multiplier: number) => boolean;

  setTeam: (team: number[]) => void;
  getPokemonProgress: (id: number) => { level: number; xp: number; xpInLevel: number; xpPct: number };
  getPokemonLevelsMap: () => Record<number, number>;
  grantPokemonBattleXp: (pokemonIds: number[], won: boolean) => PokemonLevelUpResult[];
  recordBattleWin: () => void;
  recordBattleLoss: () => void;
  recordClickGame: (coinsEarned: number) => void;
  convertDuplicate: () => void;

  checkDailyLogin: () => number;
  resetDailyIfNeeded: () => void;
  incrementMission: (type: string, amount?: number) => void;
  claimMission: (missionId: string) => boolean;

  showRewardPopup: (reward: RewardPayload) => void;
  closeRewardPopup: () => void;
  sync: () => void;
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function calcLevel(xp: number) {
  return Math.min(50, Math.floor(xp / XP_PER_LEVEL) + 1);
}

export const useEconomyStore = create<EconomyStore>((set, get) => ({
  ...getDefaultEconomy(),
  lastReward: null,
  showReward: false,
  coinAnimation: null,

  initializeEconomy: () => {
    const data = loadEconomy();
    set({ ...data });
    void loadEconomyFromSupabase().then((remote) => {
      if (remote) {
        set({ ...remote });
        saveEconomy(remote);
      }
    });
    get().checkDailyLogin();
    get().resetDailyIfNeeded();
  },

  sync: () => {
    const snap = getEconomySnapshot(get());
    saveEconomy(snap);
    void syncEconomyToSupabase(snap);
  },

  addCoins: (amount, reason) => {
    if (amount <= 0) return;
    set((s) => ({
      coins: s.coins + amount,
      coinAnimation: "gain",
    }));
    get().sync();
    setTimeout(() => set({ coinAnimation: null }), 600);
  },

  spendCoins: (amount) => {
    if (get().coins < amount) return false;
    set((s) => ({
      coins: s.coins - amount,
      coinAnimation: "loss",
    }));
    get().sync();
    setTimeout(() => set({ coinAnimation: null }), 600);
    return true;
  },

  addXp: (amount) => {
    set((s) => {
      const xp = s.xp + amount;
      const level = calcLevel(xp);
      const rank = Math.floor(level / 5) + 1;
      return { xp, level, rank };
    });
    get().sync();
  },

  useFreeSpin: () => {
    if (get().freeSpins <= 0) return false;
    set((s) => ({ freeSpins: s.freeSpins - 1 }));
    get().sync();
    return true;
  },

  grantFreeSpin: (count = 1) => {
    set((s) => ({ freeSpins: s.freeSpins + count }));
    get().sync();
  },

  canAffordSpin: (multiplier) => {
    const cost = get().getSpinCost(multiplier);
    return get().coins >= cost || get().freeSpins >= multiplier;
  },

  getSpinCost: (multiplier) => SPIN_COST_PER_REEL * multiplier,

  payForSpin: (multiplier) => {
    const free = get().freeSpins;
    if (free >= multiplier) {
      set((s) => ({ freeSpins: s.freeSpins - multiplier }));
      get().sync();
      return true;
    }
    const cost = get().getSpinCost(multiplier);
    return get().spendCoins(cost);
  },

  setTeam: (team) => {
    set({ team: team.slice(0, 3) });
    get().sync();
  },

  getPokemonProgress: (id) => {
    const key = String(id);
    const stored = get().pokemonBattleXp[key] ?? { level: 1, xp: 0 };
    const { xpInLevel, pct, level } = getXpProgress(stored.xp);
    return { level, xp: stored.xp, xpInLevel, xpPct: pct };
  },

  getPokemonLevelsMap: () => {
    const map: Record<number, number> = {};
    for (const [key, val] of Object.entries(get().pokemonBattleXp)) {
      map[Number(key)] = val.level;
    }
    for (const id of get().team) {
      if (!(id in map)) map[id] = 1;
    }
    return map;
  },

  grantPokemonBattleXp: (pokemonIds, won) => {
    const amount = won ? POKEMON_BATTLE_XP_WIN : POKEMON_BATTLE_XP_LOSS;
    const results: PokemonLevelUpResult[] = [];

    set((s) => {
      const pokemonBattleXp = { ...s.pokemonBattleXp };
      for (const id of pokemonIds) {
        const key = String(id);
        const pokemon = POKEMON_MAP[id];
        if (!pokemon) continue;

        const current = pokemonBattleXp[key] ?? { level: 1, xp: 0 };
        const prevProgress = getXpProgress(current.xp);
        const { progress, leveledUp, previousLevel } = addPokemonXp(current, amount);
        pokemonBattleXp[key] = progress;
        const newProgress = getXpProgress(progress.xp);

        results.push({
          pokemonId: id,
          pokemonName: pokemon.name,
          image: pokemon.image,
          previousLevel,
          newLevel: progress.level,
          xpGained: amount,
          previousXpInLevel: prevProgress.xpInLevel,
          newXpInLevel: newProgress.xpInLevel,
          xpPct: newProgress.pct,
          leveledUp,
        });
      }
      return { pokemonBattleXp };
    });

    get().sync();
    return results;
  },

  recordBattleWin: () => {
    set((s) => ({
      battleWins: s.battleWins + 1,
      totalBattles: s.totalBattles + 1,
    }));
    get().incrementMission("battles");
    get().sync();
  },

  recordBattleLoss: () => {
    set((s) => ({ totalBattles: s.totalBattles + 1 }));
    get().sync();
  },

  recordClickGame: (coinsEarned) => {
    const today = todayStr();
    set((s) => ({
      clickGamesPlayed: s.clickGamesPlayed + 1,
      clickGamesToday:
        s.lastClickGameDate === today ? s.clickGamesToday + 1 : 1,
      clickCoinsToday:
        s.lastClickGameDate === today
          ? s.clickCoinsToday + coinsEarned
          : coinsEarned,
      lastClickGameDate: today,
    }));
    get().incrementMission("clicks");
    get().sync();
  },

  convertDuplicate: () => {
    get().addCoins(DUPLICATE_COIN_REWARD);
  },

  checkDailyLogin: () => {
    const today = todayStr();
    const { lastLoginDate, dailyStreak } = get();
    if (lastLoginDate === today) return 0;

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().slice(0, 10);

    let newStreak = 1;
    if (lastLoginDate === yesterdayStr) {
      newStreak = dailyStreak + 1;
    }

    const dayIndex = Math.min(newStreak - 1, DAILY_LOGIN_COINS.length - 1);
    const coins = DAILY_LOGIN_COINS[dayIndex];

    set({
      lastLoginDate: today,
      dailyStreak: newStreak,
    });
    get().addCoins(coins);
    get().showRewardPopup({
      coins,
      message: `Login dia ${newStreak}! +${coins} moedas`,
    });
    get().sync();
    return coins;
  },

  resetDailyIfNeeded: () => {
    const today = todayStr();
    if (get().lastMissionDate !== today) {
      set({
        missionProgress: {},
        missionsClaimed: [],
        lastMissionDate: today,
        clickCoinsToday: 0,
        clickGamesToday: 0,
        lastClickGameDate: today,
      });
      get().sync();
    }
  },

  incrementMission: (type, amount = 1) => {
    const missions = DAILY_MISSIONS.filter((m) => m.type === type);
    set((s) => {
      const progress = { ...s.missionProgress };
      for (const m of missions) {
        progress[m.id] = Math.min(
          m.target,
          (progress[m.id] ?? 0) + amount
        );
      }
      return { missionProgress: progress };
    });
    get().sync();
  },

  claimMission: (missionId) => {
    const mission = DAILY_MISSIONS.find((m) => m.id === missionId);
    if (!mission) return false;
    const { missionProgress, missionsClaimed } = get();
    if (missionsClaimed.includes(missionId)) return false;
    if ((missionProgress[missionId] ?? 0) < mission.target) return false;

    set((s) => ({
      missionsClaimed: [...s.missionsClaimed, missionId],
    }));
    get().addCoins(mission.reward);
    get().showRewardPopup({
      coins: mission.reward,
      message: `Missão completa: ${mission.label}`,
    });
    get().sync();
    return true;
  },

  showRewardPopup: (reward) => set({ lastReward: reward, showReward: true }),
  closeRewardPopup: () => set({ showReward: false, lastReward: null }),
}));

function getEconomySnapshot(state: EconomyStore): EconomyState {
  return {
    coins: state.coins,
    xp: state.xp,
    level: state.level,
    freeSpins: state.freeSpins,
    rank: state.rank,
    battleWins: state.battleWins,
    totalBattles: state.totalBattles,
    clickGamesPlayed: state.clickGamesPlayed,
    clickCoinsToday: state.clickCoinsToday,
    clickGamesToday: state.clickGamesToday,
    lastClickGameDate: state.lastClickGameDate,
    dailyStreak: state.dailyStreak,
    lastLoginDate: state.lastLoginDate,
    missionProgress: state.missionProgress,
    missionsClaimed: state.missionsClaimed,
    lastMissionDate: state.lastMissionDate,
    team: state.team,
    pokemonBattleXp: state.pokemonBattleXp,
  };
}

export function getEconomyBonuses(team: number[]) {
  return getTeamPassiveBonuses(team);
}

export { SPIN_COST_PER_REEL, STARTING_COINS, POKEMON_XP_PER_LEVEL };
