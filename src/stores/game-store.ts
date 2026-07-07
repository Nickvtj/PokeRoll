import { create } from "zustand";
import { ALBUM_POKEMON_LIST, POKEMON_LIST, TOTAL_POKEMON } from "@/data/pokemon";
import { getPokedexInfo } from "@/data/pokedex";
import { RARITY_ORDER, RARITY_CONFIG } from "@/data/rarity";
import {
  executeSpin,
  processSpinResult,
  generateSpinSequence,
  rollShiny,
} from "@/lib/spin-algorithm";
import {
  loadLocalCollection,
  loadLocalProfile,
  fetchRemoteCollection,
  fetchRemoteProfile,
  persistLocalCollection,
  persistLocalProfile,
  syncProfileToSupabase,
  syncCollectionUseShiny,
} from "@/lib/storage";
import { queueSpinPersistence } from "@/lib/game-sync-scheduler";
import { ensureStorageVersion } from "@/lib/storage-version";
import { rollSpinJackpot } from "@/data/spin-jackpot";
import type { ItemId } from "@/types/instance";
import { preloadSpinSprites } from "@/lib/sprite-preload";
import type {
  AlbumFilter,
  CollectedPokemon,
  PlayerProfile,
  Pokemon,
  Rarity,
  SpinMultiplier,
  SpinResult,
} from "@/types";

interface GameState {
  collection: Record<number, CollectedPokemon>;
  profile: PlayerProfile;
  isLoading: boolean;
  isSpinning: boolean;
  spinMultiplier: SpinMultiplier;
  lastSpinResults: SpinResult[];
  spinSequences: Pokemon[][];
  completedReels: number;
  spinSessionId: number;
  showReveal: boolean;
  duplicateRewardsGranted: boolean;
  albumFilter: AlbumFilter;

  initialize: () => Promise<void>;
  setSpinMultiplier: (multiplier: SpinMultiplier) => void;
  spin: () => Promise<SpinResult[] | null>;
  finishReelSpin: () => void;
  grantDuplicateRewards: () => void;
  closeReveal: () => void;
  setAlbumFilter: (filter: Partial<AlbumFilter>) => void;
  setUsername: (username: string) => Promise<void>;

  getCollectedCount: () => number;
  getUniqueCount: () => number;
  getDuplicateCount: () => number;
  getHighestRarity: () => Rarity | null;
  getProgress: () => number;
  isCollected: (id: number) => boolean;
  getFilteredPokemon: () => Pokemon[];
  getSearchableCollected: () => Pokemon[];
  getShinyCount: () => number;
  toggleUseShiny: (pokemonId: number) => void;
  /** Adiciona Pokémon obtido em cápsula ao álbum */
  commitCapsuleCatch: (pokemonId: number, isShiny: boolean) => void;
  /** Marca uma espécie como vista no Pokédex (ex.: ao evoluir), sem posse/doce. */
  markPokedexSeen: (pokemonId: number, isShiny: boolean) => void;
}

function applyCollectionEntry(
  collection: Record<number, CollectedPokemon>,
  pokemonId: number,
  isShiny: boolean
): Record<number, CollectedPokemon> {
  const now = new Date().toISOString();
  const existing = collection[pokemonId];

  const newEntry: CollectedPokemon = existing
    ? {
        ...existing,
        count: existing.count + 1,
        isDuplicate: true,
        hasShiny: existing.hasShiny || isShiny,
      }
    : {
        pokemonId,
        collectedAt: now,
        isDuplicate: false,
        count: 1,
        hasShiny: isShiny,
        useShiny: false,
      };

  return { ...collection, [pokemonId]: newEntry };
}

function mergeCollections(
  local: Record<number, CollectedPokemon>,
  remote: Record<number, CollectedPokemon>
): Record<number, CollectedPokemon> {
  const merged = { ...local };

  for (const remoteEntry of Object.values(remote)) {
    const localEntry = merged[remoteEntry.pokemonId];
    if (!localEntry) {
      merged[remoteEntry.pokemonId] = remoteEntry;
      continue;
    }

    const count = Math.max(localEntry.count, remoteEntry.count);
    merged[remoteEntry.pokemonId] = {
      ...localEntry,
      count,
      isDuplicate: count > 1,
      hasShiny: localEntry.hasShiny || remoteEntry.hasShiny,
      useShiny: localEntry.useShiny || remoteEntry.useShiny,
      collectedAt:
        localEntry.collectedAt <= remoteEntry.collectedAt
          ? localEntry.collectedAt
          : remoteEntry.collectedAt,
    };
  }

  return merged;
}

function mergeProfiles(local: PlayerProfile, remote: PlayerProfile): PlayerProfile {
  return {
    ...local,
    id: remote.id || local.id,
    username:
      remote.username && remote.username !== "Treinador"
        ? remote.username
        : local.username,
    totalSpins: Math.max(local.totalSpins, remote.totalSpins),
    createdAt:
      local.createdAt <= remote.createdAt ? local.createdAt : remote.createdAt,
  };
}

