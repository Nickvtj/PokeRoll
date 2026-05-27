/** Balanceamento central da economia PokéRoll — spins são escassos, mas jogável */

export const SPIN_COST_PER_REEL = 5;
export const STARTING_COINS = 0;
export const WELCOME_PACKAGE_COINS = 15;
export const DUPLICATE_COIN_REWARD = 2;

/** Minigames — sem teto diário; recompensas menores que batalha (4–7) */
export const CAPTURE_SHAKE_MS = 700;
/** Moedas por Pokémon capturado na sequência (Captura Perfeita) */
export const CAPTURE_COINS_PER_CATCH = 1;
export const CAPTURE_COINS_MIN = CAPTURE_COINS_PER_CATCH;
export const CAPTURE_COINS_MAX = CAPTURE_COINS_PER_CATCH;

export const CLICK_GAME_DURATION_SEC = 30;
export const CLICK_BASE_COINS_MIN = 1;
export const CLICK_BASE_COINS_MAX = 2;

export const MEMORY_PAIR_COUNT = 8;
export const MEMORY_GAME_DURATION_SEC = 45;
export const MEMORY_COINS_MIN = 1;
export const MEMORY_COINS_MAX = 3;

/** @deprecated mantido por compat — sem teto/fadiga ativos */
export const MINIGAME_DAILY_SOFT_CAP = 9999;
export const MINIGAME_FATIGUE_START = 9999;
export const MINIGAME_FATIGUE_MULTIPLIER = 1;
export const CLICK_DAILY_SOFT_CAP = MINIGAME_DAILY_SOFT_CAP;
export const CLICK_FATIGUE_START = MINIGAME_FATIGUE_START;
export const CLICK_FATIGUE_MULTIPLIER = MINIGAME_FATIGUE_MULTIPLIER;

/** Auto Battle — fonte principal de moedas (~1 vitória ≈ 1 giro) */
export const BATTLE_BASE_COINS_MIN = 4;
export const BATTLE_BASE_COINS_MAX = 7;
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

/** Missões diárias */
export const DAILY_MISSIONS = [
  { id: "spin_5", label: "Girar 5 vezes", target: 5, reward: 8, type: "spins" as const },
  { id: "battle_3", label: "Vencer 3 batalhas", target: 3, reward: 12, type: "battles" as const },
  { id: "click_2", label: "Jogar 2 jogos", target: 2, reward: 5, type: "clicks" as const },
  { id: "collect_2", label: "Coletar 2 Pokémon novos", target: 2, reward: 10, type: "new_pokemon" as const },
];

/** Pokébolas do Click Rush */
export const BALL_TYPES = {
  poke: { label: "Poké", points: 1, color: "#ef4444", chance: 0.55 },
  great: { label: "Great", points: 3, color: "#3b82f6", chance: 0.28 },
  ultra: { label: "Ultra", points: 6, color: "#eab308", chance: 0.12 },
  master: { label: "Master", points: 15, color: "#a855f7", chance: 0.05 },
} as const;

export type BallType = keyof typeof BALL_TYPES;
