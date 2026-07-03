import { TEAM_MONOTYPE_DAMAGE_BONUS } from "@/data/economy-balance";
import { getDefaultEquippedMoves, resolveBattleMoves } from "@/data/pokemon-moves";
import { getDualTypeEffectiveness, getDefenderTypes, TYPE_LABELS_PT } from "@/data/type-chart";
import {
  calcBattleReward,
  computeBattlePerformance,
  createFighter,
  performCoinFlip,
  type BattleStepResult,
} from "@/lib/battle-engine";
import type {
  BattleFighter,
  BattleHitEffectiveness,
  BattleHitSound,
  BattleLogEntry,
  BattleMove,
  BattlePendingSelection,
  BattleState,
  FighterStatus,
  MovePreview,
  StatusEffect,
  TacticalPhase,
} from "@/types/battle";
import type { Pokemon } from "@/types";
import { BATTLE_TEAM_SIZE } from "@/data/battle-theme";

export const TEAM_SIZE = BATTLE_TEAM_SIZE;

let logId = 0;
function log(
  message: string,
  type: BattleLogEntry["type"],
  hitSound?: BattleHitSound
): BattleLogEntry {
  return { id: `tac-${++logId}`, message, type, timestamp: Date.now(), hitSound };
}

function effectivenessFromMult(typeMult: number): BattleHitEffectiveness {
  if (typeMult === 0) return "immune";
  if (typeMult > 1) return "super";
  if (typeMult < 1) return "weak";
  return "normal";
}

/** Passiva de defesa do Pokémon que está recebendo o golpe (ex.: Gordura Espessa do Snorlax). */
function getDefenderDefenseMult(defender: BattleFighter): number {
  const ability = defender.stats.ability;
  if (ability?.type === "passive" && ability.effect === "defense_boost") {
    return ability.value;
  }
  return 1;
}

function buildHitSound(move: BattleMove, typeMult: number, isCrit: boolean): BattleHitSound {
  return {
    attackType: move.type,
    isCrit,
    effectiveness: effectivenessFromMult(typeMult),
  };
}

/** Som garantido mesmo em erros / golpes de status */
function buildMoveHitSound(move: BattleMove, typeMult = 1, isCrit = false): BattleHitSound {
  return buildHitSound(move, typeMult, isCrit);
}

export interface MoveAttachConfig {
  moveLoadouts?: Record<string, string[]>;
}

export function attachMovesToFighter(
  fighter: BattleFighter,
  config?: MoveAttachConfig
): BattleFighter {
  const level = fighter.battleLevel ?? 1;
  const loadout = fighter.isPlayer
    ? config?.moveLoadouts?.[String(fighter.pokemon.id)]
    : null;
  const moves = resolveBattleMoves(fighter.pokemon.id, level, loadout);
  return { ...fighter, equippedMoves: moves, status: null };
}

export function attachMovesToTeam(
  fighters: BattleFighter[],
  config?: MoveAttachConfig
): BattleFighter[] {
  return fighters.map((f) => attachMovesToFighter(f, config));
}

export function getAllFighters(state: BattleState): BattleFighter[] {
  return [...state.playerTeam, ...state.enemyTeam];
}

export function fighterFlatIndex(f: BattleFighter): number {
  return f.isPlayer ? (f.slotIndex ?? 0) : TEAM_SIZE + (f.slotIndex ?? 0);
}

export function getLivingFighters(fighters: BattleFighter[]): BattleFighter[] {
  return fighters.filter((f) => f.currentHp > 0);
}

function findFighter(team: BattleFighter[], slot: number, isPlayer: boolean): BattleFighter | undefined {
  return team.find((f) => f.isPlayer === isPlayer && f.slotIndex === slot);
}

