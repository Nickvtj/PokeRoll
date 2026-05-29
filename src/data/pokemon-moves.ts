import { POKEMON_MAP } from "@/data/pokemon";
import { getPokemonBattleStats } from "@/data/pokemon-stats";
import type { BattleMove } from "@/types/battle";

export const MOVE_LIBRARY: Record<string, BattleMove> = {
  tackle: {
    id: "tackle",
    name: "Investida",
    type: "normal",
    category: "damage",
    power: 40,
    accuracy: 1,
    description: "Um golpe básico e confiável.",
  },
  scratch: {
    id: "scratch",
    name: "Arranhão",
    type: "normal",
    category: "damage",
    power: 40,
    accuracy: 1,
    description: "Garras afiadas rasgam o alvo.",
  },
  ember: {
    id: "ember",
    name: "Brasa",
    type: "fire",
    category: "damage",
    power: 40,
    accuracy: 1,
    statusEffect: "burn",
    statusChance: 0.1,
    description: "Chamas pequenas podem queimar.",
  },
  flamethrower: {
    id: "flamethrower",
    name: "Lança-chamas",
    type: "fire",
    category: "damage",
    power: 90,
    accuracy: 1,
    statusEffect: "burn",
    statusChance: 0.1,
    description: "Jato de fogo devastador.",
  },
  "fire-spin": {
    id: "fire-spin",
    name: "Chama Furacão",
    type: "fire",
    category: "damage",
    power: 35,
    accuracy: 0.85,
    description: "Redemoinho de fogo envolve o alvo.",
  },
  "will-o-wisp": {
    id: "will-o-wisp",
    name: "Fogo Fátuo",
    type: "fire",
    category: "status",
    power: 0,
    accuracy: 0.85,
    statusEffect: "burn",
    statusChance: 1,
    description: "Chama misteriosa queima o oponente.",
  },
  "water-gun": {
    id: "water-gun",
    name: "Revólver d'Água",
    type: "water",
    category: "damage",
    power: 40,
    accuracy: 1,
    description: "Jato d'água concentrado.",
  },
  surf: {
    id: "surf",
    name: "Surfar",
    type: "water",
    category: "damage",
    power: 90,
    accuracy: 1,
    description: "Onda gigante atinge todos.",
  },
  bubble: {
    id: "bubble",
    name: "Bolhas",
    type: "water",
    category: "damage",
    power: 40,
    accuracy: 1,
    description: "Bolhas de água atingem o alvo.",
  },
  "ice-beam": {
    id: "ice-beam",
    name: "Raio Gelo",
    type: "ice",
    category: "damage",
    power: 90,
    accuracy: 1,
    description: "Raio congelante.",
  },
  "vine-whip": {
    id: "vine-whip",
    name: "Chicote de Vinha",
    type: "grass",
    category: "damage",
    power: 45,
    accuracy: 1,
    description: "Vinhas chicoteiam o inimigo.",
  },
  "razor-leaf": {
    id: "razor-leaf",
    name: "Folha Navalha",
    type: "grass",
    category: "damage",
    power: 55,
    accuracy: 0.95,
    description: "Folhas cortantes voam.",
  },
  "solar-beam": {
    id: "solar-beam",
    name: "Raio Solar",
    type: "grass",
    category: "damage",
    power: 120,
    accuracy: 1,
    description: "Energia solar concentrada.",
  },
  "sleep-powder": {
    id: "sleep-powder",
    name: "Pó do Sono",
    type: "grass",
    category: "status",
    power: 0,
    accuracy: 0.75,
    statusEffect: "sleep",
    statusChance: 1,
    description: "Pó adormece o alvo.",
  },
  "thunder-shock": {
    id: "thunder-shock",
    name: "Choque do Trovão",
    type: "electric",
    category: "damage",
    power: 40,
    accuracy: 1,
    statusEffect: "paralyze",
    statusChance: 0.1,
    description: "Descarga elétrica leve.",
  },
  thunderbolt: {
    id: "thunderbolt",
    name: "Raio do Trovão",
    type: "electric",
    category: "damage",
    power: 90,
    accuracy: 1,
    statusEffect: "paralyze",
    statusChance: 0.1,
    description: "Raio poderoso e preciso.",
  },
  "thunder-wave": {
    id: "thunder-wave",
    name: "Onda de Trovão",
    type: "electric",
    category: "status",
    power: 0,
    accuracy: 0.9,
    statusEffect: "paralyze",
    statusChance: 1,
    description: "Onda elétrica paralisa o alvo.",
  },
  "quick-attack": {
    id: "quick-attack",
    name: "Ataque Rápido",
    type: "normal",
    category: "damage",
    power: 40,
    accuracy: 1,
    description: "Golpe veloz e certeiro.",
  },
  punch: {
    id: "punch",
    name: "Soco",
    type: "fighting",
    category: "damage",
    power: 40,
    accuracy: 1,
    description: "Soco direto no alvo.",
  },
  "karate-chop": {
    id: "karate-chop",
    name: "Chop de Karatê",
    type: "fighting",
    category: "damage",
    power: 50,
    accuracy: 1,
    description: "Golpe cortante de karatê.",
  },
  "close-combat": {
    id: "close-combat",
    name: "Combate Próximo",
    type: "fighting",
    category: "damage",
    power: 120,
    accuracy: 1,
    description: "Ataque corpo a corpo brutal.",
  },
  "poison-sting": {
    id: "poison-sting",
    name: "Ferrão Venenoso",
    type: "poison",
    category: "damage",
    power: 15,
    accuracy: 1,
    statusEffect: "poison",
    statusChance: 0.3,
    description: "Ferrão envenenado.",
  },
  "sludge-bomb": {
    id: "sludge-bomb",
    name: "Bomba de Lodo",
    type: "poison",
    category: "damage",
    power: 90,
    accuracy: 1,
    statusEffect: "poison",
    statusChance: 0.3,
    description: "Lodo tóxico explode no alvo.",
  },
  "toxic": {
    id: "toxic",
    name: "Tóxico",
    type: "poison",
    category: "status",
    power: 0,
    accuracy: 0.9,
    statusEffect: "poison",
    statusChance: 1,
    description: "Veneno grave envenena o alvo.",
  },
  "psychic": {
    id: "psychic",
    name: "Psíquico",
    type: "psychic",
    category: "damage",
    power: 90,
    accuracy: 1,
    description: "Ataque mental devastador.",
  },
  "confusion": {
    id: "confusion",
    name: "Confusão",
    type: "psychic",
    category: "damage",
    power: 50,
    accuracy: 1,
    description: "Onda psíquica confunde.",
  },
  "hypnosis": {
    id: "hypnosis",
    name: "Hipnose",
    type: "psychic",
    category: "status",
    power: 0,
    accuracy: 0.6,
    statusEffect: "sleep",
    statusChance: 1,
    description: "Hipnotiza o oponente.",
  },
  "shadow-ball": {
    id: "shadow-ball",
    name: "Bola Sombria",
    type: "ghost",
    category: "damage",
    power: 80,
    accuracy: 1,
    description: "Esfera sombria atinge o alvo.",
  },
  "lick": {
    id: "lick",
    name: "Lambida",
    type: "ghost",
    category: "damage",
    power: 30,
    accuracy: 1,
    statusEffect: "paralyze",
    statusChance: 0.3,
    description: "Lambida assustadora pode paralisar.",
  },
  "dragon-claw": {
    id: "dragon-claw",
    name: "Garra Dragão",
    type: "dragon",
    category: "damage",
    power: 80,
    accuracy: 1,
    description: "Garras dracônicas rasgam.",
  },
  "rock-throw": {
    id: "rock-throw",
    name: "Pedrada",
    type: "rock",
    category: "damage",
    power: 50,
    accuracy: 0.9,
    description: "Pedras são arremessadas.",
  },
  "earthquake": {
    id: "earthquake",
    name: "Terremoto",
    type: "ground",
    category: "damage",
    power: 100,
    accuracy: 1,
    description: "Treme o chão com força.",
  },
  gust: {
    id: "gust",
    name: "Lufada",
    type: "flying",
    category: "damage",
    power: 40,
    accuracy: 1,
    description: "Rajada de vento.",
  },
  "aerial-ace": {
    id: "aerial-ace",
    name: "Ás Aéreo",
    type: "flying",
    category: "damage",
    power: 60,
    accuracy: 1,
    description: "Ataque veloz e certeiro.",
  },
  "bug-bite": {
    id: "bug-bite",
    name: "Picada",
    type: "bug",
    category: "damage",
    power: 60,
    accuracy: 1,
    description: "Mordida de inseto.",
  },
  "iron-tail": {
    id: "iron-tail",
    name: "Cauda de Ferro",
    type: "steel",
    category: "damage",
    power: 100,
    accuracy: 0.75,
    description: "Cauda metálica esmagadora.",
  },
  "dark-pulse": {
    id: "dark-pulse",
    name: "Pulso Sombrio",
    type: "dark",
    category: "damage",
    power: 80,
    accuracy: 1,
    description: "Onda de energia sombria.",
  },
  "moonblast": {
    id: "moonblast",
    name: "Explosão Lunar",
    type: "fairy",
    category: "damage",
    power: 95,
    accuracy: 1,
    description: "Energia lunar atinge o alvo.",
  },
  "drain-punch": {
    id: "drain-punch",
    name: "Soco Drenagem",
    type: "fighting",
    category: "damage",
    power: 75,
    accuracy: 1,
    description: "Soco que absorve energia.",
  },
};

