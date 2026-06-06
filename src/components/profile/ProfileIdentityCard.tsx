"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, Pencil, Check, X, Star, Coins, Swords, Trophy, Disc3 } from "lucide-react";
import { RarityBadge } from "@/components/ui/RarityBadge";
import { TrainerAvatarDisplay } from "@/components/profile/TrainerAvatarDisplay";
import { ProfileStatCard } from "@/components/profile/ProfileStatCard";
import { useGameStore } from "@/stores/game-store";
import { useEconomyStore } from "@/stores/economy-store";
import { XP_PER_LEVEL } from "@/data/economy-balance";
import { formatNumber } from "@/lib/utils";

export function ProfileIdentityCard() {
  const profile = useGameStore((s) => s.profile);
  const setUsername = useGameStore((s) => s.setUsername);
  const getHighestRarity = useGameStore((s) => s.getHighestRarity);

  const level = useEconomyStore((s) => s.level);
  const rank = useEconomyStore((s) => s.rank);
  const xp = useEconomyStore((s) => s.xp);
  const coins = useEconomyStore((s) => s.coins);
  const battleWins = useEconomyStore((s) => s.battleWins);
  const freeSpins = useEconomyStore((s) => s.freeSpins);
  const selectedAvatarId = useEconomyStore((s) => s.selectedAvatarId ?? "default");

  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(profile.username);

  useEffect(() => {
    if (!editingName) setNameDraft(profile.username);
  }, [profile.username, editingName]);

  const highestRarity = getHighestRarity();
  const xpInLevel = xp % XP_PER_LEVEL;
  const xpPct = (xpInLevel / XP_PER_LEVEL) * 100;

  const saveUsername = async () => {
    const trimmed = nameDraft.trim();
    if (trimmed.length < 2) return;
    await setUsername(trimmed);
    setEditingName(false);
  };

  const cancelEdit = () => {
    setNameDraft(profile.username);
    setEditingName(false);
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-slate-900/50 ring-1 ring-inset ring-indigo-500/15 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(99,102,241,0.14),transparent_55%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(168,85,247,0.08),transparent_50%)]" />

      <div className="relative z-10 p-5 lg:p-6">
        <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-5 lg:gap-6 items-start">
          <div className="flex flex-col items-center md:items-start gap-3">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/40 to-purple-500/40 rounded-2xl blur opacity-40 group-hover:opacity-60 transition duration-500" />
              <TrainerAvatarDisplay
                avatarId={selectedAvatarId}
                username={profile.username}
                size="lg"
                className="w-20 h-20 lg:w-24 lg:h-24 shadow-2xl shrink-0 ring-2 ring-indigo-400/30 relative z-10 rounded-2xl"
              />
              <div className="absolute -bottom-1 -right-1 bg-indigo-500 text-white p-1 rounded-lg shadow-lg ring-1 ring-indigo-300/30 z-20">
                <Star className="w-3 h-3 fill-white" />
              </div>
            </div>
            <div className="px-3 py-1 rounded-lg bg-indigo-500/20 text-indigo-200 text-[10px] font-black tracking-wider ring-1 ring-inset ring-indigo-400/20">
              NÍVEL {level}
            </div>
          </div>

          <div className="space-y-4 min-w-0">
            <div className="space-y-1.5 text-center md:text-left">
              {editingName ? (
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <input
                    type="text"
                    value={nameDraft}
                    onChange={(e) => setNameDraft(e.target.value)}
                    maxLength={20}
                    className="w-full max-w-[220px] px-3 py-1.5 rounded-xl bg-black/30 ring-1 ring-indigo-500/40 text-lg font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") void saveUsername();
                      if (e.key === "Escape") cancelEdit();
                    }}
                  />
                  <button type="button" onClick={() => void saveUsername()} className="p-1.5 rounded-lg bg-emerald-500 text-white">
                    <Check className="w-4 h-4" />
                  </button>
                  <button type="button" onClick={cancelEdit} className="p-1.5 rounded-lg bg-white/10 text-white/60">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <h2 className="text-2xl lg:text-3xl font-black tracking-tight truncate">{profile.username}</h2>
                  <button
                    type="button"
                    onClick={() => setEditingName(true)}
                    className="p-1 rounded-md text-white/30 hover:text-white/70 hover:bg-white/5 transition-all shrink-0"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-3 gap-y-1 text-white/40 text-[11px]">
                <span className="inline-flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Desde {new Date(profile.createdAt).toLocaleDateString("pt-BR")}
                </span>
                <span className="text-purple-300/80 font-semibold">RANK {String(rank).toUpperCase()}</span>
                {highestRarity && (
                  <span className="inline-flex items-center gap-1.5">
                    Melhor drop: <RarityBadge rarity={highestRarity} size="sm" />
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-white/30">
                <span>Experiência</span>
                <span className="text-white/55 tabular-nums">{xpInLevel} / {XP_PER_LEVEL} XP</span>
              </div>
              <div className="h-2 w-full bg-black/30 rounded-full overflow-hidden ring-1 ring-inset ring-white/[0.06]">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${xpPct}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <ProfileStatCard icon={Coins} label="Moedas" value={formatNumber(coins)} accent="amber" />
              <ProfileStatCard icon={Swords} label="Vitórias" value={formatNumber(battleWins)} accent="red" />
              <ProfileStatCard icon={Disc3} label="Spins" value={formatNumber(freeSpins)} accent="cyan" />
              <ProfileStatCard icon={Trophy} label="Rank" value={String(rank).toUpperCase()} accent="purple" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
