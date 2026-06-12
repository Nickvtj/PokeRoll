"use client";

import { Volume2, VolumeX } from "lucide-react";
import { usePreferencesStore } from "@/stores/preferences-store";
import { playUiClick } from "@/lib/ui-sounds";
import { cn } from "@/lib/utils";

export function SoundToggleButton({ className }: { className?: string }) {
  const soundEnabled = usePreferencesStore((s) => s.soundEnabled);
  const setSoundEnabled = usePreferencesStore((s) => s.setSoundEnabled);

  return (
    <button
      type="button"
      onClick={() => {
        playUiClick();
        setSoundEnabled(!soundEnabled);
      }}
      className={cn(
        "inline-flex items-center justify-center rounded-xl border border-white/10 bg-black/30",
        "text-white/55 hover:text-white hover:bg-white/10 transition-colors nav-touch-target",
        className
      )}
      aria-label={soundEnabled ? "Desligar sons" : "Ligar sons"}
      title={soundEnabled ? "Sons ligados" : "Sons desligados"}
    >
      {soundEnabled ? (
        <Volume2 className="w-4 h-4 text-indigo-300" />
      ) : (
        <VolumeX className="w-4 h-4 text-white/40" />
      )}
    </button>
  );
}