function updateFighter(
  state: BattleState,
  slot: number,
  isPlayer: boolean,
  patch: Partial<BattleFighter>
): BattleState {
  const key = isPlayer ? "playerTeam" : "enemyTeam";
  const team = state[key].map((f) =>
    f.slotIndex === slot && f.isPlayer === isPlayer ? { ...f, ...patch } : f
  );
  return { ...state, [key]: team };
}

function effectivenessLabel(typeMult: number, typeLabel: string | null): string {
  if (typeMult === 0) return "Sem efeito";
  if (typeMult > 1) return "Super efetivo!";
  if (typeMult < 1) return "Pouco efetivo";
  return "Dano convencional";
}

export function previewMove(
  state: BattleState,
  actorSlot: number,
  targetSlot: number,
  move: BattleMove,
  bonuses: { battleDamage: number; critChance: number; defenseBoost?: number }
): MovePreview {
  const actor = findFighter(state.playerTeam, actorSlot, true);
  const target = findFighter(state.enemyTeam, targetSlot, false);
  if (!actor || !target) {
    return {
      move,
      effectiveness: "normal",
      typeLabel: null,
      typeMult: 1,
      estimatedDamage: [0, 0],
      statusChance: move.statusChance ?? 0,
    };
  }

  const defenderTypes = getDefenderTypes(target.pokemon.id, target.pokemon.name);
  const { multiplier: typeMult, label: typeLabel } = getDualTypeEffectiveness(
    move.type,
    defenderTypes
  );
  const { min, max } = estimateDamageRange(actor, target, move, typeMult, bonuses);

  return {
    move,
    effectiveness: effectivenessFromMult(typeMult),
    typeLabel,
    typeMult,
    estimatedDamage: [min, max],
    statusChance: move.statusChance ?? 0,
  };
}

function estimateDamageRange(
  attacker: BattleFighter,
  defender: BattleFighter,
  move: BattleMove,
  typeMult: number,
  bonuses: { battleDamage: number; critChance: number; defenseBoost?: number }
): { min: number; max: number } {
  if (typeMult === 0 || move.category === "status") return { min: 0, max: 0 };

  const damageMult = 1 + bonuses.battleDamage;
  const defenseMult = getDefenderDefenseMult(defender);
  const powerFactor = move.power / 50;

  const effectiveDefense = defender.stats.defense * defenseMult * 0.85;

  const rawMin =
    ((attacker.stats.attack * damageMult * powerFactor) /
      (attacker.stats.attack + effectiveDefense + 14)) *
    50 *
    typeMult;
  const rawMax = rawMin * 1.45;
  
  // Teto de dano liberado (100% da vida em vez de 42%)
  const cap = Math.max(8, Math.round(defender.maxHp * 1.0));

  return {
    min: Math.max(typeMult > 1 ? 2 : 1, Math.min(Math.round(rawMin), cap)),
    max: Math.max(typeMult > 1 ? 2 : 1, Math.min(Math.round(rawMax), cap)),
  };
}

function calcMoveDamage(
  attacker: BattleFighter,
  defender: BattleFighter,
  move: BattleMove,
  damageMult: number,
  critChance: number
): { damage: number; isCrit: boolean; typeLabel: string | null; typeMult: number } {
  const defenderTypes = getDefenderTypes(defender.pokemon.id, defender.pokemon.name);
  const { multiplier: typeMult, label: typeLabel } = getDualTypeEffectiveness(
    move.type,
    defenderTypes
  );

  if (typeMult === 0 || move.category === "status") {
    return { damage: 0, isCrit: false, typeLabel, typeMult };
  }

  const isCrit = Math.random() < critChance;
  const defenseMult = getDefenderDefenseMult(defender);
  const powerFactor = move.power / 50;

  const effectiveDefense = defender.stats.defense * defenseMult * 0.85;

  let raw =
    ((attacker.stats.attack * damageMult * powerFactor) /
      (attacker.stats.attack + effectiveDefense + 14)) *
      50 *
      typeMult +
    Math.random() * 4;

  if (isCrit) raw *= 1.45;
  const damage = Math.max(typeMult > 1 ? 2 : 1, Math.round(raw));
  
  // Teto de dano liberado
  const maxHit = Math.max(8, Math.round(defender.maxHp * 1.0));

  return {
    damage: Math.min(damage, maxHit),
    isCrit,
    typeLabel,
    typeMult,
  };
}

