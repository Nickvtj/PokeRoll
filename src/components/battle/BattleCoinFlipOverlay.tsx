"use client";

import { motion } from "framer-motion";
import {
  BATTLE_COIN_REVEAL_MS,
} from "@/data/economy-balance";
import { cn } from "@/lib/utils";

interface BattleCoinFlipOverlayProps {
  playerStarts: boolean;
}

const SPIN_DURATION_SEC = BATTLE_COIN_REVEAL_MS / 1000 + 0.15;
const REVEAL_TEXT_DELAY_SEC = BATTLE_COIN_REVEAL_MS / 1000;

export function BattleCoinFlipOverlay({ playerStarts }: BattleCoinFlipOverlayProps) {
  const finalRotation = playerStarts ? 0 : 180;

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none overflow-hidden">
      <div
        className={cn(
          "absolute inset-0 transition-opacity duration-700",
          playerStarts
            ? "bg-gradient-to-r from-cyan-500/8 via-transparent to-transparent"
            : "bg-gradient-to-l from-red-500/8 via-transparent to-transparent"
        )}
      />

      <motion.div
        initial={{ opacity: 0, y: -40, scale: 0.6 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="relative flex flex-col items-center gap-2"
      >
        <p className="text-[10px] uppercase tracking-[0.2em] text-amber-300/80 font-bold drop-shadow">
          Cara ou coroa
        </p>

        <div className="relative [perspective:900px] w-28 h-28">
          <motion.div
            className="relative w-full h-full [transform-style:preserve-3d]"
            initial={{ rotateY: 0, rotateX: 24, y: -60 }}
            animate={{
              rotateY: [0, 1080 + finalRotation],
              rotateX: [24, 8, 18, 8],
              y: [-60, 0, -12, 0],
            }}
            transition={{ duration: SPIN_DURATION_SEC, ease: [0.22, 1, 0.36, 1] }}
          >
            <div
              className={cn(
                "absolute inset-0 rounded-full flex flex-col items-center justify-center",
                "[backface-visibility:hidden] [-webkit-backface-visibility:hidden]",
                "bg-gradient-to-br from-cyan-200 via-cyan-400 to-cyan-700 shadow-[0_0_28px_rgba(34,211,238,0.45)]"
              )}
            >
              <span className="text-[11px] font-black text-cyan-950 uppercase tracking-wide">
                Cara
              </span>
              <span className="text-2xl drop-shadow">👤</span>
              <span className="text-[9px] font-bold text-cyan-900/80 mt-0.5">Você</span>
            </div>
            <div
              className={cn(
                "absolute inset-0 rounded-full flex flex-col items-center justify-center",
                "[backface-visibility:hidden] [-webkit-backface-visibility:hidden] [transform:rotateY(180deg)]",
                "bg-gradient-to-br from-orange-300 via-red-500 to-red-800 shadow-[0_0_28px_rgba(248,113,113,0.45)]"
              )}
            >
              <span className="text-[11px] font-black text-red-950 uppercase tracking-wide">
                Coroa
              </span>
              <span className="text-2xl drop-shadow">👹</span>
              <span className="text-[9px] font-bold text-red-900/80 mt-0.5">Rival</span>
            </div>
          </motion.div>

          <motion.div
            className={cn(
              "absolute -inset-4 rounded-full blur-2xl -z-10",
              playerStarts ? "bg-cyan-400/25" : "bg-red-400/25"
            )}
            animate={{ opacity: [0.2, 0.75, 0.35], scale: [0.92, 1.12, 1] }}
            transition={{ duration: SPIN_DURATION_SEC }}
          />
        </div>

        <motion.p
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: REVEAL_TEXT_DELAY_SEC, duration: 0.45 }}
          className={cn(
            "text-sm font-bold px-4 py-1.5 rounded-full backdrop-blur-sm shadow-lg",
            playerStarts
              ? "text-cyan-100 bg-cyan-500/20 shadow-cyan-500/20"
              : "text-red-100 bg-red-500/20 shadow-red-500/20"
          )}
        >
          {playerStarts ? "Você começa atacando!" : "Oponente começa atacando!"}
        </motion.p>
      </motion.div>
    </div>
  );
}
