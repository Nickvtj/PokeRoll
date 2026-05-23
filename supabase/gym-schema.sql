-- Expansão: Ginásios, Insígnias, Hall of Fame, Elite Four
-- Executar no Supabase SQL Editor (não quebra tabelas existentes)

CREATE TABLE IF NOT EXISTS gym_progress (
  user_id TEXT PRIMARY KEY,
  badges JSONB DEFAULT '[]'::jsonb,
  gym_progress JSONB DEFAULT '{}'::jsonb,
  hall_of_fame JSONB DEFAULT '[]'::jsonb,
  elite_progress JSONB DEFAULT '{}'::jsonb,
  champion_defeated BOOLEAN DEFAULT FALSE,
  saved_teams JSONB DEFAULT '[]'::jsonb,
  hall_of_fame_final BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gym_progress_user ON gym_progress(user_id);

CREATE TABLE IF NOT EXISTS pokemon_xp_history (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  pokemon_id INT NOT NULL,
  amount INT NOT NULL,
  source TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pokemon_xp_history_user ON pokemon_xp_history(user_id);
