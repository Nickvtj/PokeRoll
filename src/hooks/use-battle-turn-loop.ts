"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  BATTLE_FLASH_MS,
  BATTLE_POST_COIN_PAUSE_MS,
  BATTLE_STRIKE_MS,
  BATTLE_TURN_INTERVAL_MS,
} from "@/data/economy-balance";
import {
  executeBattleTurn,
  inferCombatBeatFromTurn,
  type BattleStepResult,
} from "@/lib/battle-engine";
import {
  findNewHitSound,
  playBattleCombatSounds,
  playBattleKoSounds,
} from "@/lib/battle-sound-utils";
import type { BattleState } from "@/types/battle";

export interface BattleCombatHighlight {
  strikerFlat: number;
  victimFlat: number;
  phase: "strike" | "flash";
}

interface BattleTurnBonuses {
  battleDamage: number;
  critChance: number;
}

interface UseBattleTurnLoopOptions {
  fighting: boolean;
  battleState: BattleState | null;
  setBattleState: (state: BattleState | null) => void;
  getBonuses: () => BattleTurnBonuses;
  onTurnComplete: (state: BattleState, done: boolean) => void;
}

const PAUSE_AFTER_BEAT_MS = Math.max(
  400,
  BATTLE_TURN_INTERVAL_MS - BATTLE_STRIKE_MS - BATTLE_FLASH_MS
);

export function useBattleTurnLoop({
  fighting,
  battleState,
  setBattleState,
  getBonuses,
  onTurnComplete,
}: UseBattleTurnLoopOptions) {
  const [displayState, setDisplayState] = useState<BattleState | null>(null);
  const [combatHighlight, setCombatHighlight] = useState<BattleCombatHighlight | null>(
    null
  );

  const animatingRef = useRef(false);
  const fightingRef = useRef(fighting);
  const stateRef = useRef(battleState);
  const prevPhaseRef = useRef(battleState?.phase);
  const timeoutRef = useRef<number | null>(null);
  const finishTurnRef = useRef<(state: BattleState, done: boolean) => void>(() => {});
  const runTurnRef = useRef<() => void>(() => {});

  fightingRef.current = fighting;
  stateRef.current = battleState;

  const clearScheduledTurn = useCallback(() => {
    if (timeoutRef.current != null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const scheduleNextTurn = useCallback(
    (delayMs: number) => {
      clearScheduledTurn();
      timeoutRef.current = window.setTimeout(() => {
        runTurnRef.current();
      }, delayMs);
    },
    [clearScheduledTurn]
  );

  const finishTurn = useCallback(
    (state: BattleState, done: boolean) => {
      stateRef.current = state;
      setBattleState(state);
      onTurnComplete(state, done);
    },
    [onTurnComplete, setBattleState]
  );

  finishTurnRef.current = finishTurn;

  const playCombatBeat = useCallback(
    (
      prev: BattleState,
      state: BattleState,
      done: boolean,
      strikerFlat: number,
      victimFlat: number,
      logFrom: number
    ) => {
      animatingRef.current = true;
      setDisplayState(prev);
      setCombatHighlight({ strikerFlat, victimFlat, phase: "strike" });

      playBattleCombatSounds(state.log, logFrom, BATTLE_STRIKE_MS);

      window.setTimeout(() => {
        setDisplayState(state);
        setCombatHighlight({ strikerFlat, victimFlat, phase: "flash" });

        window.setTimeout(() => {
          setCombatHighlight(null);
          setDisplayState(null);
          animatingRef.current = false;
          finishTurnRef.current(state, done);

          if (fightingRef.current && state.phase === "fighting") {
            scheduleNextTurn(PAUSE_AFTER_BEAT_MS);
          }
        }, BATTLE_FLASH_MS);
      }, BATTLE_STRIKE_MS);
    },
    [scheduleNextTurn]
  );

  const runTurn = useCallback(() => {
    if (!fightingRef.current || animatingRef.current) {
      scheduleNextTurn(120);
      return;
    }

    const prev = stateRef.current;
    if (!prev || prev.phase !== "fighting") {
      if (fightingRef.current && prev?.phase === "coinFlip") {
        scheduleNextTurn(250);
      }
      return;
    }

    const logFrom = prev.log.length;
    const bonuses = getBonuses();
    const result: BattleStepResult = executeBattleTurn(prev, bonuses);
    const { state, done } = result;
    const hitSound = findNewHitSound(state.log, logFrom);

    const beat =
      result.combatBeat ??
      (hitSound ? inferCombatBeatFromTurn(prev, state, logFrom) : null);

    if (hitSound && beat) {
      playCombatBeat(prev, state, done, beat.strikerFlat, beat.victimFlat, logFrom);
      return;
    }

    playBattleKoSounds(state.log, logFrom);
    finishTurnRef.current(state, done);
    if (fightingRef.current && !done && state.phase === "fighting") {
      scheduleNextTurn(BATTLE_TURN_INTERVAL_MS);
    }
  }, [getBonuses, playCombatBeat, scheduleNextTurn]);

  runTurnRef.current = runTurn;

  useEffect(() => {
    if (!fighting) {
      animatingRef.current = false;
      setCombatHighlight(null);
      setDisplayState(null);
      clearScheduledTurn();
      prevPhaseRef.current = undefined;
      return undefined;
    }

    const phase = battleState?.phase;
    const prevPhase = prevPhaseRef.current;

    if (phase === "coinFlip") {
      scheduleNextTurn(350);
      prevPhaseRef.current = phase;
      return () => clearScheduledTurn();
    }

    if (prevPhase === "coinFlip" && phase === "fighting") {
      scheduleNextTurn(BATTLE_POST_COIN_PAUSE_MS);
      prevPhaseRef.current = phase;
      return () => clearScheduledTurn();
    }

    if (phase === "fighting" && prevPhase !== "coinFlip") {
      scheduleNextTurn(500);
    }

    prevPhaseRef.current = phase;
    return () => clearScheduledTurn();
  }, [fighting, battleState?.phase, scheduleNextTurn, clearScheduledTurn]);

  const resetLoop = useCallback(() => {
    animatingRef.current = false;
    setCombatHighlight(null);
    setDisplayState(null);
    clearScheduledTurn();
  }, [clearScheduledTurn]);

  return {
    arenaState: displayState ?? battleState,
    combatHighlight,
    resetLoop,
  };
}
