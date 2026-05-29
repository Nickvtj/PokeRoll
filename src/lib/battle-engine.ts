import { POKEMON_LIST } from "@/data/pokemon";
import { getPokemonBattleStats } from "@/data/pokemon-stats";
import { getPokedexInfo } from "@/data/pokedex";
import {
  getTypeEffectiveness,
  getTypesStrongAgainst,
  normalizeType,
} from "@/data/type-chart";
import {
  BATTLE_BASE_COINS_MAX,
  BATTLE_BASE_COINS_MIN,
  BATTLE_FREE_SPIN_CHANCE,
  BATTLE_XP_BASE,
} from "@/data/economy-balance";
import { getStatMultiplier } from "@/data/pokemon-battle-level";
import type {
  BattleEngagement,
  BattleFighter,
  BattleHitEffectiveness,
  BattleHitSound,
  BattleLogEntry,
  BattleReward,
  BattleState,
} from "@/types/battle";
import type { Pokemon, Rarity } from "@/types";

let logId = 0;
function log(
  message: string,
  type: BattleLogEntry["type"],
  hitSound?: BattleHitSound
): BattleLogEntry {
  return { id: `log-${++logId}`, message, type, timestamp: Date.now(), hitSound };
}

function effectivenessFromMult(typeMult: number): BattleHitEffectiveness {
  if (typeMult === 0) return "immune";
  if (typeMult > 1) return "super";
  if (typeMult < 1) return "weak";
  return "normal";
}

function buildHitSound(
  attacker: BattleFighter,
  typeMult: number,
  isCrit: boolean
): BattleHitSound {
  const info = getPokedexInfo(attacker.pokemon.id, attacker.pokemon.name);
  const primary = normalizeType(attacker.stats.type);
  const rawSecondary = info.types[1] ? normalizeType(info.types[1]) : undefined;
  const secondary = rawSecondary && rawSecondary !== primary ? rawSecondary : undefined;

  return {
    attackType: primary,
    secondaryType: secondary,
    isCrit,
    effectiveness: effectivenessFromMult(typeMult),
  };
}

const RARITY_TIER: Record<Rarity, number> = {
  common: 1,
  uncommon: 2,
  rare: 3,
  epic: 4,
  legendary: 5,
};

const RARITY_BY_TIER: Record<number, Rarity[]> = {
  1: ["common"],
  2: ["common", "uncommon"],
  3: ["uncommon", "rare"],
  4: ["rare", "epic"],
  5: ["epic", "legendary"],
};

const TEAM_SIZE = 3;

function analyzePlayerTeam(
  playerPokemon: Pokemon[],
  pokemonLevels: Record<number, number>
) {
  const fighters = playerPokemon.map((p, i) =>
    createFighter(p, true, pokemonLevels[p.id] ?? 1, i)
  );
  const avgRarityTier =
    playerPokemon.reduce((sum, p) => sum + RARITY_TIER[p.rarity], 0) /
    playerPokemon.length;
  const avgPokemonLevel =
    playerPokemon.reduce((sum, p) => sum + (pokemonLevels[p.id] ?? 1), 0) /
    playerPokemon.length;
  const types = [...new Set(fighters.map((f) => f.stats.type))];
  return { avgRarityTier, avgPokemonLevel, types, fighters };
}

function pickEnemyRarity(targetTier: number): Rarity {
  const tier = Math.max(1, Math.min(5, Math.round(targetTier)));
  const options = RARITY_BY_TIER[tier];
  return options[Math.floor(Math.random() * options.length)];
}

