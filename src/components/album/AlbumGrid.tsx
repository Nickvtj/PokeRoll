"use client";

import { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Filter, Search, X } from "lucide-react";
import { PokemonCard } from "@/components/pokemon/PokemonCard";
import { PokedexModal } from "@/components/album/PokedexModal";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { RARITY_ORDER, RARITY_CONFIG } from "@/data/rarity";
import { TOTAL_POKEMON } from "@/data/pokemon";
import { useGameStore } from "@/stores/game-store";
import { cn } from "@/lib/utils";
import type { Pokemon, Rarity } from "@/types";

const ALBUM_PAGE_SIZE = 48;

export function AlbumGrid() {
  const [selectedPokemon, setSelectedPokemon] = useState<Pokemon | null>(null);
  const [visibleCount, setVisibleCount] = useState(ALBUM_PAGE_SIZE);

  const collection = useGameStore((s) => s.collection);
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
  }, [isSearching, getSearchableCollected, getFilteredPokemon, albumFilter]);

  const visiblePokemon = useMemo(
    () => displayedPokemon.slice(0, visibleCount),
    [displayedPokemon, visibleCount]
  );

  const hasMore = visibleCount < displayedPokemon.length;

  useEffect(() => {
    setVisibleCount(ALBUM_PAGE_SIZE);
  }, [albumFilter.rarity, albumFilter.status, albumFilter.generation, albumFilter.searchQuery]);

  const collected = getUniqueCount();
  const progress = getProgress();

  return (
    <div className="space-y-6">
      <div className="glass-card p-6 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Progresso do Álbum</h2>
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

      {/* Busca — somente Pokémon já coletados */}
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
            placeholder="Buscar nos Pokémon que você já tem..."
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
            Mostrando {displayedPokemon.length} Pokémon coletado(s) com &quot;{albumFilter.searchQuery}&quot;
          </p>
        )}
      </div>

      {!isSearching && (
        <div className="glass-card p-4 space-y-3">
          <div className="flex items-center gap-2 text-white/70">
            <Filter className="w-4 h-4" />
            <span className="text-sm font-medium">Filtros</span>
          </div>

          <div className="space-y-2">
            <p className="text-[10px] uppercase tracking-wider text-white/35 font-semibold">Status</p>
            <div className="flex flex-wrap gap-2">
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
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-[10px] uppercase tracking-wider text-white/35 font-semibold">Raridade</p>
            <div className="flex flex-wrap gap-2">
              <FilterChip
                active={albumFilter.rarity === "all"}
                onClick={() => setAlbumFilter({ rarity: "all" })}
              >
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
            </div>
          </div>

          <div className="flex items-end justify-between gap-3 flex-wrap">
            <div className="space-y-2">
              <p className="text-[10px] uppercase tracking-wider text-white/35 font-semibold">Geração</p>
              <div className="flex flex-wrap gap-2">
                <FilterChip
                  active={albumFilter.generation === "all"}
                  onClick={() => setAlbumFilter({ generation: "all" })}
                >
                  Todas gens
                </FilterChip>
                <FilterChip
                  active={albumFilter.generation === 1}
                  onClick={() => setAlbumFilter({ generation: 1 })}
                >
                  Gen 1
                </FilterChip>
              </div>
            </div>

            {(albumFilter.rarity !== "all" ||
              albumFilter.status !== "all" ||
              albumFilter.generation !== "all") && (
              <button
                type="button"
                onClick={() => {
                  setAlbumFilter({ rarity: "all", status: "all", generation: "all" });
                  setVisibleCount(ALBUM_PAGE_SIZE);
                }}
                className="text-xs text-indigo-400 hover:text-indigo-300 pb-1"
              >
                Limpar filtros
              </button>
            )}
          </div>
        </div>
      )}

      <div
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4"
      >
        {visiblePokemon.map((pokemon) => {
          const entry = collection[pokemon.id];
          return (
            <div key={pokemon.id} className="album-card-slot">
              <PokemonCard
                pokemon={pokemon}
                collected={!!entry}
                duplicateCount={entry?.count}
                size="sm"
                animate={false}
                onClick={
                  entry
                    ? () => setSelectedPokemon(pokemon)
                    : undefined
                }
              />
            </div>
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
            ? "Nenhum Pokémon coletado com esse nome."
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
        "px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border",
        active
          ? "bg-white/15 border-white/30 text-white"
          : "bg-white/5 border-white/10 text-white/50 hover:bg-white/10"
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