const TYPE_MOVE_POOLS: Record<string, [string, string, string, string]> = {
  fire: ["ember", "flamethrower", "fire-spin", "will-o-wisp"],
  water: ["water-gun", "bubble", "surf", "ice-beam"],
  grass: ["vine-whip", "razor-leaf", "solar-beam", "sleep-powder"],
  electric: ["thunder-shock", "quick-attack", "thunderbolt", "thunder-wave"],
  ice: ["ice-beam", "tackle", "scratch", "quick-attack"],
  fighting: ["punch", "karate-chop", "close-combat", "drain-punch"],
  poison: ["poison-sting", "sludge-bomb", "toxic", "tackle"],
  ground: ["earthquake", "rock-throw", "tackle", "scratch"],
  flying: ["gust", "aerial-ace", "quick-attack", "tackle"],
  psychic: ["confusion", "psychic", "hypnosis", "quick-attack"],
  bug: ["bug-bite", "poison-sting", "tackle", "scratch"],
  rock: ["rock-throw", "earthquake", "tackle", "scratch"],
  ghost: ["lick", "shadow-ball", "hypnosis", "confusion"],
  dragon: ["dragon-claw", "flamethrower", "thunderbolt", "surf"],
  dark: ["dark-pulse", "shadow-ball", "punch", "quick-attack"],
  steel: ["iron-tail", "rock-throw", "tackle", "scratch"],
  fairy: ["moonblast", "psychic", "quick-attack", "tackle"],
  normal: ["tackle", "scratch", "quick-attack", "punch"],
};