function statusLabel(effect: StatusEffect): string {
  const labels: Record<StatusEffect, string> = {
    burn: "Queimadura",
    paralyze: "Paralisia",
    poison: "Envenenamento",
    sleep: "Sono",
  };
  return labels[effect];
}

function statusDuration(effect: StatusEffect): number {
  if (effect === "sleep") return 2 + Math.floor(Math.random() * 2);
  if (effect === "paralyze") return 3;
  return 999;
}

function canAct(fighter: BattleFighter): { can: boolean; reason?: string } {
  if (fighter.currentHp <= 0) return { can: false };
  if (fighter.status?.effect === "sleep") {
    return { can: false, reason: `${fighter.pokemon.name} está dormindo!` };
  }
  if (fighter.status?.effect === "paralyze" && Math.random() < 0.25) {
    return { can: false, reason: `${fighter.pokemon.name} está paralisado!` };
  }
  return { can: true };
}

function tickStatusAtRoundEnd(state: BattleState): { state: BattleState; logs: BattleLogEntry[] } {
  let next = state;
  const logs: BattleLogEntry[] = [];

  for (const isPlayer of [true, false]) {
    const team = isPlayer ? next.playerTeam : next.enemyTeam;
    for (const f of team) {
      if (f.currentHp <= 0 || !f.status) continue;
      const slot = f.slotIndex ?? 0;

      if (f.status.effect === "poison" || f.status.effect === "burn") {
        const dot = Math.max(1, Math.round(f.maxHp * 0.08));
        const updated = findFighter(isPlayer ? next.playerTeam : next.enemyTeam, slot, isPlayer)!;
        const newHp = Math.max(0, updated.currentHp - dot);
        next = updateFighter(next, slot, isPlayer, {
          currentHp: newHp,
          status:
            f.status.turnsLeft <= 1 && f.status.effect === "burn"
              ? null
              : { ...f.status, turnsLeft: Math.max(0, f.status.turnsLeft - 1) },
        });
        logs.push(
          log(
            `${f.pokemon.name} sofre dano de ${statusLabel(f.status.effect).toLowerCase()} (-${dot})`,
            "damage"
          )
        );
      } else if (f.status.turnsLeft > 0) {
        const left = f.status.turnsLeft - 1;
        next = updateFighter(next, slot, isPlayer, {
          status: left <= 0 ? null : { ...f.status, turnsLeft: left },
        });
        if (left <= 0) {
          logs.push(log(`${f.pokemon.name} se recuperou de ${statusLabel(f.status.effect).toLowerCase()}!`, "info"));
        }
      }
    }
  }

  return { state: next, logs };
}

function checkBattleEnd(state: BattleState): BattleStepResult | null {
  const livingPlayers = getLivingFighters(state.playerTeam);
  const livingEnemies = getLivingFighters(state.enemyTeam);

  if (livingEnemies.length === 0) {
    const isTraining = !state.mode || state.mode === "training";
    return {
      state: {
        ...state,
        phase: "victory",
        reward: isTraining
          ? calcBattleReward(state.wave, 0, computeBattlePerformance(state))
          : null,
        log: [...state.log, log("Vitória!", "info")],
        tacticalPhase: undefined,
      },
      done: true,
    };
  }
  if (livingPlayers.length === 0) {
    return {
      state: {
        ...state,
        phase: "defeat",
        log: [...state.log, log("Derrota...", "ko")],
        tacticalPhase: undefined,
      },
      done: true,
    };
  }
  return null;
}

