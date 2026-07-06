"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  BATTLE_FLASH_MS,
  BATTLE_INTRO_SETTLE_MS,
  BATTLE_SPRITE_INTRO_MS,
  BATTLE_STRIKE_MS,
} from "@/data/economy-balance";
import { getBattleCeremonyTimings } from "@/lib/battle-ceremony";
import { advanceToCoinFlip } from "@/lib/battle-engine";
import {
  executeEnemyAction,
  executePlayerAction,
  finishEnemyTurn,
  getCurrentEnemyAction,
  getMonotypeBonus,
  prepareEnemyTurn,
  resolveTacticalCoinFlip,
  deselectActor,
  deselectTarget,
  resolveBattleIfOver,
  resolvePostAction,
  applyPlayerSwitch,
  selectActor,
  selectMove,
  selectTarget,
  completeAutoPlayerSelection,
  type ResolvedAction,
} from "@/lib/tactical-battle-engine";
import {
  playBattleCoinResultReveal,
  playBattleCoinSpinSequence,
  playBattleCoinToss,
} from "@/lib/sound-engine";
import { playTacticalCombatSounds } from "@/lib/battle-sound-utils";
import { usePreferencesStore } from "@/stores/preferences-store";
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
  battleSpeed?: 1 | 2 | 3;
}

const PAUSE_AFTER_BEAT_MS = 450;

const PLAYER_PICK_PHASES = new Set([
  "player-pick-actor",
  "player-pick-target",
  "player-pick-move",
]);

