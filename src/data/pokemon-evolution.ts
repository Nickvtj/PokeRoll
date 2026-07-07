/** Estágio evolutivo Gen 1, bônus moderado de combate (bases continuam viáveis com nível). */

export type EvolutionStage = 0 | 1 | 2;

export interface EvolutionStatMult {
  hp: number;
  attack: number;
  defense: number;
}

/** Bônus por estágio, aplicado após raridade, antes do nível de batalha */
export const EVOLUTION_STAT_MULT: Record<EvolutionStage, EvolutionStatMult> = {
  0: { hp: 1, attack: 1, defense: 1 },
  1: { hp: 1.06, attack: 1.08, defense: 1.06 },
  2: { hp: 1.12, attack: 1.15, defense: 1.1 },
};

const STAGE_BY_ID = new Map<number, EvolutionStage>();
const MAX_STAGE_BY_ID = new Map<number, EvolutionStage>();

function registerLine(ids: readonly number[]) {
  const maxStage = Math.min(ids.length - 1, 2) as EvolutionStage;
  ids.forEach((id, index) => {
    STAGE_BY_ID.set(id, Math.min(index, 2) as EvolutionStage);
    MAX_STAGE_BY_ID.set(id, maxStage);
  });
}

// Linhas de 3 estágios
registerLine([1, 2, 3]);
registerLine([4, 5, 6]);
registerLine([7, 8, 9]);
registerLine([10, 11, 12]);
registerLine([13, 14, 15]);
registerLine([16, 17, 18]);
registerLine([43, 44, 45]);
registerLine([46, 47]);
registerLine([60, 61, 62]);
registerLine([63, 64, 65]);
registerLine([66, 67, 68]);
registerLine([69, 70, 71]);
registerLine([74, 75, 76]);
registerLine([92, 93, 94]);
registerLine([138, 139]);
registerLine([140, 141]);
registerLine([147, 148, 149]);
registerLine([29, 30, 31]);
registerLine([32, 33, 34]);

// Linhas de 2 estágios
registerLine([19, 20]);
registerLine([21, 22]);
registerLine([23, 24]);
registerLine([25, 26]);
registerLine([27, 28]);
registerLine([35, 36]);
registerLine([37, 38]);
registerLine([39, 40]);
registerLine([41, 42]);
registerLine([48, 49]);
registerLine([50, 51]);
registerLine([52, 53]);
registerLine([54, 55]);
registerLine([56, 57]);
registerLine([58, 59]);
registerLine([72, 73]);
registerLine([77, 78]);
registerLine([79, 80]);
registerLine([81, 82]);
registerLine([84, 85]);
registerLine([86, 87]);
registerLine([88, 89]);
registerLine([90, 91]);
registerLine([96, 97]);
registerLine([98, 99]);
registerLine([100, 101]);
registerLine([102, 103]);
registerLine([109, 110]);
registerLine([111, 112]);
registerLine([116, 117]);
registerLine([118, 119]);
registerLine([120, 121]);
registerLine([129, 130]);

// Ramificações Eevee (cada final = estágio 1)
registerLine([133, 134]);
registerLine([133, 135]);
registerLine([133, 136]);

export function getEvolutionStage(pokemonId: number): EvolutionStage {
  return STAGE_BY_ID.get(pokemonId) ?? 0;
}

export function getEvolutionMaxStage(pokemonId: number): EvolutionStage {
  return MAX_STAGE_BY_ID.get(pokemonId) ?? 0;
}

export function getEvolutionStatMult(pokemonId: number): EvolutionStatMult {
  return EVOLUTION_STAT_MULT[getEvolutionStage(pokemonId)];
}

/** Rótulo para UI, null se Pokémon sem linha evolutiva */
export function getEvolutionLabel(pokemonId: number): string | null {
  const max = getEvolutionMaxStage(pokemonId);
  if (max === 0) return null;

  const stage = getEvolutionStage(pokemonId);
  const current = stage + 1;
  const total = max + 1;

  if (stage === 0) return `Forma base (${current}/${total})`;
  if (stage === max) return `Forma final (${current}/${total})`;
  return `Intermediária (${current}/${total})`;
}
