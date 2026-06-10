"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Gamepad2, Target, MousePointerClick, Brain, Coins, Play, Sparkles, Swords } from "lucide-react";
import { JitsuBeltIcon } from "@/components/minigame/jitsu/JitsuBeltIcon";
import {
  CLICK_BASE_COINS_MAX,
  CLICK_BASE_COINS_MIN,
  MEMORY_COINS_PER_PAIR,
  MEMORY_PAIR_COUNT,
} from "@/data/economy-balance";
import { getBeltForXp, getJitsuCoinRange } from "@/data/jitsu-belts";
import { useEconomyStore } from "@/stores/economy-store";
import { cn } from "@/lib/utils";
import { MINIGAME_ROUTES, preloadMinigameChunks, prefetchRoutes } from "@/lib/route-prefetch";
import { usePrefetchOnIntent } from "@/lib/use-prefetch-on-intent";

const GAMES = [
  {
    href: "/games/captura",
    title: "Captura Perfeita",
    desc: "Acerte o timing na zona verde e capture Pokémon selvagens.",
    reward: "1 moeda por acerto (perfeito ou verde)",
    icon: Target,
    gradient: "from-emerald-600/20 to-transparent",
    border: "border-emerald-500/25 hover:border-emerald-400/45",
    iconColor: "text-emerald-400",
    iconBg: "bg-emerald-500/15",
  },
  {
    href: "/games/click-rush",
    title: "Click Rush",
    desc: "Clique nas Pokébolas em 30 segundos e faça o máximo de pontos.",
    reward: `${CLICK_BASE_COINS_MIN} a ${CLICK_BASE_COINS_MAX} moedas`,
    icon: MousePointerClick,
    gradient: "from-cyan-600/20 to-transparent",
    border: "border-cyan-500/25 hover:border-cyan-400/45",
    iconColor: "text-cyan-400",
    iconBg: "bg-cyan-500/15",
  },
  {
    href: "/games/memory",
    title: "Poké Memory",
    desc: "Encontre todos os pares a tempo e treine sua memória.",
    icon: Brain,
    reward: `${MEMORY_PAIR_COUNT * MEMORY_COINS_PER_PAIR} moedas`,
    gradient: "from-violet-600/20 to-transparent",
    border: "border-violet-500/25 hover:border-violet-400/45",
    iconColor: "text-violet-400",
    iconBg: "bg-violet-500/15",
  },
  {
    href: "/games/jitsu",
    title: "Desafio Elemental",
    desc: "Vença batalhas táticas com Fogo, Água e Planta. Suba de faixa!",
    icon: Swords,
    reward: `${getJitsuCoinRange().min} a ${getJitsuCoinRange().max} moedas (+ faixa)`,
    gradient: "from-rose-600/20 to-transparent",
    border: "border-rose-500/25 hover:border-rose-400/45",
    iconColor: "text-rose-400",
    iconBg: "bg-rose-500/15",
    showBelt: true,
  },
] as const;

function GameCardLink({ href, children }: { href: string; children: React.ReactNode }) {
  const intent = usePrefetchOnIntent(href);
  return (
    <Link href={href} {...intent} className="block group h-full">
      {children}
    </Link>
  );
}

export default function GamesHubPage() {
  const router = useRouter();
  const gamesPlayed = useEconomyStore((s) => s.clickGamesPlayed);
  const gamesToday = useEconomyStore((s) => s.clickGamesToday);
  const highScores = useEconomyStore((s) => s.highScores);
  const jitsuXp = useEconomyStore((s) => s.jitsuXp ?? 0);
  const jitsuBelt = getBeltForXp(jitsuXp);

  useEffect(() => {
    prefetchRoutes(router, MINIGAME_ROUTES);
    preloadMinigameChunks();
  }, [router]);

  const highScoreMap: Record<string, number | undefined> = {
    "/games/captura": highScores?.perfectCapture,
    "/games/click-rush": highScores?.clickRush,
    "/games/memory": highScores?.memory,
    "/games/jitsu": highScores?.jitsu,
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 lg:py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div className="space-y-0.5">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Gamepad2 className="w-7 h-7 text-indigo-400" />
            Jogos
          </h1>
          <p className="text-white/50 text-sm">Minigames para farmar moedas.</p>
        </div>
        <div className="glass-card px-3 py-2 flex items-center gap-3 text-xs text-white/45 shrink-0 rounded-xl">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            {gamesPlayed} partidas
          </span>
          <span className="w-px h-3.5 bg-white/10" />
          <span>{gamesToday} hoje</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 auto-rows-fr">
        {GAMES.map((game) => {
          const record = highScoreMap[game.href];
          const Icon = game.icon;

          return (
            <GameCardLink key={game.href} href={game.href}>
              <article
                className={cn(
                  "relative rounded-2xl border overflow-hidden bg-gradient-to-br backdrop-blur-sm h-full min-h-[8.75rem]",
                  "transition-all duration-200 group-hover:scale-[1.015] group-active:scale-[0.99]",
                  game.gradient,
                  game.border
                )}
              >
                <div className="absolute inset-0 bg-slate-950/45" />
                <div className="relative z-10 p-5 h-full flex items-center gap-4">
                  <div
                    className={cn(
                      "w-14 h-14 rounded-xl flex items-center justify-center border border-white/10 shrink-0",
                      game.iconBg
                    )}
                  >
                    <Icon className={cn("w-7 h-7", game.iconColor)} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-base font-bold truncate">{game.title}</h2>
                      {"showBelt" in game && game.showBelt && (
                        <span
                          className="text-[9px] font-black bg-black/40 px-1.5 py-0.5 rounded shrink-0 flex items-center gap-1"
                          style={{ color: jitsuBelt.color }}
                        >
                          <JitsuBeltIcon color={jitsuBelt.color} size="xs" />
                          {jitsuBelt.label.replace("Faixa ", "")}
                        </span>
                      )}
                      {record !== undefined && record > 0 && (
                        <span className="text-[9px] font-black bg-black/40 px-1.5 py-0.5 rounded text-amber-300 tabular-nums shrink-0">
                          REC {game.href === "/games/captura" ? `${record} seq` : record}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-white/50 mt-0.5 line-clamp-2">{game.desc}</p>
                    <p className="text-[11px] text-amber-400/85 font-bold flex items-center gap-1 mt-1.5">
                      <Coins className="w-3.5 h-3.5 shrink-0" />
                      {game.reward}
                    </p>
                  </div>

                  <span className="flex items-center gap-0.5 text-xs font-bold text-white/25 group-hover:text-white/60 transition-colors shrink-0">
                    <Play className="w-4 h-4 fill-current" />
                  </span>
                </div>
              </article>
            </GameCardLink>
          );
        })}
      </div>
    </div>
  );
}
