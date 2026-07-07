"use client";

import { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronDown, Filter, Search, Sparkles, X } from "lucide-react";
import { PokemonCard } from "@/components/pokemon/PokemonCard";
import { PokedexModal } from "@/components/album/PokedexModal";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { RARITY_ORDER, RARITY_CONFIG } from "@/data/rarity";
import { TOTAL_POKEMON } from "@/data/pokemon";
import { withGridImage } from "@/lib/pokemon-display";
import { useGameStore } from "@/stores/game-store";
import { useEconomyStore } from "@/stores/economy-store";
import { useCanSpeciesEvolve } from "@/components/album/EvolutionPanel";
import { cn } from "@/lib/utils";
import type { CollectedPokemon, Pokemon, Rarity } from "@/types";

const ALBUM_PAGE_SIZE = 48;

const POKEMON_TYPES = [
  "normal", "fire", "water", "grass", "electric", "ice", "fighting", "poison",
  "ground", "flying", "psychic", "bug", "rock", "ghost", "dragon", "dark", "steel", "fairy",
] as const;

const TYPE_LABELS: Record<string, string> = {
  normal: "Normal", fire: "Fogo", water: "Água", grass: "Planta", electric: "Elétrico",
  ice: "Gelo", fighting: "Lutador", poison: "Veneno", ground: "Terra", flying: "Voador",
  psychic: "Psíquico", bug: "Inseto", rock: "Pedra", ghost: "Fantasma", dragon: "Dragão",
  dark: "Sombrio", steel: "Aço", fairy: "Fada",
};

