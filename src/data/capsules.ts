import { getPokedexInfo } from "@/data/pokedex";
import { MEW_ID, POKEMON_LIST, getPokemonById } from "@/data/pokemon";
import { isDropEligible } from "@/data/evolution-lines";
import { CAPSULE_MIN_TRAINER_LEVEL } from "@/data/capsule-balance";
import { RARITY_ORDER } from "@/data/rarity";
import type { CapsuleDefinition, CapsuleDropRates, CapsuleId } from "@/types/capsule";
import type { Pokemon, Rarity } from "@/types";

const STARTER_IDS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

function hasType(id: number, types: string[]): boolean {
  const want = types.map((t) => t.toLowerCase());
  return getPokedexInfo(id, "").types.some((t) => want.includes(t.toLowerCase()));
}

function buildPool(
  types: string[],
  extraIds: number[] = [],
  onlyIds?: number[]
): number[] {
  let ids: number[];
  if (onlyIds) {
    ids = onlyIds.filter((id) => id !== MEW_ID && id >= 1 && id <= 150);
  } else {
    const set = new Set<number>(extraIds.filter((id) => id !== MEW_ID));
    for (const p of POKEMON_LIST) {
      if (p.id === MEW_ID) continue;
      if (hasType(p.id, types)) set.add(p.id);
    }
    ids = [...set];
  }
  return ids.filter(isDropEligible).sort((a, b) => a - b);
}

/** Pool do Ovo Mestre: só bases raras/épicas (Modelo Elite). */
function masterEggPool(): number[] {
  return POKEMON_LIST.filter(
    (p) =>
      isDropEligible(p.id) && (p.rarity === "rare" || p.rarity === "epic")
  ).map((p) => p.id);
}

export const CAPSULE_DEFINITIONS: CapsuleDefinition[] = [
  {
    id: "rota-1",
    name: "Ovo Rota 1",
    cost: 10,
    focus: "Inseto, Normal, Voador & Iniciais",
    description: "Um ovo comum de Kanto, ideal para iniciar sua coleção.",
    poolIds: buildPool(["bug", "normal", "flying"], STARTER_IDS),
    dropRates: { common: 70, uncommon: 25, rare: 5, epic: 0, legendary: 0 },
    theme: {
      gradient: "from-lime-600/25 via-emerald-900/20 to-slate-900/40",
      border: "border-lime-500/35",
      glow: "rgba(132, 204, 22, 0.35)",
      accent: "#84cc16",
      icon: "🌿",
    },
  },
  {
    id: "viridian",
    name: "Ovo Viridian",
    cost: 15,
    focus: "Planta & Inseto",
    description: "Floresta e matinho, o espírito da primeira rota verde.",
    poolIds: buildPool(["grass", "bug"]),
    dropRates: { common: 60, uncommon: 30, rare: 10, epic: 0, legendary: 0 },
    theme: {
      gradient: "from-green-600/25 via-emerald-950/30 to-slate-900/40",
      border: "border-green-500/35",
      glow: "rgba(34, 197, 94, 0.35)",
      accent: "#22c55e",
      icon: "🍃",
    },
  },
  {
    id: "mt-moon",
    name: "Ovo Mt. Moon",
    cost: 25,
    focus: "Pedra, Terra, Veneno & Fada",
    description: "Cavernas brilhantes e Pokémon místicos das cavernas.",
    poolIds: buildPool(["rock", "ground", "poison"], [35, 39, 122]),
    dropRates: { common: 40, uncommon: 40, rare: 15, epic: 5, legendary: 0 },
    theme: {
      gradient: "from-stone-500/25 via-violet-900/25 to-slate-900/40",
      border: "border-stone-400/35",
      glow: "rgba(168, 162, 158, 0.4)",
      accent: "#a8a29e",
      icon: "🌙",
    },
  },
  {
    id: "marinha",
    name: "Ovo Marinha",
    cost: 30,
    focus: "Água & Gelo",
    description: "Ondas, correntes e Pokémon das profundezas.",
    poolIds: buildPool(["water", "ice"]),
    dropRates: { common: 30, uncommon: 40, rare: 20, epic: 10, legendary: 0 },
    theme: {
      gradient: "from-cyan-500/25 via-blue-900/30 to-slate-900/40",
      border: "border-cyan-400/35",
      glow: "rgba(34, 211, 238, 0.35)",
      accent: "#22d3ee",
      icon: "🌊",
    },
  },
  {
    id: "lavender",
    name: "Ovo Lavender",
    cost: 40,
    focus: "Fantasma & Psíquico",
    description: "A torre assombrada guarda segredos psíquicos.",
    poolIds: buildPool(["ghost", "psychic"]),
    dropRates: { common: 20, uncommon: 40, rare: 30, epic: 10, legendary: 0 },
    theme: {
      gradient: "from-violet-600/25 via-purple-950/35 to-slate-900/40",
      border: "border-violet-400/35",
      glow: "rgba(167, 139, 250, 0.4)",
      accent: "#a78bfa",
      icon: "👻",
    },
  },
  {
    id: "dojo",
    name: "Ovo do Dojo",
    cost: 50,
    focus: "Lutador & Pesados",
    description: "Snorlax, Tauros e lutadores de peso pesado.",
    poolIds: buildPool(["fighting", "normal"], [56, 57, 66, 106, 107, 128, 143]),
    dropRates: { common: 10, uncommon: 40, rare: 35, epic: 15, legendary: 0 },
    theme: {
      gradient: "from-orange-600/25 via-red-950/30 to-slate-900/40",
      border: "border-orange-500/35",
      glow: "rgba(249, 115, 22, 0.35)",
      accent: "#f97316",
      icon: "🥋",
    },
  },
  {
    id: "safari",
    name: "Ovo do Safári",
    cost: 65,
    focus: "Exclusivos do Safári",
    description: "Kangaskhan, Scyther, Pinsir e Tauros, só no parque.",
    poolIds: buildPool([], [], [115, 123, 127, 128]),
    dropRates: { common: 0, uncommon: 40, rare: 40, epic: 20, legendary: 0 },
    theme: {
      gradient: "from-amber-500/25 via-yellow-900/25 to-slate-900/40",
      border: "border-amber-400/35",
      glow: "rgba(251, 191, 36, 0.35)",
      accent: "#fbbf24",
      icon: "🦁",
    },
  },
  {
    id: "fossil",
    name: "Ovo Fóssil",
    cost: 80,
    focus: "Fósseis pré-históricos",
    description: "Omanyte, Kabuto e o lendário Aerodactyl.",
    poolIds: buildPool([], [], [138, 139, 140, 141, 142]),
    dropRates: { common: 0, uncommon: 0, rare: 70, epic: 30, legendary: 0 },
    theme: {
      gradient: "from-amber-700/25 via-stone-900/35 to-slate-900/40",
      border: "border-amber-600/35",
      glow: "rgba(217, 119, 6, 0.35)",
      accent: "#d97706",
      icon: "🦴",
    },
  },
  {
    id: "silph",
    name: "Ovo Silph Co.",
    cost: 100,
    focus: "Elétrico, Veneno & Artificiais",
    description: "Porygon, Ditto, Magnemite e experimentos corporativos.",
    poolIds: buildPool(["electric", "poison"], [81, 82, 125, 132, 137]),
    dropRates: { common: 0, uncommon: 20, rare: 50, epic: 30, legendary: 0 },
    theme: {
      gradient: "from-yellow-400/20 via-slate-800/40 to-indigo-950/40",
      border: "border-yellow-400/30",
      glow: "rgba(250, 204, 21, 0.3)",
      accent: "#facc15",
      icon: "⚡",
    },
  },
  {
    id: "mestra",
    name: "Ovo Mestre",
    cost: 150,
    focus: "Bases raras e épicas",
    description:
      "Garante um Pokémon raro ou épico de estágio base. Chance de pedra evolutiva.",
    poolIds: masterEggPool(),
    dropRates: { common: 0, uncommon: 0, rare: 55, epic: 45, legendary: 0 },
    minTrainerLevel: CAPSULE_MIN_TRAINER_LEVEL.mestra,
    theme: {
      gradient: "from-amber-400/30 via-rose-900/35 to-violet-950/50",
      border: "border-amber-300/45",
      glow: "rgba(251, 191, 36, 0.5)",
      accent: "#fbbf24",
      icon: "👑",
    },
  },
];

