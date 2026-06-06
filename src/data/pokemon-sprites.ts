const SECRET_MEW_ID = 151;

/** URL CDN original — fallback se sprite local não existir. */
export function POKEMON_SPRITE_CDN_URL(id: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
}

/** Sprite servido localmente via /public/sprites. */
export function POKEMON_SPRITE_LOCAL_URL(id: number): string {
  return `/sprites/${id}.png`;
}

/** Chance de shiny por giro da roleta (0,1%) */
export const SHINY_CHANCE = 0.001;

/** Sprite servido localmente via /public/sprites/shiny */
export function POKEMON_SHINY_SPRITE_LOCAL_URL(id: number): string {
  return `/sprites/shiny/${id}.png`;
}

export function POKEMON_SHINY_SPRITE_CDN_URL(id: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/${id}.png`;
}

export function getPokemonSpriteUrl(id: number): string {
  if (id === SECRET_MEW_ID) return POKEMON_SPRITE_CDN_URL(id);
  return POKEMON_SPRITE_LOCAL_URL(id);
}

export function getPokemonShinySpriteUrl(id: number): string {
  if (id === SECRET_MEW_ID) return POKEMON_SHINY_SPRITE_CDN_URL(id);
  return POKEMON_SHINY_SPRITE_LOCAL_URL(id);
}
