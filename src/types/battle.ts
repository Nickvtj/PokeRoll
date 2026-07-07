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

export type MoveCategory = "damage" | "status";

export type StatusEffect = "burn" | "paralyze" | "poison" | "sleep";

export interface BattleMove {
  id: string;
  name: string;
  type: string;
  category: MoveCategory;
  /** 0 para golpes puramente de status */
  power: number;
  accuracy: number;
  statusEffect?: StatusEffect;
  /** 0 a 1 chance de aplicar status */
  statusChance?: number;
  description: string;
}

export interface FighterStatus {
  effect: StatusEffect;
  turnsLeft: number;
}

export interface BattleFighter {
  pokemon: Pokemon;
  stats: PokemonBattleStats;
  currentHp: number;
  maxHp: number;
  isPlayer: boolean;
  battleLevel?: number;
  slotIndex?: number;
  /** 1 a 2 golpes equipados para batalha */
  equippedMoves?: BattleMove[];
  status?: FighterStatus | null;
}

export type BattlePhase =
  | "idle"
  | "faceOff"
  | "coinFlip"
  | "fightReveal"
  | "fighting"
  | "victory"
  | "defeat";

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
  /** XP foi dobrado por Lucky Egg nesta batalha */
  luckyEggBoosted?: boolean;
}

export interface BattleEngagement {
  /** Pokémon ativo até cair, se vencer, ataca o próximo da fila */
  championFlatIndex: number;
  /** Alvo atual (null = buscar o da frente no próximo golpe) */
  targetFlatIndex: number | null;
  /** true = próximo golpe é contra-ataque do alvo */
  counterTurn: boolean;
}

export type TacticalPhase =
  | "player-pick-actor"
  | "player-pick-target"
  | "player-pick-move"
  | "executing"
  | "animating"
  | "enemy-turn";

export interface BattlePendingSelection {
  actorSlot?: number;
  targetSlot?: number;
  moveIndex?: number;
}

export interface MovePreview {
  move: BattleMove;
  effectiveness: BattleHitEffectiveness;
  typeLabel: string | null;
  typeMult: number;
  estimatedDamage: [number, number];
  statusChance: number;
}

export interface BattleTrainerDisplay {
  opponent: {
    name: string;
    spriteUrl: string;
  };
}

export interface BattleState {
  phase: BattlePhase;
  playerTeam: BattleFighter[];
  enemyTeam: BattleFighter[];
  trainerDisplay?: BattleTrainerDisplay;
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
  /** Combate 1v1, campeão luta até cair */
  battleEngagement?: BattleEngagement | null;
  /** Combate tático por turnos */
  tacticalMode?: boolean;
  tacticalPhase?: TacticalPhase;
  pendingSelection?: BattlePendingSelection;
  roundNumber?: number;
  /** Próximo slot inimigo na rotação de turnos (0 a 2) */
  enemyTurnCursor?: number;
  /** Ação inimiga pendente neste turno (sempre 0 ou 1 item) */
  enemyActionQueue?: Array<{ actorSlot: number; targetSlot: number; moveIndex: number }>;
  /** Reservas no banco do jogador (entram quando um ativo desmaia) */
  playerBench?: BattleFighter[];
  /** Reservas no banco do inimigo */
  enemyBench?: BattleFighter[];
  /** Troca pendente: um ativo desmaiou e há reserva para entrar no slot */
  pendingSwitch?: {
    side: "player" | "enemy";
    slot: number;
    /** o que fazer após a troca do jogador: fechar o turno inimigo ou passar a vez ao jogador */
    resume?: "finishTurn" | "playerTurn";
  } | null;
  /** Contagem de tipos do roster escolhido (para boost de monotipo por tipo) */
  playerTypeCounts?: Record<string, number>;
  /** IDs de Pokémon do jogador que entraram em campo (recebem XP cheio) */
  participatedIds?: number[];
}
