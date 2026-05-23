import {
  BALL_TYPES,
  CLICK_BASE_COINS_MAX,
  CLICK_BASE_COINS_MIN,
  CLICK_DAILY_SOFT_CAP,
  CLICK_FATIGUE_MULTIPLIER,
  CLICK_FATIGUE_START,
  type BallType,
} from "@/data/economy-balance";

export interface SpawnedBall {
  id: string;
  type: BallType;
  x: number;
  y: number;
  createdAt: number;
  lifetime: number;
}

export interface RareEvent {
  id: string;
  pokemonId: number;
  x: number;
  y: number;
  createdAt: number;
  lifetime: number;
}

let spawnId = 0;

export function rollBallType(): BallType {
  const roll = Math.random();
  let cumulative = 0;
  for (const [key, config] of Object.entries(BALL_TYPES)) {
    cumulative += config.chance;
    if (roll < cumulative) return key as BallType;
  }
  return "poke";
}

export function spawnBall(): SpawnedBall {
  return {
    id: `ball-${++spawnId}`,
    type: rollBallType(),
    x: 10 + Math.random() * 80,
    y: 15 + Math.random() * 65,
    createdAt: Date.now(),
    lifetime: 700 + Math.random() * 600,
  };
}

export function maybeSpawnRareEvent(): RareEvent | null {
  if (Math.random() > 0.04) return null;
  const rareIds = [144, 145, 150, 6, 25, 131];
  return {
    id: `rare-${++spawnId}`,
    pokemonId: rareIds[Math.floor(Math.random() * rareIds.length)],
    x: 5 + Math.random() * 70,
    y: 20 + Math.random() * 50,
    createdAt: Date.now(),
    lifetime: 1800,
  };
}

export function calcClickScore(
  ballType: BallType,
  combo: number,
  comboBonus = 0
): number {
  const base = BALL_TYPES[ballType].points;
  const mult = 1 + Math.floor(combo / 5) * 0.25 + comboBonus;
  return Math.round(base * mult);
}

export function calcClickGameReward(
  score: number,
  gamesPlayedToday: number,
  coinsEarnedToday: number,
  coinBonus = 0
): { coins: number; capped: boolean } {
  let coins =
    CLICK_BASE_COINS_MIN +
    Math.floor((score / 100) * (CLICK_BASE_COINS_MAX - CLICK_BASE_COINS_MIN));
  coins = Math.min(CLICK_BASE_COINS_MAX, Math.max(CLICK_BASE_COINS_MIN, coins));
  coins = Math.round(coins * (1 + coinBonus));

  if (gamesPlayedToday >= CLICK_FATIGUE_START) {
    coins = Math.round(coins * CLICK_FATIGUE_MULTIPLIER);
  }

  const remaining = CLICK_DAILY_SOFT_CAP - coinsEarnedToday;
  const capped = remaining <= 0;
  if (capped) return { coins: 0, capped: true };
  if (coins > remaining) coins = remaining;

  return { coins, capped: false };
}
