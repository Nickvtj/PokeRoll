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

/** Sprite shiny padrão do jogo — pixel art GBA. */
export function getPokemonShinySpriteUrl(id: number): string {
  return getPokemonGbaSpriteUrl(id, { shiny: true });
}

/** @deprecated Use getPokemonSpriteUrl */
export function getPokemonRetroSpriteUrl(id: number): string {
  return getPokemonSpriteUrl(id);
}
