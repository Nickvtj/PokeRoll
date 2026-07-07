/** Formato exigido pelo @supabase/supabase-js v2 (GenericTable). */
type DbTable<
  Row extends Record<string, unknown>,
  Insert extends Record<string, unknown>,
  Update extends Record<string, unknown>,
> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      users: DbTable<
        {
          id: string;
          username: string;
          total_spins: number;
          created_at: string;
        },
        {
          id?: string;
          username: string;
          total_spins?: number;
          created_at?: string;
        },
        {
          username?: string;
          total_spins?: number;
        }
      >;
      pokemon: DbTable<
        {
          id: number;
          name: string;
          image: string;
          rarity: "common" | "uncommon" | "rare" | "epic" | "legendary";
          generation: number;
          weight: number;
        },
        {
          id: number;
          name: string;
          image: string;
          rarity: "common" | "uncommon" | "rare" | "epic" | "legendary";
          generation: number;
          weight?: number;
        },
        Partial<{
          name: string;
          image: string;
          rarity: "common" | "uncommon" | "rare" | "epic" | "legendary";
          generation: number;
          weight: number;
        }>
      >;
      collections: DbTable<
        {
          id: string;
          user_id: string;
          pokemon_id: number;
          count: number;
          first_collected_at: string;
          last_collected_at: string;
          has_shiny?: boolean;
          use_shiny?: boolean;
        },
        {
          id?: string;
          user_id: string;
          pokemon_id: number;
          count?: number;
          first_collected_at?: string;
          last_collected_at?: string;
          has_shiny?: boolean;
          use_shiny?: boolean;
        },
        {
          count?: number;
          last_collected_at?: string;
          has_shiny?: boolean;
          use_shiny?: boolean;
        }
      >;
      spins: DbTable<
        {
          id: string;
          user_id: string;
          pokemon_id: number;
          is_duplicate: boolean;
          created_at: string;
        },
        {
          id?: string;
          user_id: string;
          pokemon_id: number;
          is_duplicate: boolean;
          created_at?: string;
        },
        Record<string, never>
      >;
      player_economy: DbTable<
        {
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
          favorite_pokemon: number[];
          pokemon_battle_xp: Record<string, { level: number; xp: number }>;
          welcome_claimed: boolean;
          unlocked_achievements: string[];
          selected_avatar_id?: string | null;
          updated_at: string;
        },
        {
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
          favorite_pokemon?: number[];
          pokemon_battle_xp?: Record<string, { level: number; xp: number }>;
          welcome_claimed?: boolean;
          unlocked_achievements?: string[];
          selected_avatar_id?: string | null;
          updated_at?: string;
        },
        Partial<{
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
          favorite_pokemon: number[];
          pokemon_battle_xp: Record<string, { level: number; xp: number }>;
          welcome_claimed: boolean;
          unlocked_achievements: string[];
          selected_avatar_id: string | null;
          updated_at: string;
        }>
      >;
      player_achievements: DbTable<
        {
          id: string;
          user_id: string;
          achievement_id: string;
          unlocked_at: string;
        },
        {
          id?: string;
          user_id: string;
          achievement_id: string;
          unlocked_at?: string;
        },
        {
          achievement_id?: string;
          unlocked_at?: string;
        }
      >;
      gym_progress: DbTable<
        {
          user_id: string;
          badges: string[];
          gym_progress: Record<string, unknown>;
          hall_of_fame: Record<string, unknown>[];
          elite_progress: Record<string, unknown>;
          champion_defeated: boolean;
          saved_teams: Record<string, unknown>[];
          hall_of_fame_final: boolean;
          updated_at: string;
        },
        {
          user_id: string;
          badges?: string[];
          gym_progress?: Record<string, unknown>;
          hall_of_fame?: Record<string, unknown>[];
          elite_progress?: Record<string, unknown>;
          champion_defeated?: boolean;
          saved_teams?: Record<string, unknown>[];
          hall_of_fame_final?: boolean;
          updated_at?: string;
        },
        Partial<{
          badges: string[];
          gym_progress: Record<string, unknown>;
          hall_of_fame: Record<string, unknown>[];
          elite_progress: Record<string, unknown>;
          champion_defeated: boolean;
          saved_teams: Record<string, unknown>[];
          hall_of_fame_final: boolean;
          updated_at: string;
        }>
      >;
      battle_history: DbTable<
        {
          id: string;
          user_id: string;
          won: boolean;
          coins_earned: number;
          xp_earned: number;
          free_spin: boolean;
          wave: number;
          team_ids: number[];
          created_at: string;
        },
        {
          id?: string;
          user_id: string;
          won: boolean;
          coins_earned: number;
          xp_earned: number;
          free_spin?: boolean;
          wave?: number;
          team_ids?: number[];
          created_at?: string;
        },
        Record<string, never>
      >;
      minigame_history: DbTable<
        {
          id: string;
          user_id: string;
          score: number;
          coins_earned: number;
          max_combo: number;
          created_at: string;
        },
        {
          id?: string;
          user_id: string;
          score: number;
          coins_earned: number;
          max_combo?: number;
          created_at?: string;
        },
        Record<string, never>
      >;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
};