function normalizeEnemyToPlayer(
  enemy: BattleFighter,
  playerAvg: { hp: number; attack: number; defense: number; speed: number },
  difficulty: number
): BattleFighter {
  const variance = () => 0.96 + Math.random() * 0.1;
  const hp = Math.max(1, Math.round(playerAvg.hp * difficulty * variance()));
  const attack = Math.max(1, Math.round(playerAvg.attack * difficulty * variance()));
  const defense = Math.max(1, Math.round(playerAvg.defense * difficulty * variance()));
  const speed = Math.max(1, Math.round(playerAvg.speed * difficulty * variance()));

  return {
    ...enemy,
    stats: { ...enemy.stats, hp, attack, defense, speed },
    maxHp: hp,
    currentHp: hp,
  };
}

function getPlayerAverages(fighters: BattleFighter[]) {
  const n = fighters.length;
  return {
    hp: fighters.reduce((s, f) => s + f.maxHp, 0) / n,
    attack: fighters.reduce((s, f) => s + f.stats.attack, 0) / n,
    defense: fighters.reduce((s, f) => s + f.stats.defense, 0) / n,
    speed: fighters.reduce((s, f) => s + f.stats.speed, 0) / n,
  };
}

export function createFighter(
  pokemon: Pokemon,
  isPlayer: boolean,
  battleLevel = 1,
  slotIndex = 0
): BattleFighter {
  const base = getPokemonBattleStats(pokemon);
  const mult = getStatMultiplier(battleLevel);
  const stats = {
    ...base,
    hp: Math.round(base.hp * mult),
    attack: Math.round(base.attack * mult),
    defense: Math.round(base.defense * mult),
    speed: Math.round(base.speed * mult),
  };
  return {
    pokemon,
    stats,
    currentHp: stats.hp,
    maxHp: stats.hp,
    isPlayer,
    battleLevel,
    slotIndex,
  };
}

function pickRandomPokemon(pool: Pokemon[], usedIds: Set<number>): Pokemon | null {
  const available = pool.filter((p) => !usedIds.has(p.id));
  if (available.length === 0) return null;
  return available[Math.floor(Math.random() * available.length)];
}

export function generateEnemyTeam(
  playerPokemon: Pokemon[],
  wave: number,
  pokemonLevels: Record<number, number>
): BattleFighter[] {
  const { avgRarityTier, types, fighters, avgPokemonLevel } = analyzePlayerTeam(
    playerPokemon,
    pokemonLevels
  );
  const playerAvg = getPlayerAverages(fighters);

  const levelBonus = (avgPokemonLevel - 1) * 0.018;
  const targetTier = Math.max(1, avgRarityTier + (wave - 1) * 0.25 + levelBonus * 2);
  const difficulty = 0.94 + wave * 0.03 + levelBonus + Math.random() * 0.05;

  const usedIds = new Set<number>();
  const enemies: BattleFighter[] = [];

  for (let slot = 0; slot < TEAM_SIZE; slot++) {
    const rarity = pickEnemyRarity(targetTier + slot * 0.1);
    let pool = POKEMON_LIST.filter((p) => p.rarity === rarity);

    if (Math.random() < 0.4 && types.length > 0) {
      const playerType = types[Math.floor(Math.random() * types.length)];
      const counterTypes = getTypesStrongAgainst(playerType);
      if (counterTypes.length > 0) {
        const chosenType = counterTypes[Math.floor(Math.random() * counterTypes.length)];
        const typed = pool.filter(
          (p) => getPokemonBattleStats(p).type === chosenType
        );
        if (typed.length > 0) pool = typed;
      }
    }

    let pokemon = pickRandomPokemon(pool, usedIds);
    if (!pokemon) {
      pokemon = pickRandomPokemon(
        POKEMON_LIST.filter((p) => RARITY_TIER[p.rarity] <= Math.ceil(targetTier + 1)),
        usedIds
      );
    }
    if (!pokemon) {
      pokemon = pickRandomPokemon(POKEMON_LIST, usedIds);
    }
    if (!pokemon) continue;

    usedIds.add(pokemon.id);
    const playerForSlot = playerPokemon[slot];
    const slotLevel = Math.max(
      1,
      Math.round(pokemonLevels[playerForSlot?.id ?? 0] ?? avgPokemonLevel)
    );
    enemies.push(
      normalizeEnemyToPlayer(
        createFighter(pokemon, false, slotLevel, slot),
        playerAvg,
        difficulty
      )
    );
  }

  return enemies;
}