/** Verifica vitória/derrota após DOT, KO em cadeia, etc. */
export function resolveBattleIfOver(state: BattleState): {
  state: BattleState;
  ended: boolean;
} {
  const end = checkBattleEnd(state);
  if (end) return { state: end.state, ended: true };
  return { state, ended: false };
}

export interface ResolvedAction {
  state: BattleState;
  strikerFlat: number;
  victimFlat: number;
  move: BattleMove;
  statusApplied?: StatusEffect;
}

export function resolveAction(
  state: BattleState,
  actorSlot: number,
  targetSlot: number,
  moveIndex: number,
  actorIsPlayer: boolean,
  bonuses: { battleDamage: number; critChance: number; defenseBoost?: number },
  monotypeBonus = 0
): ResolvedAction | null {
  const actorTeam = actorIsPlayer ? state.playerTeam : state.enemyTeam;
  const targetTeam = actorIsPlayer ? state.enemyTeam : state.playerTeam;

  const actor = findFighter(actorTeam, actorSlot, actorIsPlayer);
  const target = findFighter(targetTeam, targetSlot, !actorIsPlayer);
  if (!actor || !target || actor.currentHp <= 0 || target.currentHp <= 0) return null;

  const move = actor.equippedMoves?.[moveIndex];
  if (!move) return null;

  const actCheck = canAct(actor);
  let next = state;
  let logs = [...state.log];

  if (!actCheck.can) {
    if (actCheck.reason) logs.push(log(actCheck.reason, "info"));
    if (actor.status?.effect === "sleep") {
      next = updateFighter(next, actorSlot, actorIsPlayer, { status: null });
      logs.push(log(`${actor.pokemon.name} acordou!`, "info"));
    }
    return {
      state: { ...next, log: logs, turnCount: (next.turnCount ?? 0) + 1 },
      strikerFlat: fighterFlatIndex(actor),
      victimFlat: fighterFlatIndex(actor),
      move,
    };
  }

  if (Math.random() > move.accuracy) {
    logs.push(
      log(`${actor.pokemon.name} errou ${move.name}!`, "attack", buildMoveHitSound(move))
    );
    return {
      state: { ...next, log: logs, turnCount: (next.turnCount ?? 0) + 1 },
      strikerFlat: fighterFlatIndex(actor),
      victimFlat: fighterFlatIndex(target),
      move,
    };
  }

  logs.push(
    log(`${actor.pokemon.name} usou ${move.name}!`, "attack", buildMoveHitSound(move))
  );

  let damageMult = 1 + bonuses.battleDamage + monotypeBonus;
  if (actorIsPlayer && actor.status?.effect === "burn") {
    damageMult *= 0.85;
  }

  const { damage, isCrit, typeLabel, typeMult } = calcMoveDamage(
    actor,
    target,
    move,
    damageMult,
    bonuses.critChance
  );

  let statusApplied: StatusEffect | undefined;
  let newTargetHp = target.currentHp;

  if (move.category === "status" && move.statusEffect) {
    if (Math.random() < (move.statusChance ?? 1) && !target.status) {
      statusApplied = move.statusEffect;
      next = updateFighter(next, targetSlot, !actorIsPlayer, {
        status: { effect: move.statusEffect, turnsLeft: statusDuration(move.statusEffect) },
      });
      logs.push(
        log(`${target.pokemon.name} foi afetado por ${statusLabel(move.statusEffect)}!`, "ability", buildMoveHitSound(move))
      );
    }
  } else if (damage > 0) {
    newTargetHp = Math.max(0, target.currentHp - damage);
    const effText = effectivenessLabel(typeMult, typeLabel);
    const typeSuffix = typeLabel ? ` · ${typeLabel}!` : "";
    logs.push(
      log(
        `${move.name} em ${target.pokemon.name} (-${damage}${isCrit ? " CRÍTICO!" : ""}${typeSuffix}) [${effText}]`,
        "damage",
        buildHitSound(move, typeMult, isCrit)
      )
    );
    next = updateFighter(next, targetSlot, !actorIsPlayer, { currentHp: newTargetHp });

    if (
      move.statusEffect &&
      move.statusChance &&
      Math.random() < move.statusChance &&
      newTargetHp > 0
    ) {
      const refreshed = findFighter(
        actorIsPlayer ? next.enemyTeam : next.playerTeam,
        targetSlot,
        !actorIsPlayer
      );
      if (refreshed && !refreshed.status) {
        statusApplied = move.statusEffect;
        next = updateFighter(next, targetSlot, !actorIsPlayer, {
          status: { effect: move.statusEffect, turnsLeft: statusDuration(move.statusEffect) },
        });
        logs.push(
          log(`${target.pokemon.name} foi afetado por ${statusLabel(move.statusEffect)}!`, "ability", buildMoveHitSound(move))
        );
      }
    }

    if (newTargetHp === 0) {
      logs.push(log(`${target.pokemon.name} desmaiou!`, "ko"));
      if (!actorIsPlayer) {
        next = { ...next, playerDeaths: (next.playerDeaths ?? 0) + 1 };
      }
      if (target.status?.effect === "sleep") {
        next = updateFighter(next, targetSlot, !actorIsPlayer, { status: null });
      }
    } else if (target.status?.effect === "sleep") {
      next = updateFighter(next, targetSlot, !actorIsPlayer, { status: null });
      logs.push(log(`${target.pokemon.name} acordou com o golpe!`, "info"));
    }
  } else if (typeMult === 0) {
    logs.push(
      log(`Não afetou ${target.pokemon.name}...`, "info", buildMoveHitSound(move, 0))
    );
  }

  const strikerFlat = fighterFlatIndex(actor);
  const victimFlat = fighterFlatIndex(
    findFighter(actorIsPlayer ? next.enemyTeam : next.playerTeam, targetSlot, !actorIsPlayer)!
  );

  return {
    state: {
      ...next,
      log: logs,
      turnCount: (next.turnCount ?? 0) + 1,
    },
    strikerFlat,
    victimFlat,
    move,
    statusApplied,
  };
}

