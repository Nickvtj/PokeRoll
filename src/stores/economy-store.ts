import { create } from "zustand";
import {
  DAILY_LOGIN_COINS,
  DAILY_MISSIONS,
  DUPLICATE_COIN_REWARD,
  SPIN_COST_PER_REEL,
  STARTING_COINS,
  WELCOME_PACKAGE_COINS,
  STREAK_BONUS_COINS,
  XP_PER_LEVEL,
  LUCKY_EGG_DURATION_MS,
  LUCKY_EGG_XP_MULTIPLIER,
  LUCKY_EGG_PER_MILESTONE,
  RARE_CANDY_PER_MILESTONE,
  TRAINER_LEVEL_MILESTONE,
} from "@/data/economy-balance";
import type { AchievementStats } from "@/data/achievements";
import {
  computeNewAchievements,
  loadAchievementsFromSupabase,
  syncAchievementsToSupabase,
} from "@/lib/achievements-sync";
import { getTeamPassiveBonuses } from "@/data/pokemon-stats";
import {
  addPokemonXp,
  getXpProgressFromTotal,
  migrateLegacyTotalXp,
  calcPokemonLevelFromTotalXp,
  totalXpForLevel,
  POKEMON_BATTLE_XP_LOSS,
  POKEMON_BATTLE_XP_WIN,
  GYM_BATTLE_XP_WIN,
  GYM_BATTLE_XP_LOSS,
  ELITE_BATTLE_XP_WIN,
} from "@/data/pokemon-battle-level";
import type { BattleMode } from "@/types/gym";
import { POKEMON_MAP } from "@/data/pokemon";
import { loadEconomy, getDefaultEconomy } from "@/lib/economy-storage";
import { persistEconomy } from "@/lib/economy-sync-scheduler";
import {
  loadEconomyFromSupabase,
} from "@/lib/economy-supabase";
import { mergeEconomyState } from "@/lib/economy-merge";
import { useGymStore } from "@/stores/gym-store";
import { getBeltForXp, JITSU_BELT_RANK_REWARDS } from "@/data/jitsu-belts";
import type { EconomyState, RewardPayload, RewardPlayAgainFn } from "@/types/economy";
import type { PokemonLevelUpResult } from "@/types/battle";
import {
  getPokemonMoveEntries,
  isMoveSlotUnlocked,
} from "@/data/pokemon-moves";

interface EconomyStore extends EconomyState {
  lastReward: RewardPayload | null;
  showReward: boolean;
  rewardPlayAgain: RewardPlayAgainFn | null;
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
  removeFromTeam: (pokemonId: number) => void;
  removeFromTeamAtSlot: (slotIndex: number) => void;
  toggleFavoritePokemon: (id: number) => void;
  isFavoritePokemon: (id: number) => boolean;
  getPokemonProgress: (id: number) => { level: number; xp: number; xpInLevel: number; xpPct: number };
  getPokemonLevelsMap: () => Record<number, number>;
  grantPokemonBattleXp: (pokemonIds: number[], won: boolean, mode?: BattleMode) => PokemonLevelUpResult[];
  grantPokemonXp: (pokemonId: number, amount: number) => PokemonLevelUpResult | null;
  getLevelCap: () => number;
  recordBattleWin: () => void;
  recordBattleLoss: () => void;
  recordClickGame: (coinsEarned: number) => void;
  updateHighScore: (
    game: "clickRush" | "perfectCapture" | "memory" | "jitsu",
    score: number
  ) => boolean;
  recordJitsuMatch: (won: boolean) => {
    beltPromoted: boolean;
    newBeltId: string;
    rankCoinBonus: number;
  };
  convertDuplicate: () => void;

  checkDailyLogin: () => number;
  resetDailyIfNeeded: () => void;
  incrementMission: (type: string, amount?: number) => void;
  claimMission: (missionId: string) => boolean;
  claimAllMissions: () => number;

