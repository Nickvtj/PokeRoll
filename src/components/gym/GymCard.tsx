"use client";

import { useState } from "react";
import { Lock, Coins, ChevronDown } from "lucide-react";
import { TOTAL_POKEMON } from "@/data/pokemon";
import { getHallOfFameCount } from "@/data/gyms";
import { GYM_LEADER_COIN_REWARD } from "@/data/gym-badges";
import { useGymStore } from "@/stores/gym-store";
import { useEconomyStore } from "@/stores/economy-store";
import { PokemonHallOfFame } from "@/components/gym/PokemonHallOfFame";
import { GymBattleScreen } from "@/components/gym/GymBattleScreen";
import { GymBadge } from "@/components/gym/GymBadge";
import { cn } from "@/lib/utils";
import type { GymDefinition } from "@/types/gym";

interface GymCardProps {
  gym: GymDefinition;
  unlocked: boolean;
  hasBadge: boolean;
}

export function GymCard({ gym, unlocked, hasBadge }: GymCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [battling, setBattling] = useState(false);
  const hallOfFame = useGymStore((s) => s.hallOfFame);
  const getGymProgress = useGymStore((s) => s.getGymProgress);
  const canClaimGymCoins = useGymStore((s) => s.canClaimGymCoins);
  const claimGymCoinReward = useGymStore((s) => s.claimGymCoinReward);
  const addCoins = useEconomyStore((s) => s.addCoins);

  const progress = getGymProgress(gym.id);
  const hofCount = getHallOfFameCount(hallOfFame, gym.id);
  const canClaim = canClaimGymCoins(gym.id);
  const coinsClaimed = progress.coinRewardClaimed;

  const handleClaimCoins = () => {
    const amount = claimGymCoinReward(gym.id);
    if (amount > 0) addCoins(amount);
  };

  if (battling) {
    return <GymBattleScreen gymId={gym.id} onExit={() => setBattling(false)} />;
  }

  return (
    <div
      className={cn(
        "glass-card overflow-hidden border transition-all",
        unlocked ? "border-white/10" : "border-white/5 opacity-60"
      )}
      style={
        hasBadge
          ? { boxShadow: `0 0 24px ${gym.themeColor}25`, borderColor: `${gym.themeColor}40` }
          : undefined
      }
    >
      <div className={cn("relative p-4 bg-gradient-to-br", gym.themeGradient)}>
        <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(circle_at_30%_20%,white,transparent_50%)]" />
        <div className="relative flex items-start gap-3">
          <GymBadge
            gymId={gym.id}
            name={gym.badgeName}
            earned={hasBadge}
            color={gym.themeColor}
            size="md"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm">{gym.leaderName}</h3>
              {!unlocked && <Lock className="w-3.5 h-3.5 text-white/40" />}
              {hasBadge && (
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  ✓ {gym.badgeName}
                </span>
              )}
            </div>
            <p className="text-[10px] text-white/50">{gym.arenaName} · Nv. {gym.recommendedLevel}+</p>
            <p className="text-[10px] text-white/40 mt-1 line-clamp-2">{gym.description}</p>
          </div>
        </div>

        <div className="relative mt-3 flex items-center justify-between gap-2">
          <span className="text-[10px] text-white/50">
            Hall of Fame: {hofCount}/{TOTAL_POKEMON}
          </span>
          {progress.bestStars > 0 && (
            <span className="text-[10px] text-amber-400">{"★".repeat(progress.bestStars)}</span>
          )}
        </div>
      </div>

      <div className="p-3 flex gap-2">
        <button
          type="button"
          disabled={!unlocked}
          onClick={() => setBattling(true)}
          className={cn(
            "flex-1 py-2 rounded-xl text-xs font-bold transition-all",
            unlocked
              ? "bg-indigo-500/30 text-indigo-200 hover:bg-indigo-500/40 border border-indigo-500/30"
              : "bg-white/5 text-white/30 cursor-not-allowed"
          )}
        >
          {hasBadge ? "Repetir Ginásio" : "Desafiar"}
        </button>

        {canClaim ? (
          <button
            type="button"
            onClick={handleClaimCoins}
            title={`Coletar ${GYM_LEADER_COIN_REWARD} moedas`}
            className="px-3 py-2 rounded-xl bg-amber-500/25 border border-amber-500/40 text-amber-300 hover:bg-amber-500/35 transition-all animate-pulse"
          >
            <Coins className="w-4 h-4" />
          </button>
        ) : hasBadge && coinsClaimed ? (
          <div
            title="Recompensa já coletada"
            className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white/25 cursor-default"
          >
            <Coins className="w-4 h-4" />
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            title="Ver Hall of Fame"
            className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10"
          >
            <ChevronDown className={cn("w-4 h-4 transition-transform", expanded && "rotate-180")} />
          </button>
        )}
      </div>

      {canClaim && (
        <p className="px-3 pb-2 text-[10px] text-amber-400/80 text-center">
          Toque em 🪙 para coletar {GYM_LEADER_COIN_REWARD} moedas pela vitória!
        </p>
      )}

      {expanded && (
        <div className="px-3 pb-3">
          <PokemonHallOfFame gymId={gym.id} themeColor={gym.themeColor} />
        </div>
      )}
    </div>
  );
}
