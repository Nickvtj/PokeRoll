import type { JitsuElement, JitsuSpecialEffect } from "@/types/jitsu";

const ELEMENTS: JitsuElement[] = ["FOGO", "AGUA", "PLANTA"];

export const JITSU_SPECIAL_META: Record<
  JitsuSpecialEffect,
  { label: string; short: string; color: string }
> = {
  "invert-power": {
    label: "Mundo Invertido",
    short: "Invertido",
    color: "#a78bfa",
  },
  "block-element": {
    label: "Interdição",
    short: "Bloqueio",
    color: "#f87171",
  },
  "buff-next": {
    label: "Poder +2",
    short: "+2",
    color: "#4ade80",
  },
  "debuff-next": {
    label: "Poder −2",
    short: "−2",
    color: "#fb923c",
  },
  "destroy-trophy": {
    label: "Quebra Combo",
    short: "Destruir",
    color: "#f43f5e",
  },
};

const SPECIAL_POOL: JitsuSpecialEffect[] = [
  "invert-power",
  "block-element",
  "buff-next",
  "debuff-next",
  "destroy-trophy",
];

export function pickRandomBlockTarget(cardElement: JitsuElement): JitsuElement {
  const others = ELEMENTS.filter((e) => e !== cardElement);
  return others[Math.floor(Math.random() * others.length)];
}

export function rollSpecialEffect(cardElement: JitsuElement): {
  special: JitsuSpecialEffect;
  blockTarget?: JitsuElement;
} {
  const special = SPECIAL_POOL[Math.floor(Math.random() * SPECIAL_POOL.length)];
  return {
    special,
    blockTarget: special === "block-element" ? pickRandomBlockTarget(cardElement) : undefined,
  };
}

export function describeSpecialOnPlay(
  card: { special?: JitsuSpecialEffect; blockTarget?: JitsuElement; type: JitsuElement },
  side: "player" | "bot"
): string | null {
  if (!card.special) return null;
  const who = side === "player" ? "Você" : "Sensei";
  const meta = JITSU_SPECIAL_META[card.special];
  switch (card.special) {
    case "invert-power":
      return `${who}: ${meta.label} — no empate de elemento, menor poder vence!`;
    case "block-element":
      return `${who}: ${meta.label} — ${card.blockTarget ?? "?"} bloqueado na próxima rodada!`;
    case "buff-next":
      return `${who}: próxima carta ganha +2 de poder!`;
    case "debuff-next":
      return `${who}: próxima carta do rival perde −2 de poder!`;
    case "destroy-trophy":
      return `${who}: ${meta.label} — vitória remove um troféu rival!`;
    default:
      return null;
  }
}