  showRewardPopup: (reward: RewardPayload, onPlayAgain?: RewardPlayAgainFn) => void;
  closeRewardPopup: () => void;
  claimWelcomePackage: () => void;
  refreshAchievements: (stats: AchievementStats) => void;
  dequeueAchievementToast: (id: string) => void;
  setSelectedAvatar: (avatarId: string) => void;
  sync: () => void;
  isLuckyEggActive: () => boolean;
  activateLuckyEgg: () => boolean;
  useRareCandyOnPokemon: (pokemonId: number, count?: number) => boolean;
  splitRareCandyOnTeam: () => boolean;
  toggleMoveEquip: (pokemonId: number, moveId: string) => boolean;
  getPokemonMoveLoadout: (pokemonId: number) => string[];
  achievementToastQueue: { id: string; at: number }[];
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function calcLevel(xp: number) {
  return Math.min(50, Math.floor(xp / XP_PER_LEVEL) + 1);
}

export const useEconomyStore = create<EconomyStore>((set, get) => {
  const store: EconomyStore = {
    ...getDefaultEconomy(),
    lastReward: null,
    showReward: false,
    rewardPlayAgain: null,
    coinAnimation: null,
    achievementToastQueue: [],

    initializeEconomy: () => {
      const data = loadEconomy();

      if (data.pokemonBattleXp) {
        const migratedXp: Record<string, { level: number; xp: number }> = {};
        let hasChange = false;
        for (const [key, val] of Object.entries(data.pokemonBattleXp)) {
          // Se já tem XP total migrado, não precisa recalcular
          if (val.xp > 500) {
             migratedXp[key] = val;
             continue;
          }
          hasChange = true;
          const total = migrateLegacyTotalXp(val.level, val.xp);
          migratedXp[key] = { xp: total, level: calcPokemonLevelFromTotalXp(total) };
        }
        if (hasChange) {
          set({ ...data, pokemonBattleXp: { ...data.pokemonBattleXp, ...migratedXp } });
        } else {
          set({ ...data });
        }
      } else {
        set({ ...data });
      }

      void Promise.all([loadEconomyFromSupabase(), loadAchievementsFromSupabase()]).then(
        ([remote, remoteAchievements]) => {
          if (!remote) return;
          const local = get();
          set(
            mergeEconomyState(
              getEconomySnapshot(local),
              remote,
              remoteAchievements ?? []
            )
          );
          persistEconomy(getEconomySnapshot(get()));
        }
      );

      if (data.welcomeClaimed) {
        get().checkDailyLogin();
        get().resetDailyIfNeeded();
      }
    },

    getLevelCap: () => useGymStore.getState().getLevelCap(),

  grantPokemonXp: (pokemonId, amount) => {
    if (amount <= 0) return null;
    const pokemon = POKEMON_MAP[pokemonId];
    if (!pokemon) return null;

    const levelCap = get().getLevelCap();
    let result: PokemonLevelUpResult | null = null;

    set((s) => {
      const key = String(pokemonId);
      const current = s.pokemonBattleXp[key] ?? { level: 1, xp: 0 };
      const prevProgress = getXpProgressFromTotal(current.xp);
      const { progress, leveledUp, previousLevel } = addPokemonXp(current, amount, levelCap);
      const newProgress = getXpProgressFromTotal(progress.xp);
      result = {
        pokemonId,
        pokemonName: pokemon.name,
        image: pokemon.image,
        previousLevel,
        newLevel: progress.level,
        xpGained: amount,
        previousXpInLevel: prevProgress.xpInLevel,
        newXpInLevel: newProgress.xpInLevel,
        xpPct: newProgress.pct,
        xpNeeded: newProgress.xpNeeded,
        leveledUp,
      };
      return { pokemonBattleXp: { ...s.pokemonBattleXp, [key]: progress } };
    });

    get().sync();
    return result;
  },

  grantPokemonBattleXp: (pokemonIds, won, mode = "training") => {
    let amount =
      mode === "elite"
        ? won
          ? ELITE_BATTLE_XP_WIN
          : GYM_BATTLE_XP_LOSS
        : mode === "gym"
          ? won
            ? GYM_BATTLE_XP_WIN
            : GYM_BATTLE_XP_LOSS
          : won
            ? POKEMON_BATTLE_XP_WIN
            : POKEMON_BATTLE_XP_LOSS;

    const luckyActive =
      get().luckyEggExpiresAt != null && Date.now() < (get().luckyEggExpiresAt ?? 0);
    if (luckyActive) {
      amount = Math.round(amount * LUCKY_EGG_XP_MULTIPLIER);
    }

    const levelCap = get().getLevelCap();
    const results: PokemonLevelUpResult[] = [];

    set((s) => {
      const pokemonBattleXp = { ...s.pokemonBattleXp };
      const uniqueIds = [...new Set(pokemonIds)];

      for (const id of uniqueIds) {
        const key = String(id);
        const pokemon = POKEMON_MAP[id];
        if (!pokemon) continue;

        const current = pokemonBattleXp[key] ?? { level: 1, xp: 0 };
        const prevProgress = getXpProgressFromTotal(current.xp);
        const { progress, leveledUp, previousLevel } = addPokemonXp(current, amount, levelCap);
        pokemonBattleXp[key] = progress;
        const newProgress = getXpProgressFromTotal(progress.xp);

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
          xpNeeded: newProgress.xpNeeded,
          leveledUp,
          luckyEggBoosted: luckyActive,
        });
      }

      return { pokemonBattleXp };
    });

    get().sync();
    return results;
  },

  sync: () => {
    const snap = getEconomySnapshot(get());
    persistEconomy(snap);
  },

  addCoins: (amount) => {
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
    if (!Number.isFinite(amount) || amount <= 0) return;

    const luckyActive =
      get().luckyEggExpiresAt != null && Date.now() < (get().luckyEggExpiresAt ?? 0);
    const xpGain = luckyActive
      ? Math.round(amount * LUCKY_EGG_XP_MULTIPLIER)
      : amount;

    set((s) => {
      const oldLevel = calcLevel(Number.isFinite(s.xp) ? s.xp : 0);
      const xp = (Number.isFinite(s.xp) ? s.xp : 0) + xpGain;
      const level = calcLevel(xp);
      const rank = Math.floor(level / 5) + 1;
      let rareCandyCount = s.rareCandyCount ?? 0;
      let luckyEggCount = s.luckyEggCount ?? 0;

      if (level > oldLevel) {
        for (let l = oldLevel + 1; l <= level; l++) {
          if (l % TRAINER_LEVEL_MILESTONE === 0) {
            rareCandyCount += RARE_CANDY_PER_MILESTONE;
            luckyEggCount += LUCKY_EGG_PER_MILESTONE;
          }
        }
      }

      return { xp, level, rank, rareCandyCount, luckyEggCount };
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
    const cost = get().getSpinCost(multiplier);
    if (get().coins >= cost) {
      return get().spendCoins(cost);
    }
    if (get().freeSpins >= multiplier) {
      set((s) => ({ freeSpins: s.freeSpins - multiplier }));
      get().sync();
      return true;
    }
    return false;
  },

  setTeam: (team) => {
    set({ team: team.slice(0, 3) });
    get().sync();
  },

  removeFromTeam: (pokemonId) => {
    set((s) => ({ team: s.team.filter((id) => id !== pokemonId) }));
    get().sync();
  },

  removeFromTeamAtSlot: (slotIndex) => {
    set((s) => ({
      team: s.team.filter((_, i) => i !== slotIndex),
    }));
    get().sync();
  },

  toggleFavoritePokemon: (id) => {
    const favorites = get().favoritePokemon ?? [];
    const exists = favorites.includes(id);
    const nextFavorites = exists
      ? favorites.filter((f) => f !== id)
      : [...favorites, id];
    
    set({ favoritePokemon: nextFavorites });
    get().sync();
  },

  isFavoritePokemon: (id) => (get().favoritePokemon ?? []).includes(id),

  getPokemonProgress: (id) => {
    const key = String(id);
    const stored = get().pokemonBattleXp[key] ?? { level: 1, xp: 0 };
    const { xpInLevel, pct, level } = getXpProgressFromTotal(stored.xp);
    return { level, xp: stored.xp, xpInLevel, xpPct: pct };
  },

  getPokemonLevelsMap: () => {
    const map: Record<number, number> = {};
    for (const [key, val] of Object.entries(get().pokemonBattleXp)) {
      map[Number(key)] = calcPokemonLevelFromTotalXp(val.xp);
    }
    for (const id of get().team) {
      if (!(id in map)) map[id] = 1;
    }
    return map;
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

  updateHighScore: (game, score) => {
    const currentScores = get().highScores ?? {};
    const previous = currentScores[game] ?? 0;
    if (score > previous) {
      set({
        highScores: {
          ...currentScores,
          [game]: score,
        },
      });
      get().sync();
      return true; // Novo recorde!
    }
    return false;
  },

  recordJitsuMatch: (won) => {
    const oldXp = get().jitsuXp ?? 0;
    const newXp = won ? oldXp + 1 : oldXp;
    const oldBelt = getBeltForXp(oldXp);
    const newBelt = getBeltForXp(newXp);
    const beltPromoted = newBelt.id !== oldBelt.id;

    set((s) => ({
      jitsuXp: newXp,
      jitsuWins: (s.jitsuWins ?? 0) + (won ? 1 : 0),
    }));
    get().sync();

    const rankCoinBonus =
      beltPromoted && won ? (JITSU_BELT_RANK_REWARDS[newBelt.id] ?? 0) : 0;

    return {
      beltPromoted,
      newBeltId: newBelt.id,
      rankCoinBonus,
    };
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
    const baseCoins = DAILY_LOGIN_COINS[dayIndex];
    const streakBonus = newStreak > 1 ? STREAK_BONUS_COINS : 0;
    const coins = baseCoins + streakBonus;

    set({
      lastLoginDate: today,
      dailyStreak: newStreak,
    });
    get().addCoins(coins);
    get().showRewardPopup({
      coins,
      message:
        streakBonus > 0
          ? `Login dia ${newStreak}! +${baseCoins} moedas (+${streakBonus} bônus streak)`
          : `Login dia ${newStreak}! +${coins} moedas`,
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

  claimAllMissions: () => {
    const { missionProgress, missionsClaimed } = get();
    const toClaim = DAILY_MISSIONS.filter(
      (m) =>
        !missionsClaimed.includes(m.id) &&
        (missionProgress[m.id] ?? 0) >= m.target
    );
    if (toClaim.length === 0) return 0;

    const totalCoins = toClaim.reduce((sum, m) => sum + m.reward, 0);
    set((s) => ({
      missionsClaimed: [
        ...s.missionsClaimed,
        ...toClaim.map((m) => m.id),
      ],
    }));
    get().addCoins(totalCoins);
    get().showRewardPopup({
      coins: totalCoins,
      message: `${toClaim.length} missão(ões) resgatadas · +${totalCoins} moedas`,
    });
    get().sync();
    return totalCoins;
  },

  showRewardPopup: (reward, onPlayAgain) =>
    set({ lastReward: reward, showReward: true, rewardPlayAgain: onPlayAgain ?? null }),
  closeRewardPopup: () =>
    set({ showReward: false, lastReward: null, rewardPlayAgain: null }),

  claimWelcomePackage: () => {
    if (get().welcomeClaimed) return;
    set({ welcomeClaimed: true });
    get().addCoins(WELCOME_PACKAGE_COINS);
    get().sync();
    get().checkDailyLogin();
    get().resetDailyIfNeeded();
  },

  refreshAchievements: (stats) => {
    const current = get().unlockedAchievements ?? [];
    const newlyUnlocked = computeNewAchievements(stats, current);
    if (newlyUnlocked.length === 0) return;

    const queue = get().achievementToastQueue ?? [];
    set({
      unlockedAchievements: [...current, ...newlyUnlocked],
      achievementToastQueue: [
        ...queue,
        ...newlyUnlocked.map((id) => ({ id, at: Date.now() })),
      ],
    });
    get().sync();
    void syncAchievementsToSupabase(newlyUnlocked);
  },

  dequeueAchievementToast: (id) => {
    set({
      achievementToastQueue: (get().achievementToastQueue ?? []).filter((t) => t.id !== id),
    });
  },

  setSelectedAvatar: (avatarId) => {
    set({ selectedAvatarId: avatarId });
    get().sync();
  },

  isLuckyEggActive: () => {
    const exp = get().luckyEggExpiresAt;
    return exp != null && Date.now() < exp;
  },

  activateLuckyEgg: () => {
    const count = get().luckyEggCount ?? 0;
    if (count <= 0) return false;
    if (get().isLuckyEggActive()) return false;

    set((s) => ({
      luckyEggCount: (s.luckyEggCount ?? 0) - 1,
      luckyEggExpiresAt: Date.now() + LUCKY_EGG_DURATION_MS,
    }));
    get().sync();
    return true;
  },

  useRareCandyOnPokemon: (pokemonId, count = 1) => {
    const available = get().rareCandyCount ?? 0;
    const useCount = Math.min(count, available);
    if (useCount <= 0 || !POKEMON_MAP[pokemonId]) return false;

    const levelCap = get().getLevelCap();
    const key = String(pokemonId);
    const current = get().pokemonBattleXp[key] ?? { level: 1, xp: 0 };
    const currentLevel = calcPokemonLevelFromTotalXp(current.xp);
    if (currentLevel >= levelCap) return false;

    let xpToGrant = 0;
    let simXp = current.xp;
    for (let i = 0; i < useCount; i++) {
      const lvl = calcPokemonLevelFromTotalXp(simXp);
      if (lvl >= levelCap) break;
      const need = Math.max(1, totalXpForLevel(lvl + 1) - simXp);
      xpToGrant += need;
      simXp += need;
    }
    if (xpToGrant <= 0) return false;

    set((s) => ({ rareCandyCount: (s.rareCandyCount ?? 0) - useCount }));
    get().grantPokemonXp(pokemonId, xpToGrant);
    get().sync();
    return true;
  },

  splitRareCandyOnTeam: () => {
    const teamIds = [...new Set(get().team)];
    const available = get().rareCandyCount ?? 0;
    if (teamIds.length === 0 || available <= 0) return false;

    const perPokemon = Math.floor(available / teamIds.length);
    if (perPokemon <= 0) return false;

    let ok = false;
    for (const id of teamIds) {
      if (get().useRareCandyOnPokemon(id, perPokemon)) ok = true;
    }
    return ok;
  },

  getPokemonMoveLoadout: (pokemonId) => {
    const key = String(pokemonId);
    const saved = get().pokemonMoveLoadouts[key] ?? [];
    const level = get().getPokemonProgress(pokemonId).level;
    const unlocked = new Set(
      getPokemonMoveEntries(pokemonId)
        .filter((e) => isMoveSlotUnlocked(e.slotIndex, level))
        .map((e) => e.moveId)
    );
    return saved.filter((id) => unlocked.has(id)).slice(0, 2);
  },

  toggleMoveEquip: (pokemonId, moveId) => {
    const key = String(pokemonId);
    const level = get().getPokemonProgress(pokemonId).level;
    const entry = getPokemonMoveEntries(pokemonId).find((e) => e.moveId === moveId);
    if (!entry || !isMoveSlotUnlocked(entry.slotIndex, level)) return false;

    const current = [...(get().pokemonMoveLoadouts[key] ?? [])].filter((id) => {
      const e = getPokemonMoveEntries(pokemonId).find((x) => x.moveId === id);
      return e && isMoveSlotUnlocked(e.slotIndex, level);
    });

    const idx = current.indexOf(moveId);
    let next: string[];

    if (idx >= 0) {
      next = current.filter((id) => id !== moveId);
    } else if (current.length >= 2) {
      next = [current[1], moveId];
    } else {
      next = [...current, moveId];
    }

    set((s) => ({
      pokemonMoveLoadouts: { ...s.pokemonMoveLoadouts, [key]: next },
    }));
    get().sync();
    return true;
  },
  };

  return store;
});

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
    favoritePokemon: state.favoritePokemon ?? [],
    pokemonBattleXp: state.pokemonBattleXp,
    welcomeClaimed: state.welcomeClaimed ?? false,
    unlockedAchievements: state.unlockedAchievements ?? [],
    selectedAvatarId: state.selectedAvatarId ?? "default",
    luckyEggExpiresAt: state.luckyEggExpiresAt ?? null,
    luckyEggCount: state.luckyEggCount ?? 0,
    rareCandyCount: state.rareCandyCount ?? 0,
    pokemonMoveLoadouts: state.pokemonMoveLoadouts ?? {},
    highScores: state.highScores,
    jitsuXp: state.jitsuXp ?? 0,
    jitsuWins: state.jitsuWins ?? 0,
  };
}

export function getEconomyBonuses(team: number[]) {
  return getTeamPassiveBonuses(team);
}

export { SPIN_COST_PER_REEL, STARTING_COINS };
