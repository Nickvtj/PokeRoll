import { memo } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Check, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { RARITY_CONFIG } from "@/data/rarity";
import { BATTLE_CLASSIC_THEME } from "@/data/battle-theme";
import { MonotypeSynergyAura } from "@/components/battle/MonotypeSynergyFx";
import { PokemonGymBadges } from "@/components/gym/GymBadge";
import type { Pokemon } from "@/types";
import type { TeamMonotypeSynergy } from "@/lib/team-monotype";

interface PokemonSelectorItemProps {
  pokemonId: number;
  pokemonName: string;
  rarity: string;
  selected: boolean;
  countInTeam: number;
  owned: number;
  isFavorite: boolean;
  level: number;
  type: string;
  gymBadges: string[];
  displayImage: string;
  disabled: boolean;
  synergyActive: boolean;
  synergyType: string | null;
  onToggle: (id: number) => void;
  onToggleFavorite: (id: number) => void;
}

export const PokemonSelectorItem = memo(function PokemonSelectorItem({
  pokemonId,
  pokemonName,
  rarity,
  selected,
  countInTeam,
  owned,
  isFavorite,
  level,
  type,
  gymBadges,
  displayImage,
  disabled,
  synergyActive,
  synergyType,
  onToggle,
  onToggleFavorite,
}: PokemonSelectorItemProps) {
  const config = RARITY_CONFIG[rarity];
  const showMonotypeFx = selected && synergyActive;

  return (
    <div className="pokemon-selector-item-container" style={{ contentVisibility: 'auto' }}>
      <MonotypeSynergyAura active={showMonotypeFx} type={synergyType}>
        <motion.div
          role="button"
          tabIndex={disabled ? -1 : 0}
          whileTap={{ scale: disabled ? 1 : 0.98 }}
          onClick={() => !disabled && onToggle(pokemonId)}
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
                  boxShadow: showMonotypeFx ? undefined : `0 0 14px ${config.glowColor}`,
                }
              : undefined
          }
        >
          <button
            type="button"
            aria-label={isFavorite ? "Remover dos favoritos" : "Favoritar"}
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(pokemonId);
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
            src={displayImage}
            alt={pokemonName}
            width={48}
            height={48}
            className="object-contain mx-auto mt-2"
            unoptimized
          />
          <p
            className="text-[10px] font-semibold truncate mt-1"
            style={BATTLE_CLASSIC_THEME ? { color: config.color } : undefined}
          >
            {pokemonName}
          </p>
          <p className="text-[9px] text-white/40 capitalize">{type}</p>
          {gymBadges.length > 0 && (
            <div className="mt-1">
              <PokemonGymBadges gymIds={gymBadges} size="xs" max={3} />
            </div>
          )}
        </motion.div>
      </MonotypeSynergyAura>
    </div>
  );
});
