"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  BattleSleepOverlay,
  BattleStatusBadge,
} from "@/components/battle/BattleAttackFx";
import { playBattleStrike, playBattleHit } from "@/lib/battle-hit-sounds";
import { getPokemonGbaSpriteUrl } from "@/data/pokemon-sprites";
import {
  getActorBestOpportunity,
  getBestMoveMatchup,
  type TypeMatchupHint,
} from "@/lib/battle-matchup";
import { TEAM_SIZE } from "@/lib/tactical-battle-engine";
import { useGameStore } from "@/stores/game-store";
import { shouldShowShiny } from "@/lib/pokemon-display";
import type { BattleCombatHighlight } from "@/hooks/use-tactical-battle";
import type { BattleFighter, BattleState } from "@/types/battle";

interface ClassicBattleSceneProps {
  state: BattleState;
  combatHighlight?: BattleCombatHighlight | null;
  autoBattle?: boolean;
  onPickActor?: (slot: number) => void;
  onPickTarget?: (slot: number) => void;
}

type Side = "player" | "enemy";

/** Cor do brilho no impacto, por tipo do golpe (sem halo quadrado — só no sprite) */
const TYPE_FLASH_COLORS: Record<string, string> = {
  fire: "#fb923c",
  water: "#38bdf8",
  grass: "#4ade80",
  electric: "#facc15",
  ice: "#67e2f9",
  fighting: "#f87171",
  poison: "#c084fc",
  ground: "#d97706",
  flying: "#818cf8",
  psychic: "#f472b6",
  bug: "#a3e635",
  rock: "#a8a29e",
  ghost: "#a78bfa",
  dragon: "#6366f1",
  dark: "#475569",
  steel: "#94a3b8",
  fairy: "#f472b6",
  normal: "#e2e8f0",
};

interface FighterView {
  fighter: BattleFighter;
  slot: number;
  flatIdx: number;
  isKo: boolean;
  isStriking: boolean;
  isFlashing: boolean;
  attackPhase?: "strike" | "flash" | "impact";
  moveType?: string;
  statusApplied?: string;
  selectable: boolean;
  isSelectedActor: boolean;
  isSelectedTarget: boolean;
  matchup: TypeMatchupHint | null;
  isShiny: boolean;
}

/** Sprite GBA local (public/sprites/gba) */
function GbaSprite({
  pokemonId,
  name,
  side,
  shiny,
  className,
}: {
  pokemonId: number;
  name: string;
  side: Side;
  shiny: boolean;
  className?: string;
}) {
  const back = side === "player";

  return (
    <img
      src={getPokemonGbaSpriteUrl(pokemonId, { back, shiny })}
      alt={name}
      draggable={false}
      className={cn("battle-scene-sprite object-contain select-none", className)}
    />
  );
}

function hpFillColor(pct: number): string {
  if (pct > 50) return "var(--gba-hp-high)";
  if (pct > 25) return "var(--gba-hp-mid)";
  return "var(--gba-hp-low)";
}

function ClassicStatusBox({
  view,
  onSelect,
}: {
  view: FighterView;
  onSelect?: () => void;
}) {
  const { fighter, isKo, selectable, isSelectedActor, isSelectedTarget, matchup } = view;
  const hpPercent = Math.max(0, (fighter.currentHp / fighter.maxHp) * 100);
  const clickable = selectable && !isKo && onSelect;

  return (
    <button
      type="button"
      onClick={clickable ? onSelect : undefined}
      tabIndex={clickable ? 0 : -1}
      className={cn(
        "battle-scene-box",
        isKo && "battle-scene-box-ko",
        clickable && "battle-scene-box-selectable",
        isSelectedActor && "battle-scene-box-selected",
        isSelectedTarget && "battle-scene-box-selected battle-scene-box-target",
        !clickable && "cursor-default"
      )}
    >
      <div className="battle-scene-box-name-row">
        <span className="truncate">{fighter.pokemon.name}</span>
        {fighter.battleLevel != null && fighter.battleLevel > 0 && (
          <span className="battle-scene-box-level">Lv{fighter.battleLevel}</span>
        )}
      </div>
      <div className="battle-scene-hp-row">
        <span className="battle-scene-hp-tag">HP</span>
        <div className="battle-scene-hp-track">
          <div
            className="battle-scene-hp-fill"
            style={{ width: `${hpPercent}%`, background: hpFillColor(hpPercent) }}
          />
        </div>
        {matchup && matchup.kind !== "normal" && !isKo && (
          <span
            className={cn(
              "battle-scene-matchup",
              matchup.kind === "super"
                ? "battle-scene-matchup-super"
                : matchup.kind === "weak"
                  ? "battle-scene-matchup-weak"
                  : "battle-scene-matchup-immune"
            )}
          >
            {matchup.label}
          </span>
        )}
        {fighter.status && !isKo && (
          <span className="relative z-10 scale-90 origin-right">
            <BattleStatusBadge effect={fighter.status.effect} />
          </span>
        )}
      </div>
      <div className="battle-scene-hp-numbers">
        {Math.max(0, fighter.currentHp)}/{fighter.maxHp}
      </div>
    </button>
  );
}

