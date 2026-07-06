"use client";

import { useState } from "react";
import { Lock, Coins, ChevronDown, Check } from "lucide-react";
import { TOTAL_POKEMON } from "@/data/pokemon";
import { getHallOfFameCount, getPreviousGym, getTeamGymReadiness } from "@/data/gyms";
import { GYM_LEADER_COIN_REWARD } from "@/data/gym-badges";
import { useGymStore } from "@/stores/gym-store";
import { useEconomyStore } from "@/stores/economy-store";
import { PokemonHallOfFame } from "@/components/gym/PokemonHallOfFame";
import { GymBadge } from "@/components/gym/GymBadge";
import { cn } from "@/lib/utils";
import type { GymDefinition } from "@/types/gym";

interface GymCardProps {
  gym: GymDefinition;
  unlocked: boolean;
  hasBadge: boolean;
  onChallenge: () => void;
}

export function GymCard({ gym, unlocked, hasBadge, onChallenge }: GymCardProps) {
  const [expanded, setExpanded] = useState(false);
  const hallOfFame = useGymStore((s) => s.hallOfFame);
  const progressEntry = useGymStore((s) => s.gymProgress[gym.id]);
  const coinsClaimed = progressEntry?.coinRewardClaimed ?? false;
  const bestStars = progressEntry?.bestStars ?? 0;
  const canClaimGymCoins = useGymStore((s) => s.canClaimGymCoins);
  const claimGymCoinReward = useGymStore((s) => s.claimGymCoinReward);
  const addCoins = useEconomyStore((s) => s.addCoins);
  const team = useEconomyStore((s) => s.team);
  const getPokemonLevelsMap = useEconomyStore((s) => s.getPokemonLevelsMap);

  const hofCount = getHallOfFameCount(hallOfFame, gym.id);
  const canClaim = canClaimGymCoins(gym.id);
  const previousGym = getPreviousGym(gym.id);
  const teamReadiness = getTeamGymReadiness(
    team,
    getPokemonLevelsMap(),
    gym.recommendedLevel
  );
  const canChallenge = unlocked;

  const handleClaimCoins = () => {
    const amount = claimGymCoinReward(gym.id);
    if (amount > 0) addCoins(amount);
  };

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

        <div className="relative flex items-center gap-3">
          <GymBadge
            gymId={gym.id}
            name={gym.badgeName}
            earned={hasBadge}
            color={gym.themeColor}
            size="md"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-black text-base truncate">{gym.leaderName}</h3>
              {!unlocked && <Lock className="w-3.5 h-3.5 text-white/40 shrink-0" />}
            </div>
            <p className="text-[11px] text-white/60 truncate">{gym.arenaName}</p>
          </div>
          {hasBadge ? (
            <span className="shrink-0 text-[10px] px-2 py-1 rounded-full bg-amber-500/25 text-amber-200 border border-amber-400/40 flex items-center gap-1 font-bold">
              <Check className="w-3 h-3" />
              Conquistada
            </span>
          ) : (
            bestStars > 0 && (
              <span className="shrink-0 text-xs text-amber-300 tracking-tight">{"★".repeat(bestStars)}</span>
            )
          )}
        </div>

        {/* Chips organizados de meta */}
        <div className="relative mt-3 flex flex-wrap items-center gap-1.5">
          <span
            className="text-[10px] font-bold px-2 py-1 rounded-lg border text-white/85"
            style={{ borderColor: `${gym.themeColor}55`, backgroundColor: `${gym.themeColor}20` }}
          >
            Nv. recomendado {gym.recommendedLevel}+
          </span>
          <span className="text-[10px] font-semibold px-2 py-1 rounded-lg bg-black/25 border border-white/10 text-white/60">
            Hall of Fame {hofCount}/{TOTAL_POKEMON}
          </span>
        </div>

        <p className="relative text-[11px] text-white/55 mt-2.5 leading-snug line-clamp-2">
          {gym.description}
        </p>

        {/* Aviso de estado (organizado numa pílula sutil) */}
        {!unlocked && previousGym ? (
          <p className="relative mt-2.5 text-[10px] text-amber-300/90 inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-500/10 border border-amber-400/20">
            <Lock className="w-3 h-3" />
            Derrote {previousGym.leaderName} primeiro
          </p>
        ) : unlocked && !teamReadiness.teamComplete ? (
          <p className="relative mt-2.5 text-[10px] text-white/50">
            Toque em Desafiar para montar seu time
          </p>
        ) : unlocked && teamReadiness.teamComplete && teamReadiness.underleveled ? (
          <p className="relative mt-2.5 text-[10px] text-orange-300/90 inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-orange-500/10 border border-orange-400/20">
            Time Nv. {teamReadiness.avgLevel} · abaixo do recomendado (pode tentar)
          </p>
        ) : null}
      </div>

      <div className="p-3 flex gap-2">
        <button
          type="button"
          disabled={!canChallenge}
          onClick={onChallenge}
          className={cn(
            "flex-1 py-2 rounded-xl text-xs font-bold transition-all",
            canChallenge
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
            title="Recompensa coletada"
            className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white/30 cursor-default flex items-center justify-center gap-1 min-w-[44px]"
          >
            <Check className="w-4 h-4 text-emerald-400/90" />
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
        <p className="px-3 pb-2 text-[10px] text-amber-400/80 text-center flex items-center justify-center gap-1">
          <Coins className="w-3 h-3" />
          Toque para coletar {GYM_LEADER_COIN_REWARD} moedas pela vitória!
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
