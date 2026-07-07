/**
 * Linhas evolutivas completas de Kanto (v2).
 *
 * Cada passo de evolução carrega método (level/stone/trade), nível mínimo,
 * custo em doces da família e item necessário. A "trava híbrida": para evoluir
 * é preciso doces suficientes E a instância no nível mínimo.
 *
 * familyId = id da forma base (o doce é compartilhado pela linha inteira).
 */

import type { EvoItemId } from "@/types/instance";

export type EvolutionMethod = "level" | "stone" | "trade";

export interface EvolutionStep {
  fromId: number;
  toId: number;
  /** id da forma base da linha (doce compartilhado). */
  familyId: number;
  method: EvolutionMethod;
  /** nível mínimo da instância para poder evoluir. */
  minLevel: number;
  /** doces da família necessários. */
  candyCost: number;
  /** pedra ou cabo, quando aplicável. */
  item?: EvoItemId;
}

/** Custos base (ajustáveis, travados na spec v2). */
export const EVO_COST = {
  stage1MinLevel: 16,
  stage1Candy: 100,
  stage2MinLevel: 32,
  stage2Candy: 250,
  itemMinLevel: 16,
  itemCandy: 50,
} as const;

interface LineDef {
  chain: number[];
  /** overrides por toId: método/item diferente de "level". */
  overrides?: Record<number, { method: EvolutionMethod; item?: EvoItemId }>;
}

const LINE_DEFS: LineDef[] = [
  { chain: [1, 2, 3] },
  { chain: [4, 5, 6] },
  { chain: [7, 8, 9] },
  { chain: [10, 11, 12] },
  { chain: [13, 14, 15] },
  { chain: [16, 17, 18] },
  { chain: [19, 20] },
  { chain: [21, 22] },
  { chain: [23, 24] },
  { chain: [25, 26], overrides: { 26: { method: "stone", item: "thunder-stone" } } },
  { chain: [27, 28] },
  { chain: [29, 30, 31], overrides: { 31: { method: "stone", item: "moon-stone" } } },
  { chain: [32, 33, 34], overrides: { 34: { method: "stone", item: "moon-stone" } } },
  { chain: [35, 36], overrides: { 36: { method: "stone", item: "moon-stone" } } },
  { chain: [37, 38], overrides: { 38: { method: "stone", item: "fire-stone" } } },
  { chain: [39, 40], overrides: { 40: { method: "stone", item: "moon-stone" } } },
  { chain: [41, 42] },
  { chain: [43, 44, 45], overrides: { 45: { method: "stone", item: "leaf-stone" } } },
  { chain: [46, 47] },
  { chain: [48, 49] },
  { chain: [50, 51] },
  { chain: [52, 53] },
  { chain: [54, 55] },
  { chain: [56, 57] },
  { chain: [58, 59], overrides: { 59: { method: "stone", item: "fire-stone" } } },
  { chain: [60, 61, 62], overrides: { 62: { method: "stone", item: "water-stone" } } },
  { chain: [63, 64, 65], overrides: { 65: { method: "trade", item: "linking-cord" } } },
  { chain: [66, 67, 68], overrides: { 68: { method: "trade", item: "linking-cord" } } },
  { chain: [69, 70, 71], overrides: { 71: { method: "stone", item: "leaf-stone" } } },
  { chain: [72, 73] },
  { chain: [74, 75, 76], overrides: { 76: { method: "trade", item: "linking-cord" } } },
  { chain: [77, 78] },
  { chain: [79, 80] },
  { chain: [81, 82] },
  { chain: [84, 85] },
  { chain: [86, 87] },
  { chain: [88, 89] },
  { chain: [90, 91], overrides: { 91: { method: "stone", item: "water-stone" } } },
  { chain: [92, 93, 94], overrides: { 94: { method: "trade", item: "linking-cord" } } },
  { chain: [96, 97] },
  { chain: [98, 99] },
  { chain: [100, 101] },
  { chain: [102, 103], overrides: { 103: { method: "stone", item: "leaf-stone" } } },
  { chain: [109, 110] },
  { chain: [111, 112] },
  { chain: [116, 117] },
  { chain: [118, 119] },
  { chain: [120, 121], overrides: { 121: { method: "stone", item: "water-stone" } } },
  { chain: [129, 130] },
  { chain: [138, 139] },
  { chain: [140, 141] },
  { chain: [147, 148, 149] },
];

