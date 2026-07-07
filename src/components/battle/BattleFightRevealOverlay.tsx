"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { playBattleFightStart } from "@/lib/sound-engine";
import { startBattleMusic } from "@/lib/battle-music";
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
    startBattleMusic();
  }, []);

  const accent = accentColor ?? "#6366f1";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      className="absolute inset-0 z-50 overflow-hidden rounded-md pointer-events-none flex items-center justify-center"
    >
      {/* Fundo opaco, cobre totalmente o campo até as pokébolas caírem */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(120% 90% at 50% 30%, ${accent}2e 0%, transparent 55%), linear-gradient(180deg, #0b0e16 0%, #141a26 50%, #0b0e16 100%)`,
        }}
      />

      {/* Faixas diagonais em movimento (linhas de velocidade) */}
      <motion.div
        className="absolute inset-0 opacity-70"
        initial={{ backgroundPositionX: "0px" }}
        animate={{ backgroundPositionX: "48px" }}
        transition={{ duration: 0.5, repeat: Infinity, ease: "linear" }}
        style={{
          background: `repeating-linear-gradient(115deg, ${accent}22 0 2px, transparent 2px 24px)`,
        }}
      />

      {/* Banda diagonal que passa por trás do texto */}
      <motion.div
        className="absolute left-0 right-0 h-20 sm:h-24"
        initial={{ x: "-120%", skewX: "-18deg", opacity: 0 }}
        animate={{ x: "120%", opacity: [0, 1, 0] }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        style={{ background: `linear-gradient(90deg, transparent, ${accent}55, transparent)` }}
      />

      <div className="relative z-10 flex flex-col items-center gap-3 px-4 text-center">
        <motion.p
          initial={{ scale: 0.55, opacity: 0 }}
          animate={{ scale: [0.55, 1.14, 1], opacity: 1 }}
          transition={{ duration: 0.38, ease: "easeOut" }}
          className="battle-fight-reveal-text text-4xl sm:text-5xl font-black tracking-tight text-white"
          style={{ textShadow: `0 3px 0 #1a1f2c, 0 0 22px ${accent}` }}
        >
          LUTAR!
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.25 }}
          className={cn(
            "battle-fight-reveal-sub text-[10px] font-bold px-3 py-1 rounded border",
            playerStarts
              ? "text-[#d8f0ff] bg-[#285878]/90 border-[#5090b0]/60"
              : "text-[#ffd8d0] bg-[#783028]/90 border-[#b05048]/60"
          )}
        >
          {playerStarts ? "Você ataca primeiro!" : "O rival ataca primeiro!"}
        </motion.p>
      </div>
    </motion.div>
  );
}