export function buildTurnOrder(playerStarts: boolean): number[] {
  const order: number[] = [];
  for (let slot = 0; slot < TEAM_SIZE; slot++) {
    if (playerStarts) {
      order.push(slot);
      order.push(TEAM_SIZE + slot);
    } else {
      order.push(TEAM_SIZE + slot);
      order.push(slot);
    }
  }
  return order;
}

export function performCoinFlip(): boolean {
  return Math.random() < 0.5;
}

export function resolveCoinFlip(state: BattleState): BattleState {
  const playerStarts = state.playerStarts ?? true;
  return {
    ...state,
    phase: "fighting",
    log: [
      ...state.log,
      log("🪙 Cara ou coroa...", "info"),
      log(
        playerStarts ? "Cara! Você começa atacando!" : "Coroa! O oponente começa atacando!",
        "info"
      ),
    ],
  };
}

export function initBattle(
  playerPokemon: Pokemon[],
  wave = 1,
  pokemonLevels: Record<number, number> = {}
): BattleState {
  const playerTeam = playerPokemon.map((p, i) =>
    createFighter(p, true, pokemonLevels[p.id] ?? 1, i)
  );
  const enemyTeam = generateEnemyTeam(playerPokemon, wave, pokemonLevels);

  const { avgRarityTier } = analyzePlayerTeam(playerPokemon, pokemonLevels);
  const tierLabel =
    avgRarityTier >= 4 ? "Elite" : avgRarityTier >= 3 ? "Avançado" : "Padrão";

  const playerStarts = performCoinFlip();

  return {
    phase: "coinFlip",
    playerTeam,
    enemyTeam,
    turnOrder: buildTurnOrder(playerStarts),
    currentTurnIndex: 0,
    wave,
    maxWaves: 1,
    log: [
      log("A batalha começou!", "info"),
      log(`${tierLabel} — 1v1 da frente; quem vence segue até cair`, "info"),
    ],
    reward: null,
    levelUps: [],
    mode: "training",
    playerDeaths: 0,
    turnCount: 0,
    playerStarts,
    battleEngagement: null,
  };
}

function getAllFighters(state: BattleState): BattleFighter[] {
  return [...state.playerTeam, ...state.enemyTeam];
}

function getLivingFighters(fighters: BattleFighter[]): BattleFighter[] {
  return fighters.filter((f) => f.currentHp > 0);
}

function fighterFlatIndex(f: BattleFighter): number {
  return f.isPlayer ? (f.slotIndex ?? 0) : TEAM_SIZE + (f.slotIndex ?? 0);
}

function pickNextChampion(
  state: BattleState,
  all: BattleFighter[]
): { championFlat: number; nextTurnIndex: number } | null {
  const len = state.turnOrder.length;
  for (let attempt = 0; attempt < len; attempt++) {
    const orderPos = (state.currentTurnIndex + attempt) % len;
    const idx = state.turnOrder[orderPos];
    if (all[idx]?.currentHp > 0) {
      return { championFlat: idx, nextTurnIndex: orderPos + 1 };
    }
  }
  return null;
}

function pickFrontOpponent(champion: BattleFighter, state: BattleState): BattleFighter | null {
  const opponents = getLivingOpponents(champion, state);
  if (opponents.length === 0) return null;

  const slot = champion.slotIndex ?? 0;
  const sameSlot = opponents.find((o) => (o.slotIndex ?? 0) === slot);
  if (sameSlot) return sameSlot;

  opponents.sort((a, b) => (a.slotIndex ?? 0) - (b.slotIndex ?? 0));
  return opponents[0];
}

