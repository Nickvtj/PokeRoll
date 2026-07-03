import { getEliteOpponentPortrait, getGymOpponentPortrait } from "@/data/battle-trainers";
import { BATTLE_TEAM_SIZE } from "@/data/battle-theme";
import { ELITE_FOUR, GYM_MAP, GYM_TRAINER_STAGES } from "@/data/gyms";
import { POKEMON_MAP } from "@/data/pokemon";
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
    const enemyLevel = Math.max(1, recommendedLevel);
    const raw = createFighter(pokemon, false, enemyLevel, slot);
    const variance = 0.97 + Math.random() * 0.06;
    const scale = baseDifficulty * variance;
    const hp = Math.max(1, Math.round(raw.maxHp * scale));
    const attack = Math.max(1, Math.round(raw.stats.attack * scale));
    const defense = Math.max(1, Math.round(raw.stats.defense * scale));
    const speed = Math.max(1, Math.round(raw.stats.speed * scale));
    enemies.push({
      ...raw,
      stats: { ...raw.stats, hp, attack, defense, speed },
      maxHp: hp,
      currentHp: hp,
    });
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
  const playerTeam = attachMovesToTeam(
    playerPokemon.map((p, i) => createFighter(p, true, pokemonLevels[p.id] ?? 1, i)),
    attachConfig
  );

  const avgLevel =
    playerPokemon.reduce((s, p) => s + (pokemonLevels[p.id] ?? 1), 0) /
    playerPokemon.length;

  const levelGapMod = getGymDifficultyModifier(gym.recommendedLevel, avgLevel);
  const baseDifficulty = stageData.difficultyScale * levelGapMod;

  const enemyTeam = attachMovesToTeam(
    buildEnemyTeamFromIds(
      stageData.pokemonIds.slice(0, TEAM_SIZE),
      gym.recommendedLevel,
      baseDifficulty
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
    turnOrder: buildTurnOrder(playerStarts),
    currentTurnIndex: 0,
    wave: stage,
    maxWaves: 5,
    log: [
      log(`${gym.arenaName} — ${stageData.label}: ${stageData.trainerName}`, "info"),
      log(`${gym.leaderName} · Tipo ${gym.type}${underMsg}`, "info"),
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
  const playerTeam = attachMovesToTeam(
    playerPokemon.map((p, i) => createFighter(p, true, pokemonLevels[p.id] ?? 1, i)),
    attachConfig
  );

  const avgLevel =
    playerPokemon.reduce((s, p) => s + (pokemonLevels[p.id] ?? 1), 0) /
    playerPokemon.length;

  const levelGapMod = getGymDifficultyModifier(elite.recommendedLevel, avgLevel);
  const ids = elite.isChampion
    ? elite.pokemonIds.slice(-TEAM_SIZE)
    : elite.pokemonIds.slice(0, TEAM_SIZE);

  const enemyTeam = attachMovesToTeam(
    buildEnemyTeamFromIds(
      ids,
      elite.recommendedLevel,
      elite.difficultyScale * levelGapMod
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
