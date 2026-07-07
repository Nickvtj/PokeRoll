import { calcPokemonLevelFromTotalXp, migrateLegacyTotalXp } from "@/data/pokemon-battle-level";
import { XP_PER_LEVEL } from "@/data/economy-balance";
import { mergeAchievementIds } from "@/lib/achievements-sync";
import type { EconomyState } from "@/types/economy";

function calcAccountLevel(xp: number): number {
  return Math.min(50, Math.floor(xp / XP_PER_LEVEL) + 1);
}

function maxNum(a: number, b: number): number {
  const safeA = Number.isFinite(a) ? a : 0;
  const safeB = Number.isFinite(b) ? b : 0;
  return Math.max(safeA, safeB);
}

/** Mescla dicionários de contadores (doces/itens) preferindo o maior por chave. */
function mergeCounters(
  local: Record<string, number> | undefined,
  remote: Record<string, number> | undefined
): Record<string, number> {
  const merged: Record<string, number> = {};
  for (const [key, value] of Object.entries(remote ?? {})) {
    merged[key] = value ?? 0;
  }
  for (const [key, value] of Object.entries(local ?? {})) {
    merged[key] = maxNum(value ?? 0, merged[key] ?? 0);
  }
  return merged;
}

function mergePokemonBattleXp(
  local: Record<string, { level: number; xp: number }>,
  remote: Record<string, { level: number; xp: number }>
): Record<string, { level: number; xp: number }> {
  const merged: Record<string, { level: number; xp: number }> = { ...remote };

  for (const [key, localEntry] of Object.entries(local ?? {})) {
    const remoteEntry = merged[key];
    const localTotal = migrateLegacyTotalXp(localEntry.level, localEntry.xp);
    const remoteTotal = remoteEntry
      ? migrateLegacyTotalXp(remoteEntry.level, remoteEntry.xp)
      : 0;

    if (localTotal >= remoteTotal) {
      merged[key] = {
        xp: localTotal,
        level: calcPokemonLevelFromTotalXp(localTotal),
      };
    }
  }

  return merged;
}

