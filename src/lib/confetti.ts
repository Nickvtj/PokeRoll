import confetti from "canvas-confetti";
import { getRarityColor } from "@/data/rarity";
import type { Rarity } from "@/types";

const CONFETTI_Z = 10001;

/** Dispara confetti acima do modal (z-index alto) */
export function fireCelebrationConfetti(rarity: Rarity, isNew: boolean) {
  if (!isNew) return;

  const color = getRarityColor(rarity);
  const base = { zIndex: CONFETTI_Z, disableForReducedMotion: true };

  if (rarity === "legendary") {
    const duration = 3500;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        ...base,
        particleCount: 6,
        angle: 60,
        spread: 60,
        origin: { x: 0, y: 0.65 },
        colors: [color, "#fbbf24", "#f59e0b", "#ffffff"],
      });
      confetti({
        ...base,
        particleCount: 6,
        angle: 120,
        spread: 60,
        origin: { x: 1, y: 0.65 },
        colors: [color, "#fbbf24", "#f59e0b", "#ffffff"],
      });
      confetti({
        ...base,
        particleCount: 4,
        spread: 100,
        origin: { x: 0.5, y: 0.5 },
        colors: [color, "#ffffff"],
      });

      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
    return;
  }

  if (rarity === "epic") {
    confetti({
      ...base,
      particleCount: 100,
      spread: 80,
      origin: { y: 0.55 },
      colors: [color, "#a855f7", "#ffffff", "#e879f9"],
    });
    return;
  }

  if (rarity === "rare") {
    confetti({
      ...base,
      particleCount: 70,
      spread: 65,
      origin: { y: 0.6 },
      colors: [color, "#3b82f6", "#60a5fa", "#ffffff"],
    });
    return;
  }

  // Comum / Incomum — burst menor mas visível
  confetti({
    ...base,
    particleCount: 50,
    spread: 55,
    origin: { y: 0.65 },
    colors: [color, "#22c55e", "#ffffff", "#6366f1"],
  });
}
