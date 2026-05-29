import { playBattleDamage, playBattleStrike } from "@/lib/battle-hit-sounds";
import { playBattleFaint } from "@/lib/sound-engine";
import type { BattleHitSound } from "@/types/battle";
import type { BattleLogEntry } from "@/types/battle";

export function findNewHitSound(
  log: BattleLogEntry[],
  fromIndex: number
): BattleHitSound | null {
  for (let i = fromIndex; i < log.length; i++) {
    if (log[i].hitSound) return log[i].hitSound!;
  }
  return null;
}

export function hasNewKoLog(log: BattleLogEntry[], fromIndex: number): boolean {
  for (let i = fromIndex; i < log.length; i++) {
    if (log[i].type === "ko") return true;
  }
  return false;
}

/** Golpe primeiro, dano ao piscar — estilo Pokémon clássico */
export function playBattleCombatSounds(
  log: BattleLogEntry[],
  fromIndex: number,
  flashDelayMs = 280
): void {
  const hitSound = findNewHitSound(log, fromIndex);
  if (!hitSound) return;

  const koAfter = hasNewKoLog(log, fromIndex);

  void playBattleStrike();
  window.setTimeout(() => {
    void playBattleDamage(hitSound);
    if (koAfter) {
      window.setTimeout(() => void playBattleFaint(), 220);
    }
  }, flashDelayMs);
}

/** Eventos sem golpe (ex.: só desmaio em log futuro) */
export function playBattleKoSounds(log: BattleLogEntry[], fromIndex: number): void {
  if (hasNewKoLog(log, fromIndex)) {
    void playBattleFaint();
  }
}

/** @deprecated use playBattleCombatSounds */
export function playNewBattleHitSounds(log: BattleLogEntry[], fromIndex: number): void {
  playBattleCombatSounds(log, fromIndex);
}
