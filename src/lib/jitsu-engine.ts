import {
  JITSU_COINS_LOSS,
  JITSU_COINS_WIN_MAX,
  JITSU_COINS_WIN_MIN,
  JITSU_HAND_SIZE,
  JITSU_TURN_TIMER_SEC,
  JITSU_XP_LOSS,
  JITSU_XP_WIN,
} from "@/data/economy-balance";
import { applyMinigameCoinBonus } from "@/lib/minigame-rewards";
import type {
  JitsuCard,
  JitsuElement,
  JitsuMatchResult,
  JitsuRoundWinner,
  JitsuTrophy,
} from "@/types/jitsu";

export const JITSU_HAND = JITSU_HAND_SIZE;
export const JITSU_TIMER_SEC = JITSU_TURN_TIMER_SEC;

const BEATS: Record<JitsuElement, JitsuElement> = {
  FOGO: "PLANTA",
  PLANTA: "AGUA",
  AGUA: "FOGO",
};

export interface RoundPowerMods {
  player: number;
  bot: number;
}

export function elementBeats(attacker: JitsuElement, defender: JitsuElement): boolean {
  return BEATS[attacker] === defender;
}

export function getEffectivePower(power: number, mod: number): number {
  return Math.max(1, Math.min(10, power + mod));
}

export function isElementBlocked(type: JitsuElement, blocked: JitsuElement | null): boolean {
  return blocked != null && type === blocked;
}

export function filterPlayableHand(hand: JitsuCard[], blocked: JitsuElement | null): JitsuCard[] {
  if (!blocked) return hand;
  const playable = hand.filter((c) => c.type !== blocked);
  return playable.length > 0 ? playable : hand;
}

function sameElementInverted(player: JitsuCard, bot: JitsuCard): boolean {
  return (
    player.type === bot.type &&
    (player.special === "invert-power" || bot.special === "invert-power")
  );
}

export function resolveRound(
  player: JitsuCard,
  bot: JitsuCard,
  mods: RoundPowerMods = { player: 0, bot: 0 }
): JitsuRoundWinner {
  const pPower = getEffectivePower(player.power, mods.player);
  const bPower = getEffectivePower(bot.power, mods.bot);

  if (player.type === bot.type) {
    if (pPower === bPower) return "tie";
    if (sameElementInverted(player, bot)) {
      return pPower < bPower ? "player" : "bot";
    }
    return pPower > bPower ? "player" : "bot";
  }

  if (elementBeats(player.type, bot.type)) return "player";
  if (elementBeats(bot.type, player.type)) return "bot";
  return "tie";
}

export function trophyFromCard(card: JitsuCard): JitsuTrophy {
  return { type: card.type, pokemonId: card.pokemonId, power: card.power };
}

export function checkTripleTypeWin(trophies: JitsuTrophy[]): boolean {
  const types: JitsuElement[] = ["FOGO", "AGUA", "PLANTA"];
  const usedPokemon = new Set<number>();
  for (const type of types) {
    const win = trophies.find((t) => t.type === type && !usedPokemon.has(t.pokemonId));
    if (!win) return false;
    usedPokemon.add(win.pokemonId);
  }
  return true;
}

export function checkTripleSameWin(trophies: JitsuTrophy[]): boolean {
  for (const type of ["FOGO", "AGUA", "PLANTA"] as JitsuElement[]) {
    const ofType = trophies.filter((t) => t.type === type);
    const uniqueIds = new Set(ofType.map((t) => t.pokemonId));
    if (uniqueIds.size >= 3) return true;
  }
  return false;
}

export function checkMatchWin(trophies: JitsuTrophy[]): {
  won: boolean;
  reason: JitsuMatchResult["winReason"];
} {
  if (checkTripleTypeWin(trophies)) return { won: true, reason: "triple-type" };
  if (checkTripleSameWin(trophies)) return { won: true, reason: "triple-same" };
  return { won: false, reason: null };
}

export function getWinProgressHint(trophies: JitsuTrophy[]): {
  needsType: JitsuElement | null;
  needsSameType: JitsuElement | null;
} {
  const types: JitsuElement[] = ["FOGO", "AGUA", "PLANTA"];
  const usedPokemon = new Set<number>();
  let needsType: JitsuElement | null = null;
  for (const type of types) {
    const win = trophies.find((t) => t.type === type && !usedPokemon.has(t.pokemonId));
    if (win) usedPokemon.add(win.pokemonId);
    else {
      needsType = type;
      break;
    }
  }

  let needsSameType: JitsuElement | null = null;
  for (const type of types) {
    const unique = new Set(trophies.filter((t) => t.type === type).map((t) => t.pokemonId));
    if (unique.size === 2) {
      needsSameType = type;
      break;
    }
  }

  return { needsType, needsSameType };
}

/** Remove o troféu que mais atrapalha o combo adversário */
export function pickTrophyToDestroy(trophies: JitsuTrophy[]): number {
  if (trophies.length === 0) return -1;

  const hint = getWinProgressHint(trophies);
  if (hint.needsSameType) {
    const idx = trophies.findIndex((t) => t.type === hint.needsSameType);
    if (idx >= 0) return idx;
  }
  if (hint.needsType) {
    const idx = trophies.findIndex((t) => t.type === hint.needsType);
    if (idx >= 0) return idx;
  }

  let bestIdx = 0;
  let bestPower = trophies[0].power;
  trophies.forEach((t, i) => {
    if (t.power > bestPower) {
      bestPower = t.power;
      bestIdx = i;
    }
  });
  return bestIdx;
}

export function pickBotCard(
  hand: JitsuCard[],
  playerTrophies: JitsuTrophy[],
  blocked: JitsuElement | null = null
): JitsuCard {
  const playable = filterPlayableHand(hand, blocked);
  if (playable.length === 0) throw new Error("Bot sem cartas");

  const playerClose = getWinProgressHint(playerTrophies);

  const scoreCard = (card: JitsuCard) => {
    let score = card.power;
    if (card.special === "destroy-trophy") score += 5;
    if (card.special === "invert-power") score += 2;
    if (card.special === "block-element") score += 3;
    if (playerClose.needsType === card.type) score += 4;
    if (playerClose.needsSameType === card.type) {
      const has = playerTrophies.some((t) => t.type === card.type && t.pokemonId === card.pokemonId);
      if (!has) score += 3;
    }
    return score;
  };

  const sorted = [...playable].sort((a, b) => scoreCard(b) - scoreCard(a));
  const top = scoreCard(sorted[0]);
  const contenders = sorted.filter((c) => scoreCard(c) >= top - 1);
  return contenders[Math.floor(Math.random() * contenders.length)];
}

export function calcJitsuRewards(won: boolean, coinBonus = 0, beltCoinBonus = 0) {
  const baseCoins = won
    ? JITSU_COINS_WIN_MIN + Math.floor(Math.random() * (JITSU_COINS_WIN_MAX - JITSU_COINS_WIN_MIN + 1))
    : JITSU_COINS_LOSS;
  const coins = applyMinigameCoinBonus(baseCoins + (won ? beltCoinBonus : 0), coinBonus);
  const accountXp = won ? JITSU_XP_WIN : JITSU_XP_LOSS;
  const score = won ? 100 : 10;
  return { coins, accountXp, score };
}
