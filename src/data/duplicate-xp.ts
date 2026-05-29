import type { Rarity } from "@/types";
import { DUPLICATE_COINS_BY_RARITY } from "@/data/economy-balance";

/** XP concedido ao pegar duplicata na roleta */
export const DUPLICATE_XP_BY_RARITY: Record<Rarity, number> = {
  common: 5,
  uncommon: 10,
  rare: 20,
  epic: 40,
  legendary: 80,
};

export function getDuplicateXp(rarity: Rarity): number {
  return DUPLICATE_XP_BY_RARITY[rarity];
}

export function getDuplicateCoins(rarity: Rarity): number {
  return DUPLICATE_COINS_BY_RARITY[rarity];
}