/** Pools signature por Pokémon (4 golpes únicos) */
const POKEMON_SIGNATURE_MOVES: Partial<Record<number, [string, string, string, string]>> = {
  1: ["vine-whip", "razor-leaf", "sleep-powder", "tackle"],
  4: ["ember", "scratch", "flamethrower", "will-o-wisp"],
  7: ["water-gun", "bubble", "surf", "ice-beam"],
  25: ["thunder-shock", "quick-attack", "thunderbolt", "thunder-wave"],
  6: ["flamethrower", "fire-spin", "dragon-claw", "will-o-wisp"],
  9: ["water-gun", "surf", "ice-beam", "bubble"],
  3: ["vine-whip", "razor-leaf", "solar-beam", "sleep-powder"],
  94: ["lick", "shadow-ball", "hypnosis", "psychic"],
  143: ["drain-punch", "earthquake", "tackle", "scratch"],
  150: ["psychic", "shadow-ball", "thunderbolt", "flamethrower"],
  144: ["ice-beam", "aerial-ace", "gust", "psychic"],
  145: ["thunderbolt", "thunder-wave", "aerial-ace", "quick-attack"],
  146: ["flamethrower", "aerial-ace", "fire-spin", "will-o-wisp"],
  149: ["dragon-claw", "flamethrower", "thunderbolt", "surf"],
  130: ["surf", "ice-beam", "earthquake", "dragon-claw"],
  131: ["surf", "ice-beam", "psychic", "confusion"],
  52: ["scratch", "dark-pulse", "quick-attack", "shadow-ball"],
  133: ["quick-attack", "tackle", "shadow-ball", "iron-tail"],
  134: ["surf", "ice-beam", "quick-attack", "shadow-ball"],
  135: ["thunderbolt", "thunder-wave", "quick-attack", "shadow-ball"],
  136: ["flamethrower", "fire-spin", "quick-attack", "shadow-ball"],
};

