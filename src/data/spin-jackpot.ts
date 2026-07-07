import type { EvoItemId } from "@/types/instance";

/** Chance de pedra/cabo na roleta (milagre). */
export const SPIN_EVO_ITEM_CHANCE = 0.005;

/** Chance de pacote de Doce Coringa na roleta. */
export const SPIN_WILD_CANDY_CHANCE = 0.02;

/** Quantidade de Doces Coringa por pacote na roleta. */
export const SPIN_WILD_CANDY_AMOUNT = 20;

const SPIN_EVO_ITEMS: EvoItemId[] = [
  "fire-stone",
  "water-stone",
  "thunder-stone",
  "leaf-stone",
  "moon-stone",
  "linking-cord",
];

export interface SpinJackpot {
  evoItem?: EvoItemId;
  wildCandy?: number;
}

/** Sorteia bônus extra da roleta (independente do Pokémon). */
export function rollSpinJackpot(): SpinJackpot | null {
  const bonus: SpinJackpot = {};
  let hasBonus = false;

  if (Math.random() < SPIN_EVO_ITEM_CHANCE) {
    bonus.evoItem = SPIN_EVO_ITEMS[Math.floor(Math.random() * SPIN_EVO_ITEMS.length)];
    hasBonus = true;
  }

  if (Math.random() < SPIN_WILD_CANDY_CHANCE) {
    bonus.wildCandy = SPIN_WILD_CANDY_AMOUNT;
    hasBonus = true;
  }

  return hasBonus ? bonus : null;
}