function findFighterInAll(
  all: BattleFighter[],
  target: BattleFighter
): BattleFighter | undefined {
  return all.find(
    (f) =>
      f.isPlayer === target.isPlayer &&
      f.slotIndex === target.slotIndex &&
      f.pokemon.id === target.pokemon.id
  );
}

function applyDamageToTarget(
  all: BattleFighter[],
  target: BattleFighter,
  damage: number
): BattleFighter[] {
  return all.map((f) => {
    if (
      f.isPlayer !== target.isPlayer ||
      f.slotIndex !== target.slotIndex ||
      f.pokemon.id !== target.pokemon.id
    ) {
      return f;
    }
    return { ...f, currentHp: Math.max(0, f.currentHp - damage) };
  });
}

function getLivingOpponents(attacker: BattleFighter, state: BattleState): BattleFighter[] {
  const team = attacker.isPlayer ? state.enemyTeam : state.playerTeam;
  return getLivingFighters(team);
}

function calcDamage(
  attacker: BattleFighter,
  defender: BattleFighter,
  damageMult = 1,
  critChance = 0
): { damage: number; isCrit: boolean; typeLabel: string | null; typeMult: number } {
  const isCrit = Math.random() < critChance;
  let defense = defender.stats.defense;
  const defAbility = defender.stats.ability;
  if (defAbility?.type === "passive" && defAbility.effect === "defense_boost") {
    defense *= defAbility.value;
  }

  const { multiplier: typeMult, label: typeLabel } = getTypeEffectiveness(
    attacker.stats.type,
    defender.stats.type
  );

  if (typeMult === 0) {
    return { damage: 0, isCrit: false, typeLabel, typeMult };
  }

  let raw =
    attacker.stats.attack * damageMult * typeMult -
    defense * 0.4 +
    Math.random() * 8;
  if (isCrit) raw *= 1.8;
  return {
    damage: Math.max(typeMult > 1 ? 2 : 1, Math.round(raw)),
    isCrit,
    typeLabel,
    typeMult,
  };
}

export interface BattleStepResult {
  state: BattleState;
  done: boolean;
  /** Par atacante/alvo quando houve golpe neste turno */
  combatBeat?: { strikerFlat: number; victimFlat: number } | null;
}

