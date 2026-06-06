import { JITSU_SPECIAL_CARD_CHANCE } from "@/data/economy-balance";
import { rollSpecialEffect } from "@/data/jitsu-specials";
import { POKEMON_LIST } from "@/data/pokemon";
import { getPokedexInfo } from "@/data/pokedex";
import type { JitsuCard, JitsuElement } from "@/types/jitsu";
import type { Rarity } from "@/types";

const POWER_RANGE: Record<Rarity, [number, number]> = {
  common: [1, 3],
  uncommon: [2, 4],
  rare: [4, 6],
  epic: [7, 9],
  legendary: [9, 10],
};

function mapTypesToElement(types: string[]): JitsuElement | null {
  const lower = types.map((t) => t.toLowerCase());
  if (lower.includes("fire")) return "FOGO";
  if (lower.includes("water")) return "AGUA";
  if (lower.includes("grass")) return "PLANTA";
  return null;
}

function rollPower(rarity: Rarity): number {
  const [min, max] = POWER_RANGE[rarity];
  return min + Math.floor(Math.random() * (max - min + 1));
}

const CARD_POOL = POKEMON_LIST.flatMap((pokemon) => {
  const element = mapTypesToElement(getPokedexInfo(pokemon.id, pokemon.name).types);
  if (!element) return [];
  return [{ pokemon, element }];
});

let instanceCounter = 0;

export function createJitsuCard(pokemonId?: number): JitsuCard {
  const pick =
    pokemonId != null
      ? CARD_POOL.find((c) => c.pokemon.id === pokemonId) ?? CARD_POOL[0]
      : CARD_POOL[Math.floor(Math.random() * CARD_POOL.length)];
  instanceCounter += 1;

  const base = {
    instanceId: `jitsu-${pick.pokemon.id}-${instanceCounter}-${Date.now()}`,
    pokemonId: pick.pokemon.id,
    name: pick.pokemon.name,
    type: pick.element,
    power: rollPower(pick.pokemon.rarity),
    image: pick.pokemon.image,
  };

  if (Math.random() < JITSU_SPECIAL_CARD_CHANCE) {
    const { special, blockTarget } = rollSpecialEffect(pick.element);
    return { ...base, special, blockTarget };
  }

  return base;
}

export function createInitialHand(size: number): JitsuCard[] {
  return Array.from({ length: size }, () => createJitsuCard());
}

export const JITSU_ELEMENT_META: Record<
  JitsuElement,
  {
    label: string;
    icon: string;
    border: string;
    glow: string;
    text: string;
    bg: string;
    arena: string;
    particle: string;
  }
> = {
  FOGO: {
    label: "Fogo",
    icon: "🔥",
    border: "border-orange-500/70",
    glow: "shadow-[0_0_18px_rgba(251,146,60,0.55)]",
    text: "text-orange-400",
    bg: "bg-gradient-to-br from-orange-950/90 via-slate-950 to-red-950/80",
    arena: "from-orange-600/20 via-transparent to-red-600/10",
    particle: "#fb923c",
  },
  AGUA: {
    label: "Água",
    icon: "💧",
    border: "border-cyan-500/70",
    glow: "shadow-[0_0_18px_rgba(34,211,238,0.55)]",
    text: "text-cyan-400",
    bg: "bg-gradient-to-br from-cyan-950/90 via-slate-950 to-blue-950/80",
    arena: "from-cyan-600/20 via-transparent to-blue-600/10",
    particle: "#38bdf8",
  },
  PLANTA: {
    label: "Planta",
    icon: "🌱",
    border: "border-emerald-500/70",
    glow: "shadow-[0_0_18px_rgba(74,222,128,0.55)]",
    text: "text-emerald-400",
    bg: "bg-gradient-to-br from-emerald-950/90 via-slate-950 to-green-950/80",
    arena: "from-emerald-600/20 via-transparent to-lime-600/10",
    particle: "#4ade80",
  },
};
