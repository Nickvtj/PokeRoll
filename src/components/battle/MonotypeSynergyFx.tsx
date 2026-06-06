"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Bug,
  CircleDot,
  Droplets,
  Flame,
  Ghost,
  Leaf,
  Mountain,
  Sparkles,
  Star,
  Sword,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { TeamMonotypeSynergy } from "@/lib/team-monotype";

const TYPE_ACCENT: Record<string, { rgb: string; Icon: LucideIcon }> = {
  fire: { rgb: "251, 146, 60", Icon: Flame },
  water: { rgb: "56, 189, 248", Icon: Droplets },
  grass: { rgb: "74, 222, 128", Icon: Leaf },
  electric: { rgb: "250, 204, 21", Icon: Zap },
  ice: { rgb: "103, 232, 249", Icon: Sparkles },
  fighting: { rgb: "248, 113, 113", Icon: Sword },
  poison: { rgb: "192, 132, 252", Icon: CircleDot },
  ground: { rgb: "217, 119, 6", Icon: Mountain },
  flying: { rgb: "129, 140, 248", Icon: Sparkles },
  psychic: { rgb: "244, 114, 182", Icon: Sparkles },
  bug: { rgb: "163, 230, 53", Icon: Bug },
  rock: { rgb: "168, 162, 158", Icon: Mountain },
  ghost: { rgb: "167, 139, 250", Icon: Ghost },
  dragon: { rgb: "99, 102, 241", Icon: Star },
  dark: { rgb: "100, 116, 139", Icon: CircleDot },
  steel: { rgb: "148, 163, 184", Icon: CircleDot },
  fairy: { rgb: "244, 114, 182", Icon: Sparkles },
  normal: { rgb: "203, 213, 225", Icon: Star },
};

function getTypeAccent(type: string) {
  return TYPE_ACCENT[type] ?? { rgb: "99, 102, 241", Icon: Sparkles };
}

export function MonotypeSynergyAura({
  type,
  active,
  children,
  className,
}: {
  type: string | null;
  active: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  if (!active || !type) {
    return <div className={className}>{children}</div>;
  }

  const accent = getTypeAccent(type);
  const fxClass = `monotype-synergy-${type in TYPE_ACCENT ? type : "default"}`;

  return (
    <motion.div
      initial={{ scale: 0.96, opacity: 0.85 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", damping: 14, stiffness: 320 }}
      className={cn("monotype-synergy-aura", fxClass, className)}
      style={
        {
          "--mono-rgb": accent.rgb,
        } as React.CSSProperties
      }
    >
      <span className="monotype-synergy-shimmer" aria-hidden />
      <span className="monotype-synergy-sparks" aria-hidden />
      <div className="relative z-[2]">{children}</div>
    </motion.div>
  );
}

export function MonotypeSynergyBanner({
  synergy,
  className,
}: {
  synergy: TeamMonotypeSynergy;
  className?: string;
}) {
  const accent = synergy.type ? getTypeAccent(synergy.type) : null;

  return (
    <AnimatePresence>
      {synergy.active && synergy.type && accent && (
        <motion.div
          key={synergy.type}
          initial={{ opacity: 0, y: -6, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -4, scale: 0.98 }}
          transition={{ type: "spring", damping: 18, stiffness: 280 }}
          className={cn(
            "monotype-synergy-banner rounded-xl px-3 py-2 flex items-center gap-2 border",
            `monotype-banner-${synergy.type in TYPE_ACCENT ? synergy.type : "default"}`,
            className
          )}
          style={
            {
              "--mono-rgb": accent.rgb,
            } as React.CSSProperties
          }
        >
          <span className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center shrink-0" aria-hidden>
            <accent.Icon className="w-4 h-4 text-white/90" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-black uppercase tracking-wide text-white/95 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              Sinergia {synergy.label} ativa!
            </p>
            <p className="text-[10px] text-white/55 mt-0.5">
              +{synergy.bonusPercent}% de dano · time monocromático
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
