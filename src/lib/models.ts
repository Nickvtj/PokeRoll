/**
 * Models / mappers para integração Supabase ↔ Frontend
 */
import type { CollectedPokemon, PlayerProfile, Pokemon, Rarity } from "@/types";

export interface UserRow {
  id: string;
  username: string;
  total_spins: number;
  created_at: string;
}

export interface PokemonRow {
  id: number;
  name: string;
  image: string;
  rarity: Rarity;
  generation: number;
  weight: number;
}

export interface CollectionRow {
  id: string;
  user_id: string;
  pokemon_id: number;
  count: number;
  first_collected_at: string;
  last_collected_at: string;
}

export interface SpinRow {
  id: string;
  user_id: string;
  pokemon_id: number;
  is_duplicate: boolean;
  created_at: string;
}

export function mapUserRow(row: UserRow): PlayerProfile {
  return {
    id: row.id,
    username: row.username,
    totalSpins: row.total_spins,
    createdAt: row.created_at,
  };
}

export function mapPokemonRow(row: PokemonRow): Pokemon {
  return {
    id: row.id,
    name: row.name,
    image: row.image,
    rarity: row.rarity,
    generation: row.generation,
    weight: Number(row.weight),
  };
}

export function mapCollectionRow(row: CollectionRow): CollectedPokemon {
  return {
    pokemonId: row.pokemon_id,
    collectedAt: row.first_collected_at,
    isDuplicate: row.count > 1,
    count: row.count,
  };
}

export function mapProfileToUserInsert(profile: PlayerProfile): Omit<UserRow, "created_at"> {
  return {
    id: profile.id,
    username: profile.username,
    total_spins: profile.totalSpins,
  };
}

export function mapPokemonToRow(pokemon: Pokemon): PokemonRow {
  return {
    id: pokemon.id,
    name: pokemon.name,
    image: pokemon.image,
    rarity: pokemon.rarity,
    generation: pokemon.generation,
    weight: pokemon.weight,
  };
}
