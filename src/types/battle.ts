import type { Pokemon } from "@/types";
import type { GymBattleMeta, BattleMode } from "@/types/gym";

export interface PokemonAbility {
  id: string;
  name: string;
  description: string;
  type: "active" | "passive";
  effect:
    | "damage_boost"
    | "aoe"
    | "defense_boost"
    | "coin_bonus"
    | "xp_bonus"
    | "battle_damage"
    | "crit_chance"
    | "combo_bonus";
  value: number;
}

export interface PokemonBattleStats {
  hp: number;
  attack: number;
  defense: number;
  speed: number;
  type: string;
  ability?: PokemonAbility;
}

export interface BattleFighter {
  pokemon: Pokemon;
  stats: PokemonBattleStats;
  currentHp: number;
  maxHp: number;
  isPlayer: boolean;
  battleLevel?: number;
  slotIndex?: number;
}

export type BattlePhase = "idle" | "coinFlip" | "fighting" | "victory" | "defeat";

export type BattleHitEffectiveness = "super" | "weak" | "immune" | "normal";

export interface BattleHitSound {
  attackType: string;
  secondaryType?: string;
  isCrit: boolean;
  effectiveness: BattleHitEffectiveness;
}

export interface BattleLogEntry {
  id: string;
  message: string;
  type: "attack" | "ability" | "damage" | "ko" | "info";
  timestamp: number;
  hitSound?: BattleHitSound;
}

export interface BattleReward {
  coins: number;
  xp: number;
  freeSpin: boolean;
  bonusItem?: string;
}

export interface PokemonLevelUpResult {
  pokemonId: number;
  pokemonName: string;
  image: string;
  previousLevel: number;
  newLevel: number;
  xpGained: number;
  previousXpInLevel: number;
  newXpInLevel: number;
  xpPct: number;
  xpNeeded?: number;
  leveledUp: boolean;
}

export interface BattleEngagement {
  /** Pokémon ativo até cair — se vencer, ataca o próximo da fila */
  championFlatIndex: number;
  /** Alvo atual (null = buscar o da frente no próximo golpe) */
  targetFlatIndex: number | null;
  /** true = próximo golpe é contra-ataque do alvo */
  counterTurn: boolean;
}

export interface BattleState {
  phase: BattlePhase;
  playerTeam: BattleFighter[];
  enemyTeam: BattleFighter[];
  turnOrder: number[];
  currentTurnIndex: number;
  wave: number;
  maxWaves: number;
  log: BattleLogEntry[];
  reward: BattleReward | null;
  levelUps?: PokemonLevelUpResult[];
  mode?: BattleMode;
  gymMeta?: GymBattleMeta;
  playerDeaths?: number;
  turnCount?: number;
  /** true = jogador (cara) ataca primeiro */
  playerStarts?: boolean;
  /** Combate 1v1 — campeão luta até cair */
  battleEngagement?: BattleEngagement | null;
}
