"use client";

import { Lock } from "lucide-react";
import {
  buildTrainerAvatarId,
  getUnlockedTrainerAvatars,
  TRAINER_AVATARS,
} from "@/data/trainer-avatars";
import { useEconomyStore } from "@/stores/economy-store";
import { cn } from "@/lib/utils";

export function AvatarPicker() {
  const level = useEconomyStore((s) => s.level);
  const selectedAvatarId = useEconomyStore((s) => s.selectedAvatarId ?? "default");
  const setSelectedAvatar = useEconomyStore((s) => s.setSelectedAvatar);

  const unlockedTrainers = getUnlockedTrainerAvatars(level);

  return (
    <div className="glass-card p-5 space-y-4">
      <div>
        <h3 className="font-bold text-sm">Avatares de treinador</h3>
        <p className="text-[11px] text-white/40 mt-1 leading-relaxed">
          Desbloqueie novos treinadores conforme sobe de nível da conta — um a cada 5 níveis.
        </p>
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
        {TRAINER_AVATARS.map((avatar) => {
          const unlocked = level >= avatar.unlockLevel;
          const id = buildTrainerAvatarId(avatar.id);
          const selected = selectedAvatarId === id;

          return (
            <button
              key={avatar.id}
              type="button"
              disabled={!unlocked}
              onClick={() => unlocked && setSelectedAvatar(id)}
              title={unlocked ? avatar.label : `Desbloqueia no Nv. ${avatar.unlockLevel}`}
              className={cn(
                "relative aspect-square rounded-xl border p-1 transition-all",
                selected
                  ? "border-indigo-400 bg-indigo-500/20 ring-2 ring-indigo-400/50"
                  : "border-white/10 bg-white/5 hover:bg-white/10",
                !unlocked && "opacity-40 cursor-not-allowed"
              )}
            >
              {!unlocked && (
                <Lock className="absolute top-1 right-1 w-3 h-3 text-white/40 z-10" />
              )}
              {avatar.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatar.image}
                  alt={avatar.label}
                  className="object-contain w-full h-full"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-lg font-bold text-indigo-300">
                  ?
                </div>
              )}
            </button>
          );
        })}
      </div>

      <p className="text-[10px] text-indigo-300/80">
        {unlockedTrainers.length}/{TRAINER_AVATARS.length} desbloqueados
      </p>
    </div>
  );
}
