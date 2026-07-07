export interface PokedexInfo {
  types: [string] | [string, string];
  category: string;
  description: string;
  height: number;
  weight: number;
}

export type Rarity = "common" | "uncommon" | "rare" | "epic" | "legendary";

export interface Pokemon {
  id: number;
  name: string;
  image: string;
  rarity: Rarity;
  generation: number;
  /** Chance individual dentro da raridade (peso relativo) */
  weight: number;
}

export interface CollectedPokemon {
  pokemonId: number;
  collectedAt: string;
  isDuplicate: boolean;
  count: number;
  /** Desbloqueou skin shiny na roleta */
  hasShiny?: boolean;
  /** Usar sprite shiny na batalha/UI */
  useShiny?: boolean;
}

export interface PlayerProfile {
  id: string;
  username: string;
  totalSpins: number;
  createdAt: string;
}

export interface SpinResult {
  pokemon: Pokemon;
  isNew: boolean;
  isDuplicate: boolean;
  rarity: Rarity;
  /** Resultado veio como shiny neste giro */
  isShiny?: boolean;
  /** Primeira vez desbloqueando shiny deste Pokémon */
  isNewShinyUnlock?: boolean;
  /** Bônus extra da roleta (pedra ou Doce Coringa). */
  jackpot?: {
    evoItem?: string;
    wildCandy?: number;
  };
}

export type SpinMultiplier = 1 | 2 | 3;

export interface AlbumFilter {
  rarity: Rarity | "all";
  generation: number | "all";
  status: "all" | "found" | "missing";
  pokemonType: string | "all";
  shinyOnly: boolean;
  searchQuery: string;
}

export interface RarityConfig {
  key: Rarity;
  label: string;
  chance: number;
  color: string;
  glowColor: string;
  bgGradient: string;
}

export type { Database } from "@/types/database";
