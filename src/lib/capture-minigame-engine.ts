import type { Pokemon, Rarity } from "@/types";
import { POKEMON_LIST } from "@/data/pokemon";
import {
  CAPTURE_COINS_PER_CATCH,
  CAPTURE_PERFECT_COIN_BONUS,
} from "@/data/economy-balance";
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
  common: { shakes: 2, zonePct: 18, speed: 1.2 },
  uncommon: { shakes: 2, zonePct: 14, speed: 1.4 },
  rare: { shakes: 3, zonePct: 12, speed: 1.55 },
  epic: { shakes: 3, zonePct: 14, speed: 1.45 },
  legendary: { shakes: 3, zonePct: 11, speed: 1.65 },
};

export function getCaptureConfig(rarity: Rarity): CaptureConfig {
  return CAPTURE_BY_RARITY[rarity];
}

export function getCaptureCoinsForCatch(quality: CaptureHitQuality): number {
  return quality === "perfect"
    ? CAPTURE_COINS_PER_CATCH + CAPTURE_PERFECT_COIN_BONUS
    : CAPTURE_COINS_PER_CATCH;
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

  const goodHits = caught.length - perfectHits;
  const coins = applyMinigameCoinBonus(
    goodHits * CAPTURE_COINS_PER_CATCH +
      perfectHits * (CAPTURE_COINS_PER_CATCH + CAPTURE_PERFECT_COIN_BONUS),
    coinBonus
  );

  const accountXp = 4 + caught.length * 4 + perfectHits * 4;
  const bonusPokemonXp =
    perfectHits >= 3 && caught.length >= 3
      ? 14 + perfectHits * 2
      : perfectHits >= 2
        ? 8 + perfectHits
        : caught.length >= 2
          ? 6
          : 0;

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

export function getRarityArenaBackground(rarity: Rarity): {
  gradient: string;
  border: string;
  glow: string;
} {
  const styles: Record<Rarity, { gradient: string; border: string; glow: string }> = {
    common: {
      gradient:
        "radial-gradient(ellipse 80% 55% at 50% 100%, rgba(148,163,184,0.2), transparent 60%), linear-gradient(180deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
      border: "border-slate-500/20",
      glow: "rgba(148,163,184,0.35)",
    },
    uncommon: {
      gradient:
        "radial-gradient(ellipse 80% 55% at 50% 100%, rgba(34,197,94,0.22), transparent 60%), linear-gradient(180deg, #052e16 0%, #14532d 48%, #064e3b 100%)",
      border: "border-emerald-500/25",
      glow: "rgba(34,197,94,0.4)",
    },
    rare: {
      gradient:
        "radial-gradient(ellipse 80% 55% at 50% 100%, rgba(59,130,246,0.25), transparent 60%), linear-gradient(180deg, #0c1929 0%, #1e3a8a 48%, #172554 100%)",
      border: "border-blue-500/30",
      glow: "rgba(59,130,246,0.45)",
    },
    epic: {
      gradient:
        "radial-gradient(ellipse 80% 55% at 50% 100%, rgba(168,85,247,0.28), transparent 60%), linear-gradient(180deg, #1a0a2e 0%, #581c87 48%, #3b0764 100%)",
      border: "border-purple-500/35",
      glow: "rgba(168,85,247,0.5)",
    },
    legendary: {
      gradient:
        "radial-gradient(ellipse 80% 55% at 50% 100%, rgba(251,191,36,0.3), transparent 60%), linear-gradient(180deg, #1c1408 0%, #92400e 45%, #78350f 100%)",
      border: "border-amber-500/40",
      glow: "rgba(251,191,36,0.55)",
    },
  };
  return styles[rarity];
}
