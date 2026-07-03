import { POKEMON_LIST } from "@/data/pokemon";
import { getPokemonSpriteUrl, getPokemonShinySpriteUrl } from "@/data/pokemon-sprites";
import type { SpinResult } from "@/types";

const preloadedIds = new Set<number>();
const preloadedShinyIds = new Set<number>();
let priorityPreloadStarted = false;

const BATCH_SIZE = 24;

function preloadOne(id: number): void {
  if (preloadedIds.has(id)) return;
  preloadedIds.add(id);

  const img = new Image();
  img.decoding = "async";
  img.src = getPokemonSpriteUrl(id);
}

/** Precarrega sprites locais em cache do navegador. */
export function preloadPokemonSprites(ids?: number[]): void {
  const targetIds = ids ?? POKEMON_LIST.map((p) => p.id);
  for (const id of targetIds) {
    preloadOne(id);
  }
}

/** Precarrega sprites usados nas sequências da roleta antes da animação. */
export function preloadSpinSprites(
  sequences: { id: number }[][],
  results: Pick<SpinResult, "isShiny" | "pokemon">[] = []
): void {
  const ids = new Set<number>();
  for (const sequence of sequences) {
    for (const pokemon of sequence) {
      ids.add(pokemon.id);
    }
  }
  preloadPokemonSprites([...ids]);

  for (const result of results) {
    if (result.isShiny) {
      preloadShinySprite(result.pokemon.id);
    }
  }
}

function preloadShinySprite(id: number): void {
  if (preloadedShinyIds.has(id)) return;
  preloadedShinyIds.add(id);

  const img = new Image();
  img.decoding = "async";
  img.src = getPokemonShinySpriteUrl(id);
}

export function preloadShinySprites(ids: number[]): void {
  for (const id of ids) preloadShinySprite(id);
}

function scheduleIdle(work: () => void, timeout = 3000): void {
  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(work, { timeout });
  } else {
    setTimeout(work, 400);
  }
}

function preloadInBatches(ids: number[], startIndex = 0): void {
  const batch = ids.slice(startIndex, startIndex + BATCH_SIZE);
  for (const id of batch) preloadOne(id);

  const next = startIndex + BATCH_SIZE;
  if (next < ids.length) {
    scheduleIdle(() => preloadInBatches(ids, next), 4000);
  }
}

/**
 * Precarrega em background: time + coleção (+ primeiros IDs do álbum se poucos coletados).
 */
export function preloadPrioritySpritesDeferred(
  teamIds: number[],
  collectedIds: number[]
): void {
  if (priorityPreloadStarted || typeof window === "undefined") return;
  priorityPreloadStarted = true;

  const priority = new Set<number>([...teamIds, ...collectedIds]);

  if (priority.size < 24) {
    for (const p of POKEMON_LIST.slice(0, 48)) {
      priority.add(p.id);
    }
  }

  const ids = [...priority];

  scheduleIdle(() => preloadInBatches(ids), 6000);
}

/** @deprecated Use preloadPrioritySpritesDeferred */
export function preloadAllPokemonSpritesDeferred(): void {
  if (priorityPreloadStarted || typeof window === "undefined") return;
  priorityPreloadStarted = true;
  scheduleIdle(() => preloadPokemonSprites(), 4000);
}
