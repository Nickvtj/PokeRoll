"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  BATTLE_COIN_FLIP_MS,
  BATTLE_COIN_REVEAL_MS,
  BATTLE_FLASH_MS,
  BATTLE_POST_COIN_PAUSE_MS,
  BATTLE_STRIKE_MS,
} from "@/data/economy-balance";
import {
  executeEnemyAction,
  executePlayerAction,
  finishEnemyTurn,
  getCurrentEnemyAction,
  getMonotypeBonus,
  prepareEnemyTurn,
  resolveTacticalCoinFlip,
  deselectActor,
  resolveBattleIfOver,
  selectActor,
  selectMove,
  selectTarget,
  buildAutoPlayerAction,
  type ResolvedAction,
} from "@/lib/tactical-battle-engine";
import {
  playBattleCoinResultReveal,
  playBattleCoinSpinSequence,
  playBattleCoinToss,
} from "@/lib/sound-engine";
import { playTacticalCombatSounds } from "@/lib/battle-sound-utils";
import type { BattleState, TacticalPhase } from "@/types/battle";

export interface BattleCombatHighlight {
  strikerFlat: number;
  victimFlat: number;
  phase: "strike" | "flash" | "impact";
  moveType?: string;
  statusApplied?: string;
}

interface UseTacticalBattleOptions {
  fighting: boolean;
  battleState: BattleState | null;
  setBattleState: (state: BattleState | null) => void;
  getBonuses: () => { battleDamage: number; critChance: number; defenseBoost?: number };
  onTurnComplete: (state: BattleState, done: boolean) => void;
  autoBattle?: boolean;
}

const PAUSE_AFTER_BEAT_MS = 450;

