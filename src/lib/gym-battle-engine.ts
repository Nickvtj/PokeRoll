import { getEliteOpponentPortrait, getGymOpponentPortrait } from "@/data/battle-trainers";
import { BATTLE_ROSTER_SIZE, BATTLE_TEAM_SIZE } from "@/data/battle-theme";
import { ELITE_FOUR, GYM_MAP, GYM_TRAINER_STAGES } from "@/data/gyms";
import { POKEMON_LIST, POKEMON_MAP } from "@/data/pokemon";
import { getPokemonBattleStats } from "@/data/pokemon-stats";
import { getRosterTypeCounts } from "@/lib/team-monotype";
import { buildTurnOrder, createFighter, performCoinFlip } from "@/lib/battle-engine";
import { attachMovesToTeam } from "@/lib/tactical-battle-engine";
import type { BattleFighter, BattleLogEntry, BattleState } from "@/types/battle";
import type { Pokemon } from "@/types";
import type { EliteId, GymBattleMeta, GymId } from "@/types/gym";

let logId = 0;
function log(message: string, type: BattleLogEntry["type"]): BattleLogEntry {
  return { id: `gym-log-${++logId}`, message, type, timestamp: Date.now() };
}

const TEAM_SIZE = BATTLE_TEAM_SIZE;

function scaleEnemyFighter(
  pokemon: Pokemon,
  recommendedLevel: number,
  baseDifficulty: number,
  slot: number
): BattleFighter {
  const raw = createFighter(pokemon, false, Math.max(1, recommendedLevel), slot);
  const variance = 0.97 + Math.random() * 0.06;
  const scale = baseDifficulty * variance;
  const hp = Math.max(1, Math.round(raw.maxHp * scale));
  const attack = Math.max(1, Math.round(raw.stats.attack * scale));
  const defense = Math.max(1, Math.round(raw.stats.defense * scale));
  const speed = Math.max(1, Math.round(raw.stats.speed * scale));
  return {
    ...raw,
    stats: { ...raw.stats, hp, attack, defense, speed },
    maxHp: hp,
    currentHp: hp,
  };
}

/** Reservas do inimigo (ginásio/elite): Pokémon do mesmo tipo, escalados */
function buildEnemyBench(
  type: string,
  count: number,
  recommendedLevel: number,
  baseDifficulty: number,
  usedIds: Set<number>
): BattleFighter[] {
  if (count <= 0) return [];
  const typed = POKEMON_LIST.filter(
    (p) => getPokemonBattleStats(p).type === type && !usedIds.has(p.id)
  );
  const fallback = POKEMON_LIST.filter((p) => !usedIds.has(p.id));
  const bench: BattleFighter[] = [];
  for (let i = 0; i < count; i++) {
    const pool = typed.filter((p) => !usedIds.has(p.id)).length > 0 ? typed : fallback;
    const available = pool.filter((p) => !usedIds.has(p.id));
    if (available.length === 0) break;
    const pokemon = available[Math.floor(Math.random() * available.length)];
    usedIds.add(pokemon.id);
    bench.push(scaleEnemyFighter(pokemon, recommendedLevel, baseDifficulty, TEAM_SIZE + i));
  }
  return bench;
}

export function getGymDifficultyModifier(
  recommendedLevel: number,
  teamAvgLevel: number
): number {
  const gap = recommendedLevel - teamAvgLevel;
  if (gap <= 0) return 1 + Math.min(0.12, -gap * 0.015);
  return 1 + gap * 0.07;
}

function buildEnemyTeamFromIds(
  pokemonIds: number[],
  recommendedLevel: number,
  baseDifficulty: number
): BattleFighter[] {
  const enemies: BattleFighter[] = [];

  for (let slot = 0; slot < TEAM_SIZE; slot++) {
    const id = pokemonIds[slot] ?? pokemonIds[pokemonIds.length - 1];
    const pokemon = POKEMON_MAP[id];
    if (!pokemon) continue;
    enemies.push(scaleEnemyFighter(pokemon, recommendedLevel, baseDifficulty, slot));
  }

  return enemies;
}

