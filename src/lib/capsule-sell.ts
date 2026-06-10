import {
  CAPSULE_SELL_PRICES,
  CAPSULE_SHINY_SELL_MULTIPLIER,
} from "@/types/capsule";
import type { Rarity } from "@/types";

export function getCapsuleSellPrice(rarity: Rarity, isShiny: boolean): number {
  const base = CAPSULE_SELL_PRICES[rarity] ?? 2;
  return isShiny ? base * CAPSULE_SHINY_SELL_MULTIPLIER : base;
}