export function executeBattleTurn(
  state: BattleState,
  bonuses: { battleDamage: number; critChance: number }
): BattleStepResult {
  if (state.phase !== "fighting") return { state, done: true };

  let all = getAllFighters(state);
  const livingPlayers = getLivingFighters(state.playerTeam);
  const livingEnemies = getLivingFighters(state.enemyTeam);

  if (livingPlayers.length === 0) {
    return {
      state: {
        ...state,
        phase: "defeat",
        log: [...state.log, log("Seu time foi derrotado...", "ko")],
      },
      done: true,
    };
  }
  if (livingEnemies.length === 0) {
    const reward = calcBattleReward(state.wave);
    return {
      state: {
        ...state,
        phase: "victory",
        reward,
        log: [...state.log, log("Vitória! 🎉", "info")],
      },
      done: true,
    };
  }

  let logEntries = [...state.log];
  let turnIndex = state.currentTurnIndex;
  let engagement = state.battleEngagement ?? null;

  let championFlat = engagement?.championFlatIndex ?? null;
  let champion = championFlat != null ? all[championFlat] : undefined;

  if (!champion || champion.currentHp <= 0) {
    const picked = pickNextChampion(state, all);
    if (!picked) {
      return { state: { ...state, currentTurnIndex: turnIndex + 1 }, done: false };
    }
    championFlat = picked.championFlat;
    champion = all[championFlat];
    turnIndex = picked.nextTurnIndex;
    engagement = null;
    logEntries.push(log(`${champion.pokemon.name} entra em combate!`, "info"));
  }

  const battleSlice = {
    ...state,
    playerTeam: all.filter((f) => f.isPlayer),
    enemyTeam: all.filter((f) => !f.isPlayer),
  };

  let targetFlat = engagement?.targetFlatIndex ?? null;
  let target =
    targetFlat != null && targetFlat >= 0 ? all[targetFlat] : undefined;

  if (!target || target.currentHp <= 0) {
    const newTarget = pickFrontOpponent(champion!, battleSlice);
    if (!newTarget) {
      return applyFighterUpdates(state, all, logEntries, turnIndex, null);
    }
    target = newTarget;
    targetFlat = fighterFlatIndex(target);
    engagement = {
      championFlatIndex: championFlat!,
      targetFlatIndex: targetFlat,
      counterTurn: false,
    };
    logEntries.push(
      log(`${champion!.pokemon.name} vs ${target.pokemon.name}`, "info")
    );
  } else if (!engagement) {
    engagement = {
      championFlatIndex: championFlat!,
      targetFlatIndex: targetFlat!,
      counterTurn: false,
    };
  }

  const counterTurn = engagement.counterTurn;
  const strikerFlat = counterTurn ? targetFlat! : championFlat!;
  const victimFlat = counterTurn ? championFlat! : targetFlat!;
  const striker = all[strikerFlat];
  const victim = all[victimFlat];

  if (!striker || !victim || striker.currentHp <= 0 || victim.currentHp <= 0) {
    return applyFighterUpdates(state, all, logEntries, turnIndex, null);
  }

  let damageMult = 1 + bonuses.battleDamage;
  const ability = striker.stats.ability;

  if (ability?.type === "active" && ability.effect === "damage_boost") {
    damageMult *= ability.value;
    logEntries.push(log(`${striker.pokemon.name} usou ${ability.name}!`, "ability"));
  }

  if (
    ability?.type === "active" &&
    ability.effect === "aoe" &&
    strikerFlat === championFlat
  ) {
    const livingOpp = getLivingOpponents(striker, battleSlice);
    for (const aoeTarget of livingOpp) {
      const fresh = findFighterInAll(all, aoeTarget);
      if (!fresh || fresh.currentHp <= 0) continue;
      const { damage, isCrit, typeLabel, typeMult } = calcDamage(
        striker,
        fresh,
        damageMult * ability.value,
        bonuses.critChance
      );
      const suffix = typeLabel ? ` · ${typeLabel}!` : "";
      logEntries.push(
        log(
          `${striker.pokemon.name} atingiu ${fresh.pokemon.name} (-${damage}${isCrit ? " CRÍTICO!" : ""}${suffix})`,
          "damage",
          buildHitSound(striker, typeMult, isCrit)
        )
      );
      all = applyDamageToTarget(all, fresh, damage);
      const after = findFighterInAll(all, fresh);
      if (after && after.currentHp === 0) {
        logEntries.push(log(`${fresh.pokemon.name} desmaiou!`, "ko"));
      }
    }
    const nextEngagement: BattleEngagement = {
      championFlatIndex: championFlat!,
      targetFlatIndex: null,
      counterTurn: false,
    };
    const aoeVictimFlat = fighterFlatIndex(livingOpp[0]);
    return {
      ...applyFighterUpdates(state, all, logEntries, turnIndex, nextEngagement),
      combatBeat: { strikerFlat, victimFlat: aoeVictimFlat },
    };
  }

  const { damage, isCrit, typeLabel, typeMult } = calcDamage(
    striker,
    victim,
    damageMult,
    bonuses.critChance
  );

  const typeSuffix = typeLabel ? ` · ${typeLabel}!` : "";
  logEntries.push(
    log(
      `${striker.pokemon.name} → ${victim.pokemon.name} (-${damage}${isCrit ? " CRÍTICO!" : ""}${typeSuffix})`,
      "attack",
      buildHitSound(striker, typeMult, isCrit)
    )
  );

  all = applyDamageToTarget(all, victim, damage);
  const victimAfter = all[victimFlat];
  const championAfter = all[championFlat!];

  let nextEngagement: BattleEngagement | null = engagement;

  if (!victimAfter || victimAfter.currentHp <= 0) {
    logEntries.push(log(`${victim.pokemon.name} desmaiou!`, "ko"));

    if (victimFlat === championFlat) {
      nextEngagement = null;
      const deadOrderPos = state.turnOrder.indexOf(championFlat!);
      if (deadOrderPos >= 0) turnIndex = deadOrderPos + 1;
    } else if (championAfter && championAfter.currentHp > 0) {
      nextEngagement = {
        championFlatIndex: championFlat!,
        targetFlatIndex: null,
        counterTurn: false,
      };
      logEntries.push(
        log(`${championAfter.pokemon.name} avança para o próximo oponente!`, "info")
      );
    } else {
      nextEngagement = null;
    }
  } else if (championAfter && championAfter.currentHp > 0) {
    nextEngagement = {
      championFlatIndex: championFlat!,
      targetFlatIndex: targetFlat!,
      counterTurn: !counterTurn,
    };
  } else {
    nextEngagement = null;
  }

  return {
    ...applyFighterUpdates(state, all, logEntries, turnIndex, nextEngagement),
    combatBeat: { strikerFlat, victimFlat },
  };
}

