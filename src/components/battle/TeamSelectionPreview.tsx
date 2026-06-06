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

type SlotLayout = "bar" | "sidebar";

function TeamPreviewSlot({
  pokemonId,
  slotIndex,
  layout,
  monotypeSynergy,
}: {
  pokemonId: number | null;
  slotIndex: number;
  layout: SlotLayout;
  monotypeSynergy: TeamMonotypeSynergy;
}) {
  const collection = useGameStore((s) => s.collection);
  const pokemonBattleXp = useEconomyStore((s) => s.pokemonBattleXp);
  const removeFromTeamAtSlot = useEconomyStore((s) => s.removeFromTeamAtSlot);

  const isSidebar = layout === "sidebar";

  if (pokemonId == null) {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-lg border border-dashed w-full",
          BATTLE_CLASSIC_THEME
            ? "border-indigo-400/25 bg-indigo-500/5 text-indigo-300/40"
            : "border-white/15 bg-white/[0.02] text-white/30",
          isSidebar ? "h-11 px-2" : "min-h-[4.5rem] p-2 flex-1 flex-col text-center"
        )}
      >
        {isSidebar ? (
          <div className="flex items-center gap-2 w-full min-w-0">
            <div className="w-8 h-8 rounded-md border border-dashed border-white/15 shrink-0" />
            <div className="text-left min-w-0 flex-1">
              <p className="text-[9px] font-bold uppercase tracking-wider text-white/30 truncate">
                Slot {slotIndex + 1}
              </p>
              <p className="text-[9px] text-white/25">Vazio</p>
            </div>
          </div>
        ) : (
          <>
            <span className="text-[9px] font-bold uppercase tracking-wider">Slot {slotIndex + 1}</span>
            <span className="text-[8px] mt-0.5">Vazio</span>
          </>
        )}
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
      className="w-full h-full min-h-0"
    >
      <button
        type="button"
        onClick={() => removeFromTeamAtSlot(slotIndex)}
        title={`Remover ${pokemon.name} do time`}
        className={cn(
          "relative flex rounded-lg border transition-all h-full w-full overflow-hidden",
          isSidebar
            ? "flex-row items-center gap-2 px-2 py-1 min-h-0"
            : "flex-col items-center text-center p-2 min-h-[4.5rem]",
          BATTLE_CLASSIC_THEME
            ? "battle-classic-card-active bg-indigo-950/40"
            : "bg-white/[0.04] border-2",
          "hover:brightness-110 active:scale-[0.98] cursor-pointer"
        )}
        style={{
          borderColor: config.color,
          backgroundColor: `${config.color}${BATTLE_CLASSIC_THEME ? "18" : "14"}`,
          boxShadow: monotypeSynergy.active ? undefined : `0 0 8px ${config.glowColor}`,
        }}
      >
        <div
          className={cn(
            "relative shrink-0 flex items-center justify-center",
            isSidebar ? "w-8 h-8" : "w-full mt-0.5"
          )}
        >
          <Image
            src={display.image}
            alt={pokemon.name}
            width={isSidebar ? 32 : 40}
            height={isSidebar ? 32 : 40}
            className="object-contain drop-shadow-md"
            unoptimized
          />
          <span
            className={cn(
              "absolute -top-0.5 -right-0.5 text-[7px] font-black rounded px-0.5 leading-none z-10",
              BATTLE_CLASSIC_THEME
                ? "bg-indigo-500/50 text-indigo-100 border border-indigo-400/40"
                : "bg-indigo-500/80 text-white"
            )}
          >
            {level}
          </span>
        </div>
        <p
          className={cn(
            "font-bold truncate min-w-0 leading-tight",
            isSidebar ? "text-[10px] flex-1 text-left" : "text-[10px] w-full mt-0.5 text-center"
          )}
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
            "text-[10px] font-bold uppercase tracking-wider mb-1.5",
            BATTLE_CLASSIC_THEME ? "text-cyan-300/80" : "text-cyan-400/80"
          )}
        >
          Time selecionado ({team.length}/{maxTeam})
        </p>
        <div className="grid grid-cols-3 gap-1.5">
          {slots.map((id, i) => (
            <TeamPreviewSlot
              key={i}
              pokemonId={id}
              slotIndex={i}
              layout="bar"
              monotypeSynergy={
                id != null
                  ? monotypeSynergy
                  : { active: false, type: null, label: "", bonusPercent: 0 }
              }
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <aside
      className={cn(
        "flex flex-col shrink-0 min-h-0 h-full",
        BATTLE_CLASSIC_THEME && "battle-classic-arena p-2.5",
        !BATTLE_CLASSIC_THEME && "glass-card p-2.5 rounded-2xl",
        className
      )}
    >
      <div className="flex items-center gap-2 mb-2 shrink-0">
        {BATTLE_CLASSIC_THEME ? (
          <span className="battle-classic-section-label battle-classic-player-label mb-0 flex items-center gap-1.5 text-[11px]">
            <Users className="w-3 h-3" />
            Seu time
          </span>
        ) : (
          <h4 className="text-xs font-bold flex items-center gap-1.5 text-cyan-400">
            <Users className="w-3.5 h-3.5" />
            Seu time
          </h4>
        )}
        <span className="text-[9px] text-white/45 ml-auto tabular-nums">
          {team.length}/{maxTeam}
        </span>
      </div>

      <div className="grid grid-rows-3 gap-1.5 flex-1 min-h-0 auto-rows-fr">
        {slots.map((id, i) => (
          <TeamPreviewSlot
            key={i}
            pokemonId={id}
            slotIndex={i}
            layout="sidebar"
            monotypeSynergy={
              id != null
                ? monotypeSynergy
                : { active: false, type: null, label: "", bonusPercent: 0 }
            }
          />
        ))}
      </div>
    </aside>
  );
}
