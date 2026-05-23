-- PokéRoll — Schema Supabase
-- Execute no SQL Editor do Supabase

-- Extensão UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enum de raridade
CREATE TYPE pokemon_rarity AS ENUM (
  'common',
  'uncommon',
  'rare',
  'epic',
  'legendary'
);

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username TEXT NOT NULL DEFAULT 'Treinador',
  total_spins INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela mestre de Pokémon (150 registros)
CREATE TABLE IF NOT EXISTS pokemon (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  image TEXT NOT NULL,
  rarity pokemon_rarity NOT NULL,
  generation INTEGER NOT NULL DEFAULT 1,
  weight NUMERIC NOT NULL DEFAULT 1
);

-- Coleção do jogador (evita duplicação incorreta via UNIQUE)
CREATE TABLE IF NOT EXISTS collections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  pokemon_id INTEGER NOT NULL REFERENCES pokemon(id),
  count INTEGER NOT NULL DEFAULT 1,
  first_collected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_collected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, pokemon_id)
);

-- Histórico de spins
CREATE TABLE IF NOT EXISTS spins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  pokemon_id INTEGER NOT NULL REFERENCES pokemon(id),
  is_duplicate BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_collections_user ON collections(user_id);
CREATE INDEX IF NOT EXISTS idx_collections_pokemon ON collections(pokemon_id);
CREATE INDEX IF NOT EXISTS idx_spins_user ON spins(user_id);
CREATE INDEX IF NOT EXISTS idx_spins_created ON spins(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pokemon_rarity ON pokemon(rarity);

-- RLS (Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE spins ENABLE ROW LEVEL SECURITY;

-- Políticas permissivas para anon key (ajuste conforme auth real)
CREATE POLICY "Allow all users read pokemon" ON pokemon FOR SELECT USING (true);

CREATE POLICY "Allow all users operations" ON users FOR ALL USING (true);
CREATE POLICY "Allow all collections" ON collections FOR ALL USING (true);
CREATE POLICY "Allow all spins" ON spins FOR ALL USING (true);

-- Seed: inserir 150 Pokémon (exemplo — rode script de seed no frontend ou migração)
-- Os dados completos estão em src/data/pokemon.ts

COMMENT ON TABLE users IS 'Perfis dos jogadores PokéRoll';
COMMENT ON TABLE pokemon IS 'Catálogo mestre de 150 Pokémon';
COMMENT ON TABLE collections IS 'Pokémon coletados por jogador com contagem de duplicatas';
COMMENT ON TABLE spins IS 'Histórico de cada giro na roleta';