function pickNextEnemyActorSlot(state: BattleState): number | null {
  const living = getLivingFighters(state.enemyTeam).sort(
    (a, b) => (a.slotIndex ?? 0) - (b.slotIndex ?? 0)
  );
  if (living.length === 0) return null;

  const cursor = state.enemyTurnCursor ?? 0;
  const slots = living.map((f) => f.slotIndex ?? 0);

  for (const slot of slots) {
    if (slot >= cursor) return slot;
  }
  return slots[0] ?? null;
}

function scoreTacticalMove(
  actor: BattleFighter,
  target: BattleFighter,
  move: BattleMove,
  mi: number
): number {
  const defenderTypes = getDefenderTypes(target.pokemon.id, target.pokemon.name);
  const { multiplier } = getDualTypeEffectiveness(move.type, defenderTypes);
  let score = multiplier * (move.power || 30);
  if (move.category === "status" && !target.status) score += 25;
  if (move.category === "status" && target.status) score -= 20;
  if (move.category === "damage") {
    const powerFactor = move.power / 50;
    const damage = Math.round(
      ((actor.stats.attack * powerFactor) / (actor.stats.attack + target.stats.defense + 14)) *
        50 *
        multiplier
    );
    if (damage >= target.currentHp) score += 200;
  }
  return score;
}

