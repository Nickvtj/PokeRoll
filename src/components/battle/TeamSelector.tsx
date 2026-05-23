"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Check, Shuffle, Users, X, Search } from "lucide-react";
import { POKEMON_LIST } from "@/data/pokemon";
import { getPokedexInfo } from "@/data/pokedex";
import {
  LEVEL_FILTER_OPTIONS,
  matchesLevelFilter,
  type LevelFilterId,
} from "@/data/pokemon-battle-level";
import { useGameStore } from "@/stores/game-store";
import { useEconomyStore } from "@/stores/economy-store";
import { cn } from "@/lib/utils";
import { RARITY_CONFIG } from "@/data/rarity";
import { AnimatedButton } from "@/components/ui/AnimatedButton";

interface TeamSelectorProps {
  maxTeam?: number;
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

export function TeamSelector({ maxTeam = 3 }: TeamSelectorProps) {
  const collection = useGameStore((s) => s.collection);
  const team = useEconomyStore((s) => s.team);
  const setTeam = useEconomyStore((s) => s.setTeam);
  const pokemonBattleXp = useEconomyStore((s) => s.pokemonBattleXp);

  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [levelFilter, setLevelFilter] = useState<LevelFilterId>("all");
  const [searchQuery, setSearchQuery] = useState("");

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
    return collected.filter((p) => {
      const type = getPrimaryType(p.id, p.name);
      const level = pokemonBattleXp[String(p.id)]?.level ?? 1;
      if (q && !p.name.toLowerCase().includes(q)) return false;
      if (typeFilter !== "all" && type !== typeFilter) return false;
      if (!matchesLevelFilter(level, levelFilter)) return false;
      return true;
    });
  }, [collected, typeFilter, levelFilter, pokemonBattleXp, searchQuery]);

  const toggle = (id: number) => {
    if (team.includes(id)) {
      setTeam(team.filter((t) => t !== id));
    } else if (team.length < maxTeam) {
      setTeam([...team, id]);
    }
  };

  const clearTeam = () => setTeam([]);

  const randomTeam = () => {
    const pool = [...collected];
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    setTeam(pool.slice(0, maxTeam).map((p) => p.id));
  };

  if (collected.length === 0) {
    return (
      <div className="glass-card p-6 text-center text-white/50 text-sm">
        <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
        Colete Pokémon no álbum para montar seu time!
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="font-bold text-sm flex items-center gap-2">
          <Users className="w-4 h-4 text-indigo-400" />
          Montar Time ({team.length}/{maxTeam})
        </h3>
        <div className="flex gap-2">
          <AnimatedButton variant="ghost" size="sm" onClick={clearTeam} icon={<X className="w-3.5 h-3.5" />}>
            Limpar
          </AnimatedButton>
          <AnimatedButton
            variant="secondary"
            size="sm"
            onClick={randomTeam}
            disabled={collected.length < maxTeam}
            icon={<Shuffle className="w-3.5 h-3.5" />}
          >
            Aleatório
          </AnimatedButton>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[140px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar Pokémon..."
            className="w-full glass-card pl-8 pr-3 py-1.5 text-xs rounded-xl bg-transparent border border-white/10 text-white placeholder:text-white/30"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="glass-card px-3 py-1.5 text-xs rounded-xl bg-transparent border border-white/10 text-white/70"
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
          className="glass-card px-3 py-1.5 text-xs rounded-xl bg-transparent border border-white/10 text-white/70"
        >
          {LEVEL_FILTER_OPTIONS.map((o) => (
            <option key={o.id} value={o.id} className="bg-slate-900">
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 max-h-72 overflow-y-auto pr-1">
        {filtered.map((pokemon) => {
          const selected = team.includes(pokemon.id);
          const config = RARITY_CONFIG[pokemon.rarity];
          const disabled = !selected && team.length >= maxTeam;
          const level = pokemonBattleXp[String(pokemon.id)]?.level ?? 1;
          const type = getPrimaryType(pokemon.id, pokemon.name);

          return (
            <motion.button
              key={pokemon.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => !disabled && toggle(pokemon.id)}
              disabled={disabled}
              className={cn(
                "glass-card p-2 relative text-center transition-all",
                selected && "ring-2 ring-indigo-400",
                disabled && "opacity-30 cursor-not-allowed"
              )}
              style={
                selected
                  ? {
                      borderColor: `${config.color}60`,
                      boxShadow: `0 0 15px ${config.glowColor}`,
                    }
                  : undefined
              }
            >
              <div className="absolute top-1 left-1 px-1 py-0.5 rounded-md bg-indigo-500/80 text-[9px] font-bold">
                Nv.{level}
              </div>
              {selected && (
                <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-indigo-500 flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 text-white" />
                </div>
              )}
              <Image
                src={pokemon.image}
                alt={pokemon.name}
                width={48}
                height={48}
                className="object-contain mx-auto mt-2"
                unoptimized
              />
              <p className="text-[10px] font-semibold truncate mt-1">{pokemon.name}</p>
              <p className="text-[9px] text-white/40 capitalize">{type}</p>
            </motion.button>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-xs text-white/40 py-4">
          Nenhum Pokémon com esses filtros.
        </p>
      )}
    </div>
  );
}
