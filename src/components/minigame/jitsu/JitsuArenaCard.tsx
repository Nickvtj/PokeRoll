"use client";

import { motion } from "framer-motion";
import { JitsuCard } from "@/components/minigame/jitsu/JitsuCard";
import { JITSU_ELEMENT_META } from "@/data/jitsu-cards";
import type { JitsuCard as JitsuCardType } from "@/types/jitsu";

interface JitsuArenaCardProps {
  card: JitsuCardType;
  side: "player" | "bot";
  winnerFlash: "player" | "bot" | "tie" | null;
  isResolving: boolean;
}

const FLY_FROM = {
  player: { x: -24, y: 72 },
  bot: { x: 24, y: -72 },
};

export function JitsuArenaCard({ card, side, winnerFlash, isResolving }: JitsuArenaCardProps) {
  const meta = JITSU_ELEMENT_META[card.type];
  const from = FLY_FROM[side];
  const playerWon = winnerFlash === "player";
  const botWon = winnerFlash === "bot";
  const won = side === "player" ? playerWon : botWon;
  const lost = side === "player" ? botWon : playerWon;

  return (
    <motion.div
      key={card.instanceId}
      initial={{ x: from.x, y: from.y, scale: 0.7, opacity: 0 }}
      animate={{ x: 0, y: 0, scale: 1, opacity: 1 }}
      transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
      className="relative"
    >
      <motion.div
        initial={{ rotateY: 88, opacity: 0.5 }}
        animate={{ rotateY: 0, opacity: 1 }}
        transition={{ duration: 0.38, delay: 0.12, ease: "easeOut" }}
        style={{ transformStyle: "preserve-3d", perspective: 800 }}
      >
        <motion.div
          animate={lost && isResolving ? { x: [0, -5, 5, -3, 0] } : { x: 0 }}
          transition={{ duration: 0.38, ease: "easeInOut" }}
        >
          <div
            className="absolute -inset-2 rounded-2xl blur-md opacity-50 pointer-events-none -z-10"
            style={{ background: `radial-gradient(circle, ${meta.particle}44, transparent 70%)` }}
          />
          <JitsuCard
            card={card}
            size="md"
            dimmed={lost && isResolving}
            pulsing={won && isResolving}
          />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
