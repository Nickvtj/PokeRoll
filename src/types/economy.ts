import type { FamilyCandy, ItemInventory } from "@/types/instance";

export interface EconomyState {
  coins: number;
  xp: number;
  level: number;
  freeSpins: number;
  rank: number;
  battleWins: number;
  totalBattles: number;
  clickGamesPlayed: number;
  clickCoinsToday: number;
  clickGamesToday: number;
  lastClickGameDate: string;
  dailyStreak: number;
  lastLoginDate: string;
  missionProgress: Record<string, number>;
  missionsClaimed: string[];
  lastMissionDate: string;
  team: number[]; // ids de espécie possuída (identidade por espécie, Regra A)
  /** Espécies atualmente possuídas (Mochila). Separado de "visto" (Pokédex). */
  owned?: number[];
  /** Flag interna: owned já foi populado a partir da coleção legada. */
  ownedBootstrapped?: boolean;
  favoritePokemon: number[];
  pokemonBattleXp: Record<string, { level: number; xp: number }>;
  /** IDs dos golpes equipados por Pokémon (máx. 2) */
  pokemonMoveLoadouts: Record<string, string[]>;
  welcomeClaimed?: boolean;
  unlockedAchievements: string[];
  selectedAvatarId: string;
  /** Timestamp até quando Lucky Egg está ativo */
  luckyEggExpiresAt?: number | null;
  /** Lucky Eggs no inventário (ativar no header) */
  luckyEggCount?: number;
  rareCandyCount?: number;
  /** Doces da família (v2): familyId → quantidade. Material de evolução. */
  familyCandy?: FamilyCandy;
  /** Doces Coringa: fungíveis, aplicáveis a qualquer família no Pokédex. */
  wildCandy?: number;
  /** Inventário de itens de evolução (pedras, cabo de ligação, etc). */
  items?: ItemInventory;
  highScores?: {
    clickRush?: number;
    perfectCapture?: number;
    memory?: number;
    jitsu?: number;
    hunterCave?: number;
    flappyZubat?: number;
  };
  /** Moedas ganhas ao longo da conta (desbloqueios) */
  lifetimeCoinsEarned?: number;
  /** Flappy Zubat, skins e selecao */
  flappyZubat?: {
    selectedSkin: string;
    unlockedSkins: string[];
  };
  /** Progressão do minigame Poké-Jitsu */
  jitsuXp?: number;
  jitsuWins?: number;
  /** Ovos chocados na tela de ovos */
  eggsHatched?: number;
  /** Moedas ganhas vendendo duplicatas de ovos */
  eggSellCoins?: number;
}

export interface CoinTransaction {
  amount: number;
  reason: string;
  timestamp: string;
}

export interface RewardPayload {
  coins?: number;
  xp?: number;
  freeSpin?: boolean;
  message: string;
  closeLabel?: string;
  onClosePath?: string;
  /** Dispara confete de recorde ao abrir o modal */
  isNewRecord?: boolean;
  /** Vitória/derrota, estilo do modal de batalha; omitido = recompensa neutra */
  outcome?: "win" | "loss";
}

/** Callback efêmero, não persiste no storage */
export type RewardPlayAgainFn = () => void;
