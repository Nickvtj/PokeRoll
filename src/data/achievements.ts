import {
  BookOpen,
  Coins,
  Crown,
  Dices,
  Flame,
  Gem,
  Library,
  Medal,
  MousePointerClick,
  Sparkles,
  Star,
  Swords,
  Target,
  Trophy,
  Zap,
  type LucideIcon,
} from "lucide-react";

export type AchievementCategory =
  | "spin"
  | "collection"
  | "battle"
  | "minigame"
  | "progress"
  | "economy"
  | "eggs";

export interface AchievementProgress {
  current: number;
  target: number;
}

export interface Achievement {
  id: string;
  label: string;
  description: string;
  iconKey: AchievementIconKey;
  category: AchievementCategory;
  check: (stats: AchievementStats) => boolean;
  progress: (stats: AchievementStats) => AchievementProgress;
}

export interface AchievementCardSurface {
  background: string;
  borderColor: string;
}

export const ACHIEVEMENT_CATEGORY_STYLES: Record<
  AchievementCategory,
  {
    ring: string;
    icon: string;
    label: string;
    gradient: string;
    pendingGradient: string;
    cardPending: AchievementCardSurface;
    cardDone: AchievementCardSurface;
  }
> = {
  spin: {
    ring: "ring-purple-400/40",
    icon: "text-purple-300",
    label: "text-purple-300/90",
    gradient: "from-purple-950/95 via-slate-900/98 to-slate-900/95",
    pendingGradient: "from-purple-600/35 via-purple-950/55 to-slate-900/90",
    cardPending: {
      background:
        "linear-gradient(145deg, rgba(147,51,234,0.12) 0%, rgba(15,23,42,0.97) 38%, rgba(15,23,42,0.99) 100%)",
      borderColor: "rgba(148,163,184,0.18)",
    },
    cardDone: {
      background:
        "linear-gradient(145deg, rgba(147,51,234,0.22) 0%, rgba(46,16,101,0.35) 35%, rgba(15,23,42,0.99) 100%)",
      borderColor: "rgba(192,132,252,0.42)",
    },
  },
  collection: {
    ring: "ring-emerald-400/40",
    icon: "text-emerald-300",
    label: "text-emerald-300/90",
    gradient: "from-emerald-950/95 via-slate-900/98 to-slate-900/95",
    pendingGradient: "from-emerald-600/30 via-emerald-950/50 to-slate-900/90",
    cardPending: {
      background:
        "linear-gradient(145deg, rgba(16,185,129,0.11) 0%, rgba(15,23,42,0.97) 38%, rgba(15,23,42,0.99) 100%)",
      borderColor: "rgba(148,163,184,0.18)",
    },
    cardDone: {
      background:
        "linear-gradient(145deg, rgba(16,185,129,0.2) 0%, rgba(6,78,59,0.32) 35%, rgba(15,23,42,0.99) 100%)",
      borderColor: "rgba(52,211,153,0.4)",
    },
  },
  battle: {
    ring: "ring-red-400/40",
    icon: "text-red-300",
    label: "text-red-300/90",
    gradient: "from-red-950/95 via-slate-900/98 to-slate-900/95",
    pendingGradient: "from-red-600/30 via-red-950/50 to-slate-900/90",
    cardPending: {
      background:
        "linear-gradient(145deg, rgba(239,68,68,0.1) 0%, rgba(15,23,42,0.97) 38%, rgba(15,23,42,0.99) 100%)",
      borderColor: "rgba(148,163,184,0.18)",
    },
    cardDone: {
      background:
        "linear-gradient(145deg, rgba(239,68,68,0.19) 0%, rgba(127,29,29,0.3) 35%, rgba(15,23,42,0.99) 100%)",
      borderColor: "rgba(248,113,113,0.4)",
    },
  },
  minigame: {
    ring: "ring-cyan-400/40",
    icon: "text-cyan-300",
    label: "text-cyan-300/90",
    gradient: "from-cyan-950/95 via-slate-900/98 to-slate-900/95",
    pendingGradient: "from-cyan-600/30 via-cyan-950/50 to-slate-900/90",
    cardPending: {
      background:
        "linear-gradient(145deg, rgba(6,182,212,0.11) 0%, rgba(15,23,42,0.97) 38%, rgba(15,23,42,0.99) 100%)",
      borderColor: "rgba(148,163,184,0.18)",
    },
    cardDone: {
      background:
        "linear-gradient(145deg, rgba(6,182,212,0.2) 0%, rgba(21,94,117,0.32) 35%, rgba(15,23,42,0.99) 100%)",
      borderColor: "rgba(34,211,238,0.4)",
    },
  },
  progress: {
    ring: "ring-amber-400/40",
    icon: "text-amber-300",
    label: "text-amber-300/90",
    gradient: "from-amber-950/95 via-slate-900/98 to-slate-900/95",
    pendingGradient: "from-amber-600/30 via-amber-950/50 to-slate-900/90",
    cardPending: {
      background:
        "linear-gradient(145deg, rgba(245,158,11,0.1) 0%, rgba(15,23,42,0.97) 38%, rgba(15,23,42,0.99) 100%)",
      borderColor: "rgba(148,163,184,0.18)",
    },
    cardDone: {
      background:
        "linear-gradient(145deg, rgba(245,158,11,0.19) 0%, rgba(146,64,14,0.3) 35%, rgba(15,23,42,0.99) 100%)",
      borderColor: "rgba(251,191,36,0.4)",
    },
  },
  economy: {
    ring: "ring-yellow-400/40",
    icon: "text-yellow-300",
    label: "text-yellow-300/90",
    gradient: "from-yellow-950/95 via-slate-900/98 to-slate-900/95",
    pendingGradient: "from-yellow-600/28 via-yellow-950/48 to-slate-900/90",
    cardPending: {
      background:
        "linear-gradient(145deg, rgba(234,179,8,0.1) 0%, rgba(15,23,42,0.97) 38%, rgba(15,23,42,0.99) 100%)",
      borderColor: "rgba(148,163,184,0.18)",
    },
    cardDone: {
      background:
        "linear-gradient(145deg, rgba(234,179,8,0.18) 0%, rgba(133,77,14,0.28) 35%, rgba(15,23,42,0.99) 100%)",
      borderColor: "rgba(250,204,21,0.38)",
    },
  },
  eggs: {
    ring: "ring-orange-400/40",
    icon: "text-orange-300",
    label: "text-orange-300/90",
    gradient: "from-orange-950/95 via-slate-900/98 to-slate-900/95",
    pendingGradient: "from-orange-600/28 via-orange-950/48 to-slate-900/90",
    cardPending: {
      background:
        "linear-gradient(145deg, rgba(249,115,22,0.1) 0%, rgba(15,23,42,0.97) 38%, rgba(15,23,42,0.99) 100%)",
      borderColor: "rgba(148,163,184,0.18)",
    },
    cardDone: {
      background:
        "linear-gradient(145deg, rgba(249,115,22,0.18) 0%, rgba(124,45,18,0.28) 35%, rgba(15,23,42,0.99) 100%)",
      borderColor: "rgba(251,146,60,0.38)",
    },
  },
};

