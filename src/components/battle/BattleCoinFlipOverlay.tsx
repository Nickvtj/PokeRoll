"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface BattleCoinFlipOverlayProps {
  playerStarts: boolean;
}

export function BattleCoinFlipOverlay({ playerStarts }: BattleCoinFlipOverlayProps) {
  const finalRotation = playerStarts ? 0 : 180;

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
      <div
        className={cn(
          "absolute inset-0 transition-opacity duration-700",
          playerStarts
            ? "bg-gradient-to-r from-cyan-500/10 via-transparent to-transparent"
            : "bg-gradient-to-l from-red-500/10 via-transparent to-transparent"
        )}
      />

      <motion.div
        initial={{ opacity: 0, y: -40, scale: 0.6 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35 }}
        className="relative flex flex-col items-center gap-3"
      >
        <p className="text-[10px] uppercase tracking-[0.2em] text-amber-300/90 font-bold">
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
            transition={{ duration: 2.2, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Cara — jogador */}
            <div
              className={cn(
                "absolute inset-0 rounded-full border-[3px] flex flex-col items-center justify-center",
                "[backface-visibility:hidden] [-webkit-backface-visibility:hidden]",
                "bg-gradient-to-br from-cyan-200 via-cyan-400 to-cyan-700 border-cyan-100 shadow-xl shadow-cyan-500/50"
              )}
            >
              <span className="text-[11px] font-black text-cyan-950 uppercase tracking-wide">Cara</span>
              <span className="text-2xl drop-shadow">👤</span>
              <span className="text-[9px] font-bold text-cyan-900/80 mt-0.5">Você</span>
            </div>
            {/* Coroa — oponente */}
            <div
              className={cn(
                "absolute inset-0 rounded-full border-[3px] flex flex-col items-center justify-center",
                "[backface-visibility:hidden] [-webkit-backface-visibility:hidden] [transform:rotateY(180deg)]",
                "bg-gradient-to-br from-orange-300 via-red-500 to-red-800 border-red-100 shadow-xl shadow-red-500/50"
              )}
            >
              <span className="text-[11px] font-black text-red-950 uppercase tracking-wide">Coroa</span>
              <span className="text-2xl drop-shadow">👹</span>
              <span className="text-[9px] font-bold text-red-900/80 mt-0.5">Rival</span>
            </div>
          </motion.div>

          <motion.div
            className={cn(
              "absolute -inset-3 rounded-full blur-xl -z-10",
              playerStarts ? "bg-cyan-400/30" : "bg-red-400/30"
            )}
            animate={{ opacity: [0.3, 0.9, 0.5], scale: [0.9, 1.15, 1] }}
            transition={{ duration: 2.2 }}
          />
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 0.4 }}
          className={cn(
            "text-sm font-bold px-4 py-1.5 rounded-full border backdrop-blur-sm",
            playerStarts
              ? "text-cyan-200 border-cyan-400/40 bg-cyan-500/15"
              : "text-red-200 border-red-400/40 bg-red-500/15"
          )}
        >
          {playerStarts ? "Você começa atacando!" : "Oponente começa atacando!"}
        </motion.p>
      </motion.div>
    </div>
  );
}
