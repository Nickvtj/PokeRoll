import { getLocalUserId, getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import type { EconomyState } from "@/types/economy";

export async function loadEconomyFromSupabase(): Promise<EconomyState | null> {
  if (!isSupabaseConfigured) return null;
  const supabase = getSupabase();
  if (!supabase) return null;

  const userId = getLocalUserId();
  const { data, error } = await supabase
    .from("player_economy")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error || !data) return null;

  return {
    coins: data.coins,
    xp: data.xp,
    level: data.level,
    rank: data.rank,
    freeSpins: data.free_spins,
    battleWins: data.battle_wins,
    totalBattles: data.total_battles,
    clickGamesPlayed: data.click_games_played,
    clickCoinsToday: data.click_coins_today,
    clickGamesToday: data.click_games_today,
    lastClickGameDate: data.last_click_game_date ?? "",
    dailyStreak: data.daily_streak,
    lastLoginDate: data.last_login_date ?? "",
    missionProgress: (data.mission_progress as Record<string, number>) ?? {},
    missionsClaimed: data.missions_claimed ?? [],
    lastMissionDate: data.last_mission_date ?? "",
    team: data.team ?? [],
  };
}

export async function syncEconomyToSupabase(economy: EconomyState): Promise<void> {
  if (!isSupabaseConfigured) return;
  const supabase = getSupabase();
  if (!supabase) return;

  const userId = getLocalUserId();
  const payload = {
    user_id: userId,
    coins: economy.coins,
    xp: economy.xp,
    level: economy.level,
    rank: economy.rank,
    free_spins: economy.freeSpins,
    battle_wins: economy.battleWins,
    total_battles: economy.totalBattles,
    click_games_played: economy.clickGamesPlayed,
    click_coins_today: economy.clickCoinsToday,
    click_games_today: economy.clickGamesToday,
    last_click_game_date: economy.lastClickGameDate || null,
    daily_streak: economy.dailyStreak,
    last_login_date: economy.lastLoginDate || null,
    mission_progress: economy.missionProgress,
    missions_claimed: economy.missionsClaimed,
    last_mission_date: economy.lastMissionDate || null,
    team: economy.team,
    updated_at: new Date().toISOString(),
  };

  const { data: existing } = await supabase
    .from("player_economy")
    .select("user_id")
    .eq("user_id", userId)
    .single();

  if (existing) {
    await supabase.from("player_economy").update(payload).eq("user_id", userId);
  } else {
    await supabase.from("player_economy").insert(payload);
  }
}

export async function recordBattleToSupabase(
  won: boolean,
  coins: number,
  xp: number,
  freeSpin: boolean,
  wave: number,
  teamIds: number[]
): Promise<void> {
  if (!isSupabaseConfigured) return;
  const supabase = getSupabase();
  if (!supabase) return;

  await supabase.from("battle_history").insert({
    user_id: getLocalUserId(),
    won,
    coins_earned: coins,
    xp_earned: xp,
    free_spin: freeSpin,
    wave,
    team_ids: teamIds,
  });
}

export async function recordMinigameToSupabase(
  score: number,
  coins: number,
  maxCombo: number
): Promise<void> {
  if (!isSupabaseConfigured) return;
  const supabase = getSupabase();
  if (!supabase) return;

  await supabase.from("minigame_history").insert({
    user_id: getLocalUserId(),
    score,
    coins_earned: coins,
    max_combo: maxCombo,
  });
}
