export interface Achievement {
  id: string;
  label: string;
  description: string;
  icon: string;
  check: (stats: AchievementStats) => boolean;
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
    icon: "🎰",
    check: (s) => s.totalSpins >= 10,
  },
  {
    id: "collector_30",
    label: "Colecionador",
    description: "Colete 30 Pokémon únicos",
    icon: "📖",
    check: (s) => s.uniquePokemon >= 30,
  },
  {
    id: "collector_75",
    label: "Grande Colecionador",
    description: "Colete 75 Pokémon únicos",
    icon: "📚",
    check: (s) => s.uniquePokemon >= 75,
  },
  {
    id: "album_master",
    label: "Mestre do Álbum",
    description: "Complete 150 Pokémon no álbum",
    icon: "🏆",
    check: (s) => s.uniquePokemon >= 150,
  },
  {
    id: "battle_25",
    label: "Veterano",
    description: "Vença 25 batalhas",
    icon: "⚔️",
    check: (s) => s.battleWins >= 25,
  },
  {
    id: "battle_100",
    label: "Lenda de Batalha",
    description: "Vença 100 batalhas",
    icon: "👑",
    check: (s) => s.battleWins >= 100,
  },
  {
    id: "click_25",
    label: "Click Addict",
    description: "Jogue 25 partidas de Click Rush",
    icon: "👆",
    check: (s) => s.clickGames >= 25,
  },
  {
    id: "click_100",
    label: "Mãos de Relâmpago",
    description: "Jogue 100 partidas de Click Rush",
    icon: "⚡",
    check: (s) => s.clickGames >= 100,
  },
  {
    id: "level_15",
    label: "Treinador Experiente",
    description: "Alcance nível 15 de conta",
    icon: "⭐",
    check: (s) => s.level >= 15,
  },
  {
    id: "level_30",
    label: "Elite Trainer",
    description: "Alcance nível 30 de conta",
    icon: "🌟",
    check: (s) => s.level >= 30,
  },
  {
    id: "streak_7",
    label: "Dedicado",
    description: "Mantenha streak de login por 7 dias",
    icon: "🔥",
    check: (s) => s.dailyStreak >= 7,
  },
  {
    id: "streak_30",
    label: "Inabalável",
    description: "Mantenha streak de login por 30 dias",
    icon: "💎",
    check: (s) => s.dailyStreak >= 30,
  },
  {
    id: "rich_500",
    label: "Prosperidade",
    description: "Acumule 500 moedas ao mesmo tempo",
    icon: "🪙",
    check: (s) => s.coins >= 500,
  },
  {
    id: "rich_1000",
    label: "Magnata PokéRoll",
    description: "Acumule 1000 moedas ao mesmo tempo",
    icon: "💰",
    check: (s) => s.coins >= 1000,
  },
];

export function getUnlockedAchievements(stats: AchievementStats): string[] {
  return ACHIEVEMENTS.filter((a) => a.check(stats)).map((a) => a.id);
}
