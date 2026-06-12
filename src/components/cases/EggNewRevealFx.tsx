"use client";

import { motion } from "framer-motion";

interface EggNewRevealFxProps {
  color: string;
  isShiny?: boolean;
}

export function EggNewRevealFx({ color, isShiny }: EggNewRevealFxProps) {
  const ringCount = isShiny ? 4 : 3;

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 120, damping: 16, delay: 0.05 }}
        className="absolute w-[92%] aspect-square max-w-[280px]"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: isShiny ? 18 : 24, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 rounded-full border-2 border-dashed opacity-25"
          style={{ borderColor: color }}
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: isShiny ? 14 : 20, repeat: Infinity, ease: "linear" }}
          className="absolute inset-[12%] rounded-full border opacity-35"
          style={{ borderColor: color }}
        />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: isShiny ? 10 : 16, repeat: Infinity, ease: "linear" }}
          className="absolute inset-[24%] rounded-full border border-dotted opacity-20"
          style={{ borderColor: color }}
        />

        {Array.from({ length: ringCount }).map((_, i) => (
          <motion.div
            key={i}
            animate={{
              scale: [0.85 + i * 0.05, 1.05 + i * 0.04, 0.85 + i * 0.05],
              opacity: [0.12, 0.28, 0.12],
            }}
            transition={{
              duration: 2.2 + i * 0.35,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.2,
            }}
            className="absolute inset-[8%] rounded-full"
            style={{
              background: `radial-gradient(circle, ${color}${isShiny ? "55" : "40"} 0%, transparent 68%)`,
            }}
          />
        ))}

        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: isShiny ? 8 : 12, repeat: Infinity, ease: "linear" }}
          className="absolute inset-[18%] opacity-20"
          style={{
            background: `conic-gradient(from 0deg, transparent, ${color}, transparent, ${color}, transparent)`,
            borderRadius: "50%",
            filter: "blur(6px)",
          }}
        />

        {[0, 45, 90, 135].map((deg) => (
          <motion.span
            key={deg}
            animate={{ opacity: [0.15, 0.45, 0.15], scale: [0.9, 1.05, 0.9] }}
            transition={{ duration: 1.8, repeat: Infinity, delay: deg / 180 }}
            className="absolute left-1/2 top-1/2 w-2 h-2 -ml-1 -mt-1 rounded-full"
            style={{
              backgroundColor: color,
              transform: `rotate(${deg}deg) translateY(-${isShiny ? 118 : 100}px)`,
            }}
          />
        ))}
      </motion.div>
    </div>
  );
}