export type AchievementIconKey =
  | "dices"
  | "book"
  | "library"
  | "trophy"
  | "swords"
  | "crown"
  | "target"
  | "zap"
  | "star"
  | "sparkles"
  | "flame"
  | "gem"
  | "coins"
  | "medal";

const ICON_MAP: Record<AchievementIconKey, LucideIcon> = {
  dices: Dices,
  book: BookOpen,
  library: Library,
  trophy: Trophy,
  swords: Swords,
  crown: Crown,
  target: Target,
  zap: Zap,
  star: Star,
  sparkles: Sparkles,
  flame: Flame,
  gem: Gem,
  coins: Coins,
  medal: Medal,
};

export function getAchievementIcon(key: AchievementIconKey): LucideIcon {
  return ICON_MAP[key];
}

export interface AchievementStats {
  uniquePokemon: number;
  totalSpins: number;
  battleWins: number;
  clickGames: number;
  level: number;
  dailyStreak: number;
  coins: number;
  eggsHatched: number;
  eggSellCoins: number;
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "spin_10",
    label: "Girador",
    description: "Realize 10 spins na roleta",
    iconKey: "dices",
    category: "spin",
    check: (s) => s.totalSpins >= 10,
    progress: (s) => ({ current: s.totalSpins, target: 10 }),
  },
  {
    id: "collector_30",
    label: "Colecionador",
    description: "Colete 30 Pokémon únicos",
    iconKey: "book",
    category: "collection",
    check: (s) => s.uniquePokemon >= 30,
    progress: (s) => ({ current: s.uniquePokemon, target: 30 }),
  },
  {
    id: "collector_75",
    label: "Grande Colecionador",
    description: "Colete 75 Pokémon únicos",
    iconKey: "library",
    category: "collection",
    check: (s) => s.uniquePokemon >= 75,
    progress: (s) => ({ current: s.uniquePokemon, target: 75 }),
  },
  {
    id: "album_master",
    label: "Mestre do Álbum",
    description: "Complete 150 Pokémon no álbum",
    iconKey: "trophy",
    category: "collection",
    check: (s) => s.uniquePokemon >= 150,
    progress: (s) => ({ current: s.uniquePokemon, target: 150 }),
  },
  {
    id: "battle_25",
    label: "Veterano",
    description: "Vença 25 batalhas",
    iconKey: "swords",
    category: "battle",
    check: (s) => s.battleWins >= 25,
    progress: (s) => ({ current: s.battleWins, target: 25 }),
  },
  {
    id: "battle_100",
    label: "Lenda de Batalha",
    description: "Vença 100 batalhas",
    iconKey: "crown",
    category: "battle",
    check: (s) => s.battleWins >= 100,
    progress: (s) => ({ current: s.battleWins, target: 100 }),
  },
  {
    id: "click_25",
    label: "Caçador",
    description: "Jogue 25 partidas nos minigames",
    iconKey: "target",
    category: "minigame",
    check: (s) => s.clickGames >= 25,
    progress: (s) => ({ current: s.clickGames, target: 25 }),
  },
  {
    id: "click_100",
    label: "Mestre da Pokébola",
    description: "Jogue 100 partidas nos minigames",
    iconKey: "zap",
    category: "minigame",
    check: (s) => s.clickGames >= 100,
    progress: (s) => ({ current: s.clickGames, target: 100 }),
  },
  {
    id: "level_15",
    label: "Treinador Experiente",
    description: "Alcance nível 15 de conta",
    iconKey: "star",
    category: "progress",
    check: (s) => s.level >= 15,
    progress: (s) => ({ current: s.level, target: 15 }),
  },
  {
    id: "level_30",
    label: "Elite Trainer",
    description: "Alcance nível 30 de conta",
    iconKey: "sparkles",
    category: "progress",
    check: (s) => s.level >= 30,
    progress: (s) => ({ current: s.level, target: 30 }),
  },
  {
    id: "streak_7",
    label: "Dedicado",
    description: "Mantenha streak de login por 7 dias",
    iconKey: "flame",
    category: "progress",
    check: (s) => s.dailyStreak >= 7,
    progress: (s) => ({ current: s.dailyStreak, target: 7 }),
  },
  {
    id: "streak_30",
    label: "Inabalável",
    description: "Mantenha streak de login por 30 dias",
    iconKey: "gem",
    category: "progress",
    check: (s) => s.dailyStreak >= 30,
    progress: (s) => ({ current: s.dailyStreak, target: 30 }),
  },
  {
    id: "rich_500",
    label: "Prosperidade",
    description: "Acumule 500 moedas ao mesmo tempo",
    iconKey: "coins",
    category: "economy",
    check: (s) => s.coins >= 500,
    progress: (s) => ({ current: s.coins, target: 500 }),
  },
  {
    id: "rich_1000",
    label: "Magnata PokéRoll",
    description: "Acumule 1000 moedas ao mesmo tempo",
    iconKey: "medal",
    category: "economy",
    check: (s) => s.coins >= 1000,
    progress: (s) => ({ current: s.coins, target: 1000 }),
  },
  {
    id: "egg_10",
    label: "Incubador",
    description: "Choque 10 ovos",
    iconKey: "sparkles",
    category: "eggs",
    check: (s) => s.eggsHatched >= 10,
    progress: (s) => ({ current: s.eggsHatched, target: 10 }),
  },
  {
    id: "egg_50",
    label: "Chocador",
    description: "Choque 50 ovos",
    iconKey: "star",
    category: "eggs",
    check: (s) => s.eggsHatched >= 50,
    progress: (s) => ({ current: s.eggsHatched, target: 50 }),
  },
  {
    id: "egg_100",
    label: "Mestre dos Ovos",
    description: "Choque 100 ovos",
    iconKey: "gem",
    category: "eggs",
    check: (s) => s.eggsHatched >= 100,
    progress: (s) => ({ current: s.eggsHatched, target: 100 }),
  },
  {
    id: "egg_sell_500",
    label: "Tycoon dos Ovos",
    description: "Ganhe 500 moedas vendendo duplicatas de ovos",
    iconKey: "medal",
    category: "eggs",
    check: (s) => s.eggSellCoins >= 500,
    progress: (s) => ({ current: s.eggSellCoins, target: 500 }),
  },
];

export function getUnlockedAchievements(stats: AchievementStats): string[] {
  return ACHIEVEMENTS.filter((a) => a.check(stats)).map((a) => a.id);
}

export function hasAllAchievements(unlockedIds: string[]): boolean {
  return ACHIEVEMENTS.every((a) => unlockedIds.includes(a.id));
}
