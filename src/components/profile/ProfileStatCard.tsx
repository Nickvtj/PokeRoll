"use client";

import { cn } from "@/lib/utils";

interface ProfileStatCardProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  accent?: "amber" | "red" | "cyan" | "purple" | "emerald" | "indigo";
  layout?: "vertical" | "horizontal";
  className?: string;
}

const ACCENT = {
  amber: {
    icon: "text-amber-400",
    glow: "from-amber-500/15",
    ring: "ring-amber-400/10",
  },
  red: {
    icon: "text-red-400",
    glow: "from-red-500/15",
    ring: "ring-red-400/10",
  },
  cyan: {
    icon: "text-cyan-400",
    glow: "from-cyan-500/15",
    ring: "ring-cyan-400/10",
  },
  purple: {
    icon: "text-purple-400",
    glow: "from-purple-500/15",
    ring: "ring-purple-400/10",
  },
  emerald: {
    icon: "text-emerald-400",
    glow: "from-emerald-500/15",
    ring: "ring-emerald-400/10",
  },
  indigo: {
    icon: "text-indigo-400",
    glow: "from-indigo-500/15",
    ring: "ring-indigo-400/10",
  },
};

export function ProfileStatCard({
  icon: Icon,
  label,
  value,
  accent = "indigo",
  layout = "vertical",
  className,
}: ProfileStatCardProps) {
  const a = ACCENT[accent];

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl bg-slate-900/40 ring-1 ring-inset",
        a.ring,
        "shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]",
        layout === "horizontal" ? "flex items-center gap-3 px-3 py-3" : "px-3 py-2.5 flex flex-col gap-1",
        className
      )}
    >
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-br to-transparent pointer-events-none opacity-80",
          a.glow
        )}
      />
      <Icon className={cn("relative z-10 w-4 h-4 shrink-0", a.icon)} />
      <div className={cn("relative z-10 min-w-0", layout === "vertical" && "space-y-0.5")}>
        <p className="text-sm font-black tabular-nums leading-none truncate">{value}</p>
        <p className="text-[9px] font-bold uppercase tracking-wider text-white/35">{label}</p>
      </div>
    </div>
  );
}
