import { POKEMON_LIST } from "@/data/pokemon";
import {
  MEMORY_COINS_PER_PAIR,
  MEMORY_PAIR_COUNT,
} from "@/data/economy-balance";
import { applyMinigameCoinBonus } from "@/lib/minigame-rewards";
import type { Pokemon } from "@/types";

export interface MemoryCard {
  uid: string;
  pokemonId: number;
}

export function buildMemoryDeck(): MemoryCard[] {
  const shuffled = [...POKEMON_LIST].sort(() => Math.random() - 0.5);
  const picked = shuffled.slice(0, MEMORY_PAIR_COUNT);
  const pairs: MemoryCard[] = [];

  for (const pokemon of picked) {
    pairs.push({ uid: `${pokemon.id}-a`, pokemonId: pokemon.id });
    pairs.push({ uid: `${pokemon.id}-b`, pokemonId: pokemon.id });
  }

  return pairs.sort(() => Math.random() - 0.5);
}

export function isMemoryMatch(a: MemoryCard, b: MemoryCard): boolean {
  return a.pokemonId === b.pokemonId && a.uid !== b.uid;
}

export function calcMemoryReward(
  moves: number,
  pairsFound: number,
  completed: boolean,
  coinBonus = 0
): { coins: number; accountXp: number } {
  let coins = 0;

  if (completed) {
    coins = pairsFound * MEMORY_COINS_PER_PAIR;
  }

  coins = applyMinigameCoinBonus(coins, coinBonus);

  const accountXp = completed
    ? 4 + Math.max(0, MEMORY_PAIR_COUNT - Math.floor((moves - MEMORY_PAIR_COUNT) / 3))
    : pairsFound * 2;

  return { coins, accountXp };
}

export function getMemoryPokemon(id: number): Pokemon | undefined {
  return POKEMON_LIST.find((p) => p.id === id);
}
