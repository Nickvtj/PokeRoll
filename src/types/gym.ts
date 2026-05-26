/** Tipos do sistema de Ginásios / Liga Kanto */

export type GymId =
  | "brock"
  | "misty"
  | "surge"
  | "erika"
  | "koga"
  | "sabrina"
  | "blaine"
  | "giovanni";

export type EliteId = "lorelei" | "bruno" | "agatha" | "lance" | "champion";

export type BattleMode = "training" | "gym" | "elite";

export interface GymDefinition {
  id: GymId;
  order: number;
  leaderName: string;
  badgeName: string;
  badgeEmoji: string;
  type: string;
  recommendedLevel: number;
  themeColor: string;
  themeGradient: string;
  arenaName: string;
  description: string;
  /** Nível mínimo da conta para acessar o ginásio */
  requiredAccountLevel: number;
}

export interface GymTrainerStage {
  stage: number;
  trainerName: string;
  label: string;
  pokemonIds: number[];
  /** Multiplicador de dificuldade relativo ao ginásio */
  difficultyScale: number;
}

export interface EliteDefinition {
  id: EliteId;
  name: string;
  title: string;
  type: string;
  recommendedLevel: number;
  themeColor: string;
  pokemonIds: number[];
  difficultyScale: number;
  isChampion?: boolean;
}

export interface GymProgressEntry {
  cleared: boolean;
  firstClearAt?: string;
  bestStars: number;
  attempts: number;
  perfectClears: number;
  coinRewardClaimed?: boolean;
}

export interface HallOfFameEntry {
  gymId: GymId;
  pokemonId: number;
  clearedAt: string;
  stars: number;
}

export interface SavedTeam {
  id: string;
  name: string;
  pokemonIds: number[];
  createdAt: string;
}

export interface GymState {
  badges: GymId[];
  gymProgress: Partial<Record<GymId, GymProgressEntry>>;
  hallOfFame: HallOfFameEntry[];
  eliteProgress: Partial<Record<EliteId, GymProgressEntry>>;
  championDefeated: boolean;
  savedTeams: SavedTeam[];
  hallOfFameFinal: boolean;
}

export interface GymBattleMeta {
  mode: BattleMode;
  gymId?: GymId;
  eliteId?: EliteId;
  gymName: string;
  stage: number;
  totalStages: number;
  trainerName: string;
  themeColor: string;
  themeGradient: string;
  badgeName?: string;
  recommendedLevel: number;
}

export interface PerfectRunBonus {
  noDeaths: boolean;
  fastClear: boolean;
  underleveled: boolean;
  typeChallenge: boolean;
  stars: number;
  rank: "S" | "A" | "B" | "C";
}
