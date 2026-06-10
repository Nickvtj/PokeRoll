import type { Pokemon, Rarity } from "@/types";

export type CapsuleId =
  | "rota-1"
  | "viridian"
  | "mt-moon"
  | "marinha"
  | "lavender"
  | "dojo"
  | "safari"
  | "fossil"
  | "silph"
  | "mestra";

export interface CapsuleDropRates {
  common: number;
  uncommon: number;
  rare: number;
  epic: number;
  legendary: number;
}

export interface CapsuleDefinition {
  id: CapsuleId;
  name: string;
  cost: number;
  focus: string;
  description: string;
  poolIds: number[];
  dropRates: CapsuleDropRates;
  theme: {
    gradient: string;
    border: string;
    glow: string;
    accent: string;
    icon: string;
  };
}

export interface CapsuleRollResult {
  pokemon: Pokemon;
  isShiny: boolean;
  isNew: boolean;
  isDuplicate: boolean;
  isNewShinyUnlock: boolean;
  capsuleId: CapsuleId;
}

export interface CapsuleStripItem {
  pokemon: Pokemon;
  isShiny: boolean;
  /** Slot dourado estilo CS — teaser ou shiny real */
  isGoldSlot?: boolean;
}

export const CAPSULE_SELL_PRICES: Record<Rarity, number> = {
  common: 2,
  uncommon: 8,
  rare: 25,
  epic: 60,
  legendary: 150,
};

export const CAPSULE_SHINY_SELL_MULTIPLIER = 5;

/** Chance de slot dourado (teaser) na fita — não é o shiny real */
export const CAPSULE_GOLD_TEASER_CHANCE = 0.045;
