import type { Pokemon, Rarity } from "@/types";
import { POKEMON_LIST } from "@/data/pokemon";
import { CAPTURE_COINS_PER_CATCH } from "@/data/economy-balance";
import { applyMinigameCoinBonus } from "@/lib/minigame-rewards";

export interface CaptureConfig {
  shakes: number;
  zonePct: number;
  speed: number;
}

export type CaptureHitQuality = "perfect" | "good" | "miss";

const RARITY_WEIGHTS: Record<Rarity, number> = {
  common: 48,
  uncommon: 28,
  rare: 14,
  epic: 7,
  legendary: 3,
};

const CAPTURE_BY_RARITY: Record<Rarity, CaptureConfig> = {
  common: { shakes: 2, zonePct: 26, speed: 1.0 },
  uncommon: { shakes: 2, zonePct: 22, speed: 1.15 },
  rare: { shakes: 2, zonePct: 18, speed: 1.3 },
  epic: { shakes: 3, zonePct: 14, speed: 1.45 },
  legendary: { shakes: 3, zonePct: 11, speed: 1.65 },
};

export function getCaptureConfig(rarity: Rarity): CaptureConfig {
  return CAPTURE_BY_RARITY[rarity];
}

export function getCaptureCoinsForRarity(): number {
  return CAPTURE_COINS_PER_CATCH;
}

export function pickWildPokemon(): Pokemon {
  const total = Object.values(RARITY_WEIGHTS).reduce((a, b) => a + b, 0);
  let roll = Math.random() * total;
  let chosenRarity: Rarity = "common";

  for (const [rarity, weight] of Object.entries(RARITY_WEIGHTS) as [Rarity, number][]) {
    roll -= weight;
    if (roll <= 0) {
      chosenRarity = rarity;
      break;
    }
  }

  const pool = POKEMON_LIST.filter((p) => p.rarity === chosenRarity);
  return pool[Math.floor(Math.random() * pool.length)] ?? POKEMON_LIST[0];
}

export function rollZoneCenter(): number {
  return 18 + Math.random() * 64;
}

export function evaluateCaptureHit(
  cursor: number,
  zoneCenter: number,
  zonePct: number
): CaptureHitQuality {
  const half = zonePct / 2;
  const dist = Math.abs(cursor - zoneCenter);
  if (dist <= half * 0.38) return "perfect";
  if (dist <= half) return "good";
  return "miss";
}

export function calcCaptureReward(
  captured: boolean,
  perfectHits: number,
  totalShakes: number,
  coinBonus = 0
): { coins: number; accountXp: number; bonusPokemonXp: number } {
  let coins = 0;

  if (captured) {
    coins = applyMinigameCoinBonus(CAPTURE_COINS_PER_CATCH, coinBonus);
  }

  const accountXp = captured ? 6 + perfectHits * 2 + (perfectHits === totalShakes ? 4 : 0) : 2;
  const bonusPokemonXp =
    captured && perfectHits === totalShakes && totalShakes >= 2
      ? 8 + perfectHits * 2
      : captured && Math.random() < 0.15
        ? 6
        : 0;

  return { coins, accountXp, bonusPokemonXp };
}

/** Recompensa por sequência de capturas (streak) */
export function calcStreakReward(
  caught: Pokemon[],
  perfectHits: number,
  coinBonus = 0
): { coins: number; accountXp: number; bonusPokemonXp: number } {
  if (caught.length === 0) {
    return { coins: 0, accountXp: 2, bonusPokemonXp: 0 };
  }

  const coins = applyMinigameCoinBonus(
    caught.length * CAPTURE_COINS_PER_CATCH,
    coinBonus
  );

  const accountXp = 4 + caught.length * 4 + perfectHits * 2;
  const bonusPokemonXp =
    perfectHits >= 3 && caught.length >= 3 ? 10 + perfectHits : caught.length >= 2 ? 6 : 0;

  return { coins, accountXp, bonusPokemonXp };
}

export function getRarityColor(rarity: Rarity): string {
  const colors: Record<Rarity, string> = {
    common: "text-white/60",
    uncommon: "text-green-400",
    rare: "text-blue-400",
    epic: "text-purple-400",
    legendary: "text-amber-400",
  };
  return colors[rarity];
}
