"use client";

import { Palette, Check } from "lucide-react";
import { ProfileSection } from "@/components/profile/ProfileSection";
import { TrainerAvatarDisplay } from "@/components/profile/TrainerAvatarDisplay";
import { AvatarPicker } from "@/components/profile/AvatarPicker";
import { useGameStore } from "@/stores/game-store";
import { useEconomyStore } from "@/stores/economy-store";
import { usePreferencesStore } from "@/stores/preferences-store";
import { AVATAR_BG_OPTIONS } from "@/data/avatar-backgrounds";
import { cn } from "@/lib/utils";

export function ProfileCustomizePanel() {
  const username = useGameStore((s) => s.profile.username);
  const selectedAvatarId = useEconomyStore((s) => s.selectedAvatarId ?? "default");
  const avatarBgColor = usePreferencesStore((s) => s.avatarBgColor);
  const setAvatarBgColor = usePreferencesStore((s) => s.setAvatarBgColor);

  return (
    <div className="flex flex-col min-h-0 lg:h-full gap-4">
      <div className="shrink-0 space-y-4">
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
                Escolha um avatar e a cor de fundo
              </p>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <p className="text-[10px] uppercase tracking-wider text-white/35 font-semibold">
              Cor de fundo
            </p>
            <div className="flex flex-wrap gap-2.5">
              {AVATAR_BG_OPTIONS.map((opt) => {
                const active = avatarBgColor === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setAvatarBgColor(opt.id)}
                    title={opt.label}
                    aria-label={opt.label}
                    className={cn(
                      "relative w-9 h-9 rounded-full border transition-all",
                      active
                        ? "border-white ring-2 ring-white/70 scale-105"
                        : "border-white/20 hover:border-white/50"
                    )}
                    style={{ background: opt.swatch }}
                  >
                    {active && (
                      <Check className="absolute inset-0 m-auto w-4 h-4 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </ProfileSection>
      </div>

      <div className="flex-1 min-h-0">
        <AvatarPicker />
      </div>
    </div>
  );
}
