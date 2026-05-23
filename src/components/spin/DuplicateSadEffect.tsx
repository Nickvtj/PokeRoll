"use client";

import { motion } from "framer-motion";
import { CloudRain, Frown } from "lucide-react";

/** Efeito visual "triste" para duplicatas — chuva, tom acinzentado, shake */
export function DuplicateSadEffect() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl z-20">
      {/* Vinheta cinza */}
      <div className="absolute inset-0 bg-slate-900/40 rounded-2xl" />

      {/* Gotas de chuva animadas */}
      {Array.from({ length: 12 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-0.5 h-4 bg-blue-300/30 rounded-full"
          style={{ left: `${8 + i * 8}%`, top: -10 }}
          animate={{ y: [0, 280], opacity: [0, 0.6, 0] }}
          transition={{
            duration: 0.8 + (i % 3) * 0.2,
            repeat: Infinity,
            delay: i * 0.12,
            ease: "linear",
          }}
        />
      ))}

      {/* Ícone triste flutuante */}
      <motion.div
        className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-600/50"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Frown className="w-4 h-4 text-slate-400" />
        <span className="text-xs font-medium text-slate-400">Já tenho esse...</span>
        <CloudRain className="w-4 h-4 text-blue-400/70" />
      </motion.div>
    </div>
  );
}