function pickBestActionForActor(
  actor: BattleFighter,
  targets: BattleFighter[],
  actorSlot: number
): { targetSlot: number; moveIndex: number } | null {
  const living = targets.filter((t) => t.currentHp > 0);
  if (living.length === 0) return null;

  const moves =
    actor.equippedMoves ?? getDefaultEquippedMoves(actor.pokemon.id, actor.battleLevel ?? 1);
  let bestScore = -Infinity;
  let bestTargetSlot = living[0]?.slotIndex ?? 0;
  let bestMoveIdx = 0;

  const livingBySlot = [...living].sort((a, b) => (a.slotIndex ?? 0) - (b.slotIndex ?? 0));

  for (let mi = 0; mi < moves.length; mi++) {
    const move = moves[mi];
    for (const target of livingBySlot) {
      const score = scoreTacticalMove(actor, target, move, mi);
      const targetSlot = target.slotIndex ?? 0;
      const currentBest = livingBySlot.find((f) => (f.slotIndex ?? 0) === bestTargetSlot);

      if (score > bestScore) {
        bestScore = score;
        bestMoveIdx = mi;
        bestTargetSlot = targetSlot;
        continue;
      }

      if (score === bestScore && currentBest) {
        const preferLowerHp = target.currentHp < currentBest.currentHp;
        const sameHpPreferHigherSlot =
          target.currentHp === currentBest.currentHp &&
          targetSlot > (currentBest.slotIndex ?? 0);
        if (preferLowerHp || sameHpPreferHigherSlot) {
          bestMoveIdx = mi;
          bestTargetSlot = targetSlot;
        }
      }
    }
  }

  return { targetSlot: bestTargetSlot, moveIndex: bestMoveIdx };
}

function buildSingleEnemyAction(state: BattleState): {
  actorSlot: number;
  targetSlot: number;
  moveIndex: number;
} | null {
  const actorSlot = pickNextEnemyActorSlot(state);
  if (actorSlot == null) return null;

  const enemy = findFighter(state.enemyTeam, actorSlot, false);
  if (!enemy || enemy.currentHp <= 0) return null;

  const pick = pickBestActionForActor(enemy, getLivingFighters(state.playerTeam), actorSlot);
  if (!pick) return null;
  return { actorSlot, ...pick };
}

function advanceEnemyCursor(state: BattleState, actedSlot: number): number {
  return ((actedSlot % TEAM_SIZE) + 1) % TEAM_SIZE;
}

export function startTacticalPhase(state: BattleState): BattleState {
  return {
    ...state,
    tacticalMode: true,
    tacticalPhase: "player-pick-actor",
    pendingSelection: {},
    roundNumber: 1,
    enemyTurnCursor: 0,
    enemyActionQueue: [],
  };
}

export function resolveTacticalCoinFlip(state: BattleState): BattleState {
  const playerStarts = state.playerStarts ?? performCoinFlip();
  const base = {
    ...state,
    phase: "fighting" as const,
    playerStarts,
    log: [
      ...state.log,
      log("Cara ou coroa...", "info"),
      log(
        playerStarts ? "Cara! Você começa!" : "Coroa! O oponente começa!",
        "info"
      ),
      log("Escolha qual Pokémon vai agir.", "info"),
    ],
  };

  const tactical = startTacticalPhase(base);
  if (!playerStarts) {
    const action = buildSingleEnemyAction(tactical);
    return {
      ...tactical,
      tacticalPhase: "enemy-turn",
      enemyActionQueue: action ? [action] : [],
    };
  }
  return tactical;
}

export function selectActor(state: BattleState, actorSlot: number): BattleState {
  const fighter = findFighter(state.playerTeam, actorSlot, true);
  if (!fighter || fighter.currentHp <= 0) return state;

  const { state: afterCheck, ended } = resolveBattleIfOver(state);
  if (ended) return afterCheck;

  if (getLivingFighters(state.enemyTeam).length === 0) {
    return resolveBattleIfOver(state).state;
  }

  return {
    ...state,
    tacticalPhase: "player-pick-target",
    pendingSelection: { actorSlot },
  };
}

