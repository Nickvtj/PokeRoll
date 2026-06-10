"use client";

import Image from "next/image";
import { CheckCircle, Circle, Coins, Flame, Gift, Trophy, Sparkles, Lock, CheckCircle2 } from "lucide-react";
import {
  ACHIEVEMENTS,
  getAchievementIcon,
  hasAllAchievements,
  type AchievementProgress,
} from "@/data/achievements";
import { MEW_ID, MEW_POKEMON } from "@/data/pokemon";
import { getPokemonSpriteUrl } from "@/data/pokemon-sprites";
import { isLocalAsset } from "@/lib/image-utils";
import { ProfileSection } from "@/components/profile/ProfileSection";
import { ProfileStatCard } from "@/components/profile/ProfileStatCard";
import { useGameStore } from "@/stores/game-store";
import { LUCKY_EGG_SPRITE, RARE_CANDY_SPRITE } from "@/data/item-sprites";
import { ItemSprite } from "@/components/ui/ItemSprite";
import { DAILY_MISSIONS, getStreakMissionMultiplier } from "@/data/economy-balance";
import { useEconomyStore } from "@/stores/economy-store";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { cn } from "@/lib/utils";

function rewardLabel(mission: (typeof DAILY_MISSIONS)[number], streak: number) {
  const mult = getStreakMissionMultiplier(streak);
  const r = mission.reward;
  if (r.kind === "coins") return `+${Math.round(r.amount * mult)} moedas`;
  if (r.kind === "luckyEgg") return `+${Math.max(1, Math.round(r.amount * mult))} Lucky Egg`;
  return `+${Math.max(1, Math.round(r.amount * mult))} Rare Candy`;
}

function RewardIcon({ mission }: { mission: (typeof DAILY_MISSIONS)[number] }) {
  if (mission.reward.kind === "luckyEgg") {
    return <ItemSprite src={LUCKY_EGG_SPRITE} alt="Lucky Egg" size={16} />;
  }
  if (mission.reward.kind === "rareCandy") {
    return <ItemSprite src={RARE_CANDY_SPRITE} alt="Rare Candy" size={16} />;
  }
  return <Coins className="w-3 h-3" />;
}

