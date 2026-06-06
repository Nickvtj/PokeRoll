"use client";

import Image from "next/image";
import { Trophy, Sparkles, Lock } from "lucide-react";
import {
  ACHIEVEMENTS,
  getAchievementIcon,
  hasAllAchievements,
} from "@/data/achievements";
import { MEW_ID, MEW_POKEMON } from "@/data/pokemon";
import { getPokemonSpriteUrl } from "@/data/pokemon-sprites";
import { useEconomyStore } from "@/stores/economy-store";
import { useGameStore } from "@/stores/game-store";
import { cn } from "@/lib/utils";

export function AchievementsPanel() {
  const unlockedAchievements = useEconomyStore((s) => s.unlockedAchievements ?? []);
  const unlocked = new Set(unlockedAchievements);
  const allDone = hasAllAchievements(unlockedAchievements);
  const hasMew = useGameStore((s) => !!s.collection[MEW_ID]);
  const progressPct = Math.round((unlocked.size / ACHIEVEMENTS.length) * 100);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-indigo-500/15 ring-1 ring-pink-400/20 p-4 space-y-3">
        <div className="flex items-start gap-3">
          <div className="relative w-16 h-16 shrink-0 rounded-xl bg-pink-500/10 border border-pink-400/25 flex items-center justify-center overflow-hidden">
            {hasMew ? (
              <Image
                src={getPokemonSpriteUrl(MEW_ID)}
                alt="Mew"
                width={56}
                height={56}
                className="object-contain"
                unoptimized
              />
            ) : (
              <>
                <Image
                  src={getPokemonSpriteUrl(MEW_ID)}
                  alt=""
                  width={56}
                  height={56}
                  className="object-contain opacity-20 blur-[1px] scale-110"
                  unoptimized
                />
                <Lock className="absolute w-5 h-5 text-pink-200/70" />
              </>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-bold text-sm text-pink-200 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              Pokémon secreto: {MEW_POKEMON.name}
            </p>
            <p className="text-xs text-white/50 mt-1 leading-relaxed">
              Complete todas as conquistas para desbloquear o Mew na roleta, com chance de versão shiny.
            </p>
            <div className="mt-2 flex items-center justify-between text-[10px] text-white/40">
              <span>
                {unlocked.size}/{ACHIEVEMENTS.length} conquistas
              </span>
              <span>{progressPct}%</span>
            </div>
            <div className="progress-bar h-1.5 mt-1">
              <div className="progress-fill bg-gradient-to-r from-pink-400 to-purple-400" style={{ width: `${progressPct}%` }} />
            </div>
          </div>
        </div>

        {allDone && (
          <p className="text-xs text-emerald-300/90 text-center font-medium">
            Mew liberado na roleta! Boa sorte no shiny.
          </p>
        )}
      </div>

      <div className="rounded-2xl bg-slate-900/45 ring-1 ring-inset ring-indigo-500/10 p-5 space-y-4">
        <h3 className="font-bold flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-400" />
          Conquistas ({unlocked.size}/{ACHIEVEMENTS.length})
        </h3>

        <div className="grid grid-cols-2 gap-2">
          {ACHIEVEMENTS.map((a) => {
            const done = unlocked.has(a.id);
            const Icon = getAchievementIcon(a.iconKey);
            return (
              <div
                key={a.id}
                className={cn(
                  "p-3 rounded-xl text-center transition-all",
                  done
                    ? "bg-amber-500/10 ring-1 ring-inset ring-amber-400/25"
                    : "bg-white/[0.03] ring-1 ring-inset ring-white/8 opacity-50"
                )}
              >
                <div className="flex justify-center mb-1.5">
                  <Icon className={cn("w-6 h-6", done ? "text-amber-300" : "text-white/25")} />
                </div>
                <p className="text-xs font-bold">{a.label}</p>
                <p className="text-[10px] text-white/40 mt-0.5 leading-snug">{a.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
