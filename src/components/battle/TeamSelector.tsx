"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Check, Heart, Shuffle, Users, X, Search } from "lucide-react";
import { POKEMON_LIST } from "@/data/pokemon";
import { getPokedexInfo } from "@/data/pokedex";
import {
  LEVEL_FILTER_OPTIONS,
  matchesLevelFilter,
  type LevelFilterId,
} from "@/data/pokemon-battle-level";
import { useGameStore } from "@/stores/game-store";
import { withDisplayImage } from "@/lib/pokemon-display";
import { useEconomyStore } from "@/stores/economy-store";
import { useGymStore } from "@/stores/gym-store";
import { cn } from "@/lib/utils";
import { RARITY_CONFIG } from "@/data/rarity";
import { PokemonGymBadges } from "@/components/gym/GymBadge";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { BATTLE_CLASSIC_THEME } from "@/data/battle-theme";

interface TeamSelectorProps {
  maxTeam?: number;
  className?: string;
}

const TYPE_LABELS: Record<string, string> = {
  all: "Todos tipos",
  fire: "Fogo",
  water: "Água",
  grass: "Planta",
  electric: "Elétrico",
  ice: "Gelo",
  fighting: "Lutador",
  poison: "Veneno",
  ground: "Terra",
  flying: "Voador",
  psychic: "Psíquico",
  bug: "Inseto",
  rock: "Pedra",
  ghost: "Fantasma",
  dragon: "Dragão",
  dark: "Sombrio",
  steel: "Aço",
  fairy: "Fada",
  normal: "Normal",
};

function getPrimaryType(id: number, name: string): string {
  return getPokedexInfo(id, name).types[0].toLowerCase();
}

function getOwnedCount(collection: Record<number, { count?: number }>, id: number): number {
  const entry = collection[id];
  if (!entry) return 0;
  return Math.max(1, entry.count ?? 1);
}

