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
      player_economy: {
        Row: {
          user_id: string;
          coins: number;
          xp: number;
          level: number;
          rank: number;
          free_spins: number;
          battle_wins: number;
          total_battles: number;
          click_games_played: number;
          click_coins_today: number;
          click_games_today: number;
          last_click_game_date: string | null;
          daily_streak: number;
          last_login_date: string | null;
          mission_progress: Record<string, number>;
          missions_claimed: string[];
          last_mission_date: string | null;
          team: number[];
          updated_at: string;
        };
        Insert: {
          user_id: string;
          coins?: number;
          xp?: number;
          level?: number;
          rank?: number;
          free_spins?: number;
          battle_wins?: number;
          total_battles?: number;
          click_games_played?: number;
          click_coins_today?: number;
          click_games_today?: number;
          last_click_game_date?: string | null;
          daily_streak?: number;
          last_login_date?: string | null;
          mission_progress?: Record<string, number>;
          missions_claimed?: string[];
          last_mission_date?: string | null;
          team?: number[];
          updated_at?: string;
        };
        Update: Partial<{
          coins: number;
          xp: number;
          level: number;
          rank: number;
          free_spins: number;
          battle_wins: number;
          total_battles: number;
          click_games_played: number;
          click_coins_today: number;
          click_games_today: number;
          last_click_game_date: string | null;
          daily_streak: number;
          last_login_date: string | null;
          mission_progress: Record<string, number>;
          missions_claimed: string[];
          last_mission_date: string | null;
          team: number[];
          updated_at: string;
        }>;
      };
      battle_history: {
        Row: {
          id: string;
          user_id: string;
          won: boolean;
          coins_earned: number;
          xp_earned: number;
          free_spin: boolean;
          wave: number;
          team_ids: number[];
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          won: boolean;
          coins_earned: number;
          xp_earned: number;
          free_spin?: boolean;
          wave?: number;
          team_ids?: number[];
          created_at?: string;
        };
        Update: never;
      };
      minigame_history: {
        Row: {
          id: string;
          user_id: string;
          score: number;
          coins_earned: number;
          max_combo: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          score: number;
          coins_earned: number;
          max_combo?: number;
          created_at?: string;
        };
        Update: never;
      };
    };
  };
}