export function initGymBattle(
  gymId: GymId,
  stage: number,
  playerPokemon: Pokemon[],
  pokemonLevels: Record<number, number>,
  moveLoadouts: Record<string, string[]> = {}
): BattleState {
  const gym = GYM_MAP[gymId];
  const stageData = GYM_TRAINER_STAGES[gymId].find((s) => s.stage === stage);
  if (!stageData) throw new Error(`Stage ${stage} not found for ${gymId}`);

  const attachConfig = { moveLoadouts };
  const roster = playerPokemon.slice(0, BATTLE_ROSTER_SIZE);
  const benchCount = Math.max(0, roster.length - TEAM_SIZE);
  const playerFighters = attachMovesToTeam(
    roster.map((p, i) => createFighter(p, true, pokemonLevels[p.id] ?? 1, i)),
    attachConfig
  );
  const playerTeam = playerFighters.slice(0, TEAM_SIZE);
  const playerBench = playerFighters.slice(TEAM_SIZE);

  const avgLevel =
    playerPokemon.reduce((s, p) => s + (pokemonLevels[p.id] ?? 1), 0) /
    playerPokemon.length;

  const levelGapMod = getGymDifficultyModifier(gym.recommendedLevel, avgLevel);
  const baseDifficulty = stageData.difficultyScale * levelGapMod;

  const activeEnemyIds = stageData.pokemonIds.slice(0, TEAM_SIZE);
  const enemyTeam = attachMovesToTeam(
    buildEnemyTeamFromIds(activeEnemyIds, gym.recommendedLevel, baseDifficulty)
  );
  const enemyBench = attachMovesToTeam(
    buildEnemyBench(
      gym.type,
      benchCount,
      gym.recommendedLevel,
      baseDifficulty,
      new Set(activeEnemyIds)
    )
  );

  const gymMeta: GymBattleMeta = {
    mode: "gym",
    gymId,
    gymName: gym.arenaName,
    stage,
    totalStages: 5,
    trainerName: stageData.trainerName,
    themeColor: gym.themeColor,
    themeGradient: gym.themeGradient,
    badgeName: stage === 5 ? gym.badgeName : undefined,
    recommendedLevel: gym.recommendedLevel,
  };

  const underMsg =
    avgLevel < gym.recommendedLevel - 2
      ? ` ⚠️ Abaixo do Nv. recomendado (${gym.recommendedLevel})!`
      : "";

  const playerStarts = performCoinFlip();

  return {
    phase: "faceOff",
    playerTeam,
    enemyTeam,
    playerBench,
    enemyBench,
    pendingSwitch: null,
    playerTypeCounts: getRosterTypeCounts(roster.map((p) => p.id)),
    participatedIds: playerTeam.map((f) => f.pokemon.id),
    turnOrder: buildTurnOrder(playerStarts),
    currentTurnIndex: 0,
    wave: stage,
    maxWaves: 5,
    log: [
      log(`${gym.arenaName}, ${stageData.label}: ${stageData.trainerName}`, "info"),
      log(`${gym.leaderName}, Tipo ${gym.type}${underMsg}`, "info"),
    ],
    reward: null,
    mode: "gym",
    gymMeta,
    trainerDisplay: {
      opponent: getGymOpponentPortrait(gymId, stage, stageData.trainerName),
    },
    playerDeaths: 0,
    turnCount: 0,
    playerStarts,
    battleEngagement: null,
    tacticalMode: true,
  };
}

export function initEliteBattle(
  eliteId: EliteId,
  playerPokemon: Pokemon[],
  pokemonLevels: Record<number, number>,
  moveLoadouts: Record<string, string[]> = {}
): BattleState {
  const elite = ELITE_FOUR.find((e) => e.id === eliteId);
  if (!elite) throw new Error(`Elite ${eliteId} not found`);

  const attachConfig = { moveLoadouts };
  const roster = playerPokemon.slice(0, BATTLE_ROSTER_SIZE);
  const benchCount = Math.max(0, roster.length - TEAM_SIZE);
  const playerFighters = attachMovesToTeam(
    roster.map((p, i) => createFighter(p, true, pokemonLevels[p.id] ?? 1, i)),
    attachConfig
  );
  const playerTeam = playerFighters.slice(0, TEAM_SIZE);
  const playerBench = playerFighters.slice(TEAM_SIZE);

  const avgLevel =
    playerPokemon.reduce((s, p) => s + (pokemonLevels[p.id] ?? 1), 0) /
    playerPokemon.length;

  const levelGapMod = getGymDifficultyModifier(elite.recommendedLevel, avgLevel);
  const baseDifficulty = elite.difficultyScale * levelGapMod;
  const ids = elite.isChampion
    ? elite.pokemonIds.slice(-TEAM_SIZE)
    : elite.pokemonIds.slice(0, TEAM_SIZE);

  const enemyTeam = attachMovesToTeam(
    buildEnemyTeamFromIds(ids, elite.recommendedLevel, baseDifficulty)
  );
  const enemyBench = attachMovesToTeam(
    buildEnemyBench(
      elite.type === "mixed" ? "normal" : elite.type,
      benchCount,
      elite.recommendedLevel,
      baseDifficulty,
      new Set(ids)
    )
  );

  const gymMeta: GymBattleMeta = {
    mode: "elite",
    eliteId,
    gymName: elite.isChampion ? "Hall of Fame" : "Elite Four",
    stage: 1,
    totalStages: 1,
    trainerName: elite.name,
    themeColor: elite.themeColor,
    themeGradient: "from-indigo-500/30 to-purple-900/20",
    recommendedLevel: elite.recommendedLevel,
  };

  const playerStarts = performCoinFlip();

  return {
    phase: "faceOff",
    playerTeam,
    enemyTeam,
    playerBench,
    enemyBench,
    pendingSwitch: null,
    playerTypeCounts: getRosterTypeCounts(roster.map((p) => p.id)),
    participatedIds: playerTeam.map((f) => f.pokemon.id),
    turnOrder: buildTurnOrder(playerStarts),
    currentTurnIndex: 0,
    wave: 1,
    maxWaves: 1,
    log: [
      log(`${elite.title}`, "info"),
      log(`${elite.name} desafia seu time!`, "info"),
    ],
    reward: null,
    mode: "elite",
    gymMeta,
    trainerDisplay: {
      opponent: getEliteOpponentPortrait(eliteId, elite.name),
    },
    playerDeaths: 0,
    turnCount: 0,
    playerStarts,
    battleEngagement: null,
    tacticalMode: true,
  };
}