export function TeamSelector({ maxTeam = 3, className }: TeamSelectorProps) {
  const collection = useGameStore((s) => s.collection);
  const team = useEconomyStore((s) => s.team);
  const setTeam = useEconomyStore((s) => s.setTeam);
  const pokemonBattleXp = useEconomyStore((s) => s.pokemonBattleXp);
  const favoritePokemon = useEconomyStore((s) => s.favoritePokemon);
  const toggleFavoritePokemon = useEconomyStore((s) => s.toggleFavoritePokemon);
  const getLevelCap = useEconomyStore((s) => s.getLevelCap);
  const badgeCount = useGymStore((s) => s.badges.length);
  const getHallOfFameBorder = useGymStore((s) => s.getHallOfFameBorder);

  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [levelFilter, setLevelFilter] = useState<LevelFilterId>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [favoritesOnly, setFavoritesOnly] = useState(false);

  const favoriteSet = useMemo(
    () => new Set(favoritePokemon ?? []),
    [favoritePokemon]
  );

  const collected = useMemo(
    () => POKEMON_LIST.filter((p) => collection[p.id]),
    [collection]
  );

  const availableTypes = useMemo(() => {
    const types = new Set(collected.map((p) => getPrimaryType(p.id, p.name)));
    return ["all", ...Array.from(types).sort()];
  }, [collected]);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return collected
      .filter((p) => {
        const type = getPrimaryType(p.id, p.name);
        const level = pokemonBattleXp[String(p.id)]?.level ?? 1;
        if (q && !p.name.toLowerCase().includes(q)) return false;
        if (favoritesOnly && !favoriteSet.has(p.id)) return false;
        if (typeFilter !== "all" && type !== typeFilter) return false;
        if (!matchesLevelFilter(level, levelFilter)) return false;
        return true;
      })
      .sort((a, b) => {
        const aFav = favoriteSet.has(a.id) ? 0 : 1;
        const bFav = favoriteSet.has(b.id) ? 0 : 1;
        if (aFav !== bFav) return aFav - bFav;
        return a.name.localeCompare(b.name);
      });
  }, [
    collected,
    typeFilter,
    levelFilter,
    pokemonBattleXp,
    searchQuery,
    favoritesOnly,
    favoriteSet,
  ]);

  const toggle = (id: number) => {
    const countInTeam = team.filter((t) => t === id).length;
    const owned = getOwnedCount(collection, id);

    if (countInTeam < owned && team.length < maxTeam) {
      setTeam([...team, id]);
      return;
    }
    if (countInTeam > 0) {
      const idx = team.lastIndexOf(id);
      setTeam([...team.slice(0, idx), ...team.slice(idx + 1)]);
    }
  };

  const clearTeam = () => setTeam([]);

  const randomTeam = () => {
    const pool = favoritesOnly
      ? collected.filter((p) => favoriteSet.has(p.id))
      : [...collected];
    if (pool.length < maxTeam) return;

    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    setTeam(pool.slice(0, maxTeam).map((p) => p.id));
  };

  if (collected.length === 0) {
    return (
      <div
        className={cn(
          "p-6 text-center text-white/50 text-sm",
          BATTLE_CLASSIC_THEME ? "battle-classic-dialog" : "glass-card",
          className
        )}
      >
        <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
        Colete Pokémon no álbum para montar seu time!
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col min-h-0 gap-3", className)}>
      <div className="flex items-center justify-between flex-wrap gap-2 shrink-0">
        {BATTLE_CLASSIC_THEME ? (
          <span className="battle-classic-section-label battle-classic-player-label flex items-center gap-1.5 mb-0">
            <Users className="w-3.5 h-3.5" />
            Montar Time ({team.length}/{maxTeam})
          </span>
        ) : (
          <h3 className="font-bold text-sm flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-400" />
            Montar Time ({team.length}/{maxTeam})
          </h3>
        )}
        <span className="text-[10px] text-amber-400/80">
          Cap Nv.{getLevelCap()} · {badgeCount}🏅
        </span>
        <div className="flex gap-2">
          <AnimatedButton variant="ghost" size="sm" onClick={clearTeam} icon={<X className="w-3.5 h-3.5" />}>
            Limpar
          </AnimatedButton>
          <AnimatedButton
            variant="secondary"
            size="sm"
            onClick={randomTeam}
            disabled={favoritesOnly ? favoriteSet.size < maxTeam : collected.length < maxTeam}
            icon={<Shuffle className="w-3.5 h-3.5" />}
          >
            Aleatório
          </AnimatedButton>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2 shrink-0">
        <div className="relative flex-1 min-w-[160px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar Pokémon..."
            className={cn(
              "w-full pl-10 pr-3 py-2 text-xs text-white placeholder:text-white/30",
              BATTLE_CLASSIC_THEME
                ? "battle-prep-filter"
                : "rounded-xl bg-white/5 border border-white/10 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30"
            )}
          />
        </div>
        <button
          type="button"
          onClick={() => setFavoritesOnly((v) => !v)}
          className={cn(
            "px-3 py-1.5 text-xs rounded-xl border transition-all flex items-center gap-1.5",
            BATTLE_CLASSIC_THEME ? "battle-prep-filter" : "glass-card",
            favoritesOnly
              ? "border-pink-400/50 text-pink-300 bg-pink-500/10"
              : "border-white/10 text-white/70 hover:text-white"
          )}
        >
          <Heart className={cn("w-3.5 h-3.5", favoritesOnly && "fill-pink-400 text-pink-400")} />
          Favoritos
        </button>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className={cn(
            "px-3 py-1.5 text-xs rounded-xl bg-transparent border text-white/70",
            BATTLE_CLASSIC_THEME ? "battle-prep-filter" : "glass-card border-white/10"
          )}
        >
          {availableTypes.map((t) => (
            <option key={t} value={t} className="bg-slate-900">
              {TYPE_LABELS[t] ?? t}
            </option>
          ))}
        </select>
        <select
          value={levelFilter}
          onChange={(e) => setLevelFilter(e.target.value as LevelFilterId)}
          className={cn(
            "px-3 py-1.5 text-xs rounded-xl bg-transparent border text-white/70",
            BATTLE_CLASSIC_THEME ? "battle-prep-filter" : "glass-card border-white/10"
          )}
        >
          {LEVEL_FILTER_OPTIONS.map((o) => (
            <option key={o.id} value={o.id} className="bg-slate-900">
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 flex-1 min-h-0 overflow-y-auto overscroll-contain p-1 -m-1 pr-2">
        {filtered.map((pokemon) => {
          const countInTeam = team.filter((t) => t === pokemon.id).length;
          const selected = countInTeam > 0;
          const owned = getOwnedCount(collection, pokemon.id);
          const canAddMore = countInTeam < owned && team.length < maxTeam;
          const isFavorite = favoriteSet.has(pokemon.id);
          const config = RARITY_CONFIG[pokemon.rarity];
          const disabled = !selected && !canAddMore;
          const level = pokemonBattleXp[String(pokemon.id)]?.level ?? 1;
          const type = getPrimaryType(pokemon.id, pokemon.name);
          const gymBadges = getHallOfFameBorder(pokemon.id);
          const displayPokemon = withDisplayImage(pokemon, collection[pokemon.id]);

          return (
            <motion.div
              key={pokemon.id}
              role="button"
              tabIndex={disabled ? -1 : 0}
              whileTap={{ scale: disabled ? 1 : 0.98 }}
              onClick={() => !disabled && toggle(pokemon.id)}
              onKeyDown={(e) => {
                if (!disabled && (e.key === "Enter" || e.key === " ")) {
                  e.preventDefault();
                  toggle(pokemon.id);
                }
              }}
              className={cn(
                BATTLE_CLASSIC_THEME
                  ? cn(
                      "battle-prep-card",
                      selected && "battle-prep-card-selected battle-classic-card-active",
                      isFavorite && !selected && "border-pink-400/30"
                    )
                  : cn(
                      "relative text-center transition-all cursor-pointer rounded-xl border p-2 bg-white/[0.04]",
                      selected ? "border-2" : "border-white/10 hover:border-white/20",
                      isFavorite && !selected && "border-pink-400/30"
                    ),
                disabled && "opacity-30 cursor-not-allowed"
              )}
              style={
                selected
                  ? {
                      borderColor: config.color,
                      backgroundColor: BATTLE_CLASSIC_THEME
                        ? `${config.color}22`
                        : `${config.color}18`,
                      boxShadow: `0 0 14px ${config.glowColor}`,
                    }
                  : undefined
              }
            >
              <button
                type="button"
                aria-label={isFavorite ? "Remover dos favoritos" : "Favoritar"}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavoritePokemon(pokemon.id);
                }}
                className="absolute top-1 right-1 z-10 p-0.5 rounded-full hover:bg-white/10 transition-colors"
              >
                <Heart
                  className={cn(
                    "w-3.5 h-3.5",
                    isFavorite ? "fill-pink-400 text-pink-400" : "text-white/25"
                  )}
                />
              </button>

              <div
                className={cn(
                  "absolute top-1 left-1 z-10 px-1 py-0.5 text-[8px] font-black rounded-md leading-none",
                  BATTLE_CLASSIC_THEME
                    ? "bg-indigo-500/35 text-indigo-100 border border-indigo-400/45"
                    : "bg-indigo-500/80 text-white"
                )}
              >
                Nv.{level}
              </div>
              {selected && (
                <div className="absolute bottom-1 right-1 min-w-4 h-4 px-0.5 rounded-full bg-indigo-500 flex items-center justify-center">
                  {countInTeam > 1 ? (
                    <span className="text-[8px] font-bold text-white">×{countInTeam}</span>
                  ) : (
                    <Check className="w-2.5 h-2.5 text-white" />
                  )}
                </div>
              )}
              {owned > 1 && (
                <div className="absolute bottom-1 left-1 px-1 py-0.5 rounded-md bg-black/50 text-[8px] text-amber-400/90">
                  ×{owned}
                </div>
              )}
              <Image
                src={displayPokemon.image}
                alt={pokemon.name}
                width={48}
                height={48}
                className="object-contain mx-auto mt-2"
                unoptimized
              />
              <p
                className="text-[10px] font-semibold truncate mt-1"
                style={BATTLE_CLASSIC_THEME ? { color: config.color } : undefined}
              >
                {pokemon.name}
              </p>
              <p className="text-[9px] text-white/40 capitalize">{type}</p>
              {gymBadges.length > 0 && (
                <div className="mt-1">
                  <PokemonGymBadges gymIds={gymBadges} size="xs" max={3} />
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-xs text-white/40 py-4">
          {favoritesOnly
            ? "Nenhum favorito com esses filtros. Toque no coração para favoritar."
            : "Nenhum Pokémon com esses filtros."}
        </p>
      )}
    </div>
  );
}
