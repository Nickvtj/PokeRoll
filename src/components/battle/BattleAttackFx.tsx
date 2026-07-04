"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Flame, Moon, Skull, Zap, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StatusEffect } from "@/types/battle";

interface BattleAttackFxProps {
  moveType?: string;
  statusApplied?: StatusEffect | string;
  phase: "strike" | "flash" | "impact";
  side: "player" | "enemy";
}

export function BattleAttackFx({ moveType, statusApplied, phase, side }: BattleAttackFxProps) {
  const active = phase === "flash" || phase === "impact";
  if (!active) return null;

  const type = moveType ?? "normal";

  return (
    <div className="battle-attack-fx pointer-events-none" aria-hidden>
      <TypeEffect type={type} phase={phase} />
      
      {statusApplied === "sleep" && (
        <motion.span
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: -20 }}
          className="absolute top-0 left-1/2 -translate-x-1/2 font-black text-indigo-300 drop-shadow-md z-30"
        >
          Zzz
        </motion.span>
      )}
    </div>
  );
}

function TypeEffect({ type, phase }: { type: string; phase: string }) {
  const isImpact = phase === "impact";
  
  // Cores baseadas no tipo
  const colors: Record<string, string> = {
    fire: "#fb923c",
    water: "#38bdf8",
    grass: "#4ade80",
    electric: "#facc15",
    ice: "#67e2f9",
    fighting: "#f87171",
    poison: "#c084fc",
    ground: "#d97706",
    flying: "#818cf8",
    psychic: "#f472b6",
    bug: "#a3e635",
    rock: "#a8a29e",
    ghost: "#a78bfa",
    dragon: "#6366f1",
    dark: "#475569",
    steel: "#94a3b8",
    fairy: "#f472b6",
    normal: "#cbd5e1",
  };

  const color = colors[type] || colors.normal;

  return (
    <div className="absolute inset-0 z-20 pointer-events-none">
      {/* Brilho de fundo do tipo - expandido para vazar */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: [0, 0.7, 0], scale: [0.8, 1.5, 2] }}
        transition={{ duration: 0.6 }}
        className="absolute inset-[-20%] rounded-full blur-2xl"
        style={{
          background: `radial-gradient(circle, ${color}aa, transparent 70%)`,
        }}
      />

      {/* Partículas específicas */}
      <div className="absolute inset-0 flex items-center justify-center">
        {type === "fire" && <FireParticles color={color} />}
        {type === "water" && <WaterParticles color={color} />}
        {type === "electric" && <ElectricParticles color={color} />}
        {type === "grass" && <GrassParticles color={color} />}
        {type === "ice" && <IceParticles color={color} />}
        {type === "poison" && <PoisonParticles color={color} />}
        {type === "fighting" && <FightingParticles color={color} />}
        {type === "psychic" && <PsychicParticles color={color} />}
        {type === "ghost" && <GhostParticles color={color} />}
        {type === "dragon" && <DragonParticles color={color} />}
        {/* Fallback para outros tipos usa partículas de impacto simples */}
        {!["fire", "water", "electric", "grass", "ice", "poison", "fighting", "psychic", "ghost", "dragon"].includes(type) && (
          <DefaultParticles color={color} />
        )}
      </div>

      {/* Flash de impacto (branco) */}
      {isImpact && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.8, 0] }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 bg-white"
        />
      )}
    </div>
  );
}

// Sub-componentes de partículas intensificados
function FireParticles({ color }: { color: string }) {
  return (
    <>
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ y: 40, x: (i - 5.5) * 8, opacity: 0, scale: 0 }}
          animate={{ 
            y: [-20, -100], 
            x: (i - 5.5) * 12 + (Math.random() * 20 - 10), 
            opacity: [0, 1, 0.8, 0], 
            scale: [0.5, 2, 0.5] 
          }}
          transition={{ duration: 0.8, delay: i * 0.03 }}
          className="absolute w-6 h-6 rounded-full blur-[4px]"
          style={{ backgroundColor: color, filter: 'brightness(1.5)' }}
        />
      ))}
    </>
  );
}

function WaterParticles({ color }: { color: string }) {
  return (
    <>
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ y: -40, x: (i - 7) * 6, opacity: 0, scale: 0 }}
          animate={{ 
            y: [-40, 60, 80], 
            x: (i - 7) * 15 + (Math.random() * 30 - 15), 
            opacity: [0, 1, 0], 
            scale: [0.5, 1.5, 0.2] 
          }}
          transition={{ duration: 0.6, delay: i * 0.02 }}
          className="absolute w-4 h-4 rounded-full border-2 border-white/40"
          style={{ backgroundColor: color }}
        />
      ))}
    </>
  );
}

function ElectricParticles({ color }: { color: string }) {
  return (
    <svg className="absolute w-[150%] h-[150%] overflow-visible">
      {[...Array(5)].map((_, i) => (
        <motion.path
          key={i}
          d={`M ${Math.random() * 100} 0 L ${Math.random() * 100} 50 L ${Math.random() * 100} 100 L ${Math.random() * 100} 150`}
          stroke={color}
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: [0, 1], opacity: [0, 1, 1, 0] }}
          transition={{ duration: 0.4, delay: i * 0.05 }}
          style={{ filter: 'drop-shadow(0 0 8px yellow)' }}
        />
      ))}
    </svg>
  );
}

