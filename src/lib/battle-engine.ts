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
  const targetLevel = Math.max(1, Math.round(avgPokemonLevel) + (wave - 1));
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
    const levelVariance = Math.floor(Math.random() * 3) - 1;
    const slotLevel = Math.max(1, targetLevel + levelVariance);
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

function buildAlternatingTurnOrder(): number[] {
  const order: number[] = [];
  for (let slot = 0; slot < TEAM_SIZE; slot++) {
    order.push(slot);
    order.push(TEAM_SIZE + slot);
  }
  return order;
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

  return {
    phase: "fighting",
    playerTeam,
    enemyTeam,
    turnOrder: buildAlternatingTurnOrder(),
    currentTurnIndex: 0,
    wave,
    maxWaves: 1,
    log: [
      log("A batalha começou!", "info"),
      log(`${tierLabel} — ataque frontal por posição`, "info"),
    ],
    reward: null,
    levelUps: [],
    mode: "training",
    playerDeaths: 0,
    turnCount: 0,
  };
}

function getAllFighters(state: BattleState): BattleFighter[] {
  return [...state.playerTeam, ...state.enemyTeam];
}

function getLivingFighters(fighters: BattleFighter[]): BattleFighter[] {
  return fighters.filter((f) => f.currentHp > 0);
}

function findLivingAttacker(
  state: BattleState,
  all: BattleFighter[]
): { attacker: BattleFighter; nextTurnIndex: number } | null {
  const len = state.turnOrder.length;
  if (len === 0) return null;

  for (let attempt = 0; attempt < len; attempt++) {
    const orderPos = (state.currentTurnIndex + attempt) % len;
    const fighterIdx = state.turnOrder[orderPos];
    const fighter = all[fighterIdx];
    if (fighter && fighter.currentHp > 0) {
      return { attacker: fighter, nextTurnIndex: orderPos + 1 };
    }
  }
  return null;
}

function findFrontTarget(
  attacker: BattleFighter,
  playerTeam: BattleFighter[],
  enemyTeam: BattleFighter[]
): BattleFighter | null {
  const targets = attacker.isPlayer ? enemyTeam : playerTeam;
  const living = getLivingFighters(targets);
  if (living.length === 0) return null;

  const preferredSlot = attacker.slotIndex ?? 0;
  const direct = living.find((t) => t.slotIndex === preferredSlot);
  if (direct) return direct;

  living.sort((a, b) => {
    const distA = Math.abs((a.slotIndex ?? 0) - preferredSlot);
    const distB = Math.abs((b.slotIndex ?? 0) - preferredSlot);
    return distA - distB;
  });
  return living[0];
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
}

export function executeBattleTurn(
  state: BattleState,
  bonuses: { battleDamage: number; critChance: number }
): BattleStepResult {
  if (state.phase !== "fighting") return { state, done: true };

  const all = getAllFighters(state);
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

  const found = findLivingAttacker(state, all);
  if (!found) {
    return { state: { ...state, currentTurnIndex: state.currentTurnIndex + 1 }, done: false };
  }

  const { attacker, nextTurnIndex } = found;
  const target = findFrontTarget(attacker, state.playerTeam, state.enemyTeam);
  if (!target) {
    return applyFighterUpdates(state, all, state.log, nextTurnIndex);
  }

  const ability = attacker.stats.ability;
  let damageMult = 1 + bonuses.battleDamage;
  const logEntries = [...state.log];

  if (ability?.type === "active" && ability.effect === "damage_boost") {
    damageMult *= ability.value;
    logEntries.push(
      log(`${attacker.pokemon.name} usou ${ability.name}!`, "ability")
    );
  }

  if (ability?.type === "active" && ability.effect === "aoe") {
    const oppTeam = attacker.isPlayer ? state.enemyTeam : state.playerTeam;
    const livingOpp = getLivingFighters(oppTeam);
    const newAll = all.map((f) => {
      const isTarget = livingOpp.some(
        (t) => t.pokemon.id === f.pokemon.id && t.isPlayer === f.isPlayer
      );
      if (!isTarget) return f;
      const { damage, isCrit, typeLabel, typeMult } = calcDamage(
        attacker,
        f,
        damageMult * ability!.value,
        bonuses.critChance
      );
      const suffix = typeLabel ? ` · ${typeLabel}!` : "";
      logEntries.push(
        log(
          `${attacker.pokemon.name} atingiu ${f.pokemon.name} (-${damage}${isCrit ? " CRÍTICO!" : ""}${suffix})`,
          "damage",
          buildHitSound(attacker, typeMult, isCrit)
        )
      );
      const newHp = Math.max(0, f.currentHp - damage);
      if (newHp === 0) logEntries.push(log(`${f.pokemon.name} desmaiou!`, "ko"));
      return { ...f, currentHp: newHp };
    });
    return applyFighterUpdates(state, newAll, logEntries, nextTurnIndex);
  }

  const { damage, isCrit, typeLabel, typeMult } = calcDamage(
    attacker,
    target,
    damageMult,
    bonuses.critChance
  );

  const typeSuffix = typeLabel ? ` · ${typeLabel}!` : "";
  logEntries.push(
    log(
      `${attacker.pokemon.name} → ${target.pokemon.name} (-${damage}${isCrit ? " CRÍTICO!" : ""}${typeSuffix})`,
      "attack",
      buildHitSound(attacker, typeMult, isCrit)
    )
  );

  const newAll = all.map((f) => {
    if (f.pokemon.id !== target.pokemon.id || f.isPlayer !== target.isPlayer) return f;
    const newHp = Math.max(0, f.currentHp - damage);
    if (newHp === 0) logEntries.push(log(`${f.pokemon.name} desmaiou!`, "ko"));
    return { ...f, currentHp: newHp };
  });

  return applyFighterUpdates(state, newAll, logEntries, nextTurnIndex);
}

function countNewPlayerDeaths(prev: BattleFighter[], next: BattleFighter[]): number {
  let deaths = 0;
  for (let i = 0; i < prev.length; i++) {
    const before = prev[i];
    const after = next.find(
      (f) => f.pokemon.id === before.pokemon.id && f.slotIndex === before.slotIndex
    );
    if (before.currentHp > 0 && after && after.currentHp <= 0) deaths++;
  }
  return deaths;
}

function applyFighterUpdates(
  state: BattleState,
  all: BattleFighter[],
  logEntries: BattleLogEntry[],
  nextTurnIndex: number
): BattleStepResult {
  const playerTeam = all.filter((f) => f.isPlayer);
  const enemyTeam = all.filter((f) => !f.isPlayer);

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
  const all = getAllFighters(state);
  const len = state.turnOrder.length;
  for (let attempt = 0; attempt < len; attempt++) {
    const orderPos = (state.currentTurnIndex + attempt) % len;
    const idx = state.turnOrder[orderPos];
    if (all[idx]?.currentHp > 0) return idx;
  }
  return null;
}
