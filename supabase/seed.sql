-- Seed dos 150 Pokémon no Supabase
-- Gere via: npx tsx scripts/generate-seed.ts (ou copie manualmente)

-- Exemplo de insert (primeiros 5 — complete com script ou import CSV):
INSERT INTO pokemon (id, name, image, rarity, generation, weight) VALUES
(1, 'Bulbasaur', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png', 'common', 1, 1),
(2, 'Ivysaur', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/2.png', 'uncommon', 1, 1),
(3, 'Venusaur', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/3.png', 'rare', 1, 1),
(4, 'Charmander', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/4.png', 'uncommon', 1, 1),
(5, 'Charmeleon', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/5.png', 'rare', 1, 1)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  image = EXCLUDED.image,
  rarity = EXCLUDED.rarity,
  generation = EXCLUDED.generation,
  weight = EXCLUDED.weight;

-- Para seed completo, use src/data/pokemon.ts como fonte de verdade no frontend.
-- O catálogo roda 100% offline via mock data; Supabase é opcional para sync.
