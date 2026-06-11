/** Balanceamento central da economia PokéRoll — spins são escassos, mas jogável */

export const SPIN_COST_PER_REEL = 10;
export const STARTING_COINS = 0;
export const WELCOME_PACKAGE_COINS = 15;
export const DUPLICATE_COIN_REWARD = 2;

/** Moedas por duplicata na roleta (por raridade) */
export const DUPLICATE_COINS_BY_RARITY = {
  common: 1,
  uncommon: 2,
  rare: 3,
  epic: 4,
  legendary: 5,
} as const;

/** Minigames — sem teto diário; recompensas menores que batalha (4–7) */
export const CAPTURE_SHAKE_MS = 700;
/** Moedas por acerto — 1 moeda na zona verde ou no centro dourado */
export const CAPTURE_COINS_PER_CATCH = 1;
export const CAPTURE_PERFECT_COIN_BONUS = 0;
export const CAPTURE_COINS_MIN = CAPTURE_COINS_PER_CATCH;
export const CAPTURE_COINS_MAX = CAPTURE_COINS_PER_CATCH;

export const CLICK_GAME_DURATION_SEC = 30;
/** Click Rush — moedas por desempenho (pontos + combo) */
export const CLICK_BASE_COINS_MIN = 3;
export const CLICK_BASE_COINS_MAX = 18;
/** Limites de pontos para cada faixa de moeda base */
export const CLICK_SCORE_TIER_THRESHOLDS = [120, 250, 400, 600, 800, 1000] as const;
export const CLICK_COMBO_BONUS_TIER_1 = 18;
export const CLICK_COMBO_BONUS_TIER_2 = 35;
export const CLICK_COMBO_BONUS_COINS_1 = 2;
export const CLICK_COMBO_BONUS_COINS_2 = 4;

export const MEMORY_PAIR_COUNT = 12;
export const MEMORY_GAME_DURATION_SEC = 60;
export const MEMORY_COINS_MIN = 1;
export const MEMORY_COINS_MAX = 3;

/** Poké-Jitsu (Card-Jitsu) */
export const JITSU_HAND_SIZE = 5;
export const JITSU_TURN_TIMER_SEC = 25;
/** Chance de cada carta comprada/gerada ser especial */
export const JITSU_SPECIAL_CARD_CHANCE = 0.18;
export const JITSU_COINS_WIN_MIN = 10;
export const JITSU_COINS_WIN_MAX = 22;
export const JITSU_COINS_LOSS = 3;
export const JITSU_XP_WIN = 12;
export const JITSU_XP_LOSS = 4;
/** Apresentacao dos duelistas antes da primeira rodada */
export const JITSU_FACE_OFF_MS = 2800;

/** Caverna dos Hunter — push-your-luck com entrada */
export const HUNTER_ENTRY_COST = 12;
export const HUNTER_ROUND_REWARDS = [6, 8, 10, 14, 18, 22] as const;
export const HUNTER_EXTRA_ROUND_REWARD = 22;
export const HUNTER_MAX_POT = 80;
export const HUNTER_BALL_COUNT = 4;

/** Flappy Zubat — moedas por faixa de pontuacao */
export const FLAPPY_COINS_TIERS = [
  { minScore: 50, coins: 18 },
  { minScore: 30, coins: 14 },
  { minScore: 15, coins: 10 },
  { minScore: 5, coins: 5 },
  { minScore: 1, coins: 2 },
] as const;
export const FLAPPY_CHARIZARD_LIFETIME_COINS = 5000;

/** @deprecated mantido por compat — sem teto/fadiga ativos */
export const MINIGAME_DAILY_SOFT_CAP = 9999;
export const MINIGAME_FATIGUE_START = 9999;
export const MINIGAME_FATIGUE_MULTIPLIER = 1;
export const CLICK_DAILY_SOFT_CAP = MINIGAME_DAILY_SOFT_CAP;
export const CLICK_FATIGUE_START = MINIGAME_FATIGUE_START;
export const CLICK_FATIGUE_MULTIPLIER = MINIGAME_FATIGUE_MULTIPLIER;

