"use client";

import Image from "next/image";
import { CheckCircle, CheckCircle2, Circle, Coins, Flame, Gift, Sparkles, Lock, Trophy } from "lucide-react";
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
import { useGameStore } from "@/stores/game-store";
import { LUCKY_EGG_SPRITE, RARE_CANDY_SPRITE } from "@/data/item-sprites";
import { ItemSprite } from "@/components/ui/ItemSprite";
import { DAILY_LOGIN_COINS, DAILY_MISSIONS, getStreakMissionMultiplier } from "@/data/economy-balance";
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
  const lastLoginDate = useEconomyStore((s) => s.lastLoginDate);
  const streakBonus = Math.round((getStreakMissionMultiplier(dailyStreak) - 1) * 100);
  const today = new Date().toISOString().slice(0, 10);
  const claimedToday = lastLoginDate === today;

  const claimableCount = DAILY_MISSIONS.filter(
    (m) =>
      !missionsClaimed.includes(m.id) &&
      (missionProgress[m.id] ?? 0) >= m.target
  ).length;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-indigo-500/20 bg-slate-900/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.1),transparent_55%)]" />

      <div className="relative border-b border-white/[0.06] px-5 py-4">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h3 className="font-bold flex items-center gap-2 text-lg">
              <Gift className="w-5 h-5 text-indigo-400" />
              Missões Diárias
            </h3>
            <p className="text-[11px] text-white/40 mt-1">
              {streakBonus > 0
                ? `Bônus de streak: +${streakBonus}% nas recompensas`
                : "Complete missões e mantenha sua sequência de login"}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {claimableCount > 0 && (
              <AnimatedButton variant="primary" size="sm" onClick={() => claimAllMissions()}>
                Coletar tudo ({claimableCount})
              </AnimatedButton>
            )}
            <span className="text-xs text-amber-200 flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-amber-400/30 bg-amber-500/10 font-bold tabular-nums">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              {dailyStreak} {dailyStreak === 1 ? "dia" : "dias"}
            </span>
          </div>
        </div>
      </div>

      <div className="relative px-5 py-4 border-b border-white/[0.06]">
        <div className="flex items-center justify-between gap-2 mb-3">
          <p className="text-xs font-bold uppercase tracking-wider text-white/50">
            Sequência de login
          </p>
          <p className="text-[11px]">
            {claimedToday ? (
              <span className="inline-flex items-center gap-1 text-emerald-400/90 font-medium">
                <CheckCircle className="w-3.5 h-3.5" />
                Hoje registrado
              </span>
            ) : (
              <span className="text-white/40">Entre hoje para avançar</span>
            )}
          </p>
        </div>

        <div className="flex items-stretch justify-between gap-1.5 sm:gap-2">
          {Array.from({ length: 7 }).map((_, i) => {
            const dayNum = i + 1;
            const reached =
              dailyStreak >= dayNum || (claimedToday && dailyStreak === dayNum);
            const isCurrent = !claimedToday && dailyStreak + 1 === dayNum;
            const coins = DAILY_LOGIN_COINS[Math.min(i, DAILY_LOGIN_COINS.length - 1)];

            return (
              <div
                key={dayNum}
                className="flex flex-col items-center gap-1 flex-1 min-w-0"
                title={`Dia ${dayNum} · ${coins} moedas`}
              >
                <div
                  className={cn(
                    "w-full aspect-square max-w-[2.5rem] rounded-full border-2 flex items-center justify-center text-[11px] font-black transition-all",
                    reached
                      ? "border-amber-400 bg-amber-500/25 text-amber-100 shadow-[0_0_12px_rgba(251,191,36,0.25)]"
                      : isCurrent
                        ? "border-indigo-400 bg-indigo-500/15 text-indigo-200 ring-2 ring-indigo-400/30"
                        : "border-white/12 bg-white/[0.03] text-white/30"
                  )}
                >
                  {reached ? <Flame className="w-4 h-4" /> : dayNum}
                </div>
                <span
                  className={cn(
                    "inline-flex items-center gap-0.5 text-[9px] tabular-nums font-semibold",
                    reached ? "text-amber-300/85" : isCurrent ? "text-indigo-300/80" : "text-white/25"
                  )}
                >
                  <Coins className="w-2.5 h-2.5" />
                  {coins}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="relative p-5 sm:p-6 grid gap-3 sm:grid-cols-2">
        {DAILY_MISSIONS.map((mission) => {
          const progress = missionProgress[mission.id] ?? 0;
          const claimed = missionsClaimed.includes(mission.id);
          const done = progress >= mission.target;
          const pct = Math.min(100, (progress / mission.target) * 100);

          return (
            <div
              key={mission.id}
              className={cn(
                "rounded-xl border p-4 sm:p-4.5 min-h-[5.5rem] transition-all",
                claimed
                  ? "bg-white/[0.02] border-white/8 opacity-55"
                  : done
                    ? "bg-indigo-500/10 border-indigo-400/30"
                    : "bg-slate-950/40 border-white/10 hover:border-white/18"
              )}
            >
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  {claimed ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  ) : done ? (
                    <CheckCircle2 className="w-5 h-5 text-indigo-300 shrink-0" />
                  ) : (
                    <Circle className="w-5 h-5 text-white/25 shrink-0" />
                  )}
                  <span className="text-[15px] font-semibold leading-snug">{mission.label}</span>
                </div>
                <span className="text-xs text-amber-300 font-bold flex items-center gap-1 shrink-0">
                  {rewardLabel(mission, dailyStreak)}
                  <RewardIcon mission={mission} />
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 rounded-full bg-black/35 overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-[width] duration-500",
                      done
                        ? "bg-gradient-to-r from-indigo-400 to-violet-400"
                        : "bg-gradient-to-r from-cyan-500/80 to-indigo-400/80"
                    )}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-xs text-white/45 tabular-nums font-semibold shrink-0 w-11 text-right">
                  {progress}/{mission.target}
                </span>
              </div>
              {done && !claimed && (
                <AnimatedButton
                  variant="primary"
                  size="sm"
                  onClick={() => claimMission(mission.id)}
                  className="w-full mt-2.5"
                >
                  Resgatar
                </AnimatedButton>
              )}
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
    <div className="mt-auto pt-3 space-y-1">
      <div className="flex justify-between text-[10px] text-white/40 tabular-nums">
        <span>
          {Math.min(current, target)}/{target}
        </span>
        <span>{pct}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-black/35 overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-[width] duration-500",
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
    <div className="flex flex-col gap-4 flex-1 min-h-0 lg:overflow-hidden">
      <ProfileSection
        title="Pokemon Secreto"
        description="Complete todas as conquistas para liberar o Mew na roleta."
        icon={Sparkles}
        iconClassName="text-pink-400"
        className="shrink-0"
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
            <div className="h-1 rounded-full bg-black/30 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-pink-400 to-purple-400 transition-[width] duration-700"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            {allDone && (
              <p className="text-xs text-emerald-300/90 font-medium">Mew liberado na roleta!</p>
            )}
          </div>
        </div>
      </ProfileSection>

      <ProfileSection
        title="Conquistas"
        description="Metas da sua jornada em Kanto."
        icon={Trophy}
        iconClassName="text-amber-400"
        scrollable
        className="flex-1 min-h-0 lg:min-h-[12rem]"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2.5 pb-1">
          {ACHIEVEMENTS.map((a) => {
            const done = unlocked.has(a.id);
            const Icon = getAchievementIcon(a.iconKey);
            const { current, target } = a.progress(stats);

            return (
              <div
                key={a.id}
                className={cn(
                  "rounded-xl border px-3.5 py-3 flex flex-col min-h-[7.25rem]",
                  "bg-slate-950/50 transition-colors hover:border-white/15",
                  done
                    ? "border-emerald-400/20"
                    : "border-white/10",
                  allDone && done && "shiny-rainbow-border"
                )}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      "w-10 h-10 shrink-0 rounded-lg flex items-center justify-center border",
                      done
                        ? "bg-emerald-500/10 border-emerald-400/25"
                        : "bg-white/[0.03] border-cyan-400/20"
                    )}
                  >
                    <Icon
                      className={cn("w-5 h-5", done ? "text-emerald-300" : "text-cyan-300/70")}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-bold text-white leading-tight">{a.label}</p>
                      {done && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                    </div>
                    <p className="text-[11px] text-white/45 mt-0.5 leading-snug line-clamp-2">
                      {a.description}
                    </p>
                  </div>
                </div>

                {done ? (
                  <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider mt-auto pt-3">
                    Concluída
                  </p>
                ) : (
                  <AchievementProgressBar current={current} target={target} done={false} />
                )}
              </div>
            );
          })}
        </div>
      </ProfileSection>
    </div>
  );
}
