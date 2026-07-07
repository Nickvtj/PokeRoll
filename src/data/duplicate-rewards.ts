/**
 * Recompensas de duplicata (v2).
 *
 * - Espécie que pertence a uma linha evolutiva → Doce da Família.
 * - Espécie single-stage / lendária (sem evolução) → nenhuma recompensa extra.
 */

import type { Pokemon, Rarity } from "@/types";
import { getFamilyId, isEvolvingSpecies } from "@/data/evolution-lines";

/**
 * Doces da família por raridade (espécies que evoluem).
 *
 * Meta de pacing (1ª evo = 100 doces, evo por item = 50):
 * - Comum: ~3–4 duplicatas para evoluir (2 dupes ≈ 60 doces).
 * - Raridades maiores dão mais por duplicata (são mais difíceis de tirar).
 */
export const FAMILY_CANDY_BY_RARITY: Record<Rarity, number> = {
  common: 30,
  uncommon: 45,
  rare: 75,
  epic: 110,
  legendary: 150,
};

export type DuplicateReward =
  | { type: "family-candy"; familyId: number; amount: number }
  | { type: "none" };

/** Decide o que uma duplicata concede, conforme a espécie evoluir ou não. */
export function getDuplicateReward(pokemon: Pokemon): DuplicateReward {
  if (isEvolvingSpecies(pokemon.id)) {
    return {
      type: "family-candy",
      familyId: getFamilyId(pokemon.id),
      amount: FAMILY_CANDY_BY_RARITY[pokemon.rarity],
    };
  }
  return { type: "none" };
}
