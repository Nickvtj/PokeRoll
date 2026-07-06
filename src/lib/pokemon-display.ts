import {
  getPokemonSpriteUrl,
  getPokemonShinySpriteUrl,
  getPokemonNormalizedSpriteUrl,
} from "@/data/pokemon-sprites";
import { POKEMON_MAP } from "@/data/pokemon";
import type { CollectedPokemon, Pokemon } from "@/types";

export function shouldShowShiny(entry: CollectedPokemon | null | undefined): boolean {
  return Boolean(entry?.hasShiny && entry?.useShiny);
}

export function getPokemonDisplayImage(
  pokemonId: number,
  entry?: CollectedPokemon | null
): string {
  if (entry && shouldShowShiny(entry)) {
    return getPokemonShinySpriteUrl(pokemonId);
  }
  return getPokemonSpriteUrl(pokemonId);
}

/** Pokémon com imagem resolvida (normal ou shiny) para batalha/UI */
export function withDisplayImage(
  pokemon: Pokemon,
  entry?: CollectedPokemon | null
): Pokemon {
  const image = getPokemonDisplayImage(pokemon.id, entry);
  if (image === pokemon.image) return pokemon;
  return { ...pokemon, image };
}

export function getSpinResultImage(pokemonId: number, isShiny: boolean): string {
  return isShiny ? getPokemonShinySpriteUrl(pokemonId) : getPokemonSpriteUrl(pokemonId);
}

/**
 * Imagem para grades de coleção (álbum, seleção de time): usa sprites
 * normalizados para que todos os Pokémon apareçam com o mesmo tamanho.
 */
export function getPokemonGridImage(
  pokemonId: number,
  entry?: CollectedPokemon | null
): string {
  return getPokemonNormalizedSpriteUrl(pokemonId, { shiny: shouldShowShiny(entry) });
}

/** Pokémon com imagem normalizada para grades de coleção. */
export function withGridImage(
  pokemon: Pokemon,
  entry?: CollectedPokemon | null
): Pokemon {
  return { ...pokemon, image: getPokemonGridImage(pokemon.id, entry) };
}

export function countShinyUnlocked(
  collection: Record<number, CollectedPokemon>
): number {
  return Object.values(collection).filter((c) => c.hasShiny).length;
}

export function resolveTeamPokemon(
  teamIds: number[],
  collection: Record<number, CollectedPokemon>
): Pokemon[] {
  return teamIds
    .map((id) => {
      const base = POKEMON_MAP[id];
      if (!base) return null;
      return withDisplayImage(base, collection[id]);
    })
    .filter((p): p is Pokemon => p != null);
}
