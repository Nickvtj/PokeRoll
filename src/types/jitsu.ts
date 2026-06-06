export type JitsuElement = "FOGO" | "AGUA" | "PLANTA";

export type JitsuRoundWinner = "player" | "bot" | "tie";

export type JitsuSpecialEffect =
  | "invert-power"
  | "block-element"
  | "buff-next"
  | "debuff-next"
  | "destroy-trophy";

export interface JitsuCard {
  instanceId: string;
  pokemonId: number;
  name: string;
  type: JitsuElement;
  power: number;
  image: string;
  special?: JitsuSpecialEffect;
  /** Elemento interditado para o oponente (block-element) */
  blockTarget?: JitsuElement;
}

export interface JitsuTrophy {
  type: JitsuElement;
  pokemonId: number;
  power: number;
}

export interface JitsuRoundResult {
  playerCard: JitsuCard;
  botCard: JitsuCard;
  winner: JitsuRoundWinner;
}

export interface JitsuMatchResult {
  won: boolean;
  roundsPlayed: number;
  playerTrophies: JitsuTrophy[];
  botTrophies: JitsuTrophy[];
  winReason: "triple-type" | "triple-same" | null;
}

export type JitsuBeltId =
  | "white"
  | "yellow"
  | "orange"
  | "green"
  | "blue"
  | "purple"
  | "brown"
  | "black";

export interface JitsuBeltConfig {
  id: JitsuBeltId;
  label: string;
  emoji: string;
  color: string;
  minXp: number;
}
