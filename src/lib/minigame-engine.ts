import {
  BALL_TYPES,
  CLICK_BASE_COINS_MAX,
  CLICK_BASE_COINS_MIN,
  type BallType,
} from "@/data/economy-balance";
import { applyMinigameCoinBonus } from "@/lib/minigame-rewards";

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
    lifetime: 1400 + Math.random() * 900,
  };
}

export function maybeSpawnRareEvent(): RareEvent | null {
  if (Math.random() > 0.012) return null;
  const rareIds = [144, 145, 150, 6, 25, 131];
  return {
    id: `rare-${++spawnId}`,
    pokemonId: rareIds[Math.floor(Math.random() * rareIds.length)],
    x: 5 + Math.random() * 70,
    y: 20 + Math.random() * 50,
    createdAt: Date.now(),
    lifetime: 3200,
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

export function calcClickGameReward(score: number, coinBonus = 0): number {
  let coins =
    CLICK_BASE_COINS_MIN +
    Math.floor((score / 120) * (CLICK_BASE_COINS_MAX - CLICK_BASE_COINS_MIN));
  coins = Math.min(CLICK_BASE_COINS_MAX, Math.max(CLICK_BASE_COINS_MIN, coins));
  return applyMinigameCoinBonus(coins, coinBonus);
}
