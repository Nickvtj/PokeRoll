"use client";

import { useMemo } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, Users, X } from "lucide-react";
import { POKEMON_MAP } from "@/data/pokemon";
import { getPokemonBattleStats } from "@/data/pokemon-stats";
import { BATTLE_CLASSIC_THEME, BATTLE_ROSTER_SIZE } from "@/data/battle-theme";
import { RARITY_CONFIG } from "@/data/rarity";
import { withGridImage, shouldShowShiny } from "@/lib/pokemon-display";
import { getTeamMonotypeSynergy, type MonotypeBoost } from "@/lib/team-monotype";
import { useGameStore } from "@/stores/game-store";
import { useEconomyStore } from "@/stores/economy-store";
import { isLocalAsset } from "@/lib/image-utils";
import { cn } from "@/lib/utils";
import { playUiDeselect } from "@/lib/ui-sounds";
import { MonotypeSynergyAura } from "@/components/battle/MonotypeSynergyFx";

interface TeamSelectionPreviewProps {
  maxTeam?: number;
  variant?: "floating" | "sidebar";
  className?: string;
  action?: React.ReactNode;
}

function TeamChip({
  pokemonId,
  slotIndex,
  compact,
  boosts,
}: {
  pokemonId: number | null;
  slotIndex: number;
  compact: boolean;
  boosts: MonotypeBoost[];
}) {
  const collection = useGameStore((s) => s.collection);
  const pokemonBattleXp = useEconomyStore((s) => s.pokemonBattleXp);
  const removeFromTeamAtSlot = useEconomyStore((s) => s.removeFromTeamAtSlot);

  if (pokemonId == null) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center rounded-xl border border-dashed shrink-0",
          compact ? "w-[4.5rem] h-[4.75rem]" : "w-[5.75rem] h-[5.5rem]",
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
  const display = withGridImage(pokemon, entry);
  const config = RARITY_CONFIG[pokemon.rarity];
  const level = pokemonBattleXp[String(pokemonId)]?.level ?? 1;
  const type = getPokemonBattleStats(pokemon).type;
  const boost = boosts.find((b) => b.type === type) ?? null;

  return (
    <MonotypeSynergyAura active={!!boost} type={boost?.type ?? null} className="shrink-0">
      <button
        type="button"
        onClick={() => {
          playUiDeselect();
          removeFromTeamAtSlot(slotIndex);
        }}
        title={`Remover ${pokemon.name}`}
        className={cn(
          "relative flex flex-col items-center justify-center rounded-xl border shrink-0 transition-all group",
          compact ? "w-[4.5rem] h-[4.75rem] px-1 py-1.5" : "w-[5.75rem] h-[5.5rem] px-1.5 py-1.5",
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
        {boost && (
          <span className="absolute top-1 right-4 text-[7px] font-black rounded px-0.5 bg-emerald-500/70 text-white leading-none">
            +{boost.bonusPercent}%
          </span>
        )}
        <span className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <X className="w-3 h-3 text-white/50" />
        </span>
        <Image
          src={display.image}
          alt={pokemon.name}
          width={compact ? 36 : 44}
          height={compact ? 36 : 44}
          className={cn("object-contain drop-shadow-md shrink-0", compact ? "w-9 h-9" : "w-11 h-11")}
          unoptimized={!isLocalAsset(display.image)}
        />
        <p
          className={cn(
            "font-bold truncate w-full text-center leading-tight shrink-0",
            compact ? "text-[9px] mt-0.5" : "text-[10px] mt-0.5"
          )}
          style={{ color: config.color }}
        >
          {pokemon.name}
        </p>
      </button>
    </MonotypeSynergyAura>
  );
}

/** Slot em formato de linha (imagem + info) para o painel vertical lateral */
function TeamSlotRow({
  pokemonId,
  slotIndex,
  boosts,
}: {
  pokemonId: number | null;
  slotIndex: number;
  boosts: MonotypeBoost[];
}) {
  const collection = useGameStore((s) => s.collection);
  const pokemonBattleXp = useEconomyStore((s) => s.pokemonBattleXp);
  const removeFromTeamAtSlot = useEconomyStore((s) => s.removeFromTeamAtSlot);

  if (pokemonId == null) {
    return (
      <div
        className={cn(
          "flex h-full items-center gap-3 rounded-xl border border-dashed px-3 py-2 min-h-[4rem]",
          BATTLE_CLASSIC_THEME
            ? "border-indigo-400/20 bg-indigo-500/5"
            : "border-white/12 bg-white/[0.02]"
        )}
      >
        <div className="w-11 h-11 rounded-lg border border-dashed border-white/15 flex items-center justify-center shrink-0">
          <span className="text-[10px] font-black text-white/25">{slotIndex + 1}</span>
        </div>
        <span className="text-[10px] font-semibold uppercase tracking-wide text-white/25">
          Slot vazio
        </span>
      </div>
    );
  }

  const pokemon = POKEMON_MAP[pokemonId];
  if (!pokemon) return null;

  const entry = collection[pokemonId];
  const display = withGridImage(pokemon, entry);
  const config = RARITY_CONFIG[pokemon.rarity];
  const level = pokemonBattleXp[String(pokemonId)]?.level ?? 1;
  const type = getPokemonBattleStats(pokemon).type;
  const boost = boosts.find((b) => b.type === type) ?? null;

  return (
    <MonotypeSynergyAura active={!!boost} type={boost?.type ?? null} className="h-full">
      <button
        type="button"
        onClick={() => {
          playUiDeselect();
          removeFromTeamAtSlot(slotIndex);
        }}
        title={`Remover ${pokemon.name}`}
        className={cn(
          "group flex h-full w-full items-center gap-3 rounded-xl border px-3 py-2 min-h-[4rem] transition-all",
          BATTLE_CLASSIC_THEME ? "bg-indigo-950/55" : "bg-white/[0.04]",
          "hover:brightness-110 active:scale-[0.98] cursor-pointer",
          shouldShowShiny(entry) && "shiny-rainbow-border"
        )}
        style={
          shouldShowShiny(entry)
            ? undefined
            : { borderColor: config.color, boxShadow: `0 0 8px ${config.glowColor}` }
        }
      >
        <div className="relative w-12 h-12 shrink-0">
          <Image
            src={display.image}
            alt={pokemon.name}
            fill
            sizes="48px"
            className="object-contain drop-shadow-md"
            unoptimized={!isLocalAsset(display.image)}
          />
        </div>
        <div className="min-w-0 flex-1 text-left">
          <p className="text-[13px] font-bold truncate" style={{ color: config.color }}>
            {pokemon.name}
          </p>
          <p className="text-[10px] text-white/45 capitalize truncate">
            Nv.{level}, {type}
            {boost && <span className="text-emerald-300/90 font-bold">, +{boost.bonusPercent}%</span>}
          </p>
        </div>
        <X className="w-4 h-4 text-white/30 group-hover:text-white/70 transition-colors shrink-0" />
      </button>
    </MonotypeSynergyAura>
  );
}

function SynergyPopups({ boosts }: { boosts: MonotypeBoost[] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      <AnimatePresence initial={false}>
        {boosts.map((b) => (
          <motion.span
            key={b.type}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{ type: "spring", stiffness: 380, damping: 26 }}
            className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wide rounded-md px-1.5 py-0.5 bg-emerald-500/20 border border-emerald-400/40 text-emerald-200"
          >
            <Sparkles className="w-2.5 h-2.5" />
            {b.label} +{b.bonusPercent}%
          </motion.span>
        ))}
      </AnimatePresence>
    </div>
  );
}

export function TeamSelectionPreview({
  maxTeam = BATTLE_ROSTER_SIZE,
  variant = "floating",
  className,
  action,
}: TeamSelectionPreviewProps) {
  const team = useEconomyStore((s) => s.team);
  const slots = Array.from({ length: maxTeam }, (_, i) => team[i] ?? null);
  const synergy = useMemo(() => getTeamMonotypeSynergy(team), [team]);
  const compact = maxTeam > 2;
  const canStart = team.length >= 2;
  const remaining = Math.max(0, 2 - team.length);

  // === Painel vertical fixo à direita (desktop) ===
  if (variant === "sidebar") {
    return (
      <div
        className={cn(
          "flex flex-col h-full rounded-2xl border overflow-hidden",
          BATTLE_CLASSIC_THEME
            ? "battle-classic-arena border-indigo-400/30 bg-slate-950/70"
            : "glass-card border-white/12 bg-slate-950/60",
          className
        )}
      >
        <div className="flex items-center gap-2 px-3 py-3 border-b border-white/10">
          <span className="text-xs font-bold flex items-center gap-1.5 text-cyan-300">
            <Users className="w-3.5 h-3.5" />
            Seu time
          </span>
          <span className="text-[10px] text-white/45 ml-auto tabular-nums font-bold">
            {team.length}/{maxTeam}
          </span>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-3 py-3 flex flex-col gap-2">
          <div className="flex-1 min-h-0 flex flex-col gap-2">
            {slots.map((id, i) => (
              <div key={i} className="flex-1 min-h-0">
                <TeamSlotRow pokemonId={id} slotIndex={i} boosts={synergy.boosts} />
              </div>
            ))}
          </div>

          {synergy.active && (
            <div className="shrink-0">
              <SynergyPopups boosts={synergy.boosts} />
            </div>
          )}
        </div>

        <div className="px-3 py-3 border-t border-white/10 space-y-1.5">
          {canStart && action ? (
            <div className="[&_button]:w-full [&_button]:text-sm [&_button]:py-2.5">{action}</div>
          ) : (
            <p className="text-center text-[10px] text-white/40 font-medium py-2 rounded-xl bg-white/[0.03] border border-white/5">
              Selecione mais {remaining} Pokémon
            </p>
          )}
          {canStart && team.length < maxTeam && (
            <p className="text-center text-[9px] text-white/35">
              Até {maxTeam} (2 lutam, {maxTeam - 2} de reserva)
            </p>
          )}
        </div>
      </div>
    );
  }

  // === Dock flutuante (mobile) ===
  return (
    <AnimatePresence>
      {team.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.96 }}
          transition={{ type: "spring", stiffness: 420, damping: 32 }}
          className={cn(
            "absolute bottom-3 right-3 left-3 sm:left-auto z-30",
            compact ? "sm:w-[min(100%,18.5rem)]" : "sm:w-[min(100%,15rem)]",
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
              <span className="text-xs font-bold flex items-center gap-1.5 text-cyan-400">
                <Users className="w-3.5 h-3.5" />
                Seu time
              </span>
              <span className="text-[10px] text-white/45 ml-auto tabular-nums font-bold">
                {team.length}/{maxTeam}
              </span>
            </div>

            {synergy.active && (
              <div className="px-3 pb-2 -mt-1">
                <SynergyPopups boosts={synergy.boosts} />
              </div>
            )}

            <div
              className={cn(
                "px-3 pb-2 justify-items-center",
                compact ? "grid grid-cols-2 gap-2" : "flex items-center justify-center gap-3"
              )}
            >
              {slots.map((id, i) => (
                <TeamChip
                  key={i}
                  pokemonId={id}
                  slotIndex={i}
                  compact={compact}
                  boosts={synergy.boosts}
                />
              ))}
            </div>

            <div className="px-3 pb-3 pt-0 space-y-1.5">
              {canStart && action ? (
                <div className="[&_button]:w-full [&_button]:text-sm [&_button]:py-2.5">{action}</div>
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
