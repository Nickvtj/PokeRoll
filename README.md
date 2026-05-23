# PokéRoll 🎰✨

Jogo web de coleção de figurinhas Pokémon inspirado em Coin Master. Gire a roleta, colete 150 Pokémon e complete seu álbum!

## Stack

- **Next.js 15** — App Router
- **React 19** + **TypeScript**
- **Tailwind CSS** — UI premium com glassmorphism
- **Framer Motion** — Animações fluidas
- **Zustand** — Estado global
- **Supabase** — Persistência (com fallback localStorage)
- **Lucide React** — Ícones
- **Canvas Confetti** — Efeitos de celebração

## Começar

```bash
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000)

## Estrutura

```
src/
├── app/              # Páginas (Home, Spin, Album, Profile)
├── components/       # UI, Pokémon, Spin, Album, Layout
├── data/             # 150 Pokémon + config de raridade
├── hooks/            # Init, som, confetti
├── lib/              # Supabase, storage, spin algorithm
├── stores/           # Zustand game store
└── types/            # TypeScript interfaces
supabase/
└── schema.sql        # Schema do banco de dados
```

## Supabase (Opcional)

1. Crie um projeto no [Supabase](https://supabase.com)
2. Execute `supabase/schema.sql` no SQL Editor
3. Copie `.env.example` para `.env.local` e preencha as credenciais

Sem Supabase, o jogo funciona com **localStorage** automaticamente.

## Raridades

| Raridade  | Chance |
|-----------|--------|
| Comum     | 45%    |
| Incomum   | 30%    |
| Raro      | 15%    |
| Épico     | 8%     |
| Lendário  | 2%     |

Porcentagens configuráveis em `src/data/rarity.ts`.

## Telas

- **/** — Home com botão Play
- **/spin** — Roleta / caça-níquel
- **/album** — Álbum com filtros e progresso
- **/profile** — Estatísticas do jogador

## Licença

Projeto educacional. Pokémon © Nintendo/Game Freak/Creatures Inc.