/** Mescla local + remoto preferindo o maior progresso (evita perder XP/moedas) */
export function mergeEconomyState(
  local: EconomyState,
  remote: EconomyState,
  remoteAchievementIds: string[] = []
): EconomyState {
  const xp = maxNum(local.xp, remote.xp);
  const level = calcAccountLevel(xp);
  const rank = Math.floor(level / 5) + 1;

  const missionProgress = { ...remote.missionProgress, ...local.missionProgress };
  for (const key of Object.keys(missionProgress)) {
    missionProgress[key] = maxNum(
      local.missionProgress[key] ?? 0,
      remote.missionProgress[key] ?? 0
    );
  }

  const missionsClaimed = [
    ...new Set([...(remote.missionsClaimed ?? []), ...(local.missionsClaimed ?? [])]),
  ];

  return {
    coins: maxNum(local.coins, remote.coins),
    xp,
    level,
    rank,
    freeSpins: maxNum(local.freeSpins, remote.freeSpins),
    battleWins: maxNum(local.battleWins, remote.battleWins),
    totalBattles: maxNum(local.totalBattles, remote.totalBattles),
    clickGamesPlayed: maxNum(local.clickGamesPlayed, remote.clickGamesPlayed),
    clickCoinsToday: maxNum(local.clickCoinsToday, remote.clickCoinsToday),
    clickGamesToday: maxNum(local.clickGamesToday, remote.clickGamesToday),
    lastClickGameDate: local.lastClickGameDate || remote.lastClickGameDate,
    dailyStreak: maxNum(local.dailyStreak, remote.dailyStreak),
    lastLoginDate: local.lastLoginDate || remote.lastLoginDate,
    missionProgress,
    missionsClaimed,
    lastMissionDate: local.lastMissionDate || remote.lastMissionDate,
    team: (local.team?.length ?? 0) > 0 ? local.team : remote.team,
    owned: [...new Set([...(local.owned ?? []), ...(remote.owned ?? [])])],
    ownedBootstrapped: local.ownedBootstrapped || remote.ownedBootstrapped,
    favoritePokemon:
      (local.favoritePokemon?.length ?? 0) > 0
        ? local.favoritePokemon
        : remote.favoritePokemon,
    pokemonBattleXp: mergePokemonBattleXp(
      local.pokemonBattleXp ?? {},
      remote.pokemonBattleXp ?? {}
    ),
    pokemonMoveLoadouts: {
      ...(remote.pokemonMoveLoadouts ?? {}),
      ...(local.pokemonMoveLoadouts ?? {}),
    },
    welcomeClaimed: local.welcomeClaimed || remote.welcomeClaimed,
    unlockedAchievements: mergeAchievementIds(
      local.unlockedAchievements ?? [],
      mergeAchievementIds(remote.unlockedAchievements ?? [], remoteAchievementIds)
    ),
    selectedAvatarId: local.selectedAvatarId ?? remote.selectedAvatarId ?? "default",
    luckyEggExpiresAt:
      (local.luckyEggExpiresAt ?? 0) > (remote.luckyEggExpiresAt ?? 0)
        ? local.luckyEggExpiresAt
        : remote.luckyEggExpiresAt ?? null,
    luckyEggCount: maxNum(local.luckyEggCount ?? 0, remote.luckyEggCount ?? 0),
    rareCandyCount: maxNum(local.rareCandyCount ?? 0, remote.rareCandyCount ?? 0),
    familyCandy: mergeCounters(
      local.familyCandy as Record<string, number> | undefined,
      remote.familyCandy as Record<string, number> | undefined
    ),
    wildCandy: maxNum(local.wildCandy ?? 0, remote.wildCandy ?? 0),
    items: mergeCounters(
      local.items as Record<string, number> | undefined,
      remote.items as Record<string, number> | undefined
    ),
    eggsHatched: maxNum(local.eggsHatched ?? 0, remote.eggsHatched ?? 0),
    eggSellCoins: maxNum(local.eggSellCoins ?? 0, remote.eggSellCoins ?? 0),
    lifetimeCoinsEarned: maxNum(
      local.lifetimeCoinsEarned ?? 0,
      remote.lifetimeCoinsEarned ?? 0
    ),
    highScores: {
      ...(remote.highScores ?? {}),
      ...(local.highScores ?? {}),
      clickRush: maxNum(local.highScores?.clickRush ?? 0, remote.highScores?.clickRush ?? 0),
      perfectCapture: maxNum(
        local.highScores?.perfectCapture ?? 0,
        remote.highScores?.perfectCapture ?? 0
      ),
      memory: maxNum(local.highScores?.memory ?? 0, remote.highScores?.memory ?? 0),
      jitsu: maxNum(local.highScores?.jitsu ?? 0, remote.highScores?.jitsu ?? 0),
      hunterCave: maxNum(local.highScores?.hunterCave ?? 0, remote.highScores?.hunterCave ?? 0),
      flappyZubat: maxNum(local.highScores?.flappyZubat ?? 0, remote.highScores?.flappyZubat ?? 0),
    },
    jitsuXp: maxNum(local.jitsuXp ?? 0, remote.jitsuXp ?? 0),
    jitsuWins: maxNum(local.jitsuWins ?? 0, remote.jitsuWins ?? 0),
    flappyZubat: mergeFlappyState(local.flappyZubat, remote.flappyZubat),
  };
}

function mergeFlappyState(
  local: EconomyState["flappyZubat"],
  remote: EconomyState["flappyZubat"]
): NonNullable<EconomyState["flappyZubat"]> {
  const unlocked = [
    ...new Set([
      ...(remote?.unlockedSkins ?? ["zubat"]),
      ...(local?.unlockedSkins ?? ["zubat"]),
      "zubat",
    ]),
  ];
  const selected =
    local?.selectedSkin && unlocked.includes(local.selectedSkin)
      ? local.selectedSkin
      : remote?.selectedSkin && unlocked.includes(remote.selectedSkin)
        ? remote.selectedSkin
        : "zubat";
  return { selectedSkin: selected, unlockedSkins: unlocked };
}
