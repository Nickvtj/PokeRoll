import { playBattleHit } from "@/lib/battle-hit-sounds";
import type { BattleLogEntry } from "@/types/battle";

/** Toca o som do primeiro hit encontrado nos novos logs (evita sobreposição em AOE). */
export function playNewBattleHitSounds(log: BattleLogEntry[], fromIndex: number): void {
  for (let i = fromIndex; i < log.length; i++) {
    const hitSound = log[i].hitSound;
    if (hitSound) {
      void playBattleHit(hitSound);
      return;
    }
  }
}