export const CAPSULE_MAP: Record<CapsuleId, CapsuleDefinition> = Object.fromEntries(
  CAPSULE_DEFINITIONS.map((c) => [c.id, c])
) as Record<CapsuleId, CapsuleDefinition>;

export function getCapsuleById(id: CapsuleId): CapsuleDefinition {
  return CAPSULE_MAP[id];
}

export function getCapsulePoolPokemon(capsuleId: CapsuleId): Pokemon[] {
  const def = getCapsuleById(capsuleId);
  return def.poolIds
    .map((id) => getPokemonById(id))
    .filter((p): p is Pokemon => p != null && p.id !== MEW_ID && isDropEligible(p.id));
}

function availableRaritiesInPool(pool: Pokemon[]): Rarity[] {
  const set = new Set(pool.map((p) => p.rarity));
  return RARITY_ORDER.filter((r) => set.has(r));
}

export function rollCapsuleRarity(
  dropRates: CapsuleDropRates,
  pool: Pokemon[]
): Rarity {
  const available = availableRaritiesInPool(pool);
  if (available.length === 0) return "common";

  const weighted = RARITY_ORDER.filter(
    (r) => available.includes(r) && (dropRates[r] ?? 0) > 0
  );

  if (weighted.length === 0) {
    return available[Math.floor(Math.random() * available.length)];
  }

  const total = weighted.reduce((s, r) => s + dropRates[r], 0);
  let roll = Math.random() * total;
  for (const rarity of weighted) {
    roll -= dropRates[rarity];
    if (roll <= 0) return rarity;
  }
  return weighted[weighted.length - 1];
}

export function pickCapsulePokemon(capsuleId: CapsuleId, rarity: Rarity): Pokemon {
  const pool = getCapsulePoolPokemon(capsuleId).filter((p) => p.rarity === rarity);
  if (pool.length > 0) {
    return pool[Math.floor(Math.random() * pool.length)];
  }

  const fallback = getCapsulePoolPokemon(capsuleId);
  return fallback[Math.floor(Math.random() * fallback.length)];
}