export function deselectActor(state: BattleState): BattleState {
  if (
    state.tacticalPhase !== "player-pick-target" &&
    state.tacticalPhase !== "player-pick-move"
  ) {
    return state;
  }
  return {
    ...state,
    tacticalPhase: "player-pick-actor",
    pendingSelection: {},
  };
}

export function deselectTarget(state: BattleState): BattleState {
  if (state.tacticalPhase !== "player-pick-move") return state;
  const pending = state.pendingSelection ?? {};
  if (pending.actorSlot == null) return state;
  return {
    ...state,
    tacticalPhase: "player-pick-target",
    pendingSelection: { actorSlot: pending.actorSlot },
  };
}

export function selectTarget(state: BattleState, targetSlot: number): BattleState {
  const pending = state.pendingSelection ?? {};
  if (pending.actorSlot == null) return state;
  const target = findFighter(state.enemyTeam, targetSlot, false);
  if (!target || target.currentHp <= 0) return state;

  return {
    ...state,
    tacticalPhase: "player-pick-move",
    pendingSelection: { ...pending, targetSlot },
  };
}

export function selectMove(state: BattleState, moveIndex: number): BattleState {
  const pending = state.pendingSelection ?? {};
  if (pending.actorSlot == null || pending.targetSlot == null) return state;

  return {
    ...state,
    tacticalPhase: "executing",
    pendingSelection: { ...pending, moveIndex },
  };
}

export function executePlayerAction(
  state: BattleState,
  bonuses: { battleDamage: number; critChance: number; defenseBoost?: number },
  monotypeBonus: number
): { result: ResolvedAction | null; nextPhase: TacticalPhase } {
  const pending = state.pendingSelection ?? {};
  const { actorSlot, targetSlot, moveIndex } = pending;
  if (actorSlot == null || targetSlot == null || moveIndex == null) {
    return { result: null, nextPhase: "player-pick-actor" };
  }

  const resolved = resolveAction(
    state,
    actorSlot,
    targetSlot,
    moveIndex,
    true,
    bonuses,
    monotypeBonus
  );

  if (!resolved) {
    return { result: null, nextPhase: "player-pick-actor" };
  }

  const end = checkBattleEnd(resolved.state);
  if (end) {
    return { result: { ...resolved, state: end.state }, nextPhase: "player-pick-actor" };
  }

  return {
    result: resolved,
    nextPhase: "enemy-turn",
  };
}

export function prepareEnemyTurn(state: BattleState): BattleState {
  const { state: checked, ended } = resolveBattleIfOver(state);
  if (ended) return checked;

  const action = buildSingleEnemyAction(checked);
  if (!action) {
    return finishEnemyTurn(checked);
  }

  return {
    ...checked,
    tacticalPhase: "enemy-turn",
    enemyActionQueue: [action],
    pendingSelection: {},
  };
}

export function popEnemyAction(state: BattleState): BattleState {
  const queue = [...(state.enemyActionQueue ?? [])];
  queue.shift();
  return { ...state, enemyActionQueue: queue };
}

export function getCurrentEnemyAction(state: BattleState) {
  return state.enemyActionQueue?.[0] ?? null;
}

export function executeEnemyAction(
  state: BattleState,
  bonuses: { battleDamage: number; critChance: number; defenseBoost?: number }
): { result: ResolvedAction | null; done: boolean; actedSlot: number | null } {
  const action = getCurrentEnemyAction(state);
  if (!action) return { result: null, done: false, actedSlot: null };

  const resolved = resolveAction(
    state,
    action.actorSlot,
    action.targetSlot,
    action.moveIndex,
    false,
    bonuses,
    0
  );

  if (!resolved) {
    return { result: null, done: false, actedSlot: action.actorSlot };
  }

  const afterAction: BattleState = {
    ...resolved.state,
    enemyActionQueue: [],
    enemyTurnCursor: advanceEnemyCursor(resolved.state, action.actorSlot),
  };

  const end = checkBattleEnd(afterAction);
  if (end) {
    return {
      result: { ...resolved, state: end.state },
      done: true,
      actedSlot: action.actorSlot,
    };
  }

  return {
    result: { ...resolved, state: afterAction },
    done: false,
    actedSlot: action.actorSlot,
  };
}

