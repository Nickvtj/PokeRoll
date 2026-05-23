"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Coins } from "lucide-react";
import { useEconomyStore } from "@/stores/economy-store";

/** Partículas flutuantes de moeda quando o jogador ganha/perde */
export function RewardAnimation() {
  const coinAnimation = useEconomyStore((s) => s.coinAnimation);

  return (
    <AnimatePresence>
      {coinAnimation && (
        <motion.div
          key={coinAnimation}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 pointer-events-none z-[9998] overflow-hidden"
        >
          {Array.from({ length: 8 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{
                opacity: 1,
                x: "50vw",
                y: "50vh",
                scale: 0,
              }}
              animate={{
                opacity: 0,
                x: `${30 + Math.random() * 40}vw`,
                y: `${10 + Math.random() * 30}vh`,
                scale: 1.2,
                rotate: Math.random() * 360,
              }}
              transition={{ duration: 0.8, delay: i * 0.05 }}
              className={
                coinAnimation === "gain" ? "text-amber-400" : "text-red-400"
              }
            >
              <Coins className="w-6 h-6" />
            </motion.div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
