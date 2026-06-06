import {
  JITSU_COINS_WIN_MAX,
  JITSU_COINS_WIN_MIN,
} from "@/data/economy-balance";
import type { JitsuBeltConfig, JitsuBeltId } from "@/types/jitsu";

export const JITSU_BELTS: JitsuBeltConfig[] = [
  { id: "white", label: "Faixa Branca", emoji: "⚪", color: "#e2e8f0", minXp: 0 },
  { id: "yellow", label: "Faixa Amarela", emoji: "🟡", color: "#facc15", minXp: 3 },
  { id: "orange", label: "Faixa Laranja", emoji: "🟠", color: "#fb923c", minXp: 8 },
  { id: "green", label: "Faixa Verde", emoji: "🟢", color: "#4ade80", minXp: 15 },
  { id: "blue", label: "Faixa Azul", emoji: "🔵", color: "#38bdf8", minXp: 25 },
  { id: "purple", label: "Faixa Roxa", emoji: "🟣", color: "#a78bfa", minXp: 40 },
  { id: "brown", label: "Faixa Marrom", emoji: "🟤", color: "#a16207", minXp: 60 },
  { id: "black", label: "Faixa Preta", emoji: "⚫", color: "#1e293b", minXp: 90 },
];

export function getBeltForXp(xp: number): JitsuBeltConfig {
  let current = JITSU_BELTS[0];
  for (const belt of JITSU_BELTS) {
    if (xp >= belt.minXp) current = belt;
  }
  return current;
}

export function getNextBelt(current: JitsuBeltConfig): JitsuBeltConfig | null {
  const idx = JITSU_BELTS.findIndex((b) => b.id === current.id);
  return idx < JITSU_BELTS.length - 1 ? JITSU_BELTS[idx + 1] : null;
}

export interface JitsuBeltProgressInfo {
  current: JitsuBeltConfig;
  next: JitsuBeltConfig | null;
  beltIndex: number;
  winsInSegment: number;
  segmentSize: number;
  winsToNext: number;
  segmentProgress: number;
  totalWins: number;
}

export function getBeltProgress(totalWins: number): JitsuBeltProgressInfo {
  const current = getBeltForXp(totalWins);
  const next = getNextBelt(current);
  const beltIndex = JITSU_BELTS.findIndex((b) => b.id === current.id);

  if (!next) {
    return {
      current,
      next: null,
      beltIndex,
      winsInSegment: totalWins - current.minXp,
      segmentSize: 0,
      winsToNext: 0,
      segmentProgress: 1,
      totalWins,
    };
  }

  const segmentSize = next.minXp - current.minXp;
  const winsInSegment = totalWins - current.minXp;

  return {
    current,
    next,
    beltIndex,
    winsInSegment,
    segmentSize,
    winsToNext: next.minXp - totalWins,
    segmentProgress: Math.min(1, winsInSegment / segmentSize),
    totalWins,
  };
}

export const JITSU_BELT_RANK_REWARDS: Partial<Record<JitsuBeltConfig["id"], number>> = {
  green: 50,
  blue: 75,
  purple: 100,
  brown: 150,
  black: 250,
};

/** Bônus extra de moedas por vitória conforme a faixa atual */
export const JITSU_BELT_WIN_BONUS: Record<JitsuBeltId, number> = {
  white: 0,
  yellow: 1,
  orange: 2,
  green: 4,
  blue: 6,
  purple: 8,
  brown: 10,
  black: 14,
};

export function getBeltWinBonus(beltId: JitsuBeltId): number {
  return JITSU_BELT_WIN_BONUS[beltId] ?? 0;
}

export function getJitsuCoinRange(): { min: number; max: number } {
  const maxBeltBonus = Math.max(...Object.values(JITSU_BELT_WIN_BONUS));
  return {
    min: JITSU_COINS_WIN_MIN,
    max: JITSU_COINS_WIN_MAX + maxBeltBonus,
  };
}