export function finishEnemyTurn(state: BattleState): BattleState {
  const { state: ticked, logs } = tickStatusAtRoundEnd(state);
  const afterTick: BattleState = {
    ...ticked,
    log: [...ticked.log, ...logs],
  };

  const { state: resolved, ended } = resolveBattleIfOver(afterTick);
  if (ended) return resolved;

  return {
    ...resolved,
    roundNumber: (resolved.roundNumber ?? 1) + 1,
    tacticalPhase: "player-pick-actor",
    pendingSelection: {},
    enemyActionQueue: [],
  };
}

export function getMonotypeBonus(playerTeam: BattleFighter[]): number {
  if (playerTeam.length < TEAM_SIZE) return 0;
  const types = playerTeam.map((f) => f.stats.type);
  const shared = types[0];
  if (types.every((t) => t === shared)) return TEAM_MONOTYPE_DAMAGE_BONUS;
  return 0;
}

export function buildAutoPlayerAction(state: BattleState): {
  actorSlot: number;
  targetSlot: number;
  moveIndex: number;
} | null {
  const livingPlayers = getLivingFighters(state.playerTeam).filter(
    (f) => f.status?.effect !== "sleep"
  );
  if (livingPlayers.length === 0) return null;
  if (getLivingFighters(state.enemyTeam).length === 0) return null;

  let bestScore = -Infinity;
  let selection: { actorSlot: number; targetSlot: number; moveIndex: number } | null = null;

  for (const actor of livingPlayers) {
    const actorSlot = actor.slotIndex ?? 0;
    const moves = actor.equippedMoves ?? [];
    for (let mi = 0; mi < moves.length; mi++) {
      for (const target of getLivingFighters(state.enemyTeam)) {
        const score = scoreTacticalMove(actor, target, moves[mi], mi);
        if (score > bestScore) {
          bestScore = score;
          selection = {
            actorSlot,
            targetSlot: target.slotIndex ?? 0,
            moveIndex: mi,
          };
        }
      }
    }
  }

  return selection;
}

export function completeAutoPlayerSelection(state: BattleState): BattleState | null {
  const phase = state.tacticalPhase;
  if (phase === "player-pick-actor") {
    const sel = buildAutoPlayerAction(state);
    if (!sel) return null;
    let s = selectActor(state, sel.actorSlot);
    s = selectTarget(s, sel.targetSlot);
    return selectMove(s, sel.moveIndex);
  }
  if (phase === "player-pick-target" && state.pendingSelection?.actorSlot != null) {
    const actor = findFighter(state.playerTeam, state.pendingSelection.actorSlot, true);
    if (!actor) return null;
    const pick = pickBestActionForActor(actor, getLivingFighters(state.enemyTeam), actor.slotIndex ?? 0);
    if (!pick) return null;
    let s = selectTarget(state, pick.targetSlot);
    return selectMove(s, pick.moveIndex);
  }
  if (
    phase === "player-pick-move" &&
    state.pendingSelection?.actorSlot != null &&
    state.pendingSelection?.targetSlot != null
  ) {
    const actor = findFighter(state.playerTeam, state.pendingSelection.actorSlot, true);
    if (!actor) return null;
    const pick = pickBestActionForActor(
      actor,
      [findFighter(state.enemyTeam, state.pendingSelection.targetSlot, false)!].filter(Boolean),
      actor.slotIndex ?? 0
    );
    if (!pick) return null;
    return selectMove(state, pick.moveIndex);
  }
  return null;
}

export function getEffectivenessText(preview: MovePreview): string {
  return effectivenessLabel(preview.typeMult, preview.typeLabel);
}

export { TYPE_LABELS_PT };
