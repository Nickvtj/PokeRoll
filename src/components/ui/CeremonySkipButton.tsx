"use client";

import { useEffect, useState } from "react";
import { FastForward } from "lucide-react";
import { playUiClick } from "@/lib/ui-sounds";
import { cn } from "@/lib/utils";

interface CeremonySkipButtonProps {
  onSkip: () => void;
  label?: string;
  className?: string;
  delayMs?: number;
}

export function CeremonySkipButton({
  onSkip,
  label = "Pular intro",
  className,
  delayMs = 1000,
}: CeremonySkipButtonProps) {
  const [visible, setVisible] = useState(delayMs <= 0);

  useEffect(() => {
    if (delayMs <= 0) return;
    const t = window.setTimeout(() => setVisible(true), delayMs);
    return () => window.clearTimeout(t);
  }, [delayMs]);

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={() => {
        playUiClick();
        onSkip();
      }}
      className={cn(
        "pointer-events-auto z-50 inline-flex items-center gap-1.5 px-3 py-2 rounded-xl",
        "text-caption font-bold text-white/80 bg-black/50 border border-white/20",
        "hover:bg-black/70 hover:text-white backdrop-blur-sm transition-colors",
        "min-h-[44px] min-w-[44px]",
        className
      )}
    >
      <FastForward className="w-4 h-4 shrink-0" />
      {label}
    </button>
  );
}