/** Auto Battle — moedas por desempenho (teto BATTLE_COINS_MAX) */
export const BATTLE_COINS_MIN = 4;
export const BATTLE_COINS_MAX = 15;
/** @deprecated use BATTLE_COINS_MIN */
export const BATTLE_BASE_COINS_MIN = BATTLE_COINS_MIN;
/** @deprecated use BATTLE_COINS_MAX */
export const BATTLE_BASE_COINS_MAX = BATTLE_COINS_MAX;
export const BATTLE_FREE_SPIN_CHANCE = 0.04;
export const BATTLE_XP_BASE = 14;
export const BATTLE_DURATION_BASE_MS = 18000;
export const BATTLE_DURATION_PER_WAVE_MS = 4000;
/** Pausa entre golpes — tempo para animação estilo clássico */
export const BATTLE_STRIKE_MS = 280;
export const BATTLE_FLASH_MS = 620;
export const BATTLE_TURN_INTERVAL_MS = 2200;
/** Embate VS — apresentação dos treinadores antes da moeda */
export const BATTLE_FACE_OFF_MS = 3000;
/** Moeda — giro, revelação e pausa antes do 1º ataque */
export const BATTLE_COIN_FLIP_MS = 3200;
export const BATTLE_COIN_REVEAL_MS = 2600;
export const BATTLE_POST_COIN_PAUSE_MS = 1100;

/** Boost de dano quando os 3 Pokémon do time compartilham o mesmo tipo */
export const TEAM_MONOTYPE_DAMAGE_BONUS = 0.12;
export const XP_PER_LEVEL = 260;
export const MAX_LEVEL = 50;

/** Lucky Egg: dobro de XP por 5 min (ativar manualmente no header) */
export const LUCKY_EGG_DURATION_MS = 300_000;
export const LUCKY_EGG_XP_MULTIPLIER = 2;
export const LUCKY_EGG_PER_MILESTONE = 1;

/** Poké-Memory: moedas só ao completar — 2 por par */
export const MEMORY_COINS_PER_PAIR = 2;
/** Rare Candy: a cada 5 níveis de treinador */
export const RARE_CANDY_PER_MILESTONE = 3;
export const TRAINER_LEVEL_MILESTONE = 5;
export const RARE_CANDY_XP_BONUS = 100;

/** Login / streak */
export const DAILY_LOGIN_COINS = [3, 4, 5, 6, 8, 10, 12];
export const STREAK_BONUS_COINS = 2;

/** Missões diárias */
export type DailyMissionReward =
  | { kind: "coins"; amount: number }
  | { kind: "luckyEgg"; amount: number }
  | { kind: "rareCandy"; amount: number };

export const DAILY_MISSIONS: {
  id: string;
  label: string;
  target: number;
  reward: DailyMissionReward;
  type: "spins" | "battles" | "clicks" | "new_pokemon" | "gym_win" | "perfect_capture" | "streak_spin";
}[] = [
  { id: "spin_5", label: "Girar 5 vezes", target: 5, reward: { kind: "coins", amount: 8 }, type: "spins" },
  { id: "battle_3", label: "Vencer 3 batalhas", target: 3, reward: { kind: "coins", amount: 12 }, type: "battles" },
  { id: "click_2", label: "Jogar 2 jogos", target: 2, reward: { kind: "coins", amount: 5 }, type: "clicks" },
  { id: "collect_2", label: "Coletar 2 Pokémon novos", target: 2, reward: { kind: "coins", amount: 10 }, type: "new_pokemon" },
  { id: "gym_badge", label: "Vencer um ginásio (líder)", target: 1, reward: { kind: "luckyEgg", amount: 1 }, type: "gym_win" },
  { id: "capture_streak_5", label: "Capturar 5 Pokémon em sequência (Captura Perfeita)", target: 1, reward: { kind: "rareCandy", amount: 1 }, type: "perfect_capture" },
  { id: "spin_15", label: "Girar 15 vezes", target: 15, reward: { kind: "luckyEgg", amount: 1 }, type: "spins" },
];

/** Bônus de streak no login: +10% recompensa de missão por dia (máx. +70%) */
export function getStreakMissionMultiplier(streak: number): number {
  return 1 + Math.min(7, Math.max(0, streak - 1)) * 0.1;
}

/** Pokébolas do Click Rush */
export const CLICK_TIME_BONUS_SEC = 10;
export const CLICK_TIME_BALL_CHANCE = 0.035;
export const CLICK_MAX_TIME_SEC = 55;
export const CLICK_BALL_MIN_DISTANCE_PCT = 14;
export const CLICK_BALL_LIFETIME_MIN_MS = 3200;
export const CLICK_BALL_LIFETIME_MAX_MS = 4800;
export const CLICK_SPECIAL_BALL_LIFETIME_MS = 4200;

export const BALL_TYPES = {
  poke: { label: "Poké", points: 1, color: "#ef4444", chance: 0.55 },
  great: { label: "Great", points: 3, color: "#3b82f6", chance: 0.28 },
  ultra: { label: "Ultra", points: 6, color: "#eab308", chance: 0.12 },
  master: { label: "Master", points: 15, color: "#a855f7", chance: 0.05 },
} as const;

export type BallType = keyof typeof BALL_TYPES;
