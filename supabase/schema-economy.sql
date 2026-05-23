-- PokéRoll — Schema de Economia e Gameplay
-- Execute após schema.sql no SQL Editor do Supabase

-- Economia do jogador
CREATE TABLE IF NOT EXISTS player_economy (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  coins INTEGER NOT NULL DEFAULT 15,
  xp INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 1,
  rank INTEGER NOT NULL DEFAULT 1,
  free_spins INTEGER NOT NULL DEFAULT 0,
  battle_wins INTEGER NOT NULL DEFAULT 0,
  total_battles INTEGER NOT NULL DEFAULT 0,
  click_games_played INTEGER NOT NULL DEFAULT 0,
  click_coins_today INTEGER NOT NULL DEFAULT 0,
  click_games_today INTEGER NOT NULL DEFAULT 0,
  last_click_game_date DATE,
  daily_streak INTEGER NOT NULL DEFAULT 0,
  last_login_date DATE,
  mission_progress JSONB NOT NULL DEFAULT '{}',
  missions_claimed TEXT[] NOT NULL DEFAULT '{}',
  last_mission_date DATE,
  team INTEGER[] NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Histórico de batalhas
CREATE TABLE IF NOT EXISTS battle_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  won BOOLEAN NOT NULL,
  coins_earned INTEGER NOT NULL DEFAULT 0,
  xp_earned INTEGER NOT NULL DEFAULT 0,
  free_spin BOOLEAN NOT NULL DEFAULT FALSE,
  wave INTEGER NOT NULL DEFAULT 1,
  team_ids INTEGER[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Histórico de minigames
CREATE TABLE IF NOT EXISTS minigame_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  score INTEGER NOT NULL DEFAULT 0,
  coins_earned INTEGER NOT NULL DEFAULT 0,
  max_combo INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Transações de moedas
CREATE TABLE IF NOT EXISTS coin_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Conquistas desbloqueadas
CREATE TABLE IF NOT EXISTS player_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL,
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

CREATE INDEX IF NOT EXISTS idx_battle_history_user ON battle_history(user_id);
CREATE INDEX IF NOT EXISTS idx_minigame_history_user ON minigame_history(user_id);
CREATE INDEX IF NOT EXISTS idx_coin_transactions_user ON coin_transactions(user_id);

ALTER TABLE player_economy ENABLE ROW LEVEL SECURITY;
ALTER TABLE battle_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE minigame_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE coin_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all player_economy" ON player_economy FOR ALL USING (true);
CREATE POLICY "Allow all battle_history" ON battle_history FOR ALL USING (true);
CREATE POLICY "Allow all minigame_history" ON minigame_history FOR ALL USING (true);
CREATE POLICY "Allow all coin_transactions" ON coin_transactions FOR ALL USING (true);
CREATE POLICY "Allow all player_achievements" ON player_achievements FOR ALL USING (true);

COMMENT ON TABLE player_economy IS 'Moedas, XP, time e progressão diária do jogador';
COMMENT ON TABLE battle_history IS 'Histórico de batalhas automáticas';
COMMENT ON TABLE minigame_history IS 'Histórico do Click Minigame';