export function useTacticalBattle({
  fighting,
  battleState,
  setBattleState,
  getBonuses,
  onTurnComplete,
  autoBattle = false,
  battleSpeed = 1,
}: UseTacticalBattleOptions) {
  const [displayState, setDisplayState] = useState<BattleState | null>(null);
  const [combatHighlight, setCombatHighlight] = useState<BattleCombatHighlight | null>(null);

  const animatingRef = useRef(false);
  const playerActionStartedRef = useRef(false);
  const enemyChainScheduledRef = useRef(false);
  const autoBattleScheduledRef = useRef(false);
  const fightingRef = useRef(fighting);
  const stateRef = useRef(battleState);
  const faceOffTimerRef = useRef<number | null>(null);
  const coinFlipTimerRef = useRef<number | null>(null);
  const fightRevealTimerRef = useRef<number | null>(null);
  const chainTimerRef = useRef<number | null>(null);
  const autoTimerRef = useRef<number | null>(null);
  const combatTimersRef = useRef<number[]>([]);
  const finishTurnRef = useRef<(state: BattleState, done: boolean) => void>(() => {});

  const soundsStartedRef = useRef(false);
  const lastCeremonySkipTokenRef = useRef(0);
  const ceremonySkipToken = usePreferencesStore((s) => s.ceremonySkipToken);

  // Respiro inicial: após as pokébolas caírem, segura o 1º ataque por um instante
  const introSettleRef = useRef(false);
  const introSettleMsRef = useRef(BATTLE_INTRO_SETTLE_MS);
  const introSettleTimerRef = useRef<number | null>(null);
  const prevFightingPhaseRef = useRef<string | undefined>(battleState?.phase);

  fightingRef.current = fighting;
  stateRef.current = battleState;

  const clearFaceOffTimer = useCallback(() => {
    if (faceOffTimerRef.current != null) {
      window.clearTimeout(faceOffTimerRef.current);
      faceOffTimerRef.current = null;
    }
  }, []);

  const clearCoinFlipTimer = useCallback(() => {
    if (coinFlipTimerRef.current != null) {
      window.clearTimeout(coinFlipTimerRef.current);
      coinFlipTimerRef.current = null;
    }
  }, []);

  const clearFightRevealTimer = useCallback(() => {
    if (fightRevealTimerRef.current != null) {
      window.clearTimeout(fightRevealTimerRef.current);
      fightRevealTimerRef.current = null;
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

  const clearCombatTimers = useCallback(() => {
    for (const id of combatTimersRef.current) {
      window.clearTimeout(id);
    }
    combatTimersRef.current = [];
  }, []);

  const scheduleCombatTimeout = useCallback((fn: () => void, ms: number) => {
    const id = window.setTimeout(() => {
      combatTimersRef.current = combatTimersRef.current.filter((t) => t !== id);
      if (!fightingRef.current) return;
      fn();
    }, ms);
    combatTimersRef.current.push(id);
  }, []);

  const scheduleEnemyChain = useCallback(
    (delayMs: number) => {
      clearChainTimer();
      enemyChainScheduledRef.current = true;
      chainTimerRef.current = window.setTimeout(() => {
        enemyChainScheduledRef.current = false;
        chainTimerRef.current = null;
        if (!fightingRef.current) return;
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

  const skipCeremonyToFighting = useCallback(() => {
    const prev = stateRef.current;
    if (!prev || !fightingRef.current) return;
    if (
      prev.phase !== "faceOff" &&
      prev.phase !== "coinFlip" &&
      prev.phase !== "fightReveal"
    ) {
      return;
    }

    clearFaceOffTimer();
    clearCoinFlipTimer();
    clearFightRevealTimer();
    soundsStartedRef.current = true;

    if (prev.phase === "fightReveal") {
      const resolved = { ...prev, phase: "fighting" as const };
      stateRef.current = resolved;
      syncBattleState(resolved);
      if (resolved.tacticalPhase === "enemy-turn") {
        scheduleEnemyChain(getBattleCeremonyTimings(true).postCoinPauseMs);
      }
      return;
    }

    const state = prev.phase === "faceOff" ? advanceToCoinFlip(prev) : prev;
    if (state.phase !== "coinFlip") return;

    const resolved = resolveTacticalCoinFlip(state);
    stateRef.current = resolved;
    syncBattleState(resolved);

    if (resolved.tacticalPhase === "enemy-turn") {
      scheduleEnemyChain(getBattleCeremonyTimings(true).postCoinPauseMs);
    }
  }, [
    clearFaceOffTimer,
    clearCoinFlipTimer,
    clearFightRevealTimer,
    syncBattleState,
    scheduleEnemyChain,
  ]);

  useEffect(() => {
    if (ceremonySkipToken === lastCeremonySkipTokenRef.current) return;
    lastCeremonySkipTokenRef.current = ceremonySkipToken;
    skipCeremonyToFighting();
  }, [ceremonySkipToken, skipCeremonyToFighting]);

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

      playTacticalCombatSounds(next.log, logFrom, move, BATTLE_STRIKE_MS / battleSpeed);

      scheduleCombatTimeout(() => {
        setDisplayState(next);
        setCombatHighlight({
          strikerFlat,
          victimFlat,
          phase: "flash",
          moveType: move.type,
          statusApplied,
        });

        scheduleCombatTimeout(() => {
          setCombatHighlight({
            strikerFlat,
            victimFlat,
            phase: "impact",
            moveType: move.type,
            statusApplied,
          });

          scheduleCombatTimeout(() => {
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
      }, BATTLE_STRIKE_MS / battleSpeed);
    },
    [syncBattleState, scheduleCombatTimeout, battleSpeed]
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
      // Golpe inimigo derrubou um ativo do jogador → aguarda a escolha no modal
      if (result.state.pendingSwitch?.side === "player") return;
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
      scheduleEnemyChain(PAUSE_AFTER_BEAT_MS / battleSpeed);
    });
  }, [getBonuses, playCombatBeat, scheduleEnemyChain, syncBattleState, battleSpeed]);

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

  // Ao entrar na luta (pokébolas caindo), abre uma janela de "respiro" antes do 1º ataque
  useEffect(() => {
    const phase = battleState?.phase;
    const was = prevFightingPhaseRef.current;
    prevFightingPhaseRef.current = phase;
    if (!fighting) return;
    if (phase === "fighting" && was !== "fighting") {
      // Mesmo com introdução acelerada, aguarda a pokébola cair (BATTLE_SPRITE_INTRO_MS).
      const settleMs = getBattleCeremonyTimings().skipSounds
        ? BATTLE_SPRITE_INTRO_MS
        : BATTLE_INTRO_SETTLE_MS;
      introSettleRef.current = true;
      introSettleMsRef.current = settleMs;
      if (introSettleTimerRef.current != null) {
        window.clearTimeout(introSettleTimerRef.current);
      }
      introSettleTimerRef.current = window.setTimeout(() => {
        introSettleRef.current = false;
        introSettleTimerRef.current = null;
      }, settleMs);
    }
  }, [battleState?.phase, fighting]);

  useEffect(() => {
    const phase = battleState?.tacticalPhase;
    if (
      !autoBattle ||
      !fighting ||
      battleState?.phase !== "fighting" ||
      !phase ||
      !PLAYER_PICK_PHASES.has(phase) ||
      animatingRef.current ||
      autoBattleScheduledRef.current
    ) {
      return;
    }

    autoBattleScheduledRef.current = true;
    // Primeira ação automática também respeita o respiro inicial (entrada da pokébola)
    const delay = (introSettleRef.current ? introSettleMsRef.current : 500) / battleSpeed;
    autoTimerRef.current = window.setTimeout(() => {
      autoBattleScheduledRef.current = false;
      autoTimerRef.current = null;
      if (!fightingRef.current) return;

      const next = completeAutoPlayerSelection(stateRef.current!);
      if (!next) return;

      stateRef.current = next;
      setBattleState(next);
    }, delay);
  }, [
    autoBattle,
    battleSpeed,
    fighting,
    battleState?.phase,
    battleState?.tacticalPhase,
    battleState?.pendingSelection?.actorSlot,
    battleState?.pendingSelection?.targetSlot,
    setBattleState,
  ]);

  useEffect(() => {
    if (!fighting) {
      fightingRef.current = false;
      animatingRef.current = false;
      playerActionStartedRef.current = false;
      setCombatHighlight(null);
      setDisplayState(null);
      clearFaceOffTimer();
      clearCoinFlipTimer();
      clearFightRevealTimer();
      clearChainTimer();
      clearAutoTimer();
      clearCombatTimers();
      soundsStartedRef.current = false;
      introSettleRef.current = false;
      if (introSettleTimerRef.current != null) {
        window.clearTimeout(introSettleTimerRef.current);
        introSettleTimerRef.current = null;
      }
      return undefined;
    }

    if (battleState?.phase !== "coinFlip") {
      return undefined;
    }

    const timings = getBattleCeremonyTimings();
    const playerStarts = battleState.playerStarts ?? true;
    if (!soundsStartedRef.current && !timings.skipSounds) {
      soundsStartedRef.current = true;
      void playBattleCoinToss();
      void playBattleCoinSpinSequence(timings.coinRevealMs / 1000);
    } else if (!soundsStartedRef.current) {
      soundsStartedRef.current = true;
    }

    const revealTimer = window.setTimeout(() => {
      if (!timings.skipSounds) {
        void playBattleCoinResultReveal(playerStarts);
      }
    }, timings.coinRevealMs);

    coinFlipTimerRef.current = window.setTimeout(() => {
      coinFlipTimerRef.current = null;
      const prev = stateRef.current;
      if (!prev || prev.phase !== "coinFlip") return;
      const resolved = resolveTacticalCoinFlip(prev);

      if (timings.skipSounds) {
        stateRef.current = resolved;
        syncBattleState(resolved);
        if (resolved.tacticalPhase === "enemy-turn") {
          // Aguarda a entrada da pokébola antes do 1º golpe inimigo, mesmo acelerado.
          scheduleEnemyChain(Math.max(timings.postCoinPauseMs, BATTLE_SPRITE_INTRO_MS));
        }
        return;
      }

      const revealState = { ...resolved, phase: "fightReveal" as const };
      stateRef.current = revealState;
      syncBattleState(revealState);
    }, timings.coinFlipMs);

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
    clearCombatTimers,
    clearFaceOffTimer,
  ]);

  useEffect(() => {
    if (!fighting || battleState?.phase !== "fightReveal") {
      return undefined;
    }

    const timings = getBattleCeremonyTimings();
    fightRevealTimerRef.current = window.setTimeout(() => {
      fightRevealTimerRef.current = null;
      const prev = stateRef.current;
      if (!prev || prev.phase !== "fightReveal") return;
      const resolved = { ...prev, phase: "fighting" as const };
      stateRef.current = resolved;
      syncBattleState(resolved);
      if (resolved.tacticalPhase === "enemy-turn") {
        // Espera as pokébolas assentarem antes do 1º golpe do oponente
        scheduleEnemyChain(timings.skipSounds ? timings.postCoinPauseMs : BATTLE_INTRO_SETTLE_MS);
      }
    }, timings.fightRevealMs);

    return () => {
      clearFightRevealTimer();
    };
  }, [
    fighting,
    battleState?.phase,
    syncBattleState,
    scheduleEnemyChain,
    clearFightRevealTimer,
  ]);

  useEffect(() => {
    if (!fighting) return undefined;

    if (battleState?.phase !== "faceOff") {
      return undefined;
    }

    const { faceOffMs } = getBattleCeremonyTimings();

    faceOffTimerRef.current = window.setTimeout(() => {
      faceOffTimerRef.current = null;
      const prev = stateRef.current;
      if (!prev || prev.phase !== "faceOff") return;
      const next = advanceToCoinFlip(prev);
      stateRef.current = next;
      syncBattleState(next);
    }, faceOffMs);

    return () => {
      clearFaceOffTimer();
    };
  }, [fighting, battleState?.phase, syncBattleState, clearFaceOffTimer]);

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
      if (!prev) return;

      const pending = prev.pendingSelection ?? {};

      if (
        prev.tacticalPhase === "player-pick-move" &&
        pending.targetSlot === slot
      ) {
        const next = deselectTarget(prev);
        stateRef.current = next;
        setBattleState(next);
        return;
      }

      if (prev.tacticalPhase !== "player-pick-target") return;
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

    let next: BattleState;
    if (prev.tacticalPhase === "player-pick-move") {
      next = deselectTarget(prev);
    } else if (prev.tacticalPhase === "player-pick-target") {
      next = deselectActor(prev);
    } else {
      return;
    }

    stateRef.current = next;
    setBattleState(next);
  }, [setBattleState]);

  const pickSwitch = useCallback(
    (benchIndex: number) => {
      if (animatingRef.current) return;
      const prev = stateRef.current;
      if (!prev?.pendingSwitch || prev.pendingSwitch.side !== "player") return;

      const resume = prev.pendingSwitch.resume ?? "playerTurn";
      const switched = applyPlayerSwitch(prev, benchIndex);
      if (switched === prev) return; // escolha inválida (reserva desmaiada)

      // Trata KO em cadeia (ex.: dois ativos caem por veneno)
      const post = resolvePostAction(switched);
      if (post.ended) {
        stateRef.current = post.state;
        syncBattleState(post.state);
        finishTurnRef.current(post.state, true);
        return;
      }
      if (post.needsPlayerSwitch) {
        const again: BattleState = {
          ...post.state,
          pendingSwitch: { ...post.state.pendingSwitch!, resume },
        };
        stateRef.current = again;
        syncBattleState(again);
        return;
      }

      if (resume === "finishTurn") {
        const finished = finishEnemyTurn(post.state);
        stateRef.current = finished;
        syncBattleState(finished);
        if (finished.phase === "victory" || finished.phase === "defeat") {
          finishTurnRef.current(finished, true);
        }
        return;
      }

      const resumed: BattleState = {
        ...post.state,
        roundNumber: (post.state.roundNumber ?? 1) + 1,
        tacticalPhase: "player-pick-actor",
        pendingSelection: {},
        enemyActionQueue: [],
      };
      stateRef.current = resumed;
      syncBattleState(resumed);
    },
    [syncBattleState]
  );

  const resetLoop = useCallback(() => {
    fightingRef.current = false;
    animatingRef.current = false;
    playerActionStartedRef.current = false;
    enemyChainScheduledRef.current = false;
    autoBattleScheduledRef.current = false;
    setCombatHighlight(null);
    setDisplayState(null);
    clearCoinFlipTimer();
    clearChainTimer();
    clearAutoTimer();
    clearCombatTimers();
  }, [clearCoinFlipTimer, clearChainTimer, clearAutoTimer, clearCombatTimers]);

  return {
    arenaState: displayState ?? battleState,
    combatHighlight,
    pickActor,
    pickTarget,
    pickMove,
    pickSwitch,
    cancelSelection,
    resetLoop,
    isAnimating: animatingRef.current,
  };
}
