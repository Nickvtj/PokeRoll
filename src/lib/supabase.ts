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

/**
 * Gera um UUID v4 com fallback.
 * `crypto.randomUUID` só existe em "secure contexts" (HTTPS ou localhost).
 * Acessando via IP de LAN em HTTP (ex.: http://192.168.0.12:3000) a API não
 * está disponível, então caímos para `getRandomValues` e, por fim, `Math.random`.
 */
export function generateUuid(): string {
  try {
    const c = typeof crypto !== "undefined" ? crypto : undefined;
    if (c && typeof c.randomUUID === "function") {
      return c.randomUUID();
    }
    if (c && typeof c.getRandomValues === "function") {
      const bytes = new Uint8Array(16);
      c.getRandomValues(bytes);
      bytes[6] = (bytes[6] & 0x0f) | 0x40;
      bytes[8] = (bytes[8] & 0x3f) | 0x80;
      const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0"));
      return `${hex.slice(0, 4).join("")}-${hex.slice(4, 6).join("")}-${hex
        .slice(6, 8)
        .join("")}-${hex.slice(8, 10).join("")}-${hex.slice(10, 16).join("")}`;
    }
  } catch {
    /* fallback abaixo */
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (ch) => {
    const r = (Math.random() * 16) | 0;
    const v = ch === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/** ID de usuário local quando Supabase não está configurado */
export function getLocalUserId(): string {
  if (typeof window === "undefined") return "guest";

  let id = localStorage.getItem("pokeroll_user_id");
  if (!id) {
    id = `local_${generateUuid()}`;
    localStorage.setItem("pokeroll_user_id", id);
  }
  return id;
}

export const STORAGE_KEYS = {
  collection: "pokeroll_collection",
  profile: "pokeroll_profile",
  spins: "pokeroll_spins",
} as const;
