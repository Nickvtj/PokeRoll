import { RARITY_CHANCES } from "@/data/rarity";
import { EGG_SHINY_CHANCE, SHINY_CHANCE } from "@/data/pokemon-sprites";
import {
  getSpinEligibleByRarity,
  getSpinEligiblePokemon,
  getPokemonById,
  MEW_ID,
} from "@/data/pokemon";
import { isDropEligible } from "@/data/evolution-lines";
import { getSpinResultImage } from "@/lib/pokemon-display";
import type { SpinJackpot } from "@/data/spin-jackpot";
import type { Pokemon, Rarity, SpinResult } from "@/types";

/** 0,2% de chance de shiny por giro da roleta */
export function rollShiny(): boolean {
  return Math.random() < SHINY_CHANCE;
}

/** Shiny em ovos, taxa maior que a roleta */
export function rollEggShiny(): boolean {
  return Math.random() < EGG_SHINY_CHANCE;
}

/**
 * Sorteia uma raridade com base nas porcentagens configuráveis.
 * Usa roleta cumulativa: ex. 0 a 45 = comum, 45 a 75 = incomum, etc.
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

function pickFromPool(pool: Pokemon[]): Pokemon {
  if (pool.length === 0) {
    const fallback = getSpinEligiblePokemon();
    return fallback[Math.floor(Math.random() * fallback.length)];
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

/**
 * Seleciona um Pokémon aleatório dentro da raridade sorteada.
 * Modelo Elite: apenas formas base ou single-stage.
 */
export function pickPokemonFromRarity(rarity: Rarity): Pokemon {
  return pickFromPool(getSpinEligibleByRarity(rarity));
}

/** Executa um spin completo: raridade, depois Pokémon (só base/single-stage). */
export function executeSpin(options?: { mewUnlocked?: boolean }): Pokemon {
  if (options?.mewUnlocked && Math.random() < 0.12) {
    const mew = getPokemonById(MEW_ID);
    if (mew && isDropEligible(MEW_ID)) return mew;
  }
  const rarity = rollRarity();
  return pickPokemonFromRarity(rarity);
}

/** Processa resultado do spin contra a coleção do jogador */
export function processSpinResult(
  pokemon: Pokemon,
  collectedIds: Set<number>,
  isShiny: boolean,
  alreadyHasShiny: boolean,
  jackpot?: SpinJackpot | null
): SpinResult {
  const isDuplicate = collectedIds.has(pokemon.id);
  const isNewShinyUnlock = isShiny && !alreadyHasShiny;
  const displayImage = getSpinResultImage(pokemon.id, isShiny);

  return {
    pokemon: isShiny ? { ...pokemon, image: displayImage } : pokemon,
    isNew: !isDuplicate,
    isDuplicate,
    rarity: pokemon.rarity,
    isShiny,
    isNewShinyUnlock,
    jackpot: jackpot ?? undefined,
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