function countNewPlayerDeaths(prev: BattleFighter[], next: BattleFighter[]): number {
  let deaths = 0;
  for (let i = 0; i < prev.length; i++) {
    const before = prev[i];
    const after = next.find(
      (f) => f.isPlayer === before.isPlayer && f.slotIndex === before.slotIndex
    );
    if (before.currentHp > 0 && after && after.currentHp <= 0) deaths++;
  }
  return deaths;
}

function applyFighterUpdates(
  state: BattleState,
  all: BattleFighter[],
  logEntries: BattleLogEntry[],
  nextTurnIndex: number,
  battleEngagement: BattleEngagement | null | undefined = state.battleEngagement
): BattleStepResult {
  const playerTeam = all.filter((f) => f.isPlayer);
  const enemyTeam = all.filter((f) => !f.isPlayer);

  let resolved = battleEngagement ?? null;
  if (resolved) {
    const champion = all[resolved.championFlatIndex];
    if (!champion || champion.currentHp <= 0) {
      resolved = null;
    } else if (resolved.targetFlatIndex != null) {
      const target = all[resolved.targetFlatIndex];
      if (!target || target.currentHp <= 0) {
        resolved = {
          championFlatIndex: resolved.championFlatIndex,
          targetFlatIndex: null,
          counterTurn: false,
        };
      }
    }
  }

  const newDeaths = countNewPlayerDeaths(state.playerTeam, playerTeam);
  const playerDeaths = (state.playerDeaths ?? 0) + newDeaths;
  const turnCount = (state.turnCount ?? 0) + 1;

  const newState: BattleState = {
    ...state,
    playerTeam,
    enemyTeam,
    currentTurnIndex: nextTurnIndex,
    log: logEntries,
    playerDeaths,
    turnCount,
    battleEngagement: resolved,
  };

  const livingPlayers = getLivingFighters(playerTeam);
  const livingEnemies = getLivingFighters(enemyTeam);

  if (livingEnemies.length === 0) {
    const isTraining = !state.mode || state.mode === "training";
    const reward = isTraining ? calcBattleReward(state.wave) : null;
    return {
      state: {
        ...newState,
        phase: "victory",
        reward,
        log: [...logEntries, log("Vitória! 🎉", "info")],
      },
      done: true,
    };
  }
  if (livingPlayers.length === 0) {
    return {
      state: {
        ...newState,
        phase: "defeat",
        log: [...logEntries, log("Derrota...", "ko")],
      },
      done: true,
    };
  }

  return { state: newState, done: false };
}

