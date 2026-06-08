import type { GymDefinition, GymId, GymTrainerStage, EliteDefinition, EliteId } from "@/types/gym";

/** Nível mínimo da conta para Elite Four (além das 8 insígnias) */
export const ELITE_REQUIRED_ACCOUNT_LEVEL = 40;

function withAccountLevel(gym: Omit<GymDefinition, "requiredAccountLevel">): GymDefinition {
  return {
    ...gym,
    requiredAccountLevel: 1,
  };
}

const GYMS_BASE: Omit<GymDefinition, "requiredAccountLevel">[] = [
  {
    id: "brock",
    order: 1,
    leaderName: "Brock",
    badgeName: "Boulder Badge",
    badgeEmoji: "🪨",
    type: "rock",
    recommendedLevel: 5,
    themeColor: "#a8a29e",
    themeGradient: "from-stone-600/30 to-amber-900/20",
    arenaName: "Pewter Gym",
    description: "Especialista em Pokémon pedra. Geodude e Onix aguardam.",
  },
  {
    id: "misty",
    order: 2,
    leaderName: "Misty",
    badgeName: "Cascade Badge",
    badgeEmoji: "💧",
    type: "water",
    recommendedLevel: 10,
    themeColor: "#38bdf8",
    themeGradient: "from-cyan-500/30 to-blue-900/20",
    arenaName: "Cerulean Gym",
    description: "Mestra das águas. Starmie e Golduck dominam a arena.",
  },
  {
    id: "surge",
    order: 3,
    leaderName: "Lt. Surge",
    badgeName: "Thunder Badge",
    badgeEmoji: "⚡",
    type: "electric",
    recommendedLevel: 15,
    themeColor: "#facc15",
    themeGradient: "from-yellow-500/30 to-amber-900/20",
    arenaName: "Vermilion Gym",
    description: "General elétrico. Raichu e Electrode em alta voltagem.",
  },
  {
    id: "erika",
    order: 4,
    leaderName: "Erika",
    badgeName: "Rainbow Badge",
    badgeEmoji: "🌿",
    type: "grass",
    recommendedLevel: 18,
    themeColor: "#4ade80",
    themeGradient: "from-green-500/30 to-emerald-900/20",
    arenaName: "Celadon Gym",
    description: "Flores e plantas. Vileplume e Victreebel em bloom.",
  },
  {
    id: "koga",
    order: 5,
    leaderName: "Koga",
    badgeName: "Soul Badge",
    badgeEmoji: "☠️",
    type: "poison",
    recommendedLevel: 22,
    themeColor: "#a855f7",
    themeGradient: "from-purple-500/30 to-violet-900/20",
    arenaName: "Fuchsia Gym",
    description: "Ninja venenoso. Weezing e Muk escondidos na névoa.",
  },
  {
    id: "sabrina",
    order: 6,
    leaderName: "Sabrina",
    badgeName: "Marsh Badge",
    badgeEmoji: "🧠",
    type: "psychic",
    recommendedLevel: 25,
    themeColor: "#f472b6",
    themeGradient: "from-pink-500/30 to-fuchsia-900/20",
    arenaName: "Saffron Gym",
    description: "Psíquica poderosa. Alakazam e Hypno controlam a mente.",
  },
  {
    id: "blaine",
    order: 7,
    leaderName: "Blaine",
    badgeName: "Volcano Badge",
    badgeEmoji: "🔥",
    type: "fire",
    recommendedLevel: 28,
    themeColor: "#f97316",
    themeGradient: "from-orange-500/30 to-red-900/20",
    arenaName: "Cinnabar Gym",
    description: "Mestre do fogo. Arcanine e Magmar queimam tudo.",
  },
  {
    id: "giovanni",
    order: 8,
    leaderName: "Giovanni",
    badgeName: "Earth Badge",
    badgeEmoji: "🌍",
    type: "ground",
    recommendedLevel: 32,
    themeColor: "#d97706",
    themeGradient: "from-amber-600/30 to-stone-900/20",
    arenaName: "Viridian Gym",
    description: "Chefe da Equipe Rocket. Rhydon e Nidoking esmagam.",
  },
];