export function useTacticalBattle({
  fighting,
  battleState,
  setBattleState,
  getBonuses,
  onTurnComplete,
  autoBattle = false,
}: UseTacticalBattleOptions) {
  const [displayState, setDisplayState] = useState<BattleState | null>(null);
  const [combatHighlight, setCombatHighlight] = useState<BattleCombatHighlight | null>(null);

  const animatingRef = useRef(false);
  const playerActionStartedRef = useRef(false);
  const enemyChainScheduledRef = useRef(false);
  const autoBattleScheduledRef = useRef(false);
  const fightingRef = useRef(fighting);
  const stateRef = useRef(battleState);
  const coinFlipTimerRef = useRef<number | null>(null);
  const chainTimerRef = useRef<number | null>(null);
  const autoTimerRef = useRef<number | null>(null);
  const finishTurnRef = useRef<(state: BattleState, done: boolean) => void>(() => {});

  const soundsStartedRef = useRef(false);

  fightingRef.current = fighting;
  stateRef.current = battleState;

  const clearCoinFlipTimer = useCallback(() => {
    if (coinFlipTimerRef.current != null) {
      window.clearTimeout(coinFlipTimerRef.current);
      coinFlipTimerRef.current = null;
    }
  }, []);

  const clearChainTimer = useCallback(() => {
    if (chainTimerRef.current != null) {
      window.clearTimeout(chainTimerRef.current);
      chainTimerRef.current = null;
    }
    enemyChainScheduledRef.current = false;
  }, []);

  const clearAutoTimer = useCallback(() => {
    if (autoTimerRef.current != null) {
      window.clearTimeout(autoTimerRef.current);
      autoTimerRef.current = null;
    }
    autoBattleScheduledRef.current = false;
  }, []);

  const scheduleEnemyChain = useCallback(
    (delayMs: number) => {
      clearChainTimer();
      enemyChainScheduledRef.current = true;
      chainTimerRef.current = window.setTimeout(() => {
        enemyChainScheduledRef.current = false;
        chainTimerRef.current = null;
        runEnemyChainRef.current();
      }, delayMs);
    },
    [clearChainTimer]
  );

  const finishTurn = useCallback(
    (state: BattleState, done: boolean) => {
      stateRef.current = state;
      setBattleState(state);
      if (done) {
        onTurnComplete(state, true);
      }
    },
    [onTurnComplete, setBattleState]
  );

  finishTurnRef.current = finishTurn;

  const syncBattleState = useCallback(
    (state: BattleState) => {
      stateRef.current = state;
      setBattleState(state);
    },
    [setBattleState]
  );

  const playCombatBeat = useCallback(
    (
      prev: BattleState,
      next: BattleState,
      done: boolean,
      resolved: ResolvedAction,
      onComplete: () => void
    ) => {
      animatingRef.current = true;
      const logFrom = prev.log.length;
      const { strikerFlat, victimFlat, move, statusApplied } = resolved;

      setDisplayState(prev);
      setCombatHighlight({
        strikerFlat,
        victimFlat,
        phase: "strike",
        moveType: move.type,
        statusApplied,
      });

      playTacticalCombatSounds(next.log, logFrom, move, BATTLE_STRIKE_MS);

      window.setTimeout(() => {
        setDisplayState(next);
        setCombatHighlight({
          strikerFlat,
          victimFlat,
          phase: "flash",
          moveType: move.type,
          statusApplied,
        });

        window.setTimeout(() => {
          setCombatHighlight({
            strikerFlat,
            victimFlat,
            phase: "impact",
            moveType: move.type,
            statusApplied,
          });

          window.setTimeout(() => {
            setCombatHighlight(null);
            setDisplayState(null);
            animatingRef.current = false;
            syncBattleState(next);
            if (done) {
              finishTurnRef.current(next, true);
            }
            onComplete();
          }, 180);
        }, BATTLE_FLASH_MS);
      }, BATTLE_STRIKE_MS);
    },
    [syncBattleState]
  );

  const runEnemyChainRef = useRef<() => void>(() => {});

  const runEnemyChain = useCallback(() => {
    const current = stateRef.current;
    if (!fightingRef.current) return;
    if (!current || current.phase !== "fighting" || current.tacticalPhase !== "enemy-turn") return;
    if (animatingRef.current) return;

    const action = getCurrentEnemyAction(current);
    if (!action) {
      const finished = finishEnemyTurn(current);
      const endCheck = finished.phase === "victory" || finished.phase === "defeat";
      stateRef.current = finished;
      syncBattleState(finished);
      if (endCheck) {
        finishTurnRef.current(finished, true);
      }
      return;
    }

    const prev = current;
    const { result, done } = executeEnemyAction(prev, getBonuses());

    if (!result) {
      const finished = finishEnemyTurn(stateRef.current ?? prev);
      stateRef.current = finished;
      syncBattleState(finished);
      return;
    }

    playCombatBeat(prev, result.state, done, result, () => {
      if (done) return;
      const finished = finishEnemyTurn(result.state);
      stateRef.current = finished;
      syncBattleState(finished);
    });
  }, [getBonuses, playCombatBeat, syncBattleState]);

  runEnemyChainRef.current = runEnemyChain;

  const executePendingPlayerAction = useCallback(() => {
    const prev = stateRef.current;
    if (!prev || prev.tacticalPhase !== "executing") return;
    if (playerActionStartedRef.current) return;

    playerActionStartedRef.current = true;

    const animating: BattleState = { ...prev, tacticalPhase: "animating" };
    stateRef.current = animating;
    syncBattleState(animating);

    const { result, nextPhase } = executePlayerAction(
      prev,
      getBonuses(),
      getMonotypeBonus(prev.playerTeam)
    );

    if (!result) {
      playerActionStartedRef.current = false;
      const fixed = { ...prev, tacticalPhase: nextPhase as TacticalPhase, pendingSelection: {} };
      stateRef.current = fixed;
      syncBattleState(fixed);
      return;
    }

    const done = result.state.phase === "victory" || result.state.phase === "defeat";

    playCombatBeat(prev, result.state, done, result, () => {
      playerActionStartedRef.current = false;
      if (done) return;

      const withEnemy = prepareEnemyTurn(result.state);
      stateRef.current = withEnemy;
      syncBattleState(withEnemy);
      scheduleEnemyChain(PAUSE_AFTER_BEAT_MS);
    });
  }, [getBonuses, playCombatBeat, scheduleEnemyChain, syncBattleState]);

  useEffect(() => {
    if (!fighting || !battleState || battleState.phase !== "fighting") return;
    if (animatingRef.current) return;

    const { state: resolved, ended } = resolveBattleIfOver(battleState);
    if (ended && resolved.phase !== battleState.phase) {
      stateRef.current = resolved;
      syncBattleState(resolved);
      finishTurnRef.current(resolved, true);
    }
  }, [fighting, battleState, syncBattleState]);

  useEffect(() => {
    if (battleState?.tacticalPhase === "executing" && !animatingRef.current) {
      executePendingPlayerAction();
    }
  }, [battleState?.tacticalPhase, executePendingPlayerAction]);

  /** Fallback: inicia turno inimigo se a fila existe mas o timer foi cancelado */
  useEffect(() => {
    if (
      !fighting ||
      battleState?.phase !== "fighting" ||
      battleState.tacticalPhase !== "enemy-turn" ||
      animatingRef.current ||
      enemyChainScheduledRef.current
    ) {
      return;
    }

    const queueLen = battleState.enemyActionQueue?.length ?? 0;
    if (queueLen === 0) return;

    scheduleEnemyChain(80);
  }, [
    fighting,
    battleState?.phase,
    battleState?.tacticalPhase,
    battleState?.enemyActionQueue?.length,
    scheduleEnemyChain,
  ]);

  useEffect(() => {
    if (
      autoBattle &&
      fighting &&
      battleState?.phase === "fighting" &&
      battleState.tacticalPhase === "player-pick-actor" &&
      !animatingRef.current &&
      !autoBattleScheduledRef.current
    ) {
      const selection = buildAutoPlayerAction(battleState);
      if (selection) {
        autoBattleScheduledRef.current = true;
        autoTimerRef.current = window.setTimeout(() => {
          autoBattleScheduledRef.current = false;
          autoTimerRef.current = null;
          
          let s = selectActor(stateRef.current!, selection.actorSlot);
          s = selectTarget(s, selection.targetSlot);
          s = selectMove(s, selection.moveIndex);
          
          stateRef.current = s;
          setBattleState(s);
        }, 600);
      }
    }
  }, [autoBattle, fighting, battleState?.phase, battleState?.tacticalPhase, setBattleState]);

  useEffect(() => {
    if (!fighting) {
      animatingRef.current = false;
      playerActionStartedRef.current = false;
      setCombatHighlight(null);
      setDisplayState(null);
      clearCoinFlipTimer();
      clearChainTimer();
      clearAutoTimer();
      soundsStartedRef.current = false;
      return undefined;
    }

    if (battleState?.phase !== "coinFlip") {
      return undefined;
    }

    const playerStarts = battleState.playerStarts ?? true;
    if (!soundsStartedRef.current) {
      soundsStartedRef.current = true;
      void playBattleCoinToss();
      void playBattleCoinSpinSequence(BATTLE_COIN_REVEAL_MS / 1000);
    }

    const revealTimer = window.setTimeout(() => {
      void playBattleCoinResultReveal(playerStarts);
    }, BATTLE_COIN_REVEAL_MS);

    coinFlipTimerRef.current = window.setTimeout(() => {
      coinFlipTimerRef.current = null;
      const prev = stateRef.current;
      if (!prev || prev.phase !== "coinFlip") return;
      const resolved = resolveTacticalCoinFlip(prev);
      stateRef.current = resolved;
      syncBattleState(resolved);

      if (resolved.tacticalPhase === "enemy-turn") {
        scheduleEnemyChain(BATTLE_POST_COIN_PAUSE_MS);
      }
    }, BATTLE_COIN_FLIP_MS);

    return () => {
      window.clearTimeout(revealTimer);
      clearCoinFlipTimer();
    };
  }, [
    fighting,
    battleState?.phase,
    battleState?.playerStarts,
    syncBattleState,
    scheduleEnemyChain,
    clearCoinFlipTimer,
    clearAutoTimer,
  ]);

  const pickActor = useCallback(
    (slot: number) => {
      if (animatingRef.current) return;
      const prev = stateRef.current;
      if (!prev) return;

      const pending = prev.pendingSelection ?? {};
      const isReselect =
        (prev.tacticalPhase === "player-pick-target" ||
          prev.tacticalPhase === "player-pick-move") &&
        pending.actorSlot === slot;

      if (isReselect) {
        const next = deselectActor(prev);
        stateRef.current = next;
        setBattleState(next);
        return;
      }

      if (prev.tacticalPhase !== "player-pick-actor") return;

      let next = selectActor(prev, slot);
      const { state: resolved, ended } = resolveBattleIfOver(next);
      next = resolved;
      stateRef.current = next;
      setBattleState(next);
      if (ended) {
        finishTurnRef.current(next, true);
      }
    },
    [setBattleState]
  );

  const pickTarget = useCallback(
    (slot: number) => {
      if (animatingRef.current) return;
      const prev = stateRef.current;
      if (!prev || prev.tacticalPhase !== "player-pick-target") return;
      const next = selectTarget(prev, slot);
      stateRef.current = next;
      setBattleState(next);
    },
    [setBattleState]
  );

  const pickMove = useCallback(
    (moveIndex: number) => {
      if (animatingRef.current) return;
      const prev = stateRef.current;
      if (!prev || prev.tacticalPhase !== "player-pick-move") return;
      const next = selectMove(prev, moveIndex);
      stateRef.current = next;
      setBattleState(next);
    },
    [setBattleState]
  );

  const cancelSelection = useCallback(() => {
    if (animatingRef.current) return;
    const prev = stateRef.current;
    if (!prev) return;
    const next: BattleState = {
      ...prev,
      tacticalPhase: "player-pick-actor",
      pendingSelection: {},
    };
    stateRef.current = next;
    setBattleState(next);
  }, [setBattleState]);

  const resetLoop = useCallback(() => {
    animatingRef.current = false;
    playerActionStartedRef.current = false;
    setCombatHighlight(null);
    setDisplayState(null);
    clearCoinFlipTimer();
    clearChainTimer();
    clearAutoTimer();
  }, [clearCoinFlipTimer, clearChainTimer, clearAutoTimer]);

  return {
    arenaState: displayState ?? battleState,
    combatHighlight,
    pickActor,
    pickTarget,
    pickMove,
    cancelSelection,
    resetLoop,
    isAnimating: animatingRef.current,
  };
}
