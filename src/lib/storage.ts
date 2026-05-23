import {
  getLocalUserId,
  getSupabase,
  isSupabaseConfigured,
  STORAGE_KEYS,
} from "@/lib/supabase";
import type { CollectedPokemon, PlayerProfile } from "@/types";

export async function loadCollection(): Promise<
  Record<number, CollectedPokemon>
> {
  if (isSupabaseConfigured) {
    const supabase = getSupabase();
    if (!supabase) return loadLocalCollection();

    const userId = getLocalUserId();
    const { data, error } = await supabase
      .from("collections")
      .select("*")
      .eq("user_id", userId);

    if (error || !data) return loadLocalCollection();

    const collection: Record<number, CollectedPokemon> = {};
    for (const row of data) {
      collection[row.pokemon_id] = {
        pokemonId: row.pokemon_id,
        collectedAt: row.first_collected_at,
        isDuplicate: row.count > 1,
        count: row.count,
      };
    }
    return collection;
  }

  return loadLocalCollection();
}

function loadLocalCollection(): Record<number, CollectedPokemon> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.collection);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveLocalCollection(
  collection: Record<number, CollectedPokemon>
): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.collection, JSON.stringify(collection));
}

export async function saveCollectionEntry(
  entry: CollectedPokemon
): Promise<void> {
  if (isSupabaseConfigured) {
    const supabase = getSupabase();
    if (!supabase) return saveLocalCollectionEntry(entry);

    const userId = getLocalUserId();
    const { data: existing } = await supabase
      .from("collections")
      .select("*")
      .eq("user_id", userId)
      .eq("pokemon_id", entry.pokemonId)
      .single();

    if (existing) {
      await supabase
        .from("collections")
        .update({
          count: existing.count + 1,
          last_collected_at: new Date().toISOString(),
        })
        .eq("id", existing.id);
    } else {
      await supabase.from("collections").insert({
        user_id: userId,
        pokemon_id: entry.pokemonId,
        count: entry.count,
      });
    }
    return;
  }

  saveLocalCollectionEntry(entry);
}

function saveLocalCollectionEntry(entry: CollectedPokemon): void {
  const collection = loadLocalCollection();
  collection[entry.pokemonId] = entry;
  saveLocalCollection(collection);
}

export async function loadProfile(): Promise<PlayerProfile> {
  if (isSupabaseConfigured) {
    const supabase = getSupabase();
    if (!supabase) return loadLocalProfile();

    const userId = getLocalUserId();
    const { data } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (data) {
      return {
        id: data.id,
        username: data.username,
        totalSpins: data.total_spins,
        createdAt: data.created_at,
      };
    }
  }

  return loadLocalProfile();
}

function loadLocalProfile(): PlayerProfile {
  if (typeof window === "undefined") {
    return {
      id: "guest",
      username: "Treinador",
      totalSpins: 0,
      createdAt: new Date().toISOString(),
    };
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEYS.profile);
    if (raw) return JSON.parse(raw);
  } catch {
    /* fallback */
  }

  const profile: PlayerProfile = {
    id: getLocalUserId(),
    username: "Treinador",
    totalSpins: 0,
    createdAt: new Date().toISOString(),
  };
  localStorage.setItem(STORAGE_KEYS.profile, JSON.stringify(profile));
  return profile;
}

export function saveLocalProfile(profile: PlayerProfile): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.profile, JSON.stringify(profile));
}

export async function recordSpin(
  pokemonId: number,
  isDuplicate: boolean
): Promise<void> {
  if (isSupabaseConfigured) {
    const supabase = getSupabase();
    if (!supabase) return;

    const userId = getLocalUserId();
    await supabase.from("spins").insert({
      user_id: userId,
      pokemon_id: pokemonId,
      is_duplicate: isDuplicate,
    });

    const { data: user } = await supabase
      .from("users")
      .select("total_spins")
      .eq("id", userId)
      .single();

    if (user) {
      await supabase
        .from("users")
        .update({ total_spins: user.total_spins + 1 })
        .eq("id", userId);
    }
  }
}

export async function syncFullCollection(
  collection: Record<number, CollectedPokemon>
): Promise<void> {
  saveLocalCollection(collection);
}

export async function syncProfile(profile: PlayerProfile): Promise<void> {
  saveLocalProfile(profile);

  if (isSupabaseConfigured) {
    const supabase = getSupabase();
    if (!supabase) return;

    const { data: existing } = await supabase
      .from("users")
      .select("id")
      .eq("id", profile.id)
      .single();

    if (existing) {
      await supabase
        .from("users")
        .update({ total_spins: profile.totalSpins, username: profile.username })
        .eq("id", profile.id);
    } else {
      await supabase.from("users").insert({
        id: profile.id,
        username: profile.username,
        total_spins: profile.totalSpins,
      });
    }
  }
}
