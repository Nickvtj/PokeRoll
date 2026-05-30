import confetti from "canvas-confetti";
import { getRarityColor } from "@/data/rarity";
import { getVisualQualityFromDom } from "@/lib/visual-quality";
import type { Rarity } from "@/types";

const CONFETTI_Z = 10001;

function confettiScale(): number {
  const quality = getVisualQualityFromDom();
  if (quality === "low") return 0.4;
  if (quality === "medium") return 0.7;
  return 1;
}

/** Confetti épico dourado — desbloqueio shiny */
export function fireShinyConfetti() {
  const scale = confettiScale();
  const base = { zIndex: CONFETTI_Z, disableForReducedMotion: true };
  const colors = ["#fde047", "#fbbf24", "#f59e0b", "#ffffff", "#fef3c7", "#a855f7"];
  const duration = 4500;
  const end = Date.now() + duration;

  const frame = () => {
    confetti({
      ...base,
      particleCount: Math.round(8 * scale),
      angle: 60,
      spread: 70,
      origin: { x: 0, y: 0.6 },
      colors,
    });
    confetti({
      ...base,
      particleCount: Math.round(8 * scale),
      angle: 120,
      spread: 70,
      origin: { x: 1, y: 0.6 },
      colors,
    });
    confetti({
      ...base,
      particleCount: Math.round(6 * scale),
      spread: 120,
      origin: { x: 0.5, y: 0.45 },
      colors,
      shapes: ["star"],
    });

    if (Date.now() < end) requestAnimationFrame(frame);
  };
  frame();
}

export function fireCelebrationConfetti(rarity: Rarity, isNew: boolean) {
  if (!isNew) return;

  const color = getRarityColor(rarity);
  const scale = confettiScale();
  const base = { zIndex: CONFETTI_Z, disableForReducedMotion: true };

  if (rarity === "legendary") {
    const duration = 3500;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        ...base,
        particleCount: Math.round(6 * scale),
        angle: 60,
        spread: 60,
        origin: { x: 0, y: 0.65 },
        colors: [color, "#fbbf24", "#f59e0b", "#ffffff"],
      });
      confetti({
        ...base,
        particleCount: Math.round(6 * scale),
        angle: 120,
        spread: 60,
        origin: { x: 1, y: 0.65 },
        colors: [color, "#fbbf24", "#f59e0b", "#ffffff"],
      });
      confetti({
        ...base,
        particleCount: Math.round(4 * scale),
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
      particleCount: Math.round(100 * scale),
      spread: 80,
      origin: { y: 0.55 },
      colors: [color, "#a855f7", "#ffffff", "#e879f9"],
    });
    return;
  }

  if (rarity === "rare") {
    confetti({
      ...base,
      particleCount: Math.round(70 * scale),
      spread: 65,
      origin: { y: 0.6 },
      colors: [color, "#3b82f6", "#60a5fa", "#ffffff"],
    });
    return;
  }

  confetti({
    ...base,
    particleCount: Math.round(50 * scale),
    spread: 55,
    origin: { y: 0.65 },
    colors: [color, "#22c55e", "#ffffff", "#6366f1"],
  });
}

export function fireHighScoreConfetti() {
  const scale = confettiScale();
  const base = { zIndex: CONFETTI_Z, disableForReducedMotion: true };
  
  // Explosão lateral esquerda
  confetti({
    ...base,
    particleCount: Math.round(40 * scale),
    angle: 60,
    spread: 55,
    origin: { x: 0, y: 0.7 },
    colors: ["#facc15", "#fbbf24", "#ffffff", "#6366f1"],
  });
  
  // Explosão lateral direita
  confetti({
    ...base,
    particleCount: Math.round(40 * scale),
    angle: 120,
    spread: 55,
    origin: { x: 1, y: 0.7 },
    colors: ["#facc15", "#fbbf24", "#ffffff", "#6366f1"],
  });
  
  // Chuva central de estrelas
  confetti({
    ...base,
    particleCount: Math.round(20 * scale),
    spread: 80,
    origin: { x: 0.5, y: 0.6 },
    colors: ["#facc15", "#ffffff"],
    shapes: ["star"],
  });
}