export const useGameStore = create<GameState>((set, get) => ({
  collection: {},
  profile: {
    id: "guest",
    username: "Treinador",
    totalSpins: 0,
    createdAt: new Date().toISOString(),
  },
  isLoading: true,
  isSpinning: false,
  spinMultiplier: 1,
  lastSpinResults: [],
  spinSequences: [],
  completedReels: 0,
  spinSessionId: 0,
  showReveal: false,
  duplicateRewardsGranted: false,
  albumFilter: {
    rarity: "all",
    generation: "all",
    status: "all",
    pokemonType: "all",
    shinyOnly: false,
    searchQuery: "",
  },

  initialize: async () => {
    try {
      ensureStorageVersion();
      const collection = loadLocalCollection();
      const profile = loadLocalProfile();
      set({ collection, profile, isLoading: false });
    } catch (err) {
      console.error("[PokéRoll] Falha ao carregar dados locais:", err);
      set({ isLoading: false });
      return;
    }

    void Promise.all([fetchRemoteCollection(), fetchRemoteProfile()]).then(
      ([remoteCollection, remoteProfile]) => {
        if (!remoteCollection && !remoteProfile) return;

        const current = get();
        const nextCollection = remoteCollection
          ? mergeCollections(current.collection, remoteCollection)
          : current.collection;
        const nextProfile = remoteProfile
          ? mergeProfiles(current.profile, remoteProfile)
          : current.profile;

        set({ collection: nextCollection, profile: nextProfile });
        persistLocalCollection(nextCollection);
        persistLocalProfile(nextProfile);
      }
    );
  },

  setSpinMultiplier: (multiplier) => {
    if (!get().isSpinning) {
      set({ spinMultiplier: multiplier });
    }
  },

  spin: async () => {
    const { isSpinning, spinMultiplier } = get();
    if (isSpinning) return null;

    // Economia: import dinâmico evita dependência circular
    const { useEconomyStore } = await import("@/stores/economy-store");
    const economy = useEconomyStore.getState();
    if (!economy.canAffordSpin(spinMultiplier)) return null;
    if (!economy.payForSpin(spinMultiplier)) return null;

    let collection = { ...get().collection };
    const results: SpinResult[] = [];
    const sequences: Pokemon[][] = [];

    const { hasAllAchievements } = await import("@/data/achievements");
    const mewUnlocked = hasAllAchievements(economy.unlockedAchievements ?? []);

    for (let i = 0; i < spinMultiplier; i++) {
      const pokemon = executeSpin({ mewUnlocked });
      const isShiny = rollShiny();
      const jackpot = rollSpinJackpot();
      const collectedIds = new Set(Object.keys(collection).map(Number));
      const existing = collection[pokemon.id];
      const result = processSpinResult(
        pokemon,
        collectedIds,
        isShiny,
        existing?.hasShiny ?? false,
        jackpot
      );
      results.push(result);
      sequences.push(generateSpinSequence(result.pokemon));
      collection = applyCollectionEntry(collection, pokemon.id, isShiny);
      economy.catchSpecies(pokemon.id, isShiny);
      if (jackpot?.evoItem) {
        economy.addItem(jackpot.evoItem as ItemId);
      }
      if (jackpot?.wildCandy) {
        economy.addWildCandy(jackpot.wildCandy);
      }
    }

    const newProfile = {
      ...get().profile,
      totalSpins: get().profile.totalSpins + spinMultiplier,
    };

    economy.incrementMission("spins", spinMultiplier);
    for (const r of results) {
      if (r.isNew) economy.incrementMission("new_pokemon");
    }

    set({
      isSpinning: true,
      lastSpinResults: results,
      spinSequences: sequences,
      completedReels: 0,
      spinSessionId: get().spinSessionId + 1,
      showReveal: false,
      duplicateRewardsGranted: false,
      collection,
      profile: newProfile,
    });

    preloadSpinSprites(sequences, results);

    queueSpinPersistence({
      collection,
      profile: newProfile,
      spins: results.map((r) => ({
        pokemonId: r.pokemon.id,
        isDuplicate: r.isDuplicate,
      })),
    });

    return results;
  },

  finishReelSpin: () => {
    set((state) => {
      if (!state.isSpinning || state.spinSequences.length === 0) return state;

      const next = state.completedReels + 1;
      const done = next >= state.spinSequences.length;

      if (done) {
        queueMicrotask(() => get().grantDuplicateRewards());
      }

      return {
        completedReels: next,
        ...(done ? { isSpinning: false, showReveal: true } : {}),
      };
    });
  },

  grantDuplicateRewards: () => {
    // Doce/Rare Candy de duplicata são concedidos no momento da captura
    // (economy.catchSpecies), por espécie possuída. Aqui só marcamos a flag.
    if (get().duplicateRewardsGranted) return;
    set({ duplicateRewardsGranted: true });
  },

  closeReveal: () => {
    get().grantDuplicateRewards();
    set({
      showReveal: false,
      lastSpinResults: [],
      spinSequences: [],
      completedReels: 0,
    });
  },

  setAlbumFilter: (filter) => {
    set({ albumFilter: { ...get().albumFilter, ...filter } });
  },

  setUsername: async (username) => {
    const trimmed = username.trim().slice(0, 20);
    if (trimmed.length < 2) return;

    const newProfile = { ...get().profile, username: trimmed };
    set({ profile: newProfile });
    persistLocalProfile(newProfile);
    void syncProfileToSupabase(newProfile);
  },

  getCollectedCount: () => Object.keys(get().collection).length,

  getUniqueCount: () =>
    Object.values(get().collection).filter((c) => c.count >= 1).length,

  getDuplicateCount: () =>
    Object.values(get().collection).reduce(
      (sum, c) => sum + Math.max(0, c.count - 1),
      0
    ),

  getHighestRarity: () => {
    const collected = get().collection;
    let highest: Rarity | null = null;
    let highestIndex = -1;

    for (const id of Object.keys(collected)) {
      const pokemon = POKEMON_LIST.find((p) => p.id === Number(id));
      if (!pokemon) continue;
      const idx = RARITY_ORDER.indexOf(pokemon.rarity);
      if (idx > highestIndex) {
        highestIndex = idx;
        highest = pokemon.rarity;
      }
    }

    return highest;
  },

  getProgress: () => {
    const count = get().getUniqueCount();
    return Math.round((count / TOTAL_POKEMON) * 100);
  },

  isCollected: (id) => id in get().collection,

  getFilteredPokemon: () => {
    const { albumFilter } = get();
    let list = [...ALBUM_POKEMON_LIST];

    if (albumFilter.rarity !== "all") {
      list = list.filter((p) => p.rarity === albumFilter.rarity);
    }

    if (albumFilter.generation !== "all") {
      list = list.filter((p) => p.generation === albumFilter.generation);
    }

    if (albumFilter.status === "found") {
      list = list.filter((p) => get().isCollected(p.id));
    } else if (albumFilter.status === "missing") {
      list = list.filter((p) => !get().isCollected(p.id));
    }

    if (albumFilter.pokemonType !== "all") {
      const typeFilter = albumFilter.pokemonType.toLowerCase();
      list = list.filter((p) => {
        const types = getPokedexInfo(p.id, p.name).types.map((t) => t.toLowerCase());
        return types.includes(typeFilter);
      });
    }

    if (albumFilter.shinyOnly) {
      list = list.filter((p) => get().collection[p.id]?.hasShiny);
    }

    return list;
  },

  getSearchableCollected: () => {
    const { albumFilter } = get();
    const query = albumFilter.searchQuery.trim().toLowerCase();
    if (!query) return [];

    const numeric = query.replace(/^#/, "");
    if (/^\d+$/.test(numeric)) {
      const id = parseInt(numeric, 10);
      return ALBUM_POKEMON_LIST.filter(
        (p) => p.id === id || String(p.id).padStart(3, "0").includes(numeric)
      );
    }

    return ALBUM_POKEMON_LIST.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        String(p.id).padStart(3, "0").includes(query)
    );
  },

  getShinyCount: () =>
    Object.values(get().collection).filter((c) => c.hasShiny).length,

  toggleUseShiny: (pokemonId) => {
    const entry = get().collection[pokemonId];
    if (!entry?.hasShiny) return;

    const collection = {
      ...get().collection,
      [pokemonId]: { ...entry, useShiny: !entry.useShiny },
    };
    set({ collection });
    persistLocalCollection(collection);
    void syncCollectionUseShiny(pokemonId, !entry.useShiny);
  },

  commitCapsuleCatch: (pokemonId, isShiny) => {
    const prev = get().collection;
    const wasNew = !prev[pokemonId];
    const collection = applyCollectionEntry(prev, pokemonId, isShiny);
    const profile = get().profile;
    set({ collection });
    persistLocalCollection(collection);
    queueSpinPersistence({
      collection,
      profile,
      spins: [{ pokemonId, isDuplicate: !wasNew }],
    });

    void import("@/stores/economy-store").then(({ useEconomyStore }) => {
      const economy = useEconomyStore.getState();
      // Posse + doce/rare candy por espécie possuída
      economy.catchSpecies(pokemonId, isShiny);
      if (wasNew) economy.incrementMission("new_pokemon");
    });
  },

  markPokedexSeen: (pokemonId, isShiny) => {
    const prev = get().collection;
    const existing = prev[pokemonId];
    const entry: CollectedPokemon = existing
      ? { ...existing, hasShiny: existing.hasShiny || isShiny }
      : {
          pokemonId,
          collectedAt: new Date().toISOString(),
          isDuplicate: false,
          count: 1,
          hasShiny: isShiny,
          useShiny: false,
        };
    const collection = { ...prev, [pokemonId]: entry };
    set({ collection });
    persistLocalCollection(collection);
  },
}));

export { RARITY_CONFIG, TOTAL_POKEMON };
