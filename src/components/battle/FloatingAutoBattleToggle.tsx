"use client";

import { motion } from "framer-motion";
import { Bot } from "lucide-react";
import { cn } from "@/lib/utils";
import { playUiTab } from "@/lib/ui-sounds";

export type BattleSpeed = 1 | 2 | 3;

interface FloatingAutoBattleToggleProps {
  active: boolean;
  onToggle: () => void;
  speed?: BattleSpeed;
  onSpeedChange?: (speed: BattleSpeed) => void;
}

const SPEEDS: BattleSpeed[] = [1, 2, 3];

export function FloatingAutoBattleToggle({
  active,
  onToggle,
  speed = 1,
  onSpeedChange,
}: FloatingAutoBattleToggleProps) {
  return (
    <div className="fixed bottom-20 lg:bottom-6 right-4 z-[90] flex flex-col items-end gap-2">
      {active && onSpeedChange && (
        <div className="flex items-center gap-1 px-1.5 py-1 rounded-full bg-slate-900/90 border border-white/10 backdrop-blur-md shadow-lg">
          {SPEEDS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => {
                playUiTab();
                onSpeedChange(s);
              }}
              className={cn(
                "px-2 py-0.5 rounded-full text-[10px] font-black transition-all",
                speed === s
                  ? "bg-indigo-500/40 text-indigo-100"
                  : "text-white/40 hover:text-white/70"
              )}
            >
              {s}x
            </button>
          ))}
        </div>
      )}
      <button
        type="button"
        onClick={() => {
          playUiTab();
          onToggle();
        }}
        title={active ? "Batalha automática ligada" : "Batalha automática desligada"}
        className={cn(
          "flex items-center gap-2 px-3 py-2.5 rounded-full",
          "shadow-xl border backdrop-blur-md transition-all",
          active
            ? "bg-indigo-500/25 border-indigo-400/50 text-indigo-200 shadow-indigo-500/20"
            : "bg-slate-900/80 border-white/10 text-white/45 hover:text-white/70"
        )}
      >
        <motion.div animate={active ? { rotate: 360 } : {}} transition={{ duration: 3, repeat: Infinity, ease: "linear" }}>
          <Bot className="w-4 h-4" />
        </motion.div>
        <span className="text-[10px] font-black uppercase tracking-wide hidden sm:inline">
          Auto {active ? "ON" : "OFF"}
        </span>
      </button>
    </div>
  );
}
