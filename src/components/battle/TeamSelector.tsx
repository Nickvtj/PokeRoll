"use client";

import { useMemo, useState, useCallback } from "react";
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
import { RARITY_CONFIG, RARITY_ORDER } from "@/data/rarity";
import { PokemonGymBadges } from "@/components/gym/GymBadge";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { BATTLE_CLASSIC_THEME } from "@/data/battle-theme";
import { MonotypeSynergyBanner } from "@/components/battle/MonotypeSynergyFx";
import { getTeamMonotypeSynergy } from "@/lib/team-monotype";
import { PokemonSelectorItem } from "./PokemonSelectorItem";

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
  const [rarityFilter, setRarityFilter] = useState<string>("all");
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
        if (rarityFilter !== "all" && p.rarity !== rarityFilter) return false;
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
    rarityFilter,
    levelFilter,
    pokemonBattleXp,
    searchQuery,
    favoritesOnly,
    favoriteSet,
  ]);

  const monotypeSynergy = useMemo(() => getTeamMonotypeSynergy(team), [team]);

  const toggle = useCallback((id: number) => {
    const currentTeam = useEconomyStore.getState().team;
    const countInTeam = currentTeam.filter((t) => t === id).length;
    const owned = getOwnedCount(useGameStore.getState().collection, id);

    if (countInTeam < owned && currentTeam.length < maxTeam) {
      setTeam([...currentTeam, id]);
      return;
    }
    if (countInTeam > 0) {
      const idx = currentTeam.lastIndexOf(id);
      setTeam([...currentTeam.slice(0, idx), ...currentTeam.slice(idx + 1)]);
    }
  }, [maxTeam, setTeam]);

  const handleToggleFavorite = useCallback((id: number) => {
    toggleFavoritePokemon(id);
  }, [toggleFavoritePokemon]);

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
          value={rarityFilter}
          onChange={(e) => setRarityFilter(e.target.value)}
          className={cn(
            "px-3 py-1.5 text-xs rounded-xl bg-transparent border text-white/70",
            BATTLE_CLASSIC_THEME ? "battle-prep-filter" : "glass-card border-white/10"
          )}
        >
          <option value="all" className="bg-slate-900">
            Todas raridades
          </option>
          {RARITY_ORDER.map((r) => (
            <option key={r} value={r} className="bg-slate-900">
              {RARITY_CONFIG[r].label}
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

      <MonotypeSynergyBanner synergy={monotypeSynergy} className="shrink-0" />

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 auto-rows-min flex-1 min-h-0 overflow-y-auto overscroll-contain p-1 pb-4 pr-2">
        {filtered.map((pokemon) => {
          const countInTeam = team.filter((t) => t === pokemon.id).length;
          const selected = countInTeam > 0;
          const owned = getOwnedCount(collection, pokemon.id);
          const canAddMore = countInTeam < owned && team.length < maxTeam;
          const disabled = !selected && !canAddMore;
          const type = getPrimaryType(pokemon.id, pokemon.name);
          const displayPokemon = withDisplayImage(pokemon, collection[pokemon.id]);

          return (
            <PokemonSelectorItem
              key={pokemon.id}
              pokemonId={pokemon.id}
              pokemonName={pokemon.name}
              rarity={pokemon.rarity}
              selected={selected}
              countInTeam={countInTeam}
              owned={owned}
              isFavorite={favoriteSet.has(pokemon.id)}
              level={pokemonBattleXp[String(pokemon.id)]?.level ?? 1}
              type={type}
              gymBadges={getHallOfFameBorder(pokemon.id)}
              displayImage={displayPokemon.image}
              disabled={disabled}
              synergyActive={monotypeSynergy.active}
              synergyType={monotypeSynergy.type}
              onToggle={toggle}
              onToggleFavorite={handleToggleFavorite}
            />
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
