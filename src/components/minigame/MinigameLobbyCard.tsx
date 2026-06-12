"use client";

import type { ReactNode } from "react";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { cn } from "@/lib/utils";

type LobbyAccent = "cyan" | "emerald" | "violet" | "indigo" | "amber" | "rose";

const accentStyles: Record<
  LobbyAccent,
  { border: string; glow: string; icon: string; label: string; shadow: string }
> = {
  cyan: {
    border: "border-cyan-400/20",
    glow: "rgba(34,211,238,0.15)",
    icon: "bg-cyan-500/15 border-cyan-400/35 text-cyan-300",
    label: "text-cyan-300/60",
    shadow: "shadow-[0_0_48px_rgba(34,211,238,0.08)]",
  },
  emerald: {
    border: "border-emerald-400/20",
    glow: "rgba(16,185,129,0.15)",
    icon: "bg-emerald-500/15 border-emerald-400/35 text-emerald-300",
    label: "text-emerald-300/60",
    shadow: "shadow-[0_0_48px_rgba(16,185,129,0.08)]",
  },
  violet: {
    border: "border-violet-400/20",
    glow: "rgba(139,92,246,0.15)",
    icon: "bg-violet-500/15 border-violet-400/35 text-violet-300",
    label: "text-violet-300/60",
    shadow: "shadow-[0_0_48px_rgba(139,92,246,0.08)]",
  },
  indigo: {
    border: "border-indigo-400/20",
    glow: "rgba(99,102,241,0.15)",
    icon: "bg-indigo-500/15 border-indigo-400/35 text-indigo-300",
    label: "text-indigo-300/60",
    shadow: "shadow-[0_0_48px_rgba(99,102,241,0.08)]",
  },
  amber: {
    border: "border-amber-400/20",
    glow: "rgba(251,191,36,0.15)",
    icon: "bg-amber-500/15 border-amber-400/35 text-amber-300",
    label: "text-amber-300/60",
    shadow: "shadow-[0_0_48px_rgba(251,191,36,0.08)]",
  },
  rose: {
    border: "border-rose-400/20",
    glow: "rgba(244,63,94,0.15)",
    icon: "bg-rose-500/15 border-rose-400/35 text-rose-300",
    label: "text-rose-300/60",
    shadow: "shadow-[0_0_48px_rgba(244,63,94,0.08)]",
  },
};

interface MinigameLobbyCardProps {
  accent?: LobbyAccent;
  icon: ReactNode;
  title: string;
  description: ReactNode;
  buttonLabel: string;
  onStart: () => void;
  disabled?: boolean;
  children?: ReactNode;
  buttonIcon?: ReactNode;
}

export function MinigameLobbyCard({
  accent = "cyan",
  icon,
  title,
  description,
  buttonLabel,
  onStart,
  disabled,
  children,
  buttonIcon,
}: MinigameLobbyCardProps) {
  const styles = accentStyles[accent];

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border bg-gradient-to-b from-slate-900 via-indigo-950/50 to-slate-950 p-6 sm:p-8 text-center space-y-5",
        styles.border,
        styles.shadow
      )}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: `radial-gradient(circle at 50% 0%, ${styles.glow}, transparent 55%)` }}
      />
      <div
        className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent to-transparent"
        style={{
          backgroundImage: `linear-gradient(to right, transparent, ${styles.glow}, transparent)`,
        }}
      />

      <div
        className={cn(
          "relative mx-auto w-16 h-16 rounded-2xl border flex items-center justify-center",
          styles.icon
        )}
      >
        {icon}
      </div>

      <div className="relative space-y-2">
        <p className={cn("text-[10px] uppercase tracking-[0.25em] font-bold", styles.label)}>
          Minigame Arcade
        </p>
        <h3 className="text-2xl font-black text-white">{title}</h3>
        <div className="text-white/50 text-sm leading-relaxed max-w-md mx-auto">{description}</div>
      </div>

      {children}

      <AnimatedButton
        variant="primary"
        size="lg"
        onClick={onStart}
        disabled={disabled}
        icon={buttonIcon}
        className="relative w-full max-w-xs mx-auto"
      >
        {buttonLabel}
      </AnimatedButton>
    </div>
  );
}
