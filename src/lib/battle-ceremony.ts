import {
  BATTLE_COIN_FLIP_MS,
  BATTLE_COIN_REVEAL_MS,
  BATTLE_FACE_OFF_MS,
  BATTLE_POST_COIN_PAUSE_MS,
} from "@/data/economy-balance";
import { shouldSkipBattleIntro } from "@/lib/player-preferences";

export const CEREMONY_FAST_MS = 80;
export const CEREMONY_FAST_REVEAL_MS = 120;
export const BATTLE_FIGHT_REVEAL_MS = 900;

export interface BattleCeremonyTimings {
  faceOffMs: number;
  coinFlipMs: number;
  coinRevealMs: number;
  postCoinPauseMs: number;
  fightRevealMs: number;
  skipSounds: boolean;
}

export function getBattleCeremonyTimings(forceSkip?: boolean): BattleCeremonyTimings {
  const skip = forceSkip ?? shouldSkipBattleIntro();
  if (skip) {
    return {
      faceOffMs: CEREMONY_FAST_MS,
      coinFlipMs: CEREMONY_FAST_MS + CEREMONY_FAST_REVEAL_MS,
      coinRevealMs: CEREMONY_FAST_REVEAL_MS,
      postCoinPauseMs: 50,
      fightRevealMs: 50,
      skipSounds: true,
    };
  }
  return {
    faceOffMs: BATTLE_FACE_OFF_MS,
    coinFlipMs: BATTLE_COIN_FLIP_MS,
    coinRevealMs: BATTLE_COIN_REVEAL_MS,
    postCoinPauseMs: BATTLE_POST_COIN_PAUSE_MS,
    fightRevealMs: BATTLE_FIGHT_REVEAL_MS,
    skipSounds: false,
  };
}
