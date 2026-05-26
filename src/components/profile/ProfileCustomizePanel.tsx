"use client";

import { Palette } from "lucide-react";
import { ProfileSection } from "@/components/profile/ProfileSection";
import { TrainerAvatarDisplay } from "@/components/profile/TrainerAvatarDisplay";
import { AvatarPicker } from "@/components/profile/AvatarPicker";
import { useGameStore } from "@/stores/game-store";
import { useEconomyStore } from "@/stores/economy-store";

export function ProfileCustomizePanel() {
  const username = useGameStore((s) => s.profile.username);
  const selectedAvatarId = useEconomyStore((s) => s.selectedAvatarId ?? "default");

  return (
    <div className="space-y-4">
      <ProfileSection
        title="Seu avatar"
        description="Aparece no perfil e no cabeçalho do jogo."
        icon={Palette}
        iconClassName="text-cyan-400"
      >
        <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
          <TrainerAvatarDisplay
            avatarId={selectedAvatarId}
            username={username}
            size="md"
            className="w-16 h-16"
          />
          <div>
            <p className="text-sm font-semibold">{username}</p>
            <p className="text-[11px] text-white/40 mt-0.5">
              Escolha um avatar abaixo para atualizar
            </p>
          </div>
        </div>
      </ProfileSection>

      <AvatarPicker />
    </div>
  );
}
