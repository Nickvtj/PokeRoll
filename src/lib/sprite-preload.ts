import { POKEMON_LIST } from "@/data/pokemon";
import { getPokemonSpriteUrl, POKEMON_SPRITE_CDN_URL } from "@/data/pokemon-sprites";

const preloadedIds = new Set<number>();
let fullPreloadStarted = false;

function preloadOne(id: number): void {
  if (preloadedIds.has(id)) return;
  preloadedIds.add(id);

  const img = new Image();
  img.decoding = "async";
  img.src = getPokemonSpriteUrl(id);
  img.onerror = () => {
    preloadedIds.delete(id);
    const fallback = new Image();
    fallback.decoding = "async";
    fallback.src = POKEMON_SPRITE_CDN_URL(id);
  };
}

/** Precarrega sprites locais (fallback CDN em erro). */
export function preloadPokemonSprites(ids?: number[]): void {
  const targetIds = ids ?? POKEMON_LIST.map((p) => p.id);
  for (const id of targetIds) {
    preloadOne(id);
  }
}

/** Precarrega sprites usados nas sequências da roleta antes da animação. */
export function preloadSpinSprites(sequences: { id: number }[][]): void {
  const ids = new Set<number>();
  for (const sequence of sequences) {
    for (const pokemon of sequence) {
      ids.add(pokemon.id);
    }
  }
  preloadPokemonSprites([...ids]);
}

/** Precarrega todos os sprites em background após o boot. */
export function preloadAllPokemonSpritesDeferred(): void {
  if (fullPreloadStarted || typeof window === "undefined") return;
  fullPreloadStarted = true;

  const run = () => preloadPokemonSprites();
  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(run, { timeout: 4000 });
  } else {
    setTimeout(run, 500);
  }
}
