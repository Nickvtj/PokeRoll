"use client";

import { motion } from "framer-motion";
import { Bot } from "lucide-react";
import { cn } from "@/lib/utils";
import { playUiTab } from "@/lib/ui-sounds";

interface FloatingAutoBattleToggleProps {
  active: boolean;
  onToggle: () => void;
}

export function FloatingAutoBattleToggle({ active, onToggle }: FloatingAutoBattleToggleProps) {
  return (
    <button
      type="button"
      onClick={() => {
        playUiTab();
        onToggle();
      }}
      title={active ? "Batalha automática ligada" : "Batalha automática desligada"}
      className={cn(
        "fixed bottom-20 lg:bottom-6 right-4 z-[90] flex items-center gap-2 px-3 py-2.5 rounded-full",
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
  );
}