function GrassParticles({ color }: { color: string }) {
  return (
    <>
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ rotate: 0, scale: 0, opacity: 0 }}
          animate={{ 
            rotate: 360, 
            scale: [0, 1, 0.5], 
            opacity: [0, 1, 0],
            x: (i - 2.5) * 20,
            y: (i % 2 === 0 ? -20 : 20)
          }}
          transition={{ duration: 0.7 }}
          className="absolute w-4 h-2 rounded-full bg-green-500"
          style={{ borderRadius: '100% 0% 100% 0% / 100% 0% 100% 0%' }}
        />
      ))}
    </>
  );
}

function IceParticles({ color }: { color: string }) {
  return (
    <div className="flex gap-1">
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ scale: 0, rotate: 45, opacity: 0 }}
          animate={{ scale: [0, 1.2, 0.8], opacity: [0, 1, 0], y: [-10, 10] }}
          transition={{ duration: 0.5, delay: i * 0.08 }}
          className="w-3 h-3 bg-white/80 rotate-45 border border-cyan-200"
        />
      ))}
    </div>
  );
}

function PoisonParticles({ color }: { color: string }) {
  return (
    <>
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ 
            scale: [0, 1.5, 2], 
            opacity: [0, 0.8, 0],
            x: Math.sin(i) * 30,
            y: Math.cos(i) * 30
          }}
          transition={{ duration: 0.8 }}
          className="absolute w-4 h-4 rounded-full blur-md"
          style={{ backgroundColor: color }}
        />
      ))}
    </>
  );
}

function FightingParticles({ color }: { color: string }) {
  return (
    <motion.div
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: [0.5, 1.5, 2], opacity: [0, 1, 0] }}
      transition={{ duration: 0.4 }}
      className="w-16 h-16 rounded-full border-4"
      style={{ borderColor: color }}
    />
  );
}

function PsychicParticles({ color }: { color: string }) {
  return (
    <>
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ scale: 0.1, opacity: 0 }}
          animate={{ scale: [0.1, 2], opacity: [0, 0.6, 0] }}
          transition={{ duration: 0.6, delay: i * 0.2 }}
          className="absolute w-20 h-20 rounded-full border-2"
          style={{ borderColor: color }}
        />
      ))}
    </>
  );
}

function GhostParticles({ color }: { color: string }) {
  return (
    <>
      {[...Array(4)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 1 }}
          animate={{ 
            opacity: [0, 0.5, 0], 
            scale: [1, 1.5],
            x: (i - 1.5) * 15,
            y: [0, -20, -40]
          }}
          transition={{ duration: 1, repeat: Infinity }}
          className="absolute w-8 h-8 rounded-full blur-xl"
          style={{ backgroundColor: color }}
        />
      ))}
    </>
  );
}

function DragonParticles({ color }: { color: string }) {
  return (
    <div className="relative">
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: [0, 2, 0], opacity: [0, 1, 0], rotate: [0, 180] }}
        transition={{ duration: 0.6 }}
        className="w-12 h-12 border-t-4 border-r-4 rounded-full"
        style={{ borderColor: color }}
      />
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: [0, 1.5, 0], opacity: [0, 1, 0], rotate: [180, 0] }}
        transition={{ duration: 0.6 }}
        className="absolute inset-0 w-12 h-12 border-b-4 border-l-4 rounded-full"
        style={{ borderColor: "#818cf8" }}
      />
    </div>
  );
}

function DefaultParticles({ color }: { color: string }) {
  return (
    <>
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ 
            opacity: [0, 1, 0], 
            scale: [0, 1, 0.5],
            x: Math.cos((i * 60) * Math.PI / 180) * 40,
            y: Math.sin((i * 60) * Math.PI / 180) * 40
          }}
          transition={{ duration: 0.4 }}
          className="absolute w-2 h-2 rounded-full"
          style={{ backgroundColor: color }}
        />
      ))}
    </>
  );
}

export function BattleStatusBadge({
  effect,
  compact = false,
}: {
  effect: StatusEffect;
  compact?: boolean;
}) {
  const config: Record<
    StatusEffect,
    { Icon: LucideIcon; label: string; short: string; className: string }
  > = {
    burn: { Icon: Flame, label: "Queimado", short: "QUE", className: "battle-status-burn" },
    paralyze: { Icon: Zap, label: "Paralisado", short: "PAR", className: "battle-status-paralyze" },
    poison: { Icon: Skull, label: "Envenenado", short: "ENV", className: "battle-status-poison" },
    sleep: { Icon: Moon, label: "Dormindo", short: "SON", className: "battle-status-sleep" },
  };

  const c = config[effect];
  const Icon = c.Icon;
  return (
    <span
      className={cn("battle-status-badge", c.className, compact && "battle-status-badge-compact")}
    >
      <Icon className={cn("shrink-0", compact ? "w-2.5 h-2.5" : "w-3 h-3")} aria-hidden />
      {compact ? c.short : c.label}
    </span>
  );
}

export function BattleSleepOverlay() {
  return (
    <div className="battle-sleep-overlay pointer-events-none" aria-hidden>
      <span className="battle-sleep-zzz">Z</span>
      <span className="battle-sleep-zzz battle-sleep-zzz-2">z</span>
      <span className="battle-sleep-zzz battle-sleep-zzz-3">z</span>
    </div>
  );
}