/** Fallback quando combatBeat não veio no resultado — detecta pelo log/HP */
export function inferCombatBeatFromTurn(
  prev: BattleState,
  next: BattleState,
  logFrom: number
): { strikerFlat: number; victimFlat: number } | null {
  const prevAll = getAllFighters(prev);
  const nextAll = getAllFighters(next);

  let victimFlat = -1;
  for (let i = 0; i < nextAll.length; i++) {
    if (nextAll[i].currentHp < prevAll[i].currentHp) {
      victimFlat = i;
      break;
    }
  }
  if (victimFlat < 0) return null;

  for (let i = logFrom; i < next.log.length; i++) {
    const entry = next.log[i];
    if (!entry.hitSound) continue;
    const match = entry.message.match(/^(.+?) (?:→|atingiu) (.+?) \(-/);
    if (!match) continue;
    const strikerFlat = nextAll.findIndex((f) => f.pokemon.name === match[1]);
    const parsedVictim = nextAll.findIndex((f) => f.pokemon.name === match[2]);
    if (strikerFlat >= 0 && parsedVictim >= 0) {
      return { strikerFlat, victimFlat: parsedVictim };
    }
  }

  for (let i = 0; i < nextAll.length; i++) {
    if (
      i !== victimFlat &&
      nextAll[i].currentHp > 0 &&
      nextAll[i].currentHp === prevAll[i].currentHp
    ) {
      return { strikerFlat: i, victimFlat };
    }
  }

  return null;
}

export function calcBattleReward(wave: number, coinBonus = 0): BattleReward {
  const base =
    BATTLE_BASE_COINS_MIN +
    Math.floor(Math.random() * (BATTLE_BASE_COINS_MAX - BATTLE_BASE_COINS_MIN + 1));
  const waveBonus = (wave - 1) * 2;
  const coins = Math.round((base + waveBonus) * (1 + coinBonus));
  const xp = BATTLE_XP_BASE + wave * 10;
  const freeSpin = Math.random() < BATTLE_FREE_SPIN_CHANCE;
  return { coins, xp, freeSpin };
}

export function getActiveFighterIndex(state: BattleState): number | null {
  const roles = getBattleCombatRoles(state);
  return roles.attackerFlat;
}

export interface BattleCombatRoles {
  attackerFlat: number | null;
  defenderFlat: number | null;
}

/** Quem ataca e quem recebe o golpe neste momento do duelo 1v1 */
export function getBattleCombatRoles(state: BattleState): BattleCombatRoles {
  const eng = state.battleEngagement;
  if (!eng || state.phase !== "fighting") {
    return { attackerFlat: null, defenderFlat: null };
  }

  const all = getAllFighters(state);
  const champion = all[eng.championFlatIndex];
  const target =
    eng.targetFlatIndex != null ? all[eng.targetFlatIndex] : undefined;

  if (eng.counterTurn && target?.currentHp > 0 && champion?.currentHp > 0) {
    return {
      attackerFlat: eng.targetFlatIndex!,
      defenderFlat: eng.championFlatIndex,
    };
  }

  if (champion?.currentHp > 0) {
    const defenderFlat =
      target?.currentHp > 0 ? eng.targetFlatIndex : null;
    return {
      attackerFlat: eng.championFlatIndex,
      defenderFlat: defenderFlat ?? null,
    };
  }

  if (target?.currentHp > 0) {
    return { attackerFlat: eng.targetFlatIndex!, defenderFlat: null };
  }

  return { attackerFlat: null, defenderFlat: null };
}

export function getDuelHighlightIndices(state: BattleState): number[] {
  const eng = state.battleEngagement;
  if (!eng) return [];

  const all = getAllFighters(state);
  const indices = [eng.championFlatIndex];
  if (eng.targetFlatIndex != null) {
    const target = all[eng.targetFlatIndex];
    if (target?.currentHp > 0) indices.push(eng.targetFlatIndex);
  }
  return indices;
}
