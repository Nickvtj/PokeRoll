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
}

export type SpinMultiplier = 1 | 2 | 3;

export interface AlbumFilter {
  rarity: Rarity | "all";
  generation: number | "all";
  status: "all" | "found" | "missing";
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

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          username: string;
          total_spins: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          username: string;
          total_spins?: number;
          created_at?: string;
        };
        Update: {
          username?: string;
          total_spins?: number;
        };
      };
      pokemon: {
        Row: {
          id: number;
          name: string;
          image: string;
          rarity: Rarity;
          generation: number;
          weight: number;
        };
        Insert: {
          id: number;
          name: string;
          image: string;
          rarity: Rarity;
          generation: number;
          weight?: number;
        };
        Update: Partial<{
          name: string;
          image: string;
          rarity: Rarity;
          generation: number;
          weight: number;
        }>;
      };
      collections: {
        Row: {
          id: string;
          user_id: string;
          pokemon_id: number;
          count: number;
          first_collected_at: string;
          last_collected_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          pokemon_id: number;
          count?: number;
          first_collected_at?: string;
          last_collected_at?: string;
        };
        Update: {
          count?: number;
          last_collected_at?: string;
        };
      };
      spins: {
        Row: {
          id: string;
          user_id: string;
          pokemon_id: number;
          is_duplicate: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          pokemon_id: number;
          is_duplicate: boolean;
          created_at?: string;
        };
        Update: never;
      };
    };
  };
}
