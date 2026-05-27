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
    <div className="flex flex-col sm:flex-row items-center gap-5">
      <TrainerAvatarDisplay
        avatarId={selectedAvatarId}
        username={profile.username}
        size="lg"
        className="w-20 h-20 shadow-xl shrink-0"
      />

      <div className="flex-1 w-full text-center sm:text-left space-y-3">
        {editingName ? (
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <input
              type="text"
              value={nameDraft}
              onChange={(e) => setNameDraft(e.target.value)}
              maxLength={20}
              className="w-44 px-3 py-1.5 rounded-xl bg-white/5 border border-indigo-500/40 text-center sm:text-left text-lg font-bold focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") void saveUsername();
                if (e.key === "Escape") cancelEdit();
              }}
            />
            <button
              type="button"
              onClick={() => void saveUsername()}
              disabled={nameDraft.trim().length < 2}
              className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 disabled:opacity-40"
            >
              <Check className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={cancelEdit}
              className="p-1.5 rounded-lg bg-white/5 text-white/50 hover:bg-white/10"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <h2 className="text-2xl font-bold">{profile.username}</h2>
            <button
              type="button"
              onClick={() => {
                setNameDraft(profile.username);
                setEditingName(true);
              }}
              className="p-1.5 rounded-lg text-white/40 hover:text-indigo-300 hover:bg-white/5 transition-colors"
              title="Editar nome"
            >
              <Pencil className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 font-semibold">
            <Star className="w-3 h-3" />
            Nv. {level}
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-purple-500/15 text-purple-300 font-semibold">
            Rank {rank}
          </span>
        </div>

        <div className="flex items-center justify-center sm:justify-start gap-1.5 text-white/40 text-xs">
          <Calendar className="w-3.5 h-3.5" />
          Desde {new Date(profile.createdAt).toLocaleDateString("pt-BR")}
        </div>

        {highestRarity && (
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <span className="text-xs text-white/45">Melhor drop:</span>
            <RarityBadge rarity={highestRarity} size="sm" />
          </div>
        )}

        <div className="space-y-1 max-w-xs mx-auto sm:mx-0">
          <div className="flex justify-between text-[10px] text-white/40">
            <span>XP da conta</span>
            <span>
              {xpInLevel}/{XP_PER_LEVEL}
            </span>
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
      </div>
    </div>
  );
}
