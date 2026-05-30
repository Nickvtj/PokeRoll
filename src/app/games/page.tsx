"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Gamepad2, Target, MousePointerClick, Brain, Coins, Sparkles } from "lucide-react";
import {
  CLICK_BASE_COINS_MAX,
  CLICK_BASE_COINS_MIN,
  MEMORY_COINS_PER_PAIR,
  MEMORY_PAIR_COUNT,
} from "@/data/economy-balance";
import { useEconomyStore } from "@/stores/economy-store";
import { cn } from "@/lib/utils";

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
] as const;

export default function GamesHubPage() {
  const router = useRouter();
  const gamesPlayed = useEconomyStore((s) => s.clickGamesPlayed);
  const gamesToday = useEconomyStore((s) => s.clickGamesToday);
  const highScores = useEconomyStore((s) => s.highScores);

  useEffect(() => {
    for (const game of GAMES) {
      router.prefetch(game.href);
    }
  }, [router]);

  const highScoreMap: Record<string, number | undefined> = {
    "/games/captura": highScores?.perfectCapture,
    "/games/click-rush": highScores?.clickRush,
    "/games/memory": highScores?.memory,
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

      <div className="flex flex-col gap-3">
        {GAMES.map((game) => {
          const record = highScoreMap[game.href];
          
          return (
            <Link key={game.href} href={game.href} prefetch className="block group">
              <div
                className={cn(
                  "glass-card p-4 border bg-gradient-to-br transition-all relative overflow-hidden",
                  "group-hover:scale-[1.01] group-active:scale-[0.99]",
                  game.color
                )}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      "w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border border-white/10",
                      game.iconBg
                    )}
                  >
                    <game.icon className={cn("w-5 h-5", game.iconColor)} />
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <h2 className="font-bold">{game.title}</h2>
                      {record !== undefined && (
                        <span className="text-[10px] font-black bg-white/10 px-2 py-0.5 rounded-full border border-white/5 text-amber-300">
                          RECORDE: {record}
                        </span>
                      )}
                    </div>
                    <p className="text-white/50 text-sm leading-snug">{game.desc}</p>
                    <p className="text-[11px] text-amber-400/90 flex items-center gap-1 pt-0.5">
                      <Coins className="w-3 h-3" />
                      {game.reward}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
