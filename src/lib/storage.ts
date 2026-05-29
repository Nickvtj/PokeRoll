import {
  getLocalUserId,
  getSupabase,
  isSupabaseConfigured,
  STORAGE_KEYS,
} from "@/lib/supabase";
import { createDebouncedJsonPersist } from "@/lib/debounced-local-storage";
import type { CollectedPokemon, PlayerProfile } from "@/types";

const collectionPersist = createDebouncedJsonPersist<
  Record<number, CollectedPokemon>
>(STORAGE_KEYS.collection);

const profilePersist = createDebouncedJsonPersist<PlayerProfile>(
  STORAGE_KEYS.profile
);

export function loadLocalCollection(): Record<number, CollectedPokemon> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.collection);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export async function fetchRemoteCollection(): Promise<
  Record<number, CollectedPokemon> | null
> {
  if (!isSupabaseConfigured) return null;

  const supabase = getSupabase();
  if (!supabase) return null;

  const userId = getLocalUserId();
  const { data, error } = await supabase
    .from("collections")
    .select("*")
    .eq("user_id", userId);

  if (error || !data) return null;

  const collection: Record<number, CollectedPokemon> = {};
  for (const row of data) {
    collection[row.pokemon_id] = {
      pokemonId: row.pokemon_id,
      collectedAt: row.first_collected_at,
      isDuplicate: row.count > 1,
      count: row.count,
      hasShiny: row.has_shiny ?? false,
      useShiny: row.use_shiny ?? false,
    };
  }
  return collection;
}

export async function loadCollection(): Promise<
  Record<number, CollectedPokemon>
> {
  const remote = await fetchRemoteCollection();
  if (remote) return remote;
  return loadLocalCollection();
}

export function persistLocalCollection(
  collection: Record<number, CollectedPokemon>
): void {
  collectionPersist.schedule(collection);
}

export function flushLocalCollection(): void {
  collectionPersist.flush();
}

/** @deprecated Prefer persistLocalCollection — mantido para compatibilidade interna. */
export function saveLocalCollection(
  collection: Record<number, CollectedPokemon>
): void {
  persistLocalCollection(collection);
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
          has_shiny: entry.hasShiny || existing.has_shiny,
        })
        .eq("id", existing.id);
    } else {
      await supabase.from("collections").insert({
        user_id: userId,
        pokemon_id: entry.pokemonId,
        count: entry.count,
        has_shiny: entry.hasShiny ?? false,
        use_shiny: entry.useShiny ?? false,
      });
    }
    return;
  }

  saveLocalCollectionEntry(entry);
}

export async function syncCollectionUseShiny(
  pokemonId: number,
  useShiny: boolean
): Promise<void> {
  if (!isSupabaseConfigured) return;

  const supabase = getSupabase();
  if (!supabase) return;

  const userId = getLocalUserId();
  await supabase
    .from("collections")
    .update({ use_shiny: useShiny })
    .eq("user_id", userId)
    .eq("pokemon_id", pokemonId);
}

function saveLocalCollectionEntry(entry: CollectedPokemon): void {
  const collection = loadLocalCollection();
  collection[entry.pokemonId] = entry;
  persistLocalCollection(collection);
}

export function loadLocalProfile(): PlayerProfile {
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
  profilePersist.writeImmediate(profile);
  return profile;
}

export async function fetchRemoteProfile(): Promise<PlayerProfile | null> {
  if (!isSupabaseConfigured) return null;

  const supabase = getSupabase();
  if (!supabase) return null;

  const userId = getLocalUserId();
  const { data } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();

  if (!data) return null;

  return {
    id: data.id,
    username: data.username,
    totalSpins: data.total_spins,
    createdAt: data.created_at,
  };
}

export async function loadProfile(): Promise<PlayerProfile> {
  const remote = await fetchRemoteProfile();
  if (remote) return remote;
  return loadLocalProfile();
}

export function persistLocalProfile(profile: PlayerProfile): void {
  profilePersist.schedule(profile);
}

export function flushLocalProfile(): void {
  profilePersist.flush();
}

/** @deprecated Prefer persistLocalProfile */
export function saveLocalProfile(profile: PlayerProfile): void {
  persistLocalProfile(profile);
}

export async function recordSpin(
  pokemonId: number,
  isDuplicate: boolean
): Promise<void> {
  await recordSpinsToSupabase([{ pokemonId, isDuplicate }]);
}

export async function recordSpinsToSupabase(
  spins: { pokemonId: number; isDuplicate: boolean }[],
  profile?: PlayerProfile
): Promise<void> {
  if (!isSupabaseConfigured || spins.length === 0) return;

  const supabase = getSupabase();
  if (!supabase) return;

  const userId = getLocalUserId();

  await supabase.from("spins").insert(
    spins.map(({ pokemonId, isDuplicate }) => ({
      user_id: userId,
      pokemon_id: pokemonId,
      is_duplicate: isDuplicate,
    }))
  );

  if (profile) {
    await syncProfileToSupabase(profile);
    return;
  }

  const { data: user } = await supabase
    .from("users")
    .select("total_spins")
    .eq("id", userId)
    .single();

  if (user) {
    await supabase
      .from("users")
      .update({ total_spins: user.total_spins + spins.length })
      .eq("id", userId);
  }
}

export async function syncFullCollection(
  collection: Record<number, CollectedPokemon>
): Promise<void> {
  persistLocalCollection(collection);
}

export async function syncProfile(profile: PlayerProfile): Promise<void> {
  persistLocalProfile(profile);
  await syncProfileToSupabase(profile);
}

export async function syncProfileToSupabase(
  profile: PlayerProfile
): Promise<void> {
  if (!isSupabaseConfigured) return;

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
