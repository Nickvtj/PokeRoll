"use client";

import {
  Disc3,
  Trophy,
  BookOpen,
  Copy,
  Swords,
  BarChart3,
  Stars,
  Coins,
} from "lucide-react";
import { EggIcon } from "@/components/ui/EggIcon";
import { TOTAL_POKEMON } from "@/data/pokemon";
import { useGameStore } from "@/stores/game-store";
import { useEconomyStore } from "@/stores/economy-store";
import { ProfileSection } from "@/components/profile/ProfileSection";
import { ProfileIdentityCard } from "@/components/profile/ProfileIdentityCard";
import { TrainerItemsPanel } from "@/components/profile/TrainerItemsPanel";
import { ProfileStatCard } from "@/components/profile/ProfileStatCard";

export function ProfileCard() {
  const getUniqueCount = useGameStore((s) => s.getUniqueCount);
  const getDuplicateCount = useGameStore((s) => s.getDuplicateCount);
  const getProgress = useGameStore((s) => s.getProgress);
  const getShinyCount = useGameStore((s) => s.getShinyCount);
  const totalSpins = useGameStore((s) => s.profile.totalSpins);

  const level = useEconomyStore((s) => s.level);
  const battleWins = useEconomyStore((s) => s.battleWins);
  const eggsHatched = useEconomyStore((s) => s.eggsHatched ?? 0);
  const eggSellCoins = useEconomyStore((s) => s.eggSellCoins ?? 0);

  const unique = getUniqueCount();
  const duplicates = getDuplicateCount();
  const progress = getProgress();
  const shinyCount = getShinyCount();
  const shinyProgress = Math.round((shinyCount / TOTAL_POKEMON) * 100);

  return (
    <div className="space-y-4">
      <ProfileIdentityCard />
      <TrainerItemsPanel />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ProfileSection
          title="Álbum de Figurinhas"
          description="Progresso da coleção Kanto."
          icon={BookOpen}
          iconClassName="text-cyan-400"
        >
          <div className="space-y-3">
            <div className="flex items-end justify-between gap-2">
              <div>
                <p className="text-2xl font-black text-cyan-400 tabular-nums">{progress}%</p>
                <p className="text-[10px] text-white/40 uppercase font-bold tracking-wider">
                  Completo
                </p>
              </div>
              <p className="text-xs text-white/45 text-right">
                {unique}/{TOTAL_POKEMON} · faltam {TOTAL_POKEMON - unique}
              </p>
            </div>
            <div className="progress-bar">
              <div
                className="progress-fill transition-[width] duration-1000 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs pt-2 border-t border-white/[0.06]">
              <span className="text-white/45 flex items-center gap-1">
                <Stars className="w-3.5 h-3.5 text-amber-400" />
                Shinies
              </span>
              <span className="font-bold text-amber-300 tabular-nums">
                {shinyCount} ({shinyProgress}%)
              </span>
            </div>
          </div>
        </ProfileSection>

        <ProfileSection
          title="Estatísticas"
          description="Roleta, ovos, duplicatas e batalhas."
          icon={BarChart3}
          iconClassName="text-emerald-400"
        >
          <div className="grid grid-cols-2 gap-2">
            <ProfileStatCard icon={Disc3} label="Total spins" value={String(totalSpins)} accent="indigo" layout="horizontal" />
            <ProfileStatCard icon={BookOpen} label="Únicos" value={String(unique)} accent="cyan" layout="horizontal" />
            <ProfileStatCard icon={Copy} label="Duplicatas" value={String(duplicates)} accent="amber" layout="horizontal" />
            <ProfileStatCard icon={Swords} label="Vitórias" value={String(battleWins)} accent="red" layout="horizontal" />
            <ProfileStatCard icon={Trophy} label="Nível" value={String(level)} accent="purple" layout="horizontal" />
            <ProfileStatCard icon={Stars} label="Shinies" value={String(shinyCount)} accent="amber" layout="horizontal" />
            <ProfileStatCard icon={EggIcon} label="Ovos chocados" value={String(eggsHatched)} accent="emerald" layout="horizontal" />
            <ProfileStatCard icon={Coins} label="Moedas com ovos" value={String(eggSellCoins)} accent="amber" layout="horizontal" />
          </div>
        </ProfileSection>
      </div>
    </div>
  );
}
