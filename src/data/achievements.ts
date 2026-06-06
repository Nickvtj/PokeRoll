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

export interface Achievement {
  id: string;
  label: string;
  description: string;
  iconKey: AchievementIconKey;
  check: (stats: AchievementStats) => boolean;
}

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
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "spin_10",
    label: "Girador",
    description: "Realize 10 spins na roleta",
    iconKey: "dices",
    check: (s) => s.totalSpins >= 10,
  },
  {
    id: "collector_30",
    label: "Colecionador",
    description: "Colete 30 Pokémon únicos",
    iconKey: "book",
    check: (s) => s.uniquePokemon >= 30,
  },
  {
    id: "collector_75",
    label: "Grande Colecionador",
    description: "Colete 75 Pokémon únicos",
    iconKey: "library",
    check: (s) => s.uniquePokemon >= 75,
  },
  {
    id: "album_master",
    label: "Mestre do Álbum",
    description: "Complete 150 Pokémon no álbum",
    iconKey: "trophy",
    check: (s) => s.uniquePokemon >= 150,
  },
  {
    id: "battle_25",
    label: "Veterano",
    description: "Vença 25 batalhas",
    iconKey: "swords",
    check: (s) => s.battleWins >= 25,
  },
  {
    id: "battle_100",
    label: "Lenda de Batalha",
    description: "Vença 100 batalhas",
    iconKey: "crown",
    check: (s) => s.battleWins >= 100,
  },
  {
    id: "click_25",
    label: "Caçador",
    description: "Jogue 25 partidas nos minigames",
    iconKey: "target",
    check: (s) => s.clickGames >= 25,
  },
  {
    id: "click_100",
    label: "Mestre da Pokébola",
    description: "Jogue 100 partidas nos minigames",
    iconKey: "zap",
    check: (s) => s.clickGames >= 100,
  },
  {
    id: "level_15",
    label: "Treinador Experiente",
    description: "Alcance nível 15 de conta",
    iconKey: "star",
    check: (s) => s.level >= 15,
  },
  {
    id: "level_30",
    label: "Elite Trainer",
    description: "Alcance nível 30 de conta",
    iconKey: "sparkles",
    check: (s) => s.level >= 30,
  },
  {
    id: "streak_7",
    label: "Dedicado",
    description: "Mantenha streak de login por 7 dias",
    iconKey: "flame",
    check: (s) => s.dailyStreak >= 7,
  },
  {
    id: "streak_30",
    label: "Inabalável",
    description: "Mantenha streak de login por 30 dias",
    iconKey: "gem",
    check: (s) => s.dailyStreak >= 30,
  },
  {
    id: "rich_500",
    label: "Prosperidade",
    description: "Acumule 500 moedas ao mesmo tempo",
    iconKey: "coins",
    check: (s) => s.coins >= 500,
  },
  {
    id: "rich_1000",
    label: "Magnata PokéRoll",
    description: "Acumule 1000 moedas ao mesmo tempo",
    iconKey: "medal",
    check: (s) => s.coins >= 1000,
  },
];

export function getUnlockedAchievements(stats: AchievementStats): string[] {
  return ACHIEVEMENTS.filter((a) => a.check(stats)).map((a) => a.id);
}

export function hasAllAchievements(unlockedIds: string[]): boolean {
  return ACHIEVEMENTS.every((a) => unlockedIds.includes(a.id));
}