function ClassicFighterSprite({
  view,
  side,
  onSelect,
}: {
  view: FighterView;
  side: Side;
  onSelect?: () => void;
}) {
  const {
    fighter,
    isKo,
    isStriking,
    isFlashing,
    moveType,
    statusApplied,
    selectable,
    isSelectedActor,
    isSelectedTarget,
    isShiny,
  } = view;

  const isSleeping = fighter.status?.effect === "sleep" && !isKo;
  const clickable = selectable && !isKo && onSelect;

  // Direção do "avanço" no ataque: jogador (embaixo/esq.) avança p/ cima-direita;
  // inimigo (topo/dir.) avança p/ baixo-esquerda — como nos jogos de GBA.
  const lungeX = side === "player" ? [0, 26, 0] : [0, -26, 0];
  const lungeY = side === "player" ? [0, -18, 0] : [0, 18, 0];

  // Brilho colorido do impacto aplicado direto no sprite (sem halo quadrado)
  const flashColor = TYPE_FLASH_COLORS[moveType ?? "normal"] ?? TYPE_FLASH_COLORS.normal;

  return (
    <motion.div
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
      onClick={clickable ? onSelect : undefined}
      onKeyDown={
        clickable
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelect?.();
              }
            }
          : undefined
      }
      key={isFlashing ? `flash-${moveType}` : isStriking ? "strike" : "idle"}
      animate={
        isKo
          ? { opacity: 0.35, y: 6, x: 0, filter: "grayscale(1) brightness(0.9)" }
          : isStriking
            ? {
                x: lungeX,
                y: lungeY,
                filter: ["brightness(1)", "brightness(1.35)", "brightness(1)"],
              }
            : isFlashing
              ? {
                  x: [0, -6, 6, -4, 4, 0],
                  // piscada clássica de dano dos jogos GBA + brilho da cor do golpe
                  opacity: [1, 0.15, 1, 0.15, 1],
                  filter: [
                    `drop-shadow(0 0 0px ${flashColor})`,
                    `drop-shadow(0 0 10px ${flashColor})`,
                    `drop-shadow(0 0 3px ${flashColor})`,
                    `drop-shadow(0 0 8px ${flashColor})`,
                    `drop-shadow(0 0 0px ${flashColor})`,
                  ],
                }
              : { opacity: 1, x: 0, y: 0, filter: "grayscale(0) brightness(1)" }
      }
      transition={
        isFlashing
          ? { duration: 0.4, ease: "linear" }
          : isStriking
            ? { duration: 0.3, ease: "backOut" }
            : { duration: 0.2 }
      }
      className={cn(
        "battle-scene-slot",
        isStriking && "z-30",
        clickable && "cursor-pointer"
      )}
    >
      <div className="battle-scene-platform" aria-hidden />

      <div
        className={cn(
          "relative flex items-end justify-center",
          side === "player" ? "w-[90%] max-w-[9rem]" : "w-[82%] max-w-[7.5rem]",
          "aspect-square"
        )}
      >
        {(clickable || isSelectedActor || isSelectedTarget) && !isKo && (
          <span
            className={cn(
              "battle-scene-arrow",
              (isSelectedActor || isSelectedTarget) && "battle-scene-arrow-locked"
            )}
            aria-hidden
          >
            ▼
          </span>
        )}
        {statusApplied === "sleep" && isFlashing && (
          <span className="absolute -top-2 left-1/2 -translate-x-1/2 z-30 font-black text-indigo-200 drop-shadow-md">
            Zzz
          </span>
        )}
        {isSleeping && <BattleSleepOverlay />}
        <GbaSprite
          pokemonId={fighter.pokemon.id}
          name={fighter.pokemon.name}
          side={side}
          shiny={isShiny}
          className={cn(
            "w-full h-full relative z-[2]",
            isSleeping && "opacity-60 saturate-50"
          )}
        />
      </div>
    </motion.div>
  );
}

