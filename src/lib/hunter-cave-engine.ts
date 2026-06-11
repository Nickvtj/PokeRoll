import {
  HUNTER_BALL_COUNT,
  HUNTER_ENTRY_COST,
  HUNTER_EXTRA_ROUND_REWARD,
  HUNTER_MAX_POT,
  HUNTER_ROUND_REWARDS,
} from "@/data/economy-balance";
import { applyMinigameCoinBonus } from "@/lib/minigame-rewards";

export function rollHaunterIndex(): number {
  return Math.floor(Math.random() * HUNTER_BALL_COUNT);
}

export function getRoundReward(roundNumber: number): number {
  const idx = roundNumber - 1;
  if (idx < HUNTER_ROUND_REWARDS.length) return HUNTER_ROUND_REWARDS[idx];
  return HUNTER_EXTRA_ROUND_REWARD;
}

export function addToPot(currentPot: number, reward: number): number {
  return Math.min(HUNTER_MAX_POT, currentPot + reward);
}

export function calcHunterProfit(pot: number): number {
  return pot - HUNTER_ENTRY_COST;
}

export function calcHunterAccountXp(pot: number, fled: boolean): number {
  if (!fled || pot <= 0) return 4;
  return Math.max(4, Math.min(16, Math.round(pot / 6)));
}

export interface HunterRewardResult {
  coins: number;
  accountXp: number;
  profit: number;
  score: number;
}

export function calcHunterFleeReward(
  pot: number,
  coinBonus = 0
): HunterRewardResult {
  const coins = applyMinigameCoinBonus(pot, coinBonus);
  return {
    coins,
    accountXp: calcHunterAccountXp(pot, true),
    profit: calcHunterProfit(pot),
    score: pot,
  };
}

export { HUNTER_ENTRY_COST, HUNTER_MAX_POT };
