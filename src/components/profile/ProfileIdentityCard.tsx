"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, Pencil, Check, X, Star } from "lucide-react";
import { RarityBadge } from "@/components/ui/RarityBadge";
import { TrainerAvatarDisplay } from "@/components/profile/TrainerAvatarDisplay";
import { useGameStore } from "@/stores/game-store";
import { useEconomyStore } from "@/stores/economy-store";
import { XP_PER_LEVEL } from "@/data/economy-balance";

export function ProfileIdentityCard() {
  const profile = useGameStore((s) => s.profile);
  const setUsername = useGameStore((s) => s.setUsername);
  const getHighestRarity = useGameStore((s) => s.getHighestRarity);

  const level = useEconomyStore((s) => s.level);
  const rank = useEconomyStore((s) => s.rank);
  const xp = useEconomyStore((s) => s.xp);
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
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500/10 via-transparent to-purple-500/10 p-6 border border-white/10">
      {/* Background Decor */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-indigo-500/10 blur-3xl rounded-full" />
      <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-purple-500/10 blur-3xl rounded-full" />

      <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
          <TrainerAvatarDisplay
            avatarId={selectedAvatarId}
            username={profile.username}
            size="lg"
            className="w-24 h-24 shadow-2xl shrink-0 border-2 border-white/20 relative z-10"
          />
          <div className="absolute -bottom-1 -right-1 bg-indigo-500 text-white p-1.5 rounded-full shadow-lg border border-white/20 z-20">
            <Star className="w-3.5 h-3.5 fill-white" />
          </div>
        </div>

        <div className="flex-1 w-full text-center md:text-left space-y-4">
          <div className="space-y-1">
            {editingName ? (
              <div className="flex items-center justify-center md:justify-start gap-2">
                <input
                  type="text"
                  value={nameDraft}
                  onChange={(e) => setNameDraft(e.target.value)}
                  maxLength={20}
                  className="w-full max-w-[240px] px-4 py-2 rounded-xl bg-white/5 border border-indigo-500/50 text-lg font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") void saveUsername();
                    if (e.key === "Escape") cancelEdit();
                  }}
                />
                <button
                  type="button"
                  onClick={() => void saveUsername()}
                  className="p-2 rounded-xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                >
                  <Check className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-center md:justify-start gap-3">
                <h2 className="text-3xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
                  {profile.username}
                </h2>
                <button
                  type="button"
                  onClick={() => setEditingName(true)}
                  className="p-1.5 rounded-lg text-white/30 hover:text-white/70 hover:bg-white/5 transition-all"
                >
                  <Pencil className="w-4 h-4" />
                </button>
              </div>
            )}
            <div className="flex items-center justify-center md:justify-start gap-2 text-white/40 text-xs">
              <Calendar className="w-3.5 h-3.5" />
              Treinador desde {new Date(profile.createdAt).toLocaleDateString("pt-BR")}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
            <div className="px-4 py-1.5 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-black shadow-inner flex items-center gap-2">
              NÍVEL {level}
            </div>
            <div className="px-4 py-1.5 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-black shadow-inner">
              RANK {String(rank).toUpperCase()}
            </div>
            {highestRarity && (
              <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-white/5 border border-white/10">
                <span className="text-[10px] text-white/30 font-bold uppercase">Melhor drop:</span>
                <RarityBadge rarity={highestRarity} size="sm" />
              </div>
            )}
          </div>

          <div className="space-y-2 max-w-sm mx-auto md:mx-0 pt-2">
            <div className="flex justify-between items-end text-[10px] font-black uppercase tracking-widest text-white/30">
              <span>Experiência</span>
              <span className="text-white/60">
                {xpInLevel} / {XP_PER_LEVEL} XP
              </span>
            </div>
            <div className="h-2.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 p-0.5">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                initial={{ width: 0 }}
                animate={{ width: `${xpPct}%` }}
                transition={{ duration: 1.2, ease: "easeOut" }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
