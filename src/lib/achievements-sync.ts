import { getLocalUserId, getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { ACHIEVEMENTS, getUnlockedAchievements, type AchievementStats } from "@/data/achievements";

export async function loadAchievementsFromSupabase(): Promise<string[]> {
  if (!isSupabaseConfigured) return [];
  const supabase = getSupabase();
  if (!supabase) return [];

  const userId = getLocalUserId();
  const { data, error } = await supabase
    .from("player_achievements")
    .select("achievement_id")
    .eq("user_id", userId);

  if (error || !data) return [];
  return data.map((row) => row.achievement_id);
}

export async function syncAchievementsToSupabase(ids: string[]): Promise<void> {
  if (!isSupabaseConfigured || ids.length === 0) return;
  const supabase = getSupabase();
  if (!supabase) return;

  const userId = getLocalUserId();
  const rows = ids.map((achievement_id) => ({
    user_id: userId,
    achievement_id,
  }));

  await supabase
    .from("player_achievements")
    .upsert(rows, { onConflict: "user_id,achievement_id", ignoreDuplicates: true });
}

export function computeNewAchievements(
  stats: AchievementStats,
  alreadyUnlocked: string[]
): string[] {
  const unlocked = new Set(alreadyUnlocked);
  return getUnlockedAchievements(stats).filter((id) => !unlocked.has(id));
}

export function mergeAchievementIds(local: string[], remote: string[]): string[] {
  return [...new Set([...local, ...remote])];
}

export { ACHIEVEMENTS };
