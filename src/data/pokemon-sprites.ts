export interface GbaSpriteVariant {
  back?: boolean;
  shiny?: boolean;
}

/** Sprite GBA local (public/sprites/gba) — FireRed/LeafGreen */
export function getPokemonGbaSpriteUrl(
  id: number,
  { back = false, shiny = false }: GbaSpriteVariant = {}
): string {
  return `/sprites/gba/${back ? "back/" : ""}${shiny ? "shiny/" : ""}${id}.png`;
}

/** Chance de shiny por giro da roleta (0,2%) */
export const SHINY_CHANCE = 0.002;

/** Chance de shiny ao chocar ovos (0,8%) */
export const EGG_SHINY_CHANCE = 0.008;

/** Sprite padrão do jogo — pixel art GBA. */
export function getPokemonSpriteUrl(id: number): string {
  return getPokemonGbaSpriteUrl(id);
}

/**
 * Sprite GBA normalizado (public/sprites/gba/norm) — recortado e recentralizado
 * para que todos os Pokémon ocupem o mesmo tamanho no álbum/seleção de time.
 * Gerado por scripts/normalize-gba-sprites.ps1.
 */
export function getPokemonNormalizedSpriteUrl(
  id: number,
  { shiny = false }: { shiny?: boolean } = {}
): string {
  return `/sprites/gba/norm/${shiny ? "shiny/" : ""}${id}.png`;
}

/** Sprite shiny padrão do jogo — pixel art GBA. */
export function getPokemonShinySpriteUrl(id: number): string {
  return getPokemonGbaSpriteUrl(id, { shiny: true });
}

/** @deprecated Use getPokemonSpriteUrl */
export function getPokemonRetroSpriteUrl(id: number): string {
  return getPokemonSpriteUrl(id);
}
