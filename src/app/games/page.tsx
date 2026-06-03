"use client";

import Link from "next/link";
import { Gamepad2, Target, MousePointerClick, Brain, Coins, Sparkles } from "lucide-react";
import {
  CLICK_BASE_COINS_MAX,
  CLICK_BASE_COINS_MIN,
  MEMORY_COINS_PER_PAIR,
  MEMORY_PAIR_COUNT,
} from "@/data/economy-balance";
import { useEconomyStore } from "@/stores/economy-store";
import { cn } from "@/lib/utils";
import { usePrefetchOnIntent } from "@/lib/use-prefetch-on-intent";

const GAMES = [
  {
    href: "/games/captura",
    title: "Captura Perfeita",
    desc: "Acerte o timing na zona verde enquanto a Pokébola balança.",
    reward: "1 moeda por captura",
    icon: Target,
    color: "from-emerald-500/20 to-cyan-500/10 border-emerald-500/25",
    iconColor: "text-emerald-400",
    iconBg: "bg-emerald-500/15",
  },
  {
    href: "/games/click-rush",
    title: "Click Rush",
    desc: "Clique nas Pokébolas o máximo que puder em 30 segundos.",
    reward: `${CLICK_BASE_COINS_MIN}~${CLICK_BASE_COINS_MAX} moedas · por desempenho`,
    icon: MousePointerClick,
    color: "from-cyan-500/20 to-blue-500/10 border-cyan-500/25",
    iconColor: "text-cyan-400",
    iconBg: "bg-cyan-500/15",
  },
  {
    href: "/games/memory",
    title: "Poké-Memory",
    desc: "Vire as cartas e encontre todos os pares antes do tempo acabar.",
    reward: `${MEMORY_PAIR_COUNT * MEMORY_COINS_PER_PAIR} moedas ao completar`,
    icon: Brain,
    color: "from-violet-500/20 to-purple-500/10 border-violet-500/25",
    iconColor: "text-violet-400",
    iconBg: "bg-violet-500/15",
  },
  {
    href: "/games/danca-pikachu",
    title: "Dança Pikachu",
    desc: "Siga o ritmo das setas e mostre seus reflexos com o Pikachu.",
    reward: "1 moeda a cada 500 pontos",
    icon: Sparkles,
    color: "from-amber-500/20 to-yellow-500/10 border-amber-500/25",
    iconColor: "text-yellow-400",
    iconBg: "bg-yellow-500/15",
  },
] as const;

function GameCardLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const intent = usePrefetchOnIntent(href);
  return (
    <Link href={href} {...intent} className="block group">
      {children}
    </Link>
  );
}

export default function GamesHubPage() {
  const gamesPlayed = useEconomyStore((s) => s.clickGamesPlayed);
  const gamesToday = useEconomyStore((s) => s.clickGamesToday);
  const highScores = useEconomyStore((s) => s.highScores);

  const highScoreMap: Record<string, number | undefined> = {
    "/games/captura": highScores?.perfectCapture,
    "/games/click-rush": highScores?.clickRush,
    "/games/memory": highScores?.memory,
    "/games/danca-pikachu": highScores?.dancaPikachu,
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-8 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Gamepad2 className="w-8 h-8 text-indigo-400" />
          Jogos
        </h1>
        <p className="text-white/55 text-sm leading-relaxed">
          Três minigames rápidos para ganhar moedas entre as batalhas. Sem limite diário, jogue
          quando quiser!
        </p>
      </div>

      <div className="glass-card px-4 py-3 flex items-center justify-between text-xs text-white/45">
        <span className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          {gamesPlayed} partidas no total
        </span>
        <span>{gamesToday} hoje</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {GAMES.map((game) => {
          const record = highScoreMap[game.href];
          
          return (
            <GameCardLink key={game.href} href={game.href}>
              <div
                className={cn(
                  "glass-card p-5 border bg-gradient-to-br transition-all relative overflow-hidden h-full flex flex-col",
                  "group-hover:scale-[1.02] group-hover:shadow-lg group-hover:shadow-indigo-500/10 group-active:scale-[0.98]",
                  game.color
                )}
              >
                <div className="flex flex-col h-full space-y-4">
                  <div className="flex items-center justify-between">
                    <div
                      className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border border-white/10 shadow-inner",
                        game.iconBg
                      )}
                    >
                      <game.icon className={cn("w-6 h-6", game.iconColor)} />
                    </div>
                    {record !== undefined && (
                      <span className="text-[10px] font-black bg-white/10 px-2 py-1 rounded-lg border border-white/5 text-amber-300">
                        RECORDE: {record}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 space-y-2">
                    <h2 className="text-lg font-bold tracking-tight">{game.title}</h2>
                    <p className="text-white/50 text-xs leading-relaxed line-clamp-2">
                      {game.desc}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                    <p className="text-[10px] text-amber-400/90 font-bold flex items-center gap-1">
                      <Coins className="w-3 h-3" />
                      {game.reward}
                    </p>
                    <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                      <Sparkles className="w-3 h-3 text-white/30 group-hover:text-white/60" />
                    </div>
                  </div>
                </div>
              </div>
            </GameCardLink>
          );
        })}
      </div>
    </div>
  );
}
