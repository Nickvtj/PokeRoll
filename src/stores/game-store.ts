import { create } from "zustand";
import { POKEMON_LIST, TOTAL_POKEMON } from "@/data/pokemon";
import { RARITY_ORDER, RARITY_CONFIG } from "@/data/rarity";
import {
  executeSpin,
  processSpinResult,
  generateSpinSequence,
  rollShiny,
} from "@/lib/spin-algorithm";
import {
  loadCollection,
  loadProfile,
  persistLocalCollection,
  persistLocalProfile,
  syncProfileToSupabase,
  syncCollectionUseShiny,
} from "@/lib/storage";
import { queueSpinPersistence } from "@/lib/game-sync-scheduler";
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
    searchQuery: "",
  },

  initialize: async () => {
    set({ isLoading: true });
    const [collection, profile] = await Promise.all([
      loadCollection(),
      loadProfile(),
    ]);
    set({ collection, profile, isLoading: false });
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

    for (let i = 0; i < spinMultiplier; i++) {
      const pokemon = executeSpin();
      const isShiny = rollShiny();
      const collectedIds = new Set(Object.keys(collection).map(Number));
      const existing = collection[pokemon.id];
      const result = processSpinResult(
        pokemon,
        collectedIds,
        isShiny,
        existing?.hasShiny ?? false
      );
      results.push(result);
      sequences.push(generateSpinSequence(pokemon));
      collection = applyCollectionEntry(collection, pokemon.id, isShiny);

      if (result.isDuplicate) {
        const { getDuplicateXp } = await import("@/data/duplicate-xp");
        economy.grantPokemonXp(pokemon.id, getDuplicateXp(pokemon.rarity));
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
    const { lastSpinResults, duplicateRewardsGranted } = get();
    if (duplicateRewardsGranted || lastSpinResults.length === 0) return;

    const duplicateCount = lastSpinResults.filter((r) => r.isDuplicate).length;
    set({ duplicateRewardsGranted: true });

    if (duplicateCount === 0) return;

    void import("@/stores/economy-store").then(({ useEconomyStore }) => {
      const economy = useEconomyStore.getState();
      for (let i = 0; i < duplicateCount; i++) {
        economy.convertDuplicate();
      }
    });
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
    let list = [...POKEMON_LIST];

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

    return list;
  },

  getSearchableCollected: () => {
    const { albumFilter } = get();
    const query = albumFilter.searchQuery.trim().toLowerCase();
    if (!query) return [];

    return POKEMON_LIST.filter(
      (p) =>
        get().isCollected(p.id) &&
        p.name.toLowerCase().includes(query)
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
}));

export { RARITY_CONFIG, TOTAL_POKEMON };
