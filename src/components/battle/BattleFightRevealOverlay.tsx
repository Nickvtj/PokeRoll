"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { Swords } from "lucide-react";
import { playBattleFightStart } from "@/lib/sound-engine";
import { cn } from "@/lib/utils";

interface BattleFightRevealOverlayProps {
  playerStarts: boolean;
  accentColor?: string;
}

export function BattleFightRevealOverlay({
  playerStarts,
  accentColor,
}: BattleFightRevealOverlayProps) {
  useEffect(() => {
    void playBattleFightStart();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.03 }}
      transition={{ duration: 0.22 }}
      className="absolute inset-0 z-50 overflow-hidden rounded-xl pointer-events-none flex items-center justify-center"
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.35 }}
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-[3px]"
      />

      <div className="relative z-10 flex flex-col items-center gap-5 px-6 text-center">
        <motion.div
          initial={{ rotate: -12, scale: 0 }}
          animate={{ rotate: 0, scale: 1 }}
          transition={{ delay: 0.08, type: "spring", stiffness: 320, damping: 16 }}
          className={cn(
            "w-16 h-16 rounded-2xl flex items-center justify-center border-2 border-white/20",
            "bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600",
            "shadow-[0_0_40px_rgba(99,102,241,0.55)]"
          )}
          style={
            accentColor
              ? { boxShadow: `0 0 36px ${accentColor}66`, borderColor: `${accentColor}55` }
              : undefined
          }
        >
          <Swords className="w-8 h-8 text-white drop-shadow-lg" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4, type: "spring", stiffness: 280 }}
          className="relative px-8 py-3 rounded-2xl border border-white/15 bg-slate-900/60 shadow-[0_0_32px_rgba(99,102,241,0.25)]"
        >
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            className="absolute inset-x-4 top-0 h-[2px] bg-gradient-to-r from-transparent via-white/70 to-transparent"
          />
          <p className="text-4xl sm:text-5xl font-black italic text-white drop-shadow-[0_4px_18px_rgba(0,0,0,0.65)] tracking-tight">
            LUTAR!
          </p>
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.25, duration: 0.3 }}
            className="absolute inset-x-4 bottom-0 h-[2px] bg-gradient-to-r from-transparent via-white/50 to-transparent"
          />
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.35 }}
          className={cn(
            "text-sm font-bold px-4 py-1.5 rounded-full border",
            playerStarts
              ? "text-cyan-200 bg-cyan-500/15 border-cyan-400/35"
              : "text-rose-200 bg-rose-500/15 border-rose-400/35"
          )}
        >
          {playerStarts ? "Você ataca primeiro!" : "O rival ataca primeiro!"}
        </motion.p>
      </div>
    </motion.div>
  );
}
