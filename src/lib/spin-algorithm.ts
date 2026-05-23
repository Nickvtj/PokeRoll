import { RARITY_CHANCES } from "@/data/rarity";
import { getPokemonByRarity, POKEMON_LIST } from "@/data/pokemon";
import type { Pokemon, Rarity, SpinResult } from "@/types";

/**
 * Sorteia uma raridade com base nas porcentagens configuráveis.
 * Usa roleta cumulativa: ex. 0–45 = comum, 45–75 = incomum, etc.
 */
export function rollRarity(): Rarity {
  const roll = Math.random() * 100;
  let cumulative = 0;

  const entries = Object.entries(RARITY_CHANCES) as [Rarity, number][];

  for (const [rarity, chance] of entries) {
    cumulative += chance;
    if (roll < cumulative) {
      return rarity;
    }
  }

  return "common";
}

/**
 * Seleciona um Pokémon aleatório dentro da raridade sorteada.
 * Suporta pesos individuais (weight) para fine-tuning futuro.
 */
export function pickPokemonFromRarity(rarity: Rarity): Pokemon {
  const pool = getPokemonByRarity(rarity);

  if (pool.length === 0) {
    // Fallback: qualquer Pokémon da lista
    return POKEMON_LIST[Math.floor(Math.random() * POKEMON_LIST.length)];
  }

  const totalWeight = pool.reduce((sum, p) => sum + p.weight, 0);
  let roll = Math.random() * totalWeight;

  for (const pokemon of pool) {
    roll -= pokemon.weight;
    if (roll <= 0) {
      return pokemon;
    }
  }

  return pool[pool.length - 1];
}

/** Executa um spin completo: raridade → Pokémon */
export function executeSpin(): Pokemon {
  const rarity = rollRarity();
  return pickPokemonFromRarity(rarity);
}

/** Processa resultado do spin contra a coleção do jogador */
export function processSpinResult(
  pokemon: Pokemon,
  collectedIds: Set<number>
): SpinResult {
  const isDuplicate = collectedIds.has(pokemon.id);

  return {
    pokemon,
    isNew: !isDuplicate,
    isDuplicate,
    rarity: pokemon.rarity,
  };
}

/** Gera sequência de Pokémon para animação do slot (decoys + resultado real) */
export function generateSpinSequence(
  result: Pokemon,
  length = 20
): Pokemon[] {
  const sequence: Pokemon[] = [];

  for (let i = 0; i < length - 1; i++) {
    const decoyRarity = rollRarity();
    sequence.push(pickPokemonFromRarity(decoyRarity));
  }

  sequence.push(result);
  return sequence;
}
