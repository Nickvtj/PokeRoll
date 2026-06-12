"use client";

/**
 * Áudio de batalha — delegado ao motor procedural (battle-hit-sounds).
 * Mantido para compatibilidade; Mixkit removido.
 */

import { isSoundEnabled } from "@/lib/player-preferences";
import { playBattleHit, playBattleStrike } from "@/lib/battle-hit-sounds";
import type { BattleHitSound } from "@/types/battle";

class BattleAudioManager {
  private static instance: BattleAudioManager;

  static getInstance() {
    if (!BattleAudioManager.instance) {
      BattleAudioManager.instance = new BattleAudioManager();
    }
    return BattleAudioManager.instance;
  }

  play(_soundKey: string, _volume = 0.4) {
    if (!isSoundEnabled()) return;
    void playBattleStrike();
  }

  playAttack(type: string) {
    if (!isSoundEnabled()) return;
    const sound: BattleHitSound = {
      attackType: type,
      isCrit: false,
      effectiveness: "normal",
    };
    void playBattleHit(sound);
  }

  playImpact() {
    if (!isSoundEnabled()) return;
    void playBattleStrike();
  }
}

export const battleAudio = BattleAudioManager.getInstance();
