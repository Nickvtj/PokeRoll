"use client";

import { CheckCircle, Circle, Coins, Flame, Gift } from "lucide-react";
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
