"use client";

import { motion } from "framer-motion";
import { Flame } from "lucide-react";
import { cn } from "@/lib/utils";

interface ComboCounterProps {
  combo: number;
  maxCombo: number;
}

export function ComboCounter({ combo, maxCombo }: ComboCounterProps) {
  const mult = 1 + Math.floor(combo / 5) * 0.25;

  return (
    <div className="flex items-center gap-2">
      <motion.div
        animate={combo > 0 ? { scale: [1, 1.2, 1] } : {}}
        className={cn(
          "flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold",
          combo >= 10
            ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
            : combo >= 5
              ? "bg-amber-500/20 text-amber-400"
              : "bg-white/5 text-white/50"
        )}
      >
        <Flame className="w-3.5 h-3.5" />
        x{combo}
      </motion.div>
      {combo >= 5 && (
        <span className="text-[10px] text-amber-400/70">{mult.toFixed(1)}x</span>
      )}
      {maxCombo > 0 && (
        <span className="text-[10px] text-white/30">max {maxCombo}</span>
      )}
    </div>
  );
}
