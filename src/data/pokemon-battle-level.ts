/** Progressão individual de Pokémon em batalha */

export const POKEMON_XP_PER_LEVEL = 40;
export const MAX_POKEMON_BATTLE_LEVEL = 25;
export const POKEMON_BATTLE_XP_WIN = 18;
export const POKEMON_BATTLE_XP_LOSS = 6;
export const POKEMON_STAT_PER_LEVEL = 0.04;

export interface PokemonBattleProgress {
  level: number;
  xp: number;
}

export function calcPokemonLevel(xp: number): number {
  return Math.min(MAX_POKEMON_BATTLE_LEVEL, Math.floor(xp / POKEMON_XP_PER_LEVEL) + 1);
}

export function getStatMultiplier(level: number): number {
  return 1 + (level - 1) * POKEMON_STAT_PER_LEVEL;
}

export function getXpProgress(xp: number) {
  const level = calcPokemonLevel(xp);
  const xpInLevel = xp % POKEMON_XP_PER_LEVEL;
  const pct =
    level >= MAX_POKEMON_BATTLE_LEVEL ? 100 : (xpInLevel / POKEMON_XP_PER_LEVEL) * 100;
  return { level, xpInLevel, pct, xpToNext: POKEMON_XP_PER_LEVEL };
}

export function addPokemonXp(
  current: PokemonBattleProgress,
  amount: number
): { progress: PokemonBattleProgress; leveledUp: boolean; previousLevel: number } {
  const previousLevel = current.level;
  const newXp = current.xp + amount;
  const newLevel = calcPokemonLevel(newXp);
  return {
    progress: { xp: newXp, level: newLevel },
    leveledUp: newLevel > previousLevel,
    previousLevel,
  };
}

export const LEVEL_FILTER_OPTIONS = [
  { id: "all", label: "Todos níveis" },
  { id: "1-5", label: "Nv. 1–5", min: 1, max: 5 },
  { id: "6-10", label: "Nv. 6–10", min: 6, max: 10 },
  { id: "11+", label: "Nv. 11+", min: 11, max: 99 },
] as const;

export type LevelFilterId = (typeof LEVEL_FILTER_OPTIONS)[number]["id"];

export function matchesLevelFilter(level: number, filter: LevelFilterId): boolean {
  if (filter === "all") return true;
  const opt = LEVEL_FILTER_OPTIONS.find((o) => o.id === filter);
  if (!opt || opt.id === "all") return true;
  return level >= opt.min && level <= opt.max;
}
