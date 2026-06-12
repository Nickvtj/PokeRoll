"use client";

import { Settings, Volume2, VolumeX, FastForward, Monitor, MousePointer2 } from "lucide-react";
import { ProfileSection } from "@/components/profile/ProfileSection";
import { usePreferencesStore } from "@/stores/preferences-store";
import { playUiClick, playUiTab } from "@/lib/ui-sounds";
import type { VisualQualityMode } from "@/lib/player-preferences";
import { cn } from "@/lib/utils";

const QUALITY_OPTIONS: { id: VisualQualityMode; label: string }[] = [
  { id: "auto", label: "Automático" },
  { id: "high", label: "Alto" },
  { id: "medium", label: "Médio" },
  { id: "low", label: "Baixo" },
];

function ToggleRow({
  icon: Icon,
  label,
  description,
  checked,
  onChange,
}: {
  icon: typeof Volume2;
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-start gap-3 p-3 rounded-xl border border-white/10 bg-white/[0.03] cursor-pointer hover:bg-white/[0.05] transition-colors">
      <Icon className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold">{label}</p>
        <p className="text-caption text-white/50 mt-0.5 leading-snug">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={(e) => {
          e.preventDefault();
          playUiClick();
          onChange(!checked);
        }}
        className={cn(
          "relative w-11 h-6 rounded-full shrink-0 transition-colors",
          checked ? "bg-indigo-500" : "bg-white/15"
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform",
            checked && "translate-x-5"
          )}
        />
      </button>
    </label>
  );
}

export function ProfileSettingsPanel() {
  const soundEnabled = usePreferencesStore((s) => s.soundEnabled);
  const skipBattleIntro = usePreferencesStore((s) => s.skipBattleIntro);
  const visualQualityMode = usePreferencesStore((s) => s.visualQualityMode);
  const customCursorEnabled = usePreferencesStore((s) => s.customCursorEnabled);
  const setSoundEnabled = usePreferencesStore((s) => s.setSoundEnabled);
  const setSkipBattleIntro = usePreferencesStore((s) => s.setSkipBattleIntro);
  const setVisualQualityMode = usePreferencesStore((s) => s.setVisualQualityMode);
  const setCustomCursorEnabled = usePreferencesStore((s) => s.setCustomCursorEnabled);

  return (
    <ProfileSection
      title="Configurações"
      icon={Settings}
      description="Som, animações e desempenho"
    >
      <div className="space-y-3">
        <ToggleRow
          icon={soundEnabled ? Volume2 : VolumeX}
          label="Efeitos sonoros"
          description="Sons de UI, batalha, minigames e recompensas"
          checked={soundEnabled}
          onChange={setSoundEnabled}
        />
        <ToggleRow
          icon={FastForward}
          label="Pular intros de batalha"
          description="Face-off e moeda mais rápidos na batalha"
          checked={skipBattleIntro}
          onChange={setSkipBattleIntro}
        />
        <ToggleRow
          icon={MousePointer2}
          label="Cursor temático"
          description="Cursor estilo PokéRoll; desligado usa o cursor do sistema"
          checked={customCursorEnabled}
          onChange={setCustomCursorEnabled}
        />

        <div className="p-3 rounded-xl border border-white/10 bg-white/[0.03] space-y-2">
          <div className="flex items-center gap-2">
            <Monitor className="w-5 h-5 text-cyan-400 shrink-0" />
            <div>
              <p className="text-sm font-bold">Qualidade visual</p>
              <p className="text-caption text-white/50">Blur, partículas e efeitos de fundo</p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            {QUALITY_OPTIONS.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => {
                  playUiTab();
                  setVisualQualityMode(id);
                }}
                className={cn(
                  "py-2 px-2 rounded-lg text-caption font-bold transition-colors min-h-[44px]",
                  visualQualityMode === id
                    ? "bg-indigo-500/25 text-indigo-200 border border-indigo-400/40"
                    : "bg-white/5 text-white/45 border border-transparent hover:text-white/70"
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </ProfileSection>
  );
}
