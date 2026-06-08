"use client";

import Image from "next/image";
import { Trophy, Sparkles, Lock, CheckCircle2, CircleDashed } from "lucide-react";
import {
  ACHIEVEMENTS,
  ACHIEVEMENT_CATEGORY_STYLES,
  getAchievementIcon,
  hasAllAchievements,
  type AchievementProgress,
} from "@/data/achievements";
import { MEW_ID, MEW_POKEMON } from "@/data/pokemon";
import { getPokemonSpriteUrl } from "@/data/pokemon-sprites";
import { useEconomyStore } from "@/stores/economy-store";
import { useGameStore } from "@/stores/game-store";
import { cn } from "@/lib/utils";

const PROGRESS_STEPS = 5;

function AchievementStepDots({ current, target, done }: AchievementProgress & { done: boolean }) {
  const ratio = Math.min(1, current / target);
  const filledSteps = done ? PROGRESS_STEPS : Math.floor(ratio * PROGRESS_STEPS);
  const hasPartial = !done && ratio * PROGRESS_STEPS - filledSteps >= 0.35;

  return (
    <div className="flex justify-center items-center gap-1 mt-2">
      {Array.from({ length: PROGRESS_STEPS }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "rounded-full transition-colors",
            i < filledSteps
              ? "w-2 h-2 bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.5)]"
              : i === filledSteps && hasPartial
                ? "w-2 h-2 bg-amber-400/40 ring-1 ring-amber-400/50"
                : "w-1.5 h-1.5 bg-white/10"
          )}
        />
      ))}
    </div>
  );
}

export function AchievementsPanel() {
  const unlockedAchievements = useEconomyStore((s) => s.unlockedAchievements ?? []);
  const level = useEconomyStore((s) => s.level);
  const battleWins = useEconomyStore((s) => s.battleWins);
  const clickGamesPlayed = useEconomyStore((s) => s.clickGamesPlayed);
  const dailyStreak = useEconomyStore((s) => s.dailyStreak);
  const coins = useEconomyStore((s) => s.coins);
  const profile = useGameStore((s) => s.profile);
  const collection = useGameStore((s) => s.collection);

  const unlocked = new Set(unlockedAchievements);
  const allDone = hasAllAchievements(unlockedAchievements);
  const hasMew = !!collection[MEW_ID];
  const progressPct = Math.round((unlocked.size / ACHIEVEMENTS.length) * 100);

  const stats = {
    uniquePokemon: Object.keys(collection).length,
    totalSpins: profile.totalSpins,
    battleWins,
    clickGames: clickGamesPlayed,
    level,
    dailyStreak,
    coins,
  };

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
            const catStyle = ACHIEVEMENT_CATEGORY_STYLES[a.category];
            const { current, target } = a.progress(stats);
            const displayCurrent = Math.min(current, target);

            const surface = done ? catStyle.cardDone : catStyle.cardPending;

            return (
              <div
                key={a.id}
                className={cn(
                  "relative p-3 rounded-xl text-center transition-all border",
                  done && !allDone && "ring-1 ring-inset shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]",
                  done && !allDone && catStyle.ring,
                  !done && "border-dashed",
                  allDone && "shiny-rainbow-border"
                )}
                style={{ background: surface.background, borderColor: surface.borderColor }}
              >
                <div
                  className={cn(
                    "absolute top-2 right-2",
                    done ? catStyle.icon : "text-white/20"
                  )}
                >
                  {done ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : (
                    <CircleDashed className="w-3.5 h-3.5" />
                  )}
                </div>

                <div className="flex justify-center mb-1.5">
                  <Icon
                    className={cn(
                      "w-6 h-6",
                      allDone ? "text-white" : done ? catStyle.icon : cn(catStyle.icon, "opacity-55")
                    )}
                  />
                </div>
                <p
                  className={cn(
                    "text-xs font-bold",
                    done ? "text-white" : "text-white/75"
                  )}
                >
                  {a.label}
                </p>
                <p className={cn("text-[10px] mt-0.5 leading-snug", done ? "text-white/50" : "text-white/38")}>
                  {a.description}
                </p>
                {!done && (
                  <>
                    <p className={cn("text-[10px] font-bold mt-1.5 tabular-nums", catStyle.label)}>
                      {displayCurrent}/{target}
                    </p>
                    <AchievementStepDots current={current} target={target} done={false} />
                  </>
                )}
                {done && !allDone && (
                  <p className={cn("text-[9px] font-bold mt-1.5 uppercase tracking-wider flex items-center justify-center gap-1", catStyle.label)}>
                    <CheckCircle2 className="w-3 h-3" />
                    Concluída
                  </p>
                )}
                {done && allDone && <AchievementStepDots current={target} target={target} done />}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
