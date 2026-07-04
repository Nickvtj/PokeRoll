"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
import { playUiSelect, playUiConfirm } from "@/lib/ui-sounds";
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
      className={cn(
        "battle-scene-sprite select-none",
        back ? "battle-scene-sprite-back" : "battle-scene-sprite-front",
        className
      )}
    />
  );
}

function hpFillColor(pct: number): string {
  if (pct > 50) return "var(--gba-hp-high)";
  if (pct > 25) return "var(--gba-hp-mid)";
  return "var(--gba-hp-low)";
}

function genderSymbol(id: number): { char: string; className: string } | null {
  // Cosmético estilo GBA — determinístico por id (jogo não rastreia gênero)
  const genderless = new Set([81, 82, 100, 101, 120, 121, 132, 137, 144, 145, 146, 150, 151]);
  if (genderless.has(id)) return null;
  return id % 2 === 0
    ? { char: "♂", className: "battle-scene-gender-male" }
    : { char: "♀", className: "battle-scene-gender-female" };
}

function ClassicStatusBox({
  view,
  onSelect,
}: {
  view: FighterView;
  onSelect?: () => void;
}) {
  const { fighter, isKo, selectable, isSelectedActor, isSelectedTarget } = view;
  const hpPercent = Math.max(0, (fighter.currentHp / fighter.maxHp) * 100);
  const clickable = selectable && !isKo && onSelect;
  const gender = genderSymbol(fighter.pokemon.id);

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
        <span className="flex items-center gap-1 min-w-0">
          <span className="truncate">{fighter.pokemon.name}</span>
          {gender && <span className={gender.className}>{gender.char}</span>}
        </span>
        <span className="flex items-center gap-1.5 shrink-0">
          {fighter.status && !isKo && (
            <BattleStatusBadge effect={fighter.status.effect} compact />
          )}
          {fighter.battleLevel != null && fighter.battleLevel > 0 && (
            <span className="battle-scene-box-level">Lv{fighter.battleLevel}</span>
          )}
        </span>
      </div>
      <div className="battle-scene-hp-row">
        <span className="battle-scene-hp-tag">HP</span>
        <div className="battle-scene-hp-track">
          <div
            className="battle-scene-hp-fill"
            style={{ width: `${hpPercent}%`, background: hpFillColor(hpPercent) }}
          />
        </div>
      </div>
    </button>
  );
}

function PokeballRelease({ delay }: { delay: number }) {
  return (
    <>
      <motion.span
        className="battle-pokeball"
        aria-hidden
        initial={{ y: -100, opacity: 0, rotate: -35 }}
        animate={{
          y: [-100, 0, -18, 0],
          opacity: [0, 1, 1, 1],
          rotate: [-35, 12, 6, 10],
        }}
        transition={{ delay, duration: 0.52, ease: "easeIn", times: [0, 0.58, 0.8, 1] }}
      />
      <motion.span
        className="battle-pokeball-flash"
        aria-hidden
        initial={{ opacity: 0, scale: 0.2 }}
        animate={{ opacity: [0, 0, 0.95, 0], scale: [0.2, 0.2, 2.2, 3] }}
        transition={{ delay: delay + 0.44, duration: 0.38, ease: "easeOut" }}
      />
    </>
  );
}

