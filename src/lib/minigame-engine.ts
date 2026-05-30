import {
  BALL_TYPES,
  CLICK_BASE_COINS_MAX,
  CLICK_BASE_COINS_MIN,
  CLICK_BALL_MIN_DISTANCE_PCT,
  CLICK_COMBO_BONUS_COINS_1,
  CLICK_COMBO_BONUS_COINS_2,
  CLICK_COMBO_BONUS_TIER_1,
  CLICK_COMBO_BONUS_TIER_2,
  CLICK_SCORE_TIER_THRESHOLDS,
  CLICK_TIME_BALL_CHANCE,
  type BallType,
} from "@/data/economy-balance";
import { applyMinigameCoinBonus } from "@/lib/minigame-rewards";

export type SpawnedBallKind = "normal" | "time" | "freeze" | "double" | "frenzy";

export interface SpawnedBall {
  id: string;
  type: BallType;
  kind: SpawnedBallKind;
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

function pickSpawnPosition(existing: SpawnedBall[]): { x: number; y: number } {
  const minDist = CLICK_BALL_MIN_DISTANCE_PCT;
  for (let attempt = 0; attempt < 30; attempt++) {
    const x = 8 + Math.random() * 82;
    const y = 12 + Math.random() * 68;
    const overlaps = existing.some(
      (b) => Math.hypot(b.x - x, b.y - y) < minDist
    );
    if (!overlaps) return { x, y };
  }
  return { x: 8 + Math.random() * 82, y: 12 + Math.random() * 68 };
}

export function rollBallType(): BallType {
  const roll = Math.random();
  let cumulative = 0;
  for (const [key, config] of Object.entries(BALL_TYPES)) {
    cumulative += config.chance;
    if (roll < cumulative) return key as BallType;
  }
  return "poke";
}

export function spawnBall(existing: SpawnedBall[] = []): SpawnedBall {
  const roll = Math.random();
  let kind: SpawnedBallKind = "normal";

  // Lógica de chances para itens especiais (Balanceado: Tempo ultra raro)
  if (roll < 0.005) kind = "time";      // 0.5% (era 2%)
  else if (roll < 0.04) kind = "freeze"; // 3.5%
  else if (roll < 0.08) kind = "double"; // 4%
  else if (roll < 0.095) kind = "frenzy"; // 1.5%

  const { x, y } = pickSpawnPosition(existing);

  return {
    id: `ball-${++spawnId}`,
    type: kind === "frenzy" ? "master" : rollBallType(),
    kind,
    x,
    y,
    createdAt: Date.now(),
    lifetime: kind === "normal" ? 1400 + Math.random() * 900 : 2500,
  };
}

export function maybeSpawnRareEvent(): RareEvent | null {
  if (Math.random() > 0.012) return null;
  const rareIds = [144, 145, 150, 6, 25, 131];
  const { x, y } = pickSpawnPosition([]);
  return {
    id: `rare-${++spawnId}`,
    pokemonId: rareIds[Math.floor(Math.random() * rareIds.length)],
    x,
    y,
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

export interface ClickGameRewardBreakdown {
  baseCoins: number;
  comboBonus: number;
  totalBeforeTeamBonus: number;
  coins: number;
}

function calcClickScoreTierCoins(score: number): number {
  let tier = CLICK_BASE_COINS_MIN;
  for (const threshold of CLICK_SCORE_TIER_THRESHOLDS) {
    if (score < threshold) break;
    tier += 1;
  }
  return tier;
}

function calcClickComboBonusCoins(maxCombo: number): number {
  if (maxCombo >= CLICK_COMBO_BONUS_TIER_2) return CLICK_COMBO_BONUS_COINS_2;
  if (maxCombo >= CLICK_COMBO_BONUS_TIER_1) return CLICK_COMBO_BONUS_COINS_1;
  return 0;
}

export function calcClickGameRewardBreakdown(
  score: number,
  maxCombo: number,
  coinBonus = 0
): ClickGameRewardBreakdown {
  const baseCoins = calcClickScoreTierCoins(score);
  const comboBonus = calcClickComboBonusCoins(maxCombo);
  const totalBeforeTeamBonus = Math.min(
    CLICK_BASE_COINS_MAX,
    baseCoins + comboBonus
  );
  const coins = applyMinigameCoinBonus(totalBeforeTeamBonus, coinBonus);
  return { baseCoins, comboBonus, totalBeforeTeamBonus, coins };
}

export function calcClickGameReward(
  score: number,
  coinBonus = 0,
  maxCombo = 0
): number {
  return calcClickGameRewardBreakdown(score, maxCombo, coinBonus).coins;
}
