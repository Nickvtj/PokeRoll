import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const isSupabaseConfigured =
  supabaseUrl.length > 0 &&
  supabaseAnonKey.length > 0 &&
  !supabaseUrl.includes("your_supabase");

let supabaseInstance: SupabaseClient<Database> | null = null;

export function getSupabase(): SupabaseClient<Database> | null {
  if (!isSupabaseConfigured) return null;

  if (!supabaseInstance) {
    supabaseInstance = createClient<Database>(supabaseUrl, supabaseAnonKey);
  }

  return supabaseInstance;
}

/** ID de usuário local quando Supabase não está configurado */
export function getLocalUserId(): string {
  if (typeof window === "undefined") return "guest";

  let id = localStorage.getItem("pokeroll_user_id");
  if (!id) {
    id = `local_${crypto.randomUUID()}`;
    localStorage.setItem("pokeroll_user_id", id);
  }
  return id;
}

export const STORAGE_KEYS = {
  collection: "pokeroll_collection",
  profile: "pokeroll_profile",
  spins: "pokeroll_spins",
} as const;
