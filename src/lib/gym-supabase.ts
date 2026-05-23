import { getLocalUserId, getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import type { GymState } from "@/types/gym";

export async function loadGymFromSupabase(): Promise<GymState | null> {
  if (!isSupabaseConfigured) return null;
  const supabase = getSupabase();
  if (!supabase) return null;

  const userId = getLocalUserId();
  const { data, error } = await supabase
    .from("gym_progress")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error || !data) return null;

  return {
    badges: data.badges ?? [],
    gymProgress: data.gym_progress ?? {},
    hallOfFame: data.hall_of_fame ?? [],
    eliteProgress: data.elite_progress ?? {},
    championDefeated: data.champion_defeated ?? false,
    savedTeams: data.saved_teams ?? [],
    hallOfFameFinal: data.hall_of_fame_final ?? false,
  };
}

export async function syncGymToSupabase(state: GymState): Promise<void> {
  if (!isSupabaseConfigured) return;
  const supabase = getSupabase();
  if (!supabase) return;

  const userId = getLocalUserId();
  const payload = {
    user_id: userId,
    badges: state.badges,
    gym_progress: state.gymProgress,
    hall_of_fame: state.hallOfFame,
    elite_progress: state.eliteProgress,
    champion_defeated: state.championDefeated,
    saved_teams: state.savedTeams,
    hall_of_fame_final: state.hallOfFameFinal,
    updated_at: new Date().toISOString(),
  };

  const { data: existing } = await supabase
    .from("gym_progress")
    .select("user_id")
    .eq("user_id", userId)
    .single();

  if (existing) {
    await supabase.from("gym_progress").update(payload).eq("user_id", userId);
  } else {
    await supabase.from("gym_progress").insert(payload);
  }
}
