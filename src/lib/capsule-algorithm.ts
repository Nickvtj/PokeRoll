import {
  getCapsuleById,
  getCapsulePoolPokemon,
  pickCapsulePokemon,
  rollCapsuleRarity,
} from "@/data/capsules";
import {
  getEggHatchFamilyCandyBonus,
  rollMasterEggEvoItem,
} from "@/data/capsule-balance";
import { getFamilyId } from "@/data/evolution-lines";
import { rollEggShiny } from "@/lib/spin-algorithm";
import { getSpinResultImage } from "@/lib/pokemon-display";
import {
  CAPSULE_GOLD_TEASER_CHANCE,
  type CapsuleId,
  type CapsuleRollResult,
  type CapsuleStripItem,
} from "@/types/capsule";
import type { Pokemon } from "@/types";

const TILE_SIZE = 6;
const TILES_BEFORE_WINNER = 16;
const TILES_AFTER_WINNER = 6;

export const CAPSULE_WINNER_INDEX = TILES_BEFORE_WINNER * TILE_SIZE;

export function rollCapsule(capsuleId: CapsuleId): CapsuleRollResult {
  const pool = getCapsulePoolPokemon(capsuleId);
  const capsule = getCapsuleById(capsuleId);
  const rarity = rollCapsuleRarity(capsule.dropRates, pool);
  const pokemon = pickCapsulePokemon(capsuleId, rarity);
  const isShiny = rollEggShiny();
  const hatchFamilyCandy = getEggHatchFamilyCandyBonus(capsuleId);
  const bonusEvoItem =
    capsuleId === "mestra" ? rollMasterEggEvoItem() ?? undefined : undefined;

  return {
    pokemon,
    isShiny,
    isNew: false,
    isDuplicate: false,
    isNewShinyUnlock: false,
    capsuleId,
    hatchFamilyCandy,
    bonusEvoItem,
  };
}

/** Aplica recompensas fixas de chocagem (doces + item bônus). */
export function applyCapsuleHatchRewards(
  roll: CapsuleRollResult,
  economy: {
    addFamilyCandy: (familyId: number, amount: number) => void;
    addItem: (itemId: import("@/types/instance").ItemId, amount?: number) => void;
  }
): void {
  if (roll.hatchFamilyCandy && roll.hatchFamilyCandy > 0) {
    economy.addFamilyCandy(getFamilyId(roll.pokemon.id), roll.hatchFamilyCandy);
  }
  if (roll.bonusEvoItem) {
    economy.addItem(roll.bonusEvoItem as import("@/types/instance").ItemId);
  }
}

export function resolveCapsuleCollection(
  roll: CapsuleRollResult,
  collectedIds: Set<number>,
  existingHasShiny: boolean
): CapsuleRollResult {
  const isDuplicate = collectedIds.has(roll.pokemon.id);
  const isNew = !isDuplicate;
  const isNewShinyUnlock = roll.isShiny && !existingHasShiny;

  return {
    ...roll,
    isNew,
    isDuplicate,
    isNewShinyUnlock,
    pokemon: roll.isShiny
      ? { ...roll.pokemon, image: getSpinResultImage(roll.pokemon.id, true) }
      : roll.pokemon,
  };
}

function pickDecoy(pool: Pokemon[], winner: Pokemon): Pokemon {
  return pool[Math.floor(Math.random() * pool.length)] ?? winner;
}

function pushDecoy(strip: CapsuleStripItem[], pool: Pokemon[], winner: Pokemon) {
  const decoy = pickDecoy(pool, winner);
  if (Math.random() < CAPSULE_GOLD_TEASER_CHANCE) {
    strip.push({ pokemon: decoy, isShiny: false, isGoldSlot: true });
    return;
  }
  strip.push({ pokemon: decoy, isShiny: false, isGoldSlot: false });
}

export function generateCapsuleStrip(
  winner: Pokemon,
  pool: Pokemon[],
  winnerIsShiny: boolean
): CapsuleStripItem[] {
  const strip: CapsuleStripItem[] = [];

  for (let t = 0; t < TILES_BEFORE_WINNER; t++) {
    for (let i = 0; i < TILE_SIZE; i++) {
      pushDecoy(strip, pool, winner);
    }
  }

  strip.push({
    pokemon: winnerIsShiny
      ? { ...winner, image: getSpinResultImage(winner.id, true) }
      : winner,
    isShiny: winnerIsShiny,
    isGoldSlot: winnerIsShiny,
  });

  for (let t = 0; t < TILES_AFTER_WINNER; t++) {
    for (let i = 0; i < TILE_SIZE; i++) {
      pushDecoy(strip, pool, winner);
    }
  }

  return strip;
}