function ClassicFighterSprite({
  view,
  side,
  introGen,
  onSelect,
}: {
  view: FighterView;
  side: Side;
  introGen: number;
  onSelect?: () => void;
}) {
  const {
    fighter,
    slot,
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

  const introDelay = (side === "enemy" ? 0 : 0.12) + slot * 0.16;
  const runIntro = introGen > 0;
  const [introDone, setIntroDone] = useState(!runIntro);

  useEffect(() => {
    if (!runIntro) {
      setIntroDone(true);
      return;
    }
    setIntroDone(false);
    const t = setTimeout(() => setIntroDone(true), (introDelay + 0.65) * 1000);
    return () => clearTimeout(t);
  }, [introGen, introDelay, runIntro]);

  const showBall = runIntro && !introDone;
  const showSprite = !runIntro || introDone;

  const lungeX = side === "player" ? [0, 26, 0] : [0, -26, 0];
  const lungeY = side === "player" ? [0, -18, 0] : [0, 18, 0];
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
        clickable && "cursor-pointer",
        isSelectedActor && "battle-scene-slot-actor",
        isSelectedTarget && "battle-scene-slot-target",
        selectable && !isKo && !isSelectedActor && !isSelectedTarget && "battle-scene-slot-hover"
      )}
    >
      <div className="battle-scene-platform" aria-hidden />

      <AnimatePresence>
        {showBall && <PokeballRelease key={`ball-${introGen}-${slot}`} delay={introDelay} />}
      </AnimatePresence>

      <div
        className={cn(
          "relative items-end justify-center",
          side === "player"
            ? "battle-scene-sprite-wrap-back"
            : "battle-scene-sprite-wrap-front",
          !isKo && showSprite && clickable && !isSelectedActor && !isSelectedTarget && "battle-scene-clickable",
          !isKo && showSprite && isSelectedActor && "battle-scene-picked-actor",
          !isKo && showSprite && isSelectedTarget && "battle-scene-picked-target"
        )}
      >
        {statusApplied === "sleep" && isFlashing && (
          <span className="absolute -top-2 left-1/2 -translate-x-1/2 z-30 font-black text-indigo-200 drop-shadow-md">
            Zzz
          </span>
        )}
        {isSleeping && showSprite && <BattleSleepOverlay />}

        <AnimatePresence>
          {showSprite && (
            <motion.span
              key={`sprite-${introGen}-${slot}`}
              className="inline-flex items-end justify-center"
              style={{ transformOrigin: "bottom center" }}
              initial={runIntro ? { opacity: 0, scale: 0.2, filter: "brightness(3)" } : false}
              animate={{ opacity: 1, scale: 1, filter: "brightness(1)" }}
              transition={{ duration: 0.28, ease: "backOut" }}
            >
              <GbaSprite
                pokemonId={fighter.pokemon.id}
                name={fighter.pokemon.name}
                side={side}
                shiny={isShiny}
                className={cn(isSleeping && "opacity-60 saturate-50")}
              />
            </motion.span>
          )}
        </AnimatePresence>
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

  const [introGen, setIntroGen] = useState(0);
  const prevPhaseRef = useRef(state.phase);
  useEffect(() => {
    if (prevPhaseRef.current !== "fighting" && state.phase === "fighting") {
      setIntroGen((g) => g + 1);
    }
    prevPhaseRef.current = state.phase;
  }, [state.phase]);

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

  const handlePickActor = (slot: number) => {
    playUiSelect();
    onPickActor?.(slot);
  };

  const handlePickTarget = (slot: number) => {
    playUiConfirm();
    onPickTarget?.(slot);
  };

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

  const gymAccent = state.gymMeta?.themeColor;

  return (
    <div
      className={cn("battle-scene", gymAccent && "battle-scene-gym")}
      style={gymAccent ? ({ "--gym-accent": gymAccent } as React.CSSProperties) : undefined}
    >
      {/* Caixas de status inimigas — canto superior esquerdo (estilo FRLG) */}
      <div className="battle-scene-enemy-boxes">
        {enemyViews.map((view) => (
          <ClassicStatusBox
            key={`ebox-${view.fighter.pokemon.id}-${view.slot}`}
            view={view}
            onSelect={() => handlePickTarget(view.slot)}
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
            introGen={introGen}
            onSelect={() => handlePickTarget(view.slot)}
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
            introGen={introGen}
            onSelect={() => handlePickActor(view.slot)}
          />
        ))}
      </div>

      {/* Caixas de status do jogador — canto inferior direito */}
      <div className="battle-scene-player-boxes">
        {playerViews.map((view) => (
          <ClassicStatusBox
            key={`pbox-${view.fighter.pokemon.id}-${view.slot}`}
            view={view}
            onSelect={() => handlePickActor(view.slot)}
          />
        ))}
      </div>
    </div>
  );
}
