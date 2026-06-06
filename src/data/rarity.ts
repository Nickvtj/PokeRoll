import type { RarityConfig } from "@/types";

/** Porcentagens configuráveis de drop por raridade (devem somar 100) */
export const RARITY_CHANCES: Record<string, number> = {
  common: 45.4,
  uncommon: 30,
  rare: 20,
  epic: 4,
  legendary: 0.6,
};

export const RARITY_CONFIG: Record<string, RarityConfig> = {
  common: {
    key: "common",
    label: "Comum",
    chance: RARITY_CHANCES.common,
    color: "#94a3b8",
    glowColor: "rgba(148, 163, 184, 0.5)",
    bgGradient: "from-slate-400/20 to-slate-600/10",
  },
  uncommon: {
    key: "uncommon",
    label: "Incomum",
    chance: RARITY_CHANCES.uncommon,
    color: "#22c55e",
    glowColor: "rgba(34, 197, 94, 0.5)",
    bgGradient: "from-green-400/20 to-emerald-600/10",
  },
  rare: {
    key: "rare",
    label: "Raro",
    chance: RARITY_CHANCES.rare,
    color: "#3b82f6",
    glowColor: "rgba(59, 130, 246, 0.5)",
    bgGradient: "from-blue-400/20 to-blue-600/10",
  },
  epic: {
    key: "epic",
    label: "Épico",
    chance: RARITY_CHANCES.epic,
    color: "#a855f7",
    glowColor: "rgba(168, 85, 247, 0.5)",
    bgGradient: "from-purple-400/20 to-purple-600/10",
  },
  legendary: {
    key: "legendary",
    label: "Lendário",
    chance: RARITY_CHANCES.legendary,
    color: "#f59e0b",
    glowColor: "rgba(245, 158, 11, 0.6)",
    bgGradient: "from-amber-400/20 to-orange-600/10",
  },
};

export const RARITY_ORDER = [
  "common",
  "uncommon",
  "rare",
  "epic",
  "legendary",
] as const;

export function getRarityLabel(rarity: string): string {
  return RARITY_CONFIG[rarity]?.label ?? rarity;
}

export function getRarityColor(rarity: string): string {
  return RARITY_CONFIG[rarity]?.color ?? "#94a3b8";
}