export function ClassicBattleScene({
  state,
  combatHighlight = null,
  autoBattle = false,
  onPickActor,
  onPickTarget,
}: ClassicBattleSceneProps) {
  const collection = useGameStore((s) => s.collection);
  const tactical = state.tacticalMode && state.phase === "fighting";
  const phase = state.tacticalPhase;
  const pending = state.pendingSelection ?? {};

  // Sons estilo Game Boy sincronizados com as fases do golpe
  useEffect(() => {
    if (!combatHighlight) return;
    if (combatHighlight.phase === "strike") {
      void playBattleStrike();
    } else if (combatHighlight.phase === "impact") {
      void playBattleHit({
        attackType: combatHighlight.moveType || "normal",
        isCrit: false,
        effectiveness: "normal",
      });
    }
  }, [combatHighlight, combatHighlight?.phase]);

  const selectedActor =
    pending.actorSlot != null
      ? state.playerTeam.find((f) => f.slotIndex === pending.actorSlot)
      : null;

  const buildView = (fighter: BattleFighter, i: number, side: Side): FighterView => {
    const slot = fighter.slotIndex ?? i;
    const flatIdx = side === "enemy" ? TEAM_SIZE + slot : slot;
    const isKo = fighter.currentHp <= 0;
    const isStriker = combatHighlight?.strikerFlat === flatIdx;
    const isVictim = combatHighlight?.victimFlat === flatIdx;
    const isStriking = !isKo && isStriker && combatHighlight?.phase === "strike";
    const isFlashing =
      !isKo &&
      isVictim &&
      (combatHighlight?.phase === "flash" || combatHighlight?.phase === "impact");

    let selectable = false;
    let isSelectedActor = false;
    let isSelectedTarget = false;
    let matchup: TypeMatchupHint | null = null;

    if (tactical && !autoBattle && !isKo) {
      if (side === "player") {
        selectable =
          (phase === "player-pick-actor" && fighter.status?.effect !== "sleep") ||
          ((phase === "player-pick-target" || phase === "player-pick-move") &&
            pending.actorSlot === slot);
        isSelectedActor =
          (phase === "player-pick-target" || phase === "player-pick-move") &&
          pending.actorSlot === slot;
        if (phase === "player-pick-actor") {
          matchup = getActorBestOpportunity(fighter, state.enemyTeam);
        }
      } else {
        selectable =
          phase === "player-pick-target" ||
          (phase === "player-pick-move" && pending.targetSlot === slot);
        isSelectedTarget =
          (phase === "player-pick-target" || phase === "player-pick-move") &&
          pending.targetSlot === slot;
        if (
          selectedActor &&
          (phase === "player-pick-target" || phase === "player-pick-move")
        ) {
          matchup = getBestMoveMatchup(selectedActor, fighter);
        }
      }
    }

    return {
      fighter,
      slot,
      flatIdx,
      isKo,
      isStriking,
      isFlashing,
      attackPhase: isVictim || isStriker ? combatHighlight?.phase : undefined,
      moveType: isVictim || isStriker ? combatHighlight?.moveType : undefined,
      statusApplied: isVictim ? combatHighlight?.statusApplied : undefined,
      selectable,
      isSelectedActor,
      isSelectedTarget,
      matchup,
      isShiny:
        side === "player" && shouldShowShiny(collection[fighter.pokemon.id]),
    };
  };

  const enemyViews = state.enemyTeam.map((f, i) => buildView(f, i, "enemy"));
  const playerViews = state.playerTeam.map((f, i) => buildView(f, i, "player"));

  return (
    <div className="battle-scene">
      {/* Caixas de status inimigas — canto superior esquerdo (estilo FRLG) */}
      <div className="battle-scene-enemy-boxes">
        {enemyViews.map((view) => (
          <ClassicStatusBox
            key={`ebox-${view.fighter.pokemon.id}-${view.slot}`}
            view={view}
            onSelect={() => onPickTarget?.(view.slot)}
          />
        ))}
      </div>

      {/* Sprites inimigos — campo superior direito */}
      <div className="battle-scene-enemy-field">
        {enemyViews.map((view) => (
          <ClassicFighterSprite
            key={`espr-${view.fighter.pokemon.id}-${view.slot}`}
            view={view}
            side="enemy"
            onSelect={() => onPickTarget?.(view.slot)}
          />
        ))}
      </div>

      {/* Sprites do jogador (de costas) — campo inferior esquerdo */}
      <div className="battle-scene-player-field">
        {playerViews.map((view) => (
          <ClassicFighterSprite
            key={`pspr-${view.fighter.pokemon.id}-${view.slot}`}
            view={view}
            side="player"
            onSelect={() => onPickActor?.(view.slot)}
          />
        ))}
      </div>

      {/* Caixas de status do jogador — canto inferior direito */}
      <div className="battle-scene-player-boxes">
        {playerViews.map((view) => (
          <ClassicStatusBox
            key={`pbox-${view.fighter.pokemon.id}-${view.slot}`}
            view={view}
            onSelect={() => onPickActor?.(view.slot)}
          />
        ))}
      </div>
    </div>
  );
}