export function MissionsPanel() {
  const missionProgress = useEconomyStore((s) => s.missionProgress);
  const missionsClaimed = useEconomyStore((s) => s.missionsClaimed);
  const claimMission = useEconomyStore((s) => s.claimMission);
  const claimAllMissions = useEconomyStore((s) => s.claimAllMissions);
  const dailyStreak = useEconomyStore((s) => s.dailyStreak);
  const streakBonus = Math.round((getStreakMissionMultiplier(dailyStreak) - 1) * 100);

  const claimableCount = DAILY_MISSIONS.filter(
    (m) =>
      !missionsClaimed.includes(m.id) &&
      (missionProgress[m.id] ?? 0) >= m.target
  ).length;

  return (
    <div className="glass-card p-5 space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-bold flex items-center gap-2">
          <Gift className="w-5 h-5 text-indigo-400" />
          Missões Diárias
        </h3>
        <div className="flex items-center gap-2">
          {claimableCount > 0 && (
            <AnimatedButton variant="primary" size="sm" onClick={() => claimAllMissions()}>
              Coletar tudo ({claimableCount})
            </AnimatedButton>
          )}
          <span className="text-xs text-amber-400 flex items-center gap-1">
            <Flame className="w-3.5 h-3.5" />
            Streak: {dailyStreak}d
          </span>
        </div>
      </div>

      {streakBonus > 0 && (
        <p className="text-[11px] text-emerald-400/90">
          Bônus de streak: +{streakBonus}% nas recompensas de missão
        </p>
      )}

      <div className="space-y-2">
        {DAILY_MISSIONS.map((mission) => {
          const progress = missionProgress[mission.id] ?? 0;
          const claimed = missionsClaimed.includes(mission.id);
          const done = progress >= mission.target;
          const pct = Math.min(100, (progress / mission.target) * 100);

          return (
            <div
              key={mission.id}
              className={cn(
                "p-3 rounded-xl border transition-all",
                claimed
                  ? "bg-white/5 border-white/10 opacity-50"
                  : done
                    ? "bg-indigo-500/10 border-indigo-500/30"
                    : "bg-white/5 border-white/10"
              )}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  {claimed ? (
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  ) : (
                    <Circle className="w-4 h-4 text-white/30" />
                  )}
                  <span className="text-sm font-medium">{mission.label}</span>
                </div>
                <span className="text-xs text-amber-400 font-bold flex items-center gap-0.5">
                  {rewardLabel(mission, dailyStreak)}
                  <RewardIcon mission={mission} />
                </span>
              </div>
              <div className="progress-bar h-1.5">
                <div className="progress-fill" style={{ width: `${pct}%` }} />
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-[10px] text-white/40">
                  {progress}/{mission.target}
                </span>
                {done && !claimed && (
                  <AnimatedButton
                    variant="primary"
                    size="sm"
                    onClick={() => claimMission(mission.id)}
                  >
                    Resgatar
                  </AnimatedButton>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AchievementProgressBar({ current, target, done }: AchievementProgress & { done: boolean }) {
  const pct = done ? 100 : Math.min(100, Math.round((current / target) * 100));
  return (
    <div className="space-y-1 mt-2">
      <div className="flex justify-between text-[9px] text-white/35 tabular-nums">
        <span>
          {Math.min(current, target)}/{target}
        </span>
        <span>{pct}%</span>
      </div>
      <div className="progress-bar h-1">
        <div
          className={cn(
            "progress-fill transition-[width] duration-500",
            done ? "bg-gradient-to-r from-emerald-400 to-emerald-500" : "bg-gradient-to-r from-indigo-400 to-purple-400"
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
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
  const eggsHatched = useEconomyStore((s) => s.eggsHatched ?? 0);
  const eggSellCoins = useEconomyStore((s) => s.eggSellCoins ?? 0);
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
    eggsHatched,
    eggSellCoins,
  };

  return (
    <div className="space-y-4">
      <ProfileSection
        title="Pokemon Secreto"
        description="Complete todas as conquistas para liberar o Mew na roleta."
        icon={Sparkles}
        iconClassName="text-pink-400"
      >
        <div className="flex items-start gap-4">
          <div className="relative w-20 h-20 shrink-0 rounded-xl bg-slate-900/50 ring-1 ring-inset ring-pink-400/15 flex items-center justify-center overflow-hidden">
            {hasMew ? (
              <Image
                src={getPokemonSpriteUrl(MEW_ID)}
                alt="Mew"
                width={64}
                height={64}
                className="object-contain"
                unoptimized={!isLocalAsset(getPokemonSpriteUrl(MEW_ID))}
              />
            ) : (
              <>
                <Image
                  src={getPokemonSpriteUrl(MEW_ID)}
                  alt=""
                  width={64}
                  height={64}
                  className="object-contain opacity-15 blur-[1px]"
                  unoptimized={!isLocalAsset(getPokemonSpriteUrl(MEW_ID))}
                />
                <Lock className="absolute w-6 h-6 text-white/30" />
              </>
            )}
          </div>
          <div className="flex-1 min-w-0 space-y-2">
            <p className="font-bold text-sm text-white">{MEW_POKEMON.name}</p>
            <div className="flex items-end justify-between gap-2">
              <div>
                <p className="text-lg font-black text-pink-400 tabular-nums">{progressPct}%</p>
                <p className="text-[9px] text-white/40 uppercase font-bold tracking-wider">
                  Progresso
                </p>
              </div>
              <p className="text-[11px] text-white/45">
                {unlocked.size}/{ACHIEVEMENTS.length}
              </p>
            </div>
            <div className="progress-bar h-1">
              <div
                className="progress-fill bg-gradient-to-r from-pink-400 to-purple-400 transition-[width] duration-700"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            {allDone && (
              <p className="text-xs text-emerald-300/90 font-medium">
                Mew liberado na roleta!
              </p>
            )}
          </div>
        </div>
      </ProfileSection>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <ProfileStatCard
          icon={Trophy}
          label="Concluidas"
          value={`${unlocked.size}/${ACHIEVEMENTS.length}`}
          accent="amber"
          layout="horizontal"
        />
        <ProfileStatCard
          icon={CheckCircle2}
          label="Restantes"
          value={String(ACHIEVEMENTS.length - unlocked.size)}
          accent="indigo"
          layout="horizontal"
        />
        <ProfileStatCard
          icon={Sparkles}
          label="Mew"
          value={hasMew ? "Sim" : "Nao"}
          accent="purple"
          layout="horizontal"
        />
        <ProfileStatCard
          icon={Trophy}
          label="Meta"
          value={allDone ? "100%" : `${progressPct}%`}
          accent="emerald"
          layout="horizontal"
        />
      </div>

      <ProfileSection
        title="Conquistas"
        description="Metas da sua jornada em Kanto."
        icon={Trophy}
        iconClassName="text-amber-400"
      >
        <div className="space-y-2">
          {ACHIEVEMENTS.map((a) => {
            const done = unlocked.has(a.id);
            const Icon = getAchievementIcon(a.iconKey);
            const { current, target } = a.progress(stats);

            return (
              <div
                key={a.id}
                className={cn(
                  "relative overflow-hidden rounded-xl bg-slate-900/40 ring-1 ring-inset px-3 py-3",
                  done
                    ? "ring-emerald-400/15 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
                    : "ring-white/8",
                  allDone && done && "shiny-rainbow-border"
                )}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      "w-10 h-10 shrink-0 rounded-lg flex items-center justify-center ring-1 ring-inset",
                      done
                        ? "bg-emerald-500/10 ring-emerald-400/20"
                        : "bg-white/[0.03] ring-white/10"
                    )}
                  >
                    <Icon
                      className={cn(
                        "w-5 h-5",
                        done ? "text-emerald-300" : "text-white/35"
                      )}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-white leading-tight">{a.label}</p>
                        <p className="text-[11px] text-white/40 mt-0.5 leading-snug">
                          {a.description}
                        </p>
                      </div>
                      {done ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      ) : null}
                    </div>
                    {!done && (
                      <AchievementProgressBar current={current} target={target} done={false} />
                    )}
                    {done && (
                      <p className="text-[9px] font-bold text-emerald-400/80 uppercase tracking-wider mt-2">
                        Concluida
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </ProfileSection>
    </div>
  );
}
