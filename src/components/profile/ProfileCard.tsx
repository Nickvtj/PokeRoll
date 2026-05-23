"use client";

import { motion } from "framer-motion";
import {
  Disc3,
  Trophy,
  BookOpen,
  Copy,
  Crown,
  Calendar,
  Coins,
  Star,
  Swords,
} from "lucide-react";
import { RarityBadge } from "@/components/ui/RarityBadge";
import { TOTAL_POKEMON } from "@/data/pokemon";
import { useGameStore } from "@/stores/game-store";
import { useEconomyStore } from "@/stores/economy-store";
import { ProfileBadgesPanel } from "@/components/profile/ProfileBadgesPanel";
import { formatNumber } from "@/lib/utils";
import { XP_PER_LEVEL } from "@/data/economy-balance";

export function ProfileCard() {
  const profile = useGameStore((s) => s.profile);
  const getUniqueCount = useGameStore((s) => s.getUniqueCount);
  const getDuplicateCount = useGameStore((s) => s.getDuplicateCount);
  const getHighestRarity = useGameStore((s) => s.getHighestRarity);
  const getProgress = useGameStore((s) => s.getProgress);

  const coins = useEconomyStore((s) => s.coins);
  const level = useEconomyStore((s) => s.level);
  const xp = useEconomyStore((s) => s.xp);
  const rank = useEconomyStore((s) => s.rank);
  const battleWins = useEconomyStore((s) => s.battleWins);
  const freeSpins = useEconomyStore((s) => s.freeSpins);

  const highestRarity = getHighestRarity();
  const progress = getProgress();
  const unique = getUniqueCount();
  const duplicates = getDuplicateCount();
  const xpInLevel = xp % XP_PER_LEVEL;
  const xpPct = (xpInLevel / XP_PER_LEVEL) * 100;

  const stats = [
    {
      icon: Coins,
      label: "Moedas",
      value: formatNumber(coins),
      color: "text-amber-400",
    },
    {
      icon: Star,
      label: "Nível / Rank",
      value: `${level} / ${rank}`,
      color: "text-purple-400",
    },
    {
      icon: Swords,
      label: "Vitórias",
      value: formatNumber(battleWins),
      color: "text-red-400",
    },
    {
      icon: Disc3,
      label: "Total de Spins",
      value: formatNumber(profile.totalSpins),
      color: "text-indigo-400",
    },
    {
      icon: BookOpen,
      label: "Pokémon Únicos",
      value: `${unique}/${TOTAL_POKEMON}`,
      color: "text-cyan-400",
    },
    {
      icon: Copy,
      label: "Duplicatas",
      value: formatNumber(duplicates),
      color: "text-amber-400",
    },
    {
      icon: Trophy,
      label: "Progresso",
      value: `${progress}%`,
      color: "text-emerald-400",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Avatar / Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8 text-center space-y-4"
      >
        <div className="relative mx-auto w-24 h-24">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 animate-pulseGlow" />
          <div className="relative w-full h-full rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-4xl font-bold shadow-xl">
            {profile.username.charAt(0).toUpperCase()}
          </div>
          <Crown className="absolute -top-2 -right-2 w-8 h-8 text-amber-400 drop-shadow-lg" />
        </div>

        <div>
          <h2 className="text-2xl font-bold">{profile.username}</h2>
          <div className="flex items-center justify-center gap-1.5 mt-1 text-white/40 text-sm">
            <Calendar className="w-3.5 h-3.5" />
            Treinador desde{" "}
            {new Date(profile.createdAt).toLocaleDateString("pt-BR")}
          </div>
        </div>

        {highestRarity && (
          <div className="flex items-center justify-center gap-2">
            <span className="text-sm text-white/50">Maior raridade:</span>
            <RarityBadge rarity={highestRarity} size="md" />
          </div>
        )}

        {freeSpins > 0 && (
          <p className="text-sm text-cyan-400 font-semibold">
            🎰 {freeSpins} spin{freeSpins > 1 ? "s" : ""} grátis
          </p>
        )}

        {/* XP bar */}
        <div className="max-w-xs mx-auto space-y-1">
          <div className="flex justify-between text-xs text-white/40">
            <span>XP</span>
            <span>{xpInLevel}/{XP_PER_LEVEL}</span>
          </div>
          <div className="progress-bar h-2">
            <motion.div
              className="progress-fill bg-gradient-to-r from-purple-500 to-indigo-500"
              initial={{ width: 0 }}
              animate={{ width: `${xpPct}%` }}
              transition={{ duration: 0.8 }}
            />
          </div>
        </div>
      </motion.div>

      <ProfileBadgesPanel />

      {/* Barra de progresso do álbum */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-6 space-y-3"
      >
        <h3 className="font-bold flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-cyan-400" />
          Álbum de Figurinhas
        </h3>
        <div className="flex items-center justify-between text-sm">
          <span className="text-white/50">{unique} coletados</span>
          <span className="font-bold text-cyan-400">{progress}%</span>
          <span className="text-white/50">{TOTAL_POKEMON - unique} faltando</span>
        </div>
        <div className="progress-bar">
          <motion.div
            className="progress-fill"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />
        </div>
      </motion.div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-5 space-y-2"
          >
            <stat.icon className={`w-5 h-5 ${stat.color}`} />
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-xs text-white/50">{stat.label}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
