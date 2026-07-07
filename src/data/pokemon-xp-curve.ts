
/** Nível máximo permitido com base em insígnias */
// v2 (Opção 1): cap inicial 18 permite evoluir estágio 1 (nível 16) com grind;
// o doce da família é o freio real do ritmo. Cresce até 50 no Campeão.
export const LEVEL_CAP_BY_BADGE_COUNT: number[] = [
  18, // 0 badges
  22, // 1
  26, // 2
  29, // 3
  32, // 4
  35, // 5
  38, // 6
  41, // 7
  44, // 8 (todas insígnias Kanto)
  47, // Elite Four completo
  50, // Campeão
];

export const MAX_POKEMON_BATTLE_LEVEL = 50;

export function getLevelCap(badgeCount: number, championDefeated: boolean): number {
  if (championDefeated) return MAX_POKEMON_BATTLE_LEVEL;
  const idx = Math.min(badgeCount, LEVEL_CAP_BY_BADGE_COUNT.length - 2);
  return LEVEL_CAP_BY_BADGE_COUNT[idx] ?? 18;
}

export function getLevelCapLabel(badgeCount: number, championDefeated: boolean): string {
  const cap = getLevelCap(badgeCount, championDefeated);
  if (championDefeated) return `Nv. máx ${cap} (Campeão)`;
  if (badgeCount >= 8) return `Nv. máx ${cap} (Elite)`;
  return `Nv. máx ${cap} (${badgeCount} insígnia${badgeCount !== 1 ? "s" : ""})`;
}

/** XP necessário para subir DO nível anterior PARA `level` */
export function xpRequiredForLevel(level: number): number {
  if (level <= 1) return 0;
  return Math.floor(12 * Math.pow(level - 1, 2.05) + 8 * (level - 1));
}

/** XP total acumulado para ATINGIR um nível */
export function totalXpForLevel(level: number): number {
  let total = 0;
  for (let l = 2; l <= level; l++) {
    total += xpRequiredForLevel(l);
  }
  return total;
}

export function calcPokemonLevelFromTotalXp(totalXp: number): number {
  let level = 1;
  while (
    level < MAX_POKEMON_BATTLE_LEVEL &&
    totalXp >= totalXpForLevel(level + 1)
  ) {
    level++;
  }
  return level;
}

export function getXpProgressFromTotal(totalXp: number) {
  const level = calcPokemonLevelFromTotalXp(totalXp);
  const currentLevelFloor = totalXpForLevel(level);
  const nextLevelTotal =
    level >= MAX_POKEMON_BATTLE_LEVEL
      ? currentLevelFloor
      : totalXpForLevel(level + 1);
  const xpInLevel = totalXp - currentLevelFloor;
  const xpNeeded = nextLevelTotal - currentLevelFloor;
  const pct =
    level >= MAX_POKEMON_BATTLE_LEVEL || xpNeeded <= 0
      ? 100
      : (xpInLevel / xpNeeded) * 100;

  return {
    level,
    xpInLevel,
    xpNeeded,
    pct,
    xpToNext: xpNeeded - xpInLevel,
  };
}

export function migrateLegacyTotalXp(legacyLevel: number, legacyXp: number): number {
  const linearPerLevel = 40;
  return Math.max(0, (legacyLevel - 1) * linearPerLevel + (legacyXp % linearPerLevel));
}

export function clampXpToLevelCap(totalXp: number, levelCap: number): number {
  const maxXp = totalXpForLevel(levelCap);
  return Math.min(totalXp, maxXp);
}

export function getStatMultiplier(level: number): number {
  return 1 + (level - 1) * 0.04;
}

export const POKEMON_BATTLE_XP_WIN = 22;
export const POKEMON_BATTLE_XP_LOSS = 8;
export const GYM_BATTLE_XP_WIN = 52;
export const GYM_BATTLE_XP_LOSS = 14;
export const ELITE_BATTLE_XP_WIN = 68;

export const LEVEL_FILTER_OPTIONS = [
  { id: "all", label: "Todos níveis" },
  { id: "1-5", label: "Nv. 1 a 5", min: 1, max: 5 },
  { id: "6-10", label: "Nv. 6 a 10", min: 6, max: 10 },
  { id: "11-20", label: "Nv. 11 a 20", min: 11, max: 20 },
  { id: "21+", label: "Nv. 21+", min: 21, max: 99 },
] as const;

export type LevelFilterId = (typeof LEVEL_FILTER_OPTIONS)[number]["id"];

export function matchesLevelFilter(level: number, filter: LevelFilterId): boolean {
  if (filter === "all") return true;
  const opt = LEVEL_FILTER_OPTIONS.find((o) => o.id === filter);
  if (!opt || opt.id === "all") return true;
  return level >= opt.min && level <= opt.max;
}

export interface PokemonBattleProgress {
  level: number;
  xp: number;
}

export function addPokemonXp(
  current: PokemonBattleProgress,
  amount: number,
  levelCap: number
): { progress: PokemonBattleProgress; leveledUp: boolean; previousLevel: number; capped: boolean } {
  const previousLevel = calcPokemonLevelFromTotalXp(current.xp);
  const maxXp = totalXpForLevel(levelCap);
  const newXp = Math.min(maxXp, current.xp + amount);
  const newLevel = calcPokemonLevelFromTotalXp(newXp);
  const capped = newXp >= maxXp && amount > 0;

  return {
    progress: { xp: newXp, level: newLevel },
    leveledUp: newLevel > previousLevel,
    previousLevel,
    capped,
  };
}

export function getXpProgress(totalXp: number) {
  const p = getXpProgressFromTotal(totalXp);
  return {
    level: p.level,
    xpInLevel: p.xpInLevel,
    pct: p.pct,
    xpToNext: p.xpNeeded,
  };
}

export function calcPokemonLevel(xp: number): number {
  return calcPokemonLevelFromTotalXp(xp);
}