function resolveMove(id: string): BattleMove {
  return MOVE_LIBRARY[id] ?? MOVE_LIBRARY.tackle;
}

export function getPokemonMovePool(pokemonId: number): BattleMove[] {
  return getPokemonMovePoolIds(pokemonId).map(resolveMove);
}

/** Níveis para desbloquear cada golpe do pool (1º → 4º) */
export const MOVE_UNLOCK_LEVELS = [1, 10, 20, 30] as const;

export interface PokemonMoveEntry {
  move: BattleMove;
  moveId: string;
  slotIndex: number;
  unlockLevel: number;
}

export function getPokemonMovePoolIds(pokemonId: number): string[] {
  const sig = POKEMON_SIGNATURE_MOVES[pokemonId];
  const pokemon = POKEMON_MAP[pokemonId];
  const type = pokemon ? getPokemonBattleStats(pokemon).type : "normal";
  return sig ?? TYPE_MOVE_POOLS[type] ?? TYPE_MOVE_POOLS.normal;
}

export function getPokemonMoveEntries(pokemonId: number): PokemonMoveEntry[] {
  return getPokemonMovePoolIds(pokemonId).map((id, slotIndex) => ({
    move: resolveMove(id),
    moveId: id,
    slotIndex,
    unlockLevel: MOVE_UNLOCK_LEVELS[slotIndex] ?? 30,
  }));
}

export function getUnlockedMoveCount(level: number): number {
  return MOVE_UNLOCK_LEVELS.filter((l) => level >= l).length;
}

export function isMoveSlotUnlocked(slotIndex: number, level: number): boolean {
  return level >= (MOVE_UNLOCK_LEVELS[slotIndex] ?? 99);
}

export function getUnlockedMoveEntries(pokemonId: number, level: number): PokemonMoveEntry[] {
  return getPokemonMoveEntries(pokemonId).filter((e) => isMoveSlotUnlocked(e.slotIndex, level));
}

function pickAutoLoadout(unlocked: PokemonMoveEntry[]): BattleMove[] {
  if (unlocked.length === 0) {
    return [resolveMove("tackle")];
  }
  const damage = [...unlocked]
    .filter((e) => e.move.category === "damage")
    .sort((a, b) => b.move.power - a.move.power);
  const status = unlocked.filter((e) => e.move.category === "status");
  const first = damage[0] ?? unlocked[0];
  if (unlocked.length === 1) return [first.move];
  const second =
    status.find((e) => e.moveId !== first.moveId) ??
    damage.find((e) => e.moveId !== first.moveId) ??
    unlocked.find((e) => e.moveId !== first.moveId) ??
    first;
  return [first.move, second.move];
}

/** Resolve golpes levados à batalha conforme nível + loadout salvo */
export function resolveBattleMoves(
  pokemonId: number,
  level: number,
  loadoutIds?: string[] | null
): BattleMove[] {
  const unlocked = getUnlockedMoveEntries(pokemonId, level);
  if (unlocked.length === 0) return [getPokemonMoveEntries(pokemonId)[0]?.move ?? resolveMove("tackle")];

  const unlockedIds = new Set(unlocked.map((e) => e.moveId));
  const chosen = (loadoutIds ?? []).filter((id) => unlockedIds.has(id));

  if (chosen.length >= 2) {
    return chosen.slice(0, 2).map(resolveMove);
  }
  if (chosen.length === 1) {
    if (unlocked.length === 1) return [resolveMove(chosen[0])];
    const auto = pickAutoLoadout(unlocked);
    const first = resolveMove(chosen[0]);
    const second = auto.find((m) => m.id !== first.id) ?? auto[1] ?? first;
    return [first, second];
  }

  return pickAutoLoadout(unlocked);
}

export function getDefaultEquippedMoves(pokemonId: number, level = 30): BattleMove[] {
  return resolveBattleMoves(pokemonId, level, null);
}

export function getMoveById(id: string): BattleMove {
  return resolveMove(id);
}
