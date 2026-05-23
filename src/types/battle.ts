import type { Pokemon } from "@/types";

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

export type BattlePhase = "idle" | "fighting" | "victory" | "defeat";

export interface BattleLogEntry {
  id: string;
  message: string;
  type: "attack" | "ability" | "damage" | "ko" | "info";
  timestamp: number;
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
  leveledUp: boolean;
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
}
