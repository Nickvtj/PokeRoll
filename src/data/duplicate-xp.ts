import type { Rarity } from "@/types";

/** XP concedido ao pegar duplicata na roleta */
export const DUPLICATE_XP_BY_RARITY: Record<Rarity, number> = {
  common: 5,
  uncommon: 10,
  rare: 20,
  epic: 40,
  legendary: 100,
};

export function getDuplicateXp(rarity: Rarity): number {
  return DUPLICATE_XP_BY_RARITY[rarity];
}
