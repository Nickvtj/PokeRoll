/** URL CDN original — fallback se sprite local não existir. */
export function POKEMON_SPRITE_CDN_URL(id: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
}

/** Sprite servido localmente via /public/sprites. */
export function POKEMON_SPRITE_LOCAL_URL(id: number): string {
  return `/sprites/${id}.png`;
}

export function getPokemonSpriteUrl(id: number): string {
  return POKEMON_SPRITE_LOCAL_URL(id);
}
