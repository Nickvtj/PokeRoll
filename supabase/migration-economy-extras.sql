-- Migração: campos extras em player_economy (execute se já rodou schema-economy.sql)
ALTER TABLE player_economy
  ADD COLUMN IF NOT EXISTS favorite_pokemon INTEGER[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS pokemon_battle_xp JSONB NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS welcome_claimed BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS unlocked_achievements TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS selected_avatar_id TEXT NOT NULL DEFAULT 'default';
