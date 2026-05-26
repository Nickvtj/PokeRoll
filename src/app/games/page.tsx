"use client";



import Link from "next/link";

import { Gamepad2, Target, MousePointerClick, Brain, Coins } from "lucide-react";

import { CoinCounter } from "@/components/ui/CoinCounter";

import {

  CAPTURE_COINS_MAX,

  CAPTURE_COINS_MIN,

  CLICK_BASE_COINS_MAX,

  CLICK_BASE_COINS_MIN,

  MEMORY_COINS_MAX,

  MEMORY_COINS_MIN,

} from "@/data/economy-balance";

import { useEconomyStore } from "@/stores/economy-store";

import { cn } from "@/lib/utils";



const GAMES = [

  {

    href: "/games/captura",

    title: "Captura Perfeita",

    desc: "Acerte o timing na Pokébola enquanto ela balança.",

    reward: "1~5 moedas (por raridade)",

    icon: Target,

    color: "from-emerald-500/25 to-cyan-500/15 border-emerald-500/30",

    iconColor: "text-emerald-400",

  },

  {

    href: "/games/click-rush",

    title: "Click Rush",

    desc: "Clique nas Pokébolas em 30s e faça combos.",

    reward: `${CLICK_BASE_COINS_MIN}~${CLICK_BASE_COINS_MAX} moedas`,

    icon: MousePointerClick,

    color: "from-cyan-500/25 to-blue-500/15 border-cyan-500/30",

    iconColor: "text-cyan-400",

  },

  {

    href: "/games/memory",

    title: "Poké-Memory",

    desc: "Encontre pares de Pokémon no jogo da memória.",

    reward: `${MEMORY_COINS_MIN}~${MEMORY_COINS_MAX} moedas`,

    icon: Brain,

    color: "from-violet-500/25 to-purple-500/15 border-violet-500/30",

    iconColor: "text-violet-400",

  },

] as const;



export default function GamesHubPage() {

  const gamesPlayed = useEconomyStore((s) => s.clickGamesPlayed);

  const gamesToday = useEconomyStore((s) => s.clickGamesToday);



  return (

    <div className="max-w-lg mx-auto px-4 py-8 space-y-6">

      <div className="flex items-center justify-between">

        <div>

          <h1 className="text-3xl font-bold flex items-center gap-2">

            <Gamepad2 className="w-8 h-8 text-indigo-400" />

            Jogos

          </h1>

          <p className="text-white/50 text-sm mt-1">

            Minigames casuais · farm leve de moedas

          </p>

        </div>

        <CoinCounter size="sm" />

      </div>



      <div className="glass-card p-4 flex items-center justify-between text-xs">

        <span className="text-white/45">Partidas totais: {gamesPlayed}</span>

        <span className="text-white/45">Hoje: {gamesToday}</span>

      </div>



      <div className="flex flex-col gap-4">

        {GAMES.map((game) => (

          <Link key={game.href} href={game.href} className="block">

            <div

              className={cn(

                "glass-card p-5 border bg-gradient-to-br transition-transform hover:scale-[1.01] active:scale-[0.99]",

                game.color

              )}

            >

              <div className="flex items-start gap-4">

                <div

                  className={cn(

                    "w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0",

                    game.iconColor

                  )}

                >

                  <game.icon className="w-6 h-6" />

                </div>

                <div className="flex-1 min-w-0">

                  <h2 className="font-bold text-lg">{game.title}</h2>

                  <p className="text-white/50 text-sm mt-0.5">{game.desc}</p>

                  <p className="text-xs text-amber-400/90 mt-2 flex items-center gap-1">

                    <Coins className="w-3 h-3" />

                    {game.reward}

                  </p>

                </div>

              </div>

            </div>

          </Link>

        ))}

      </div>



      <p className="text-[11px] text-white/35 text-center leading-relaxed px-2">

        Batalhas ainda rendem mais (4~7 moedas). Sem limite diário — jogue o quanto quiser.

      </p>

    </div>

  );

}

