"use client";

import {
  Disc3,
  Trophy,
  BookOpen,
  Copy,
  Coins,
  Swords,
  User,
  BarChart3,
  Stars,
} from "lucide-react";
import { TOTAL_POKEMON } from "@/data/pokemon";
import { useGameStore } from "@/stores/game-store";
import { useEconomyStore } from "@/stores/economy-store";
import { ProfileSection } from "@/components/profile/ProfileSection";
import { ProfileIdentityCard } from "@/components/profile/ProfileIdentityCard";
import { TrainerItemsPanel } from "@/components/profile/TrainerItemsPanel";
import { formatNumber } from "@/lib/utils";

interface StatItemProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  color: string;
}

function StatItem({ icon: Icon, label, value, color }: StatItemProps) {
  return (
    <div className="rounded-xl bg-white/5 border border-white/10 p-3 space-y-1">
      <Icon className={`w-4 h-4 ${color}`} />
      <p className="text-lg font-bold leading-none">{value}</p>
      <p className="text-[10px] text-white/45">{label}</p>
    </div>
  );
}

function StatGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <p className="text-[10px] uppercase tracking-wider text-white/35 font-semibold">
        {title}
      </p>
      <div className="grid grid-cols-2 gap-2">{children}</div>
    </div>
  );
}

export function ProfileCard() {
  const getUniqueCount = useGameStore((s) => s.getUniqueCount);
  const getDuplicateCount = useGameStore((s) => s.getDuplicateCount);
  const getProgress = useGameStore((s) => s.getProgress);
  const getShinyCount = useGameStore((s) => s.getShinyCount);
  const totalSpins = useGameStore((s) => s.profile.totalSpins);

  const coins = useEconomyStore((s) => s.coins);
  const level = useEconomyStore((s) => s.level);
  const rank = useEconomyStore((s) => s.rank);
  const battleWins = useEconomyStore((s) => s.battleWins);
  const freeSpins = useEconomyStore((s) => s.freeSpins);

  const unique = getUniqueCount();
  const duplicates = getDuplicateCount();
  const progress = getProgress();
  const shinyCount = getShinyCount();
  const shinyProgress = Math.round((shinyCount / TOTAL_POKEMON) * 100);

  return (
    <div className="space-y-4">
      <ProfileSection
        title="Treinador"
        description="Seu progresso na jornada."
        icon={User}
      >
        <ProfileIdentityCard />
      </ProfileSection>

      <TrainerItemsPanel />

      <ProfileSection
        title="Álbum de Figurinhas"
        description="Progresso da coleção Kanto."
        icon={BookOpen}
        iconClassName="text-cyan-400"
      >
        <div className="flex items-center justify-between text-sm">
          <span className="text-white/50">{unique} coletados</span>
          <span className="font-bold text-cyan-400">{progress}%</span>
          <span className="text-white/50">{TOTAL_POKEMON - unique} faltando</span>
        </div>
        <div className="progress-bar">
          <div
            className="progress-fill transition-[width] duration-1000 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-sm mt-3 pt-3 border-t border-white/10">
          <span className="text-white/50 flex items-center gap-1">
            <Stars className="w-3.5 h-3.5 text-amber-400" />
            Shinies
          </span>
          <span className="font-bold text-amber-300">
            {shinyCount}/{TOTAL_POKEMON}
          </span>
          <span className="text-white/50">{shinyProgress}%</span>
        </div>
      </ProfileSection>

      <ProfileSection
        title="Estatísticas"
        description="Números da sua jornada."
        icon={BarChart3}
        iconClassName="text-emerald-400"
      >
        <div className="space-y-4">
          <StatGroup title="Economia">
            <StatItem
              icon={Coins}
              label="Moedas"
              value={formatNumber(coins)}
              color="text-amber-400"
            />
            <StatItem
              icon={Disc3}
              label="Spins grátis"
              value={formatNumber(freeSpins)}
              color="text-cyan-400"
            />
          </StatGroup>

          <StatGroup title="Conta e batalhas">
            <StatItem
              icon={Trophy}
              label="Nível / Rank"
              value={`${level} / ${rank}`}
              color="text-purple-400"
            />
            <StatItem
              icon={Swords}
              label="Vitórias"
              value={formatNumber(battleWins)}
              color="text-red-400"
            />
          </StatGroup>

          <StatGroup title="Roleta e coleção">
            <StatItem
              icon={Disc3}
              label="Total de spins"
              value={formatNumber(totalSpins)}
              color="text-indigo-400"
            />
            <StatItem
              icon={BookOpen}
              label="Pokémon únicos"
              value={`${unique}/${TOTAL_POKEMON}`}
              color="text-cyan-400"
            />
            <StatItem
              icon={Copy}
              label="Duplicatas"
              value={formatNumber(duplicates)}
              color="text-amber-400"
            />
            <StatItem
              icon={Stars}
              label="Shinies"
              value={`${shinyCount}/${TOTAL_POKEMON}`}
              color="text-amber-300"
            />
            <StatItem
              icon={Trophy}
              label="Álbum completo"
              value={`${progress}%`}
              color="text-emerald-400"
            />
          </StatGroup>
        </div>
      </ProfileSection>
    </div>
  );
}