export const GYMS: GymDefinition[] = GYMS_BASE.map(withAccountLevel);

export const GYM_MAP: Record<GymId, GymDefinition> = Object.fromEntries(
  GYMS.map((g) => [g.id, g])
) as Record<GymId, GymDefinition>;

/** 5 batalhas por ginásio: 3 treinadores + mini boss + líder */
export const GYM_TRAINER_STAGES: Record<GymId, GymTrainerStage[]> = {
  brock: [
    { stage: 1, trainerName: "Campeão Júnior", label: "Treinador", pokemonIds: [74, 27, 50], difficultyScale: 0.85 },
    { stage: 2, trainerName: "Hiker Marcus", label: "Intermediário", pokemonIds: [74, 75, 95], difficultyScale: 0.95 },
    { stage: 3, trainerName: "Rock Crusher", label: "Forte", pokemonIds: [75, 95, 111], difficultyScale: 1.05 },
    { stage: 4, trainerName: "Graveler Guard", label: "Mini Boss", pokemonIds: [76, 95, 112], difficultyScale: 1.15 },
    { stage: 5, trainerName: "Brock", label: "Líder", pokemonIds: [74, 95, 76], difficultyScale: 1.25 },
  ],
  misty: [
    { stage: 1, trainerName: "Swimmer Amy", label: "Treinador", pokemonIds: [60, 118, 120], difficultyScale: 0.85 },
    { stage: 2, trainerName: "Fisher Kai", label: "Intermediário", pokemonIds: [61, 119, 121], difficultyScale: 0.95 },
    { stage: 3, trainerName: "Wave Rider", label: "Forte", pokemonIds: [55, 87, 131], difficultyScale: 1.05 },
    { stage: 4, trainerName: "Tentacruel Tide", label: "Mini Boss", pokemonIds: [73, 121, 131], difficultyScale: 1.15 },
    { stage: 5, trainerName: "Misty", label: "Líder", pokemonIds: [120, 121, 131], difficultyScale: 1.25 },
  ],
  surge: [
    { stage: 1, trainerName: "Engineer Volt", label: "Treinador", pokemonIds: [100, 81, 25], difficultyScale: 0.85 },
    { stage: 2, trainerName: "Shock Trooper", label: "Intermediário", pokemonIds: [101, 82, 26], difficultyScale: 0.95 },
    { stage: 3, trainerName: "Thunder Squad", label: "Forte", pokemonIds: [125, 101, 82], difficultyScale: 1.05 },
    { stage: 4, trainerName: "Electrode Core", label: "Mini Boss", pokemonIds: [101, 125, 26], difficultyScale: 1.15 },
    { stage: 5, trainerName: "Lt. Surge", label: "Líder", pokemonIds: [26, 101, 82], difficultyScale: 1.25 },
  ],
  erika: [
    { stage: 1, trainerName: "Gardener Leaf", label: "Treinador", pokemonIds: [43, 69, 114], difficultyScale: 0.85 },
    { stage: 2, trainerName: "Bloom Keeper", label: "Intermediário", pokemonIds: [44, 70, 45], difficultyScale: 0.95 },
    { stage: 3, trainerName: "Vine Master", label: "Forte", pokemonIds: [45, 71, 103], difficultyScale: 1.05 },
    { stage: 4, trainerName: "Exeggutor Grove", label: "Mini Boss", pokemonIds: [71, 103, 114], difficultyScale: 1.15 },
    { stage: 5, trainerName: "Erika", label: "Líder", pokemonIds: [45, 71, 103], difficultyScale: 1.25 },
  ],
  koga: [
    { stage: 1, trainerName: "Ninja Trainee", label: "Treinador", pokemonIds: [41, 48, 109], difficultyScale: 0.85 },
    { stage: 2, trainerName: "Poison Fang", label: "Intermediário", pokemonIds: [42, 49, 110], difficultyScale: 0.95 },
    { stage: 3, trainerName: "Toxic Cloud", label: "Forte", pokemonIds: [89, 110, 34], difficultyScale: 1.05 },
    { stage: 4, trainerName: "Muk Shadow", label: "Mini Boss", pokemonIds: [89, 34, 49], difficultyScale: 1.15 },
    { stage: 5, trainerName: "Koga", label: "Líder", pokemonIds: [42, 89, 34], difficultyScale: 1.25 },
  ],
  sabrina: [
    { stage: 1, trainerName: "Psychic Adept", label: "Treinador", pokemonIds: [63, 96, 122], difficultyScale: 0.85 },
    { stage: 2, trainerName: "Mind Bender", label: "Intermediário", pokemonIds: [64, 97, 124], difficultyScale: 0.95 },
    { stage: 3, trainerName: "Telekinetic", label: "Forte", pokemonIds: [65, 97, 122], difficultyScale: 1.05 },
    { stage: 4, trainerName: "Hypno Dream", label: "Mini Boss", pokemonIds: [97, 65, 124], difficultyScale: 1.15 },
    { stage: 5, trainerName: "Sabrina", label: "Líder", pokemonIds: [64, 97, 65], difficultyScale: 1.25 },
  ],
  blaine: [
    { stage: 1, trainerName: "Ember Spark", label: "Treinador", pokemonIds: [58, 77, 37], difficultyScale: 0.85 },
    { stage: 2, trainerName: "Flame Dancer", label: "Intermediário", pokemonIds: [59, 78, 38], difficultyScale: 0.95 },
    { stage: 3, trainerName: "Inferno Knight", label: "Forte", pokemonIds: [59, 126, 136], difficultyScale: 1.05 },
    { stage: 4, trainerName: "Magmar Forge", label: "Mini Boss", pokemonIds: [126, 136, 59], difficultyScale: 1.15 },
    { stage: 5, trainerName: "Blaine", label: "Líder", pokemonIds: [58, 126, 136], difficultyScale: 1.25 },
  ],
  giovanni: [
    { stage: 1, trainerName: "Rocket Grunt", label: "Treinador", pokemonIds: [52, 50, 41], difficultyScale: 0.85 },
    { stage: 2, trainerName: "Rocket Elite", label: "Intermediário", pokemonIds: [53, 51, 42], difficultyScale: 0.95 },
    { stage: 3, trainerName: "Ground Force", label: "Forte", pokemonIds: [111, 51, 34], difficultyScale: 1.05 },
    { stage: 4, trainerName: "Rhydon Crusher", label: "Mini Boss", pokemonIds: [112, 51, 34], difficultyScale: 1.15 },
    { stage: 5, trainerName: "Giovanni", label: "Líder", pokemonIds: [111, 112, 34], difficultyScale: 1.25 },
  ],
};

