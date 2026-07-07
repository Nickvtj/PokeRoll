import { getLocalUserId, getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import type { GymState } from "@/types/gym";
import type { Database } from "@/types/database";

type GymProgressInsert = Database["public"]["Tables"]["gym_progress"]["Insert"];
type GymProgressUpdate = Database["public"]["Tables"]["gym_progress"]["Update"];

function toGymRow(state: GymState): GymProgressUpdate {
  return {
    badges: state.badges,
    gym_progress: state.gymProgress as Record<string, unknown>,
    hall_of_fame: state.hallOfFame as unknown as Record<string, unknown>[],
    elite_progress: state.eliteProgress as Record<string, unknown>,
    champion_defeated: state.championDefeated,
    saved_teams: state.savedTeams as unknown as Record<string, unknown>[],
    hall_of_fame_final: state.hallOfFameFinal,
    updated_at: new Date().toISOString(),
  };
}

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
    badges: (data.badges ?? []) as GymState["badges"],
    gymProgress: (data.gym_progress ?? {}) as GymState["gymProgress"],
    hallOfFame: (data.hall_of_fame ?? []) as unknown as GymState["hallOfFame"],
    eliteProgress: (data.elite_progress ?? {}) as GymState["eliteProgress"],
    championDefeated: data.champion_defeated ?? false,
    savedTeams: (data.saved_teams ?? []) as unknown as GymState["savedTeams"],
    hallOfFameFinal: data.hall_of_fame_final ?? false,
  };
}

export async function syncGymToSupabase(state: GymState): Promise<void> {
  if (!isSupabaseConfigured) return;
  const supabase = getSupabase();
  if (!supabase) return;

  const userId = getLocalUserId();
  const row = toGymRow(state);

  const { data: existing } = await supabase
    .from("gym_progress")
    .select("user_id")
    .eq("user_id", userId)
    .single();

  if (existing) {
    await supabase.from("gym_progress").update(row).eq("user_id", userId);
  } else {
    const insertRow: GymProgressInsert = { user_id: userId, ...row };
    await supabase.from("gym_progress").insert(insertRow);
  }
}
