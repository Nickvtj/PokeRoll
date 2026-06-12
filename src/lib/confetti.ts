import confetti from "canvas-confetti";
import { getRarityColor } from "@/data/rarity";
import { getVisualQualityFromDom } from "@/lib/visual-quality";
import type { Rarity } from "@/types";

const CONFETTI_Z = 10001;

function confettiScale(): number {
  const quality = getVisualQualityFromDom();
  if (quality === "low") return 0.35;
  if (quality === "medium") return 0.55;
  return 1;
}

function shinyDurationMs(): number {
  const quality = getVisualQualityFromDom();
  if (quality === "low") return 1800;
  if (quality === "medium") return 2800;
  return 4500;
}

/** Confetti épico dourado — desbloqueio shiny */
export function fireShinyConfetti() {
  const scale = confettiScale();
  const base = { zIndex: CONFETTI_Z, disableForReducedMotion: true };
  const colors = ["#fde047", "#fbbf24", "#f59e0b", "#ffffff", "#fef3c7", "#a855f7"];
  const duration = shinyDurationMs();
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

/** Confetti leve ao desbloquear Pokémon novo (comum / incomum / raro) */
export function fireNewPokemonConfetti(rarity: Rarity) {
  const color = getRarityColor(rarity);
  const scale = confettiScale();
  const base = { zIndex: CONFETTI_Z, disableForReducedMotion: true };
  const colors = [color, "#ffffff", "#a855f7", "#6366f1"];

  confetti({
    ...base,
    particleCount: Math.round(28 * scale),
    spread: 65,
    origin: { y: 0.52 },
    colors,
  });
  confetti({
    ...base,
    particleCount: Math.round(12 * scale),
    angle: 60,
    spread: 45,
    origin: { x: 0.15, y: 0.6 },
    colors,
  });
  confetti({
    ...base,
    particleCount: Math.round(12 * scale),
    angle: 120,
    spread: 45,
    origin: { x: 0.85, y: 0.6 },
    colors,
  });
}

/** Confetti de coleção — apenas épico e lendário novos */
export function fireCelebrationConfetti(rarity: Rarity, isNew: boolean) {
  if (!isNew) return;
  if (rarity !== "legendary" && rarity !== "epic") return;

  const color = getRarityColor(rarity);
  const scale = confettiScale();
  const base = { zIndex: CONFETTI_Z, disableForReducedMotion: true };

  if (rarity === "legendary") {
    const duration = getVisualQualityFromDom() === "low" ? 2200 : 3500;
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

  confetti({
    ...base,
    particleCount: Math.round(55 * scale),
    spread: 80,
    origin: { y: 0.55 },
    colors: [color, "#a855f7", "#ffffff", "#e879f9"],
  });
}

/** Confete curto (legado) */
export function fireHighScoreConfetti() {
  fireMinigameRecordConfetti();
}

/** Vitória no Desafio Elemental */
export function fireJitsuVictoryConfetti() {
  const scale = confettiScale();
  const base = { zIndex: CONFETTI_Z, disableForReducedMotion: true };
  const colors = ["#fb923c", "#38bdf8", "#4ade80", "#facc15", "#ffffff"];

  confetti({
    ...base,
    particleCount: Math.round(18 * scale),
    angle: 60,
    spread: 55,
    origin: { x: 0, y: 0.6 },
    colors,
  });
  confetti({
    ...base,
    particleCount: Math.round(18 * scale),
    angle: 120,
    spread: 55,
    origin: { x: 1, y: 0.6 },
    colors,
  });
  confetti({
    ...base,
    particleCount: Math.round(12 * scale),
    spread: 70,
    origin: { x: 0.5, y: 0.5 },
    colors,
    shapes: ["star"],
  });
}

/** Celebração leve de novo recorde nos minigames */
export function fireMinigameRecordConfetti() {
  const scale = confettiScale();
  const base = { zIndex: CONFETTI_Z, disableForReducedMotion: true };
  const colors = ["#facc15", "#fbbf24", "#ffffff", "#a855f7"];

  confetti({
    ...base,
    particleCount: Math.round(22 * scale),
    angle: 60,
    spread: 50,
    origin: { x: 0, y: 0.65 },
    colors,
  });
  confetti({
    ...base,
    particleCount: Math.round(22 * scale),
    angle: 120,
    spread: 50,
    origin: { x: 1, y: 0.65 },
    colors,
  });
  confetti({
    ...base,
    particleCount: Math.round(10 * scale),
    spread: 60,
    origin: { x: 0.5, y: 0.55 },
    colors,
    shapes: ["star"],
  });
}
