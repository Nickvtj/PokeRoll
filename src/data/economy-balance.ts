/** Balanceamento central da economia PokéRoll — spins são escassos, mas jogável */

export const SPIN_COST_PER_REEL = 5;
export const STARTING_COINS = 20;
export const DUPLICATE_COIN_REWARD = 2;

/** Click Minigame — menos eficiente que batalha */
export const CLICK_GAME_DURATION_SEC = 30;
export const CLICK_BASE_COINS_MIN = 1;
export const CLICK_BASE_COINS_MAX = 3;
export const CLICK_DAILY_SOFT_CAP = 12;
export const CLICK_FATIGUE_START = 4;
export const CLICK_FATIGUE_MULTIPLIER = 0.55;

/** Auto Battle — fonte principal de moedas */
export const BATTLE_BASE_COINS_MIN = 3;
export const BATTLE_BASE_COINS_MAX = 8;
export const BATTLE_FREE_SPIN_CHANCE = 0.04;
export const BATTLE_XP_BASE = 22;
export const BATTLE_DURATION_BASE_MS = 18000;
export const BATTLE_DURATION_PER_WAVE_MS = 4000;

/** Progressão */
export const XP_PER_LEVEL = 120;
export const MAX_LEVEL = 50;

/** Login / streak */
export const DAILY_LOGIN_COINS = [3, 4, 5, 6, 8, 10, 12];
export const STREAK_BONUS_COINS = 2;

/** Missões diárias — recompensa proporcional ao esforço (spin = 5 moedas) */
export const DAILY_MISSIONS = [
  { id: "spin_5", label: "Girar 5 vezes", target: 5, reward: 8, type: "spins" as const },
  { id: "battle_3", label: "Vencer 3 batalhas", target: 3, reward: 12, type: "battles" as const },
  { id: "click_2", label: "Jogar 2 minigames", target: 2, reward: 5, type: "clicks" as const },
  { id: "collect_2", label: "Coletar 2 Pokémon novos", target: 2, reward: 10, type: "new_pokemon" as const },
];

/** Pokébolas do minigame */
export const BALL_TYPES = {
  poke: { label: "Poké", points: 1, color: "#ef4444", chance: 0.55 },
  great: { label: "Great", points: 3, color: "#3b82f6", chance: 0.28 },
  ultra: { label: "Ultra", points: 6, color: "#eab308", chance: 0.12 },
  master: { label: "Master", points: 15, color: "#a855f7", chance: 0.05 },
} as const;

export type BallType = keyof typeof BALL_TYPES;
