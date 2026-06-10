"use client";

import { useMemo } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Users, X } from "lucide-react";
import { POKEMON_MAP } from "@/data/pokemon";
import { BATTLE_CLASSIC_THEME } from "@/data/battle-theme";
import { RARITY_CONFIG } from "@/data/rarity";
import { withDisplayImage } from "@/lib/pokemon-display";
import { getTeamMonotypeSynergy } from "@/lib/team-monotype";
import { useGameStore } from "@/stores/game-store";
import { useEconomyStore } from "@/stores/economy-store";
import { isLocalAsset } from "@/lib/image-utils";
import { cn } from "@/lib/utils";
import { playUiDeselect } from "@/lib/ui-sounds";
import { shouldShowShiny } from "@/lib/pokemon-display";
import { MonotypeSynergyAura } from "@/components/battle/MonotypeSynergyFx";
import type { TeamMonotypeSynergy } from "@/lib/team-monotype";

interface TeamSelectionPreviewProps {
  maxTeam?: number;
  variant?: "floating";
  className?: string;
  action?: React.ReactNode;
}

function TeamChip({
  pokemonId,
  slotIndex,
  monotypeSynergy,
}: {
  pokemonId: number | null;
  slotIndex: number;
  monotypeSynergy: TeamMonotypeSynergy;
}) {
  const collection = useGameStore((s) => s.collection);
  const pokemonBattleXp = useEconomyStore((s) => s.pokemonBattleXp);
  const removeFromTeamAtSlot = useEconomyStore((s) => s.removeFromTeamAtSlot);

  if (pokemonId == null) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center rounded-xl border border-dashed w-[4.5rem] h-[4.75rem] shrink-0",
          BATTLE_CLASSIC_THEME
            ? "border-indigo-400/20 bg-indigo-500/5"
            : "border-white/15 bg-white/[0.02]"
        )}
      >
        <span className="text-[8px] font-bold uppercase text-white/25">Slot {slotIndex + 1}</span>
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
    <MonotypeSynergyAura active={monotypeSynergy.active} type={monotypeSynergy.type} className="shrink-0">
      <button
        type="button"
        onClick={() => {
          playUiDeselect();
          removeFromTeamAtSlot(slotIndex);
        }}
        title={`Remover ${pokemon.name}`}
        className={cn(
          "relative flex flex-col items-center rounded-xl border w-[4.5rem] h-[4.75rem] px-1 py-1.5 transition-all group",
          BATTLE_CLASSIC_THEME ? "bg-indigo-950/55" : "bg-white/[0.04]",
          "hover:brightness-110 active:scale-95 cursor-pointer",
          shouldShowShiny(entry) && "shiny-rainbow-border"
        )}
        style={
          shouldShowShiny(entry)
            ? undefined
            : {
                borderColor: config.color,
                boxShadow: `0 0 10px ${config.glowColor}`,
              }
        }
      >
        <span className="absolute top-1 left-1 text-[7px] font-black rounded px-0.5 bg-indigo-500/60 text-white leading-none">
          {level}
        </span>
        <span className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <X className="w-3 h-3 text-white/50" />
        </span>
        <Image
          src={display.image}
          alt={pokemon.name}
          width={36}
          height={36}
          className="object-contain drop-shadow-md mt-1"
          unoptimized={!isLocalAsset(display.image)}
        />
        <p className="text-[9px] font-bold truncate w-full text-center leading-tight mt-0.5" style={{ color: config.color }}>
          {pokemon.name}
        </p>
      </button>
    </MonotypeSynergyAura>
  );
}

export function TeamSelectionPreview({
  maxTeam = 3,
  variant = "floating",
  className,
  action,
}: TeamSelectionPreviewProps) {
  const team = useEconomyStore((s) => s.team);
  const slots = Array.from({ length: maxTeam }, (_, i) => team[i] ?? null);
  const monotypeSynergy = useMemo(() => getTeamMonotypeSynergy(team), [team]);
  const isFull = team.length >= maxTeam;
  const remaining = maxTeam - team.length;

  if (variant !== "floating") return null;

  return (
    <AnimatePresence>
      {team.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.96 }}
          transition={{ type: "spring", stiffness: 420, damping: 32 }}
          className={cn(
            "absolute bottom-3 right-3 sm:bottom-4 sm:right-4 z-30 w-[min(100%,18.5rem)]",
            className
          )}
        >
          <div
            className={cn(
              "rounded-2xl border shadow-2xl backdrop-blur-md overflow-hidden",
              BATTLE_CLASSIC_THEME
                ? "battle-classic-arena border-indigo-400/30 bg-slate-950/90"
                : "glass-card border-white/15 bg-slate-950/88"
            )}
          >
            <div className="flex items-center gap-2 px-3 pt-3 pb-2">
              {BATTLE_CLASSIC_THEME ? (
                <span className="battle-classic-section-label battle-classic-player-label mb-0 flex items-center gap-1.5 text-[11px]">
                  <Users className="w-3.5 h-3.5" />
                  Seu time
                </span>
              ) : (
                <span className="text-xs font-bold flex items-center gap-1.5 text-cyan-400">
                  <Users className="w-3.5 h-3.5" />
                  Seu time
                </span>
              )}
              <span className="text-[10px] text-white/45 ml-auto tabular-nums font-bold">
                {team.length}/{maxTeam}
              </span>
            </div>

            {monotypeSynergy.active && (
              <p className="px-3 pb-2 text-[9px] font-bold text-emerald-300/90 -mt-1">
                {monotypeSynergy.label} (+{monotypeSynergy.bonusPercent}%)
              </p>
            )}

            <div className="flex items-center justify-center gap-2 px-3 pb-3">
              {slots.map((id, i) => (
                <TeamChip
                  key={i}
                  pokemonId={id}
                  slotIndex={i}
                  monotypeSynergy={
                    id != null
                      ? monotypeSynergy
                      : { active: false, type: null, label: "", bonusPercent: 0 }
                  }
                />
              ))}
            </div>

            <div className="px-3 pb-3 pt-0">
              {isFull && action ? (
                action
              ) : (
                <p className="text-center text-[10px] text-white/40 font-medium py-2 rounded-xl bg-white/[0.03] border border-white/5">
                  Selecione mais {remaining} Pokémon
                </p>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