export function AlbumGrid() {
  const [selectedPokemon, setSelectedPokemon] = useState<Pokemon | null>(null);
  const [visibleCount, setVisibleCount] = useState(ALBUM_PAGE_SIZE);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const collection = useGameStore((s) => s.collection);
  const owned = useEconomyStore((s) => s.owned);
  const ownedSet = useMemo(() => new Set(owned ?? []), [owned]);
  useEconomyStore((s) => s.pokemonBattleXp);
  useEconomyStore((s) => s.familyCandy);
  useEconomyStore((s) => s.items);
  const albumFilter = useGameStore((s) => s.albumFilter);
  const setAlbumFilter = useGameStore((s) => s.setAlbumFilter);
  const getFilteredPokemon = useGameStore((s) => s.getFilteredPokemon);
  const getSearchableCollected = useGameStore((s) => s.getSearchableCollected);
  const getUniqueCount = useGameStore((s) => s.getUniqueCount);
  const getProgress = useGameStore((s) => s.getProgress);

  const isSearching = albumFilter.searchQuery.trim().length > 0;

  const displayedPokemon = useMemo(() => {
    if (isSearching) return getSearchableCollected();
    return getFilteredPokemon();
  }, [
    isSearching,
    getSearchableCollected,
    getFilteredPokemon,
    albumFilter.rarity,
    albumFilter.status,
    albumFilter.generation,
    albumFilter.pokemonType,
    albumFilter.shinyOnly,
    albumFilter.searchQuery,
  ]);

  const visiblePokemon = useMemo(
    () => displayedPokemon.slice(0, visibleCount),
    [displayedPokemon, visibleCount]
  );

  const hasMore = visibleCount < displayedPokemon.length;

  useEffect(() => {
    setVisibleCount(ALBUM_PAGE_SIZE);
  }, [albumFilter.rarity, albumFilter.status, albumFilter.generation, albumFilter.pokemonType, albumFilter.shinyOnly, albumFilter.searchQuery]);

  const collected = getUniqueCount();
  const progress = getProgress();

  return (
    <div className="space-y-6">
      <div className="glass-card p-6 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Progresso do Pokédex</h2>
          <span className="text-2xl font-bold neon-text">
            {collected}/{TOTAL_POKEMON}
          </span>
        </div>
        <div className="progress-bar">
          <motion.div
            className="progress-fill"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
        <p className="text-sm text-white/50">{progress}% completo</p>
      </div>

      {/* Busca, somente Pokémon já coletados */}
      <div className="glass-card p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            value={albumFilter.searchQuery}
            onChange={(e) => {
              setAlbumFilter({ searchQuery: e.target.value });
              setVisibleCount(ALBUM_PAGE_SIZE);
            }}
            placeholder="Buscar por nome ou número (#151, 025...)"
            className="w-full pl-10 pr-10 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-all"
          />
          {albumFilter.searchQuery && (
            <button
              onClick={() => setAlbumFilter({ searchQuery: "" })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        {isSearching && (
          <p className="mt-2 text-xs text-white/40">
            {displayedPokemon.length} resultado(s) para &quot;{albumFilter.searchQuery}&quot;
          </p>
        )}
      </div>

      {!isSearching && (
        <div className="glass-card overflow-hidden">
          <button
            type="button"
            onClick={() => setFiltersOpen((v) => !v)}
            className="w-full flex items-center justify-between gap-3 p-4 hover:bg-white/[0.03] transition-colors"
          >
            <span className="flex items-center gap-2 text-sm font-semibold text-white/80">
              <Filter className="w-4 h-4 text-indigo-400" />
              Filtros do Pokédex
            </span>
            <ChevronDown className={cn("w-4 h-4 text-white/40 transition-transform", filtersOpen && "rotate-180")} />
          </button>

          {filtersOpen && (
            <div className="px-4 pb-4 space-y-4 border-t border-white/10 pt-4">
              <FilterSection title="Status">
                {(
                  [
                    { value: "all", label: "Todos" },
                    { value: "found", label: "Encontrados" },
                    { value: "missing", label: "Faltando" },
                  ] as const
                ).map(({ value, label }) => (
                  <FilterChip
                    key={value}
                    active={albumFilter.status === value}
                    onClick={() => setAlbumFilter({ status: value })}
                  >
                    {label}
                  </FilterChip>
                ))}
              </FilterSection>

              <FilterSection title="Raridade">
                <FilterChip active={albumFilter.rarity === "all"} onClick={() => setAlbumFilter({ rarity: "all" })}>
                  Todas
                </FilterChip>
                {RARITY_ORDER.map((r) => (
                  <FilterChip
                    key={r}
                    active={albumFilter.rarity === r}
                    onClick={() => setAlbumFilter({ rarity: r as Rarity })}
                    color={RARITY_CONFIG[r].color}
                  >
                    {RARITY_CONFIG[r].label}
                  </FilterChip>
                ))}
              </FilterSection>

              <FilterSection title="Tipo">
                <FilterChip active={albumFilter.pokemonType === "all"} onClick={() => setAlbumFilter({ pokemonType: "all" })}>
                  Todos
                </FilterChip>
                {POKEMON_TYPES.map((t) => (
                  <FilterChip
                    key={t}
                    active={albumFilter.pokemonType === t}
                    onClick={() => setAlbumFilter({ pokemonType: t })}
                  >
                    {TYPE_LABELS[t]}
                  </FilterChip>
                ))}
              </FilterSection>

              <FilterSection title="Extras">
                <FilterChip
                  active={albumFilter.shinyOnly}
                  onClick={() => setAlbumFilter({ shinyOnly: !albumFilter.shinyOnly })}
                >
                  <span className="inline-flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Só com shiny
                  </span>
                </FilterChip>
                <FilterChip active={albumFilter.generation === 1} onClick={() => setAlbumFilter({ generation: 1 })}>
                  Gen 1
                </FilterChip>
                <FilterChip active={albumFilter.generation === "all"} onClick={() => setAlbumFilter({ generation: "all" })}>
                  Todas gens
                </FilterChip>
              </FilterSection>

              {(albumFilter.rarity !== "all" ||
                albumFilter.status !== "all" ||
                albumFilter.generation !== "all" ||
                albumFilter.pokemonType !== "all" ||
                albumFilter.shinyOnly) && (
                <button
                  type="button"
                  onClick={() => {
                    setAlbumFilter({
                      rarity: "all",
                      status: "all",
                      generation: "all",
                      pokemonType: "all",
                      shinyOnly: false,
                    });
                    setVisibleCount(ALBUM_PAGE_SIZE);
                  }}
                  className="text-xs text-indigo-400 hover:text-indigo-300"
                >
                  Limpar filtros
                </button>
              )}
            </div>
          )}
        </div>
      )}

      <div
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4"
      >
        {visiblePokemon.map((pokemon) => {
          const entry = collection[pokemon.id];
          const displayPokemon = withGridImage(pokemon, entry);
          return (
            <EvolveReadyCard
              key={pokemon.id}
              pokemon={displayPokemon}
              entry={entry}
              isOwned={ownedSet.has(pokemon.id)}
              onClick={entry ? () => setSelectedPokemon(pokemon) : undefined}
            />
          );
        })}
      </div>

      {hasMore && (
        <div className="flex justify-center pt-2">
          <AnimatedButton
            variant="secondary"
            onClick={() => setVisibleCount((n) => n + ALBUM_PAGE_SIZE)}
          >
            Carregar mais ({displayedPokemon.length - visibleCount} restantes)
          </AnimatedButton>
        </div>
      )}

      {displayedPokemon.length === 0 && (
        <div className="text-center py-12 text-white/40">
          {isSearching
            ? "Nenhum Pokémon encontrado com essa busca."
            : "Nenhum Pokémon encontrado com esses filtros."}
        </div>
      )}

      <PokedexModal
        pokemon={selectedPokemon}
        collection={selectedPokemon ? collection[selectedPokemon.id] ?? null : null}
        show={!!selectedPokemon}
        onClose={() => setSelectedPokemon(null)}
      />
    </div>
  );
}

function EvolveReadyCard({
  pokemon,
  entry,
  isOwned,
  onClick,
}: {
  pokemon: Pokemon;
  entry: CollectedPokemon | undefined;
  isOwned: boolean;
  onClick?: () => void;
}) {
  const canEvolve = useCanSpeciesEvolve(pokemon.id);
  const evolveReady = isOwned && canEvolve;

  return (
    <div className="album-card-slot">
      <PokemonCard
        pokemon={pokemon}
        collected={!!entry}
        duplicateCount={entry?.count}
        hasShiny={entry?.hasShiny}
        evolveReady={evolveReady}
        size="sm"
        animate={false}
        onClick={onClick}
      />
    </div>
  );
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <p className="text-[10px] uppercase tracking-wider text-white/35 font-semibold">{title}</p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function FilterChip({
  children,
  active,
  onClick,
  color,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
  color?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 border",
        active
          ? "bg-indigo-500/20 border-indigo-400/40 text-white shadow-sm shadow-indigo-500/10"
          : "bg-white/[0.04] border-white/10 text-white/50 hover:bg-white/10 hover:border-white/20"
      )}
      style={
        active && color
          ? {
              borderColor: `${color}60`,
              color,
              backgroundColor: `${color}15`,
            }
          : undefined
      }
    >
      {children}
    </button>
  );
}