/** Eevee: mesma espécie base, três pedras diferentes. */
const EEVEE_STEPS: EvolutionStep[] = [
  { fromId: 133, toId: 134, familyId: 133, method: "stone", minLevel: EVO_COST.itemMinLevel, candyCost: EVO_COST.itemCandy, item: "water-stone" },
  { fromId: 133, toId: 135, familyId: 133, method: "stone", minLevel: EVO_COST.itemMinLevel, candyCost: EVO_COST.itemCandy, item: "thunder-stone" },
  { fromId: 133, toId: 136, familyId: 133, method: "stone", minLevel: EVO_COST.itemMinLevel, candyCost: EVO_COST.itemCandy, item: "fire-stone" },
];

function buildSteps(): EvolutionStep[] {
  const steps: EvolutionStep[] = [];

  for (const { chain, overrides } of LINE_DEFS) {
    const familyId = chain[0];
    for (let i = 1; i < chain.length; i++) {
      const fromId = chain[i - 1];
      const toId = chain[i];
      const ov = overrides?.[toId];
      const method = ov?.method ?? "level";
      const stageOfFrom = i - 1; // base = 0, intermediário = 1

      let minLevel: number;
      let candyCost: number;
      if (method === "level") {
        if (stageOfFrom === 0) {
          minLevel = EVO_COST.stage1MinLevel;
          candyCost = EVO_COST.stage1Candy;
        } else {
          minLevel = EVO_COST.stage2MinLevel;
          candyCost = EVO_COST.stage2Candy;
        }
      } else {
        minLevel = EVO_COST.itemMinLevel;
        candyCost = EVO_COST.itemCandy;
      }

      steps.push({ fromId, toId, familyId, method, minLevel, candyCost, item: ov?.item });
    }
  }

  steps.push(...EEVEE_STEPS);
  return steps;
}

export const EVOLUTION_STEPS: EvolutionStep[] = buildSteps();

const STEPS_BY_FROM = new Map<number, EvolutionStep[]>();
const FAMILY_ID_BY_SPECIES = new Map<number, number>();

for (const step of EVOLUTION_STEPS) {
  const list = STEPS_BY_FROM.get(step.fromId) ?? [];
  list.push(step);
  STEPS_BY_FROM.set(step.fromId, list);
}

for (const { chain } of LINE_DEFS) {
  const familyId = chain[0];
  for (const id of chain) FAMILY_ID_BY_SPECIES.set(id, familyId);
}
// Eevee + eeveelutions compartilham a família 133
for (const id of [133, 134, 135, 136]) FAMILY_ID_BY_SPECIES.set(id, 133);

/** Passos de evolução disponíveis a partir de uma espécie (Eevee retorna 3). */
export function getEvolutionsFrom(speciesId: number): EvolutionStep[] {
  return STEPS_BY_FROM.get(speciesId) ?? [];
}

/** True se a espécie pertence a alguma linha evolutiva (mesmo se forma final). */
export function isEvolvingSpecies(speciesId: number): boolean {
  return FAMILY_ID_BY_SPECIES.has(speciesId);
}

/** familyId (id da forma base) da espécie, ou a própria espécie se single-stage. */
export function getFamilyId(speciesId: number): number {
  return FAMILY_ID_BY_SPECIES.get(speciesId) ?? speciesId;
}

/** True se a espécie tem pelo menos um passo de evolução a partir dela. */
export function canEvolve(speciesId: number): boolean {
  return STEPS_BY_FROM.has(speciesId);
}

/**
 * Modelo Elite: só formas base ou single-stage podem dropar na roleta/ovos.
 * - Linha evolutiva: apenas `familyId === speciesId` (ex.: Charmander, não Charizard).
 * - Single-stage: não está em linha (ex.: Tauros, Chansey).
 */
export function isDropEligible(speciesId: number): boolean {
  if (!isEvolvingSpecies(speciesId)) return true;
  return getFamilyId(speciesId) === speciesId;
}