export const ELITE_FOUR: EliteDefinition[] = [
  {
    id: "lorelei",
    name: "Lorelei",
    title: "Elite Four · Gelo",
    type: "ice",
    recommendedLevel: 35,
    themeColor: "#67e8f9",
    pokemonIds: [87, 91, 124, 131],
    difficultyScale: 1.3,
  },
  {
    id: "bruno",
    name: "Bruno",
    title: "Elite Four · Lutador",
    type: "fighting",
    recommendedLevel: 38,
    themeColor: "#ef4444",
    pokemonIds: [66, 67, 68, 106],
    difficultyScale: 1.35,
  },
  {
    id: "agatha",
    name: "Agatha",
    title: "Elite Four · Fantasma",
    type: "ghost",
    recommendedLevel: 40,
    themeColor: "#a78bfa",
    pokemonIds: [92, 93, 94, 24],
    difficultyScale: 1.4,
  },
  {
    id: "lance",
    name: "Lance",
    title: "Elite Four · Dragão",
    type: "dragon",
    recommendedLevel: 42,
    themeColor: "#6366f1",
    pokemonIds: [130, 148, 149, 142],
    difficultyScale: 1.45,
  },
  {
    id: "champion",
    name: "Blue",
    title: "Campeão",
    type: "mixed",
    recommendedLevel: 45,
    themeColor: "#fbbf24",
    pokemonIds: [18, 65, 112, 130, 143, 6],
    difficultyScale: 1.55,
    isChampion: true,
  },
];

