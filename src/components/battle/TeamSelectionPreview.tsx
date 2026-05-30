"use client";

import { useMemo } from "react";
import Image from "next/image";
import { Users } from "lucide-react";
import { POKEMON_MAP } from "@/data/pokemon";
import { BATTLE_CLASSIC_THEME } from "@/data/battle-theme";
import { RARITY_CONFIG } from "@/data/rarity";
import { withDisplayImage } from "@/lib/pokemon-display";
import { getTeamMonotypeSynergy } from "@/lib/team-monotype";
import { useGameStore } from "@/stores/game-store";
import { useEconomyStore } from "@/stores/economy-store";
import { cn } from "@/lib/utils";
import { MonotypeSynergyAura } from "@/components/battle/MonotypeSynergyFx";
import type { TeamMonotypeSynergy } from "@/lib/team-monotype";

interface TeamSelectionPreviewProps {
  maxTeam?: number;
  variant?: "bar" | "sidebar";
  className?: string;
}

function TeamPreviewSlot({
  pokemonId,
  slotIndex,
  compact,
  monotypeSynergy,
}: {
  pokemonId: number | null;
  slotIndex: number;
  compact?: boolean;
  monotypeSynergy: TeamMonotypeSynergy;
}) {
  const collection = useGameStore((s) => s.collection);
  const pokemonBattleXp = useEconomyStore((s) => s.pokemonBattleXp);
  const removeFromTeamAtSlot = useEconomyStore((s) => s.removeFromTeamAtSlot);

  if (pokemonId == null) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center rounded-xl border border-dashed text-center",
          BATTLE_CLASSIC_THEME
            ? "border-indigo-400/25 bg-indigo-500/5 text-indigo-300/40"
            : "border-white/15 bg-white/[0.02] text-white/30",
          compact ? "min-h-[88px] p-2" : "min-h-[112px] p-3 flex-1"
        )}
      >
        <span className="text-[10px] font-bold uppercase tracking-wider">Slot {slotIndex + 1}</span>
        <span className="text-[9px] mt-1">Vazio</span>
      </div>
    );
  }

  const pokemon = POKEMON_MAP[pokemonId];
  if (!pokemon) return null;

  const entry = collection[pokemonId];
  const display = withDisplayImage(pokemon, entry);
  const config = RARITY_CONFIG[pokemon.rarity];
  const level = pokemonBattleXp[String(pokemonId)]?.level ?? 1;

  return (
    <MonotypeSynergyAura
      active={monotypeSynergy.active}
      type={monotypeSynergy.type}
      className={compact ? "min-h-[88px]" : "flex-1 min-h-[112px]"}
    >
      <button
        onClick={() => removeFromTeamAtSlot(slotIndex)}
        className={cn(
          "relative flex flex-col items-center rounded-xl border text-center transition-all h-full w-full overflow-hidden",
          BATTLE_CLASSIC_THEME ? "battle-prep-card battle-prep-card-selected battle-classic-card-active" : "bg-white/[0.04] border-2",
          compact ? "p-2 min-h-[88px]" : "p-3 min-h-[112px]",
          "hover:scale-[0.98] active:scale-95 cursor-pointer"
        )}
        style={{
          borderColor: config.color,
          backgroundColor: `${config.color}${BATTLE_CLASSIC_THEME ? "22" : "18"}`,
          boxShadow: monotypeSynergy.active ? undefined : `0 0 12px ${config.glowColor}`,
        }}
      >
      <span
        className={cn(
          "absolute top-1.5 left-1.5 text-[8px] font-black rounded-md px-1 py-0.5 leading-none z-10",
          BATTLE_CLASSIC_THEME
            ? "bg-indigo-500/35 text-indigo-100 border border-indigo-400/45"
            : "bg-indigo-500/80 text-white"
        )}
      >
        Nv.{level}
      </span>
      <Image
        src={display.image}
        alt={pokemon.name}
        width={compact ? 48 : 56}
        height={compact ? 48 : 56}
        className="object-contain mt-1 drop-shadow-lg"
        unoptimized
      />
      <p
        className={cn("font-bold truncate w-full mt-1", compact ? "text-[10px]" : "text-xs")}
        style={{ color: config.color }}
      >
        {pokemon.name}
      </p>
      </button>
    </MonotypeSynergyAura>
  );
}

export function TeamSelectionPreview({
  maxTeam = 3,
  variant = "bar",
  className,
}: TeamSelectionPreviewProps) {
  const team = useEconomyStore((s) => s.team);
  const slots = Array.from({ length: maxTeam }, (_, i) => team[i] ?? null);
  const monotypeSynergy = useMemo(() => getTeamMonotypeSynergy(team), [team]);

  if (variant === "bar") {
    return (
      <div className={cn("shrink-0", className)}>
        <p
          className={cn(
            "text-[10px] font-bold uppercase tracking-wider mb-2",
            BATTLE_CLASSIC_THEME ? "text-cyan-300/80" : "text-cyan-400/80"
          )}
        >
          Time selecionado ({team.length}/{maxTeam})
        </p>
        <div className="grid grid-cols-3 gap-2">
          {slots.map((id, i) => (
            <TeamPreviewSlot
              key={i}
              pokemonId={id}
              slotIndex={i}
              compact
              monotypeSynergy={id != null ? monotypeSynergy : { active: false, type: null, label: "", bonusPercent: 0 }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <aside
      className={cn(
        "flex flex-col min-h-0",
        BATTLE_CLASSIC_THEME && "battle-classic-arena p-3 sm:p-4",
        !BATTLE_CLASSIC_THEME && "glass-card p-3 rounded-2xl",
        className
      )}
    >
      <div className="flex items-center gap-2 mb-3 shrink-0">
        {BATTLE_CLASSIC_THEME ? (
          <span className="battle-classic-section-label battle-classic-player-label mb-0 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" />
            Seu time
          </span>
        ) : (
          <h4 className="text-sm font-bold flex items-center gap-2 text-cyan-400">
            <Users className="w-4 h-4" />
            Seu time
          </h4>
        )}
        <span className="text-[10px] text-white/45 ml-auto tabular-nums">
          {team.length}/{maxTeam}
        </span>
      </div>

      <div className="flex flex-col gap-2 flex-1 min-h-0">
        {slots.map((id, i) => (
          <TeamPreviewSlot
            key={i}
            pokemonId={id}
            slotIndex={i}
            monotypeSynergy={id != null ? monotypeSynergy : { active: false, type: null, label: "", bonusPercent: 0 }}
          />
        ))}
      </div>

      {team.length < maxTeam && (
        <p className="text-[10px] text-white/40 text-center mt-2 shrink-0 leading-relaxed">
          Escolha {maxTeam - team.length} Pokémon no grid ao lado
        </p>
      )}
    </aside>
  );
}