export function getGymById(id: GymId): GymDefinition {
  return GYM_MAP[id];
}

export function getPreviousGym(gymId: GymId): GymDefinition | null {
  const gym = GYM_MAP[gymId];
  if (gym.order <= 1) return null;
  return GYMS.find((g) => g.order === gym.order - 1) ?? null;
}

export function isGymUnlocked(gymId: GymId, badges: GymId[]): boolean {
  const gym = GYM_MAP[gymId];
  if (gym.order <= 1) return true;
  const previous = GYMS.find((g) => g.order === gym.order - 1);
  if (!previous) return true;
  return badges.includes(previous.id);
}

export function isEliteLeagueUnlocked(_accountLevel: number, badges: GymId[]): boolean {
  return allBadgesEarned(badges);
}

export function getTeamGymReadiness(
  team: number[],
  pokemonLevels: Record<number, number>,
  recommendedLevel: number
): { ready: boolean; avgLevel: number; teamComplete: boolean; underleveled: boolean } {
  const teamComplete = team.length >= 3;
  if (!teamComplete) {
    return { ready: false, avgLevel: 0, teamComplete: false, underleveled: false };
  }
  const avgLevel =
    team.reduce((sum, id) => sum + (pokemonLevels[id] ?? 1), 0) / team.length;
  const underleveled = avgLevel < recommendedLevel;
  return {
    ready: teamComplete,
    avgLevel: Math.round(avgLevel * 10) / 10,
    teamComplete: true,
    underleveled,
  };
}

export function allBadgesEarned(badges: GymId[]): boolean {
  return GYMS.every((g) => badges.includes(g.id));
}

export const ELITE_ORDER = ["lorelei", "bruno", "agatha", "lance", "champion"] as const;

export function isEliteMemberUnlocked(
  eliteId: EliteId,
  eliteProgress: Partial<Record<EliteId, { cleared?: boolean }>>
): boolean {
  const idx = ELITE_ORDER.indexOf(eliteId);
  if (idx <= 0) return true;
  const prevId = ELITE_ORDER[idx - 1];
  return !!eliteProgress[prevId]?.cleared;
}

export function getKantoLeagueLabel(
  badges: GymId[],
  championDefeated: boolean,
  eliteProgress: Partial<Record<EliteId, { cleared?: boolean }>>
): string {
  if (championDefeated) return "Mestre Pokémon";

  if (allBadgesEarned(badges)) {
    for (const eliteId of ELITE_ORDER) {
      if (!eliteProgress[eliteId]?.cleared) {
        const elite = ELITE_FOUR.find((e) => e.id === eliteId);
        if (elite?.isChampion) return "Liga Indigo · Campeão";
        return elite ? `Liga Elite · ${elite.name}` : "Liga Elite";
      }
    }
    return "Liga Elite";
  }

  const nextGym = GYMS.find((g) => !badges.includes(g.id));
  if (!nextGym) return "Liga Kanto";
  return `Liga ${nextGym.leaderName}`;
}

export function getHallOfFameCount(
  hallOfFame: { gymId: GymId; pokemonId: number }[],
  gymId: GymId
): number {
  const unique = new Set(
    hallOfFame.filter((e) => e.gymId === gymId).map((e) => e.pokemonId)
  );
  return unique.size;
}
