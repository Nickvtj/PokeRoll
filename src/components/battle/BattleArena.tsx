"use client";

import { useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Swords, Target, Pointer } from "lucide-react";
import { PokemonBattleCard, type BattleSelectionMode } from "@/components/battle/PokemonBattleCard";
import { BattleActionPanel } from "@/components/battle/BattleActionPanel";
import { BattleTurnBanner, battleSectionClass } from "@/components/battle/BattleTurnBanner";
import { BattleResultModal } from "@/components/battle/BattleResultModal";
import { BattleCoinFlipOverlay } from "@/components/battle/BattleCoinFlipOverlay";
import { BattleFaceOffOverlay } from "@/components/battle/BattleFaceOffOverlay";
import { BattleTrainerChip } from "@/components/battle/BattleTrainerChip";
import { FloatingAutoBattleToggle, type BattleSpeed } from "@/components/battle/FloatingAutoBattleToggle";
import {
  getPlayerTrainerPortrait,
  rollTrainingOpponent,
} from "@/data/battle-trainers";
import { useGameStore } from "@/stores/game-store";
import { useEconomyStore } from "@/stores/economy-store";
import { PokeballIcon } from "@/components/ui/PokeballIcon";
import { BATTLE_CLASSIC_THEME } from "@/data/battle-theme";
import type { BattleCombatHighlight } from "@/hooks/use-tactical-battle";
import type { BattleTurnHighlight } from "@/components/battle/PokemonBattleCard";
import type { BattleState } from "@/types/battle";
import { getActorBestOpportunity, getBestMoveMatchup } from "@/lib/battle-matchup";
import type { TypeMatchupHint } from "@/lib/battle-matchup";
import { cn } from "@/lib/utils";

interface BattleArenaProps {
  state: BattleState | null;
  combatHighlight?: BattleCombatHighlight | null;
  onContinue?: () => void;
  onPlayAgain?: () => void;
  continueLabel?: string;
  bonuses?: { battleDamage: number; critChance: number; defenseBoost?: number };
  onPickActor?: (slot: number) => void;
  onPickTarget?: (slot: number) => void;
  onPickMove?: (index: number) => void;
  onCancelSelection?: () => void;
  autoBattle?: boolean;
  onToggleAutoBattle?: () => void;
  battleSpeed?: BattleSpeed;
  onBattleSpeedChange?: (speed: BattleSpeed) => void;
}

export function BattleArena({
  state,
  combatHighlight = null,
  onContinue,
  onPlayAgain,
  continueLabel,
  bonuses = { battleDamage: 0, critChance: 0 },
  onPickActor,
  onPickTarget,
  onPickMove,
  onCancelSelection,
  autoBattle = false,
  onToggleAutoBattle,
  battleSpeed = 1,
  onBattleSpeedChange,
}: BattleArenaProps) {
  const profile = useGameStore((s) => s.profile);
  const selectedAvatarId = useEconomyStore((s) => s.selectedAvatarId ?? "default");
  const playerTrainer = getPlayerTrainerPortrait(profile.username, selectedAvatarId);
  const opponentTrainer = useMemo(
    () => state?.trainerDisplay?.opponent ?? rollTrainingOpponent(),
    [state?.trainerDisplay?.opponent]
  );
  const isPreFight = state?.phase === "faceOff" || state?.phase === "coinFlip";

  if (!state) {
    return (
      <div className="glass-card p-12 text-center text-white/40">
        <Swords className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p>Selecione seu time e inicie a batalha</p>
      </div>
    );
  }

  const tactical = state.tacticalMode && state.phase === "fighting";
  const phase = state.tacticalPhase;
  const pending = state.pendingSelection ?? {};

  const turnHighlight = (
    f: (typeof state.playerTeam)[0],
    teamOffset: number,
    slot: number
  ): BattleTurnHighlight => {
    if (f.currentHp <= 0) return "none";

    if (combatHighlight) {
      const flatIdx = teamOffset + slot;
      if (combatHighlight.phase === "strike" && flatIdx === combatHighlight.strikerFlat) {
        return "attack";
      }
      if (
        (combatHighlight.phase === "flash" || combatHighlight.phase === "impact") &&
        flatIdx === combatHighlight.victimFlat
      ) {
        return "defend";
      }
      if (
        flatIdx === combatHighlight.strikerFlat ||
        flatIdx === combatHighlight.victimFlat
      ) {
        return "idle-dim";
      }
      return "idle-dim";
    }

    return "none";
  };

  const playerSelectionMode = (slot: number): BattleSelectionMode => {
    if (
      !tactical ||
      phase === "executing" ||
      phase === "animating" ||
      phase === "enemy-turn"
    ) {
      return "none";
    }
    if (phase === "player-pick-actor") return "pick-actor";
    if (phase === "player-pick-target" || phase === "player-pick-move") {
      if (pending.actorSlot === slot) return "selected-actor";
    }
    return "none";
  };

  const enemySelectionMode = (slot: number): BattleSelectionMode => {
    if (!tactical || phase !== "player-pick-target") return "none";
    return "pick-target";
  };

  const livingEnemies = state.enemyTeam.filter((f) => f.currentHp > 0);
  const selectedActor =
    pending.actorSlot != null
      ? state.playerTeam.find((f) => f.slotIndex === pending.actorSlot)
      : null;

  const getEnemyMatchup = (enemy: (typeof state.enemyTeam)[0]): TypeMatchupHint | null => {
    if (!selectedActor || enemy.currentHp <= 0) return null;
    if (phase === "player-pick-target" || phase === "player-pick-move") {
      return getBestMoveMatchup(selectedActor, enemy);
    }
    return null;
  };

  const getPlayerMatchup = (player: (typeof state.playerTeam)[0]): TypeMatchupHint | null => {
    if (player.currentHp <= 0 || phase !== "player-pick-actor") return null;
    return getActorBestOpportunity(player, state.enemyTeam);
  };

  const showModal =
    (state.phase === "victory" || state.phase === "defeat") && onContinue;

  const arenaContent = (
    <div className="relative min-h-[22rem] sm:min-h-[24rem]">
      <AnimatePresence>
        {state.phase === "faceOff" && (
          <BattleFaceOffOverlay
            key="face-off"
            player={playerTrainer}
            opponent={opponentTrainer}
            accentColor={state.gymMeta?.themeColor}
            playerFallbackLetter={profile.username.charAt(0)}
          />
        )}
      </AnimatePresence>

      {state.phase === "coinFlip" && (
        <BattleCoinFlipOverlay playerStarts={state.playerStarts ?? true} />
      )}

      <div className={isPreFight ? "opacity-25 pointer-events-none select-none" : ""}>
      <div className="flex items-center justify-between gap-4 mb-2">
        {state.gymMeta ? (
          <div
            className={cn(
              BATTLE_CLASSIC_THEME
                ? "battle-classic-gym-banner flex-1"
                : "glass-card px-3 py-2 text-center text-xs font-bold border flex-1"
            )}
            style={
              BATTLE_CLASSIC_THEME
                ? { color: state.gymMeta.themeColor }
                : {
                    borderColor: `${state.gymMeta.themeColor}40`,
                    color: state.gymMeta.themeColor,
                  }
            }
          >
            {state.gymMeta.gymName} · {state.gymMeta.trainerName}
            {state.gymMeta.stage > 0 && (
              <span className={BATTLE_CLASSIC_THEME ? "text-white/45 font-normal" : "text-white/50 font-normal"}>
                {" "}
                ({state.gymMeta.stage}/{state.gymMeta.totalStages})
              </span>
            )}
          </div>
        ) : (
          <div className="flex-1" />
        )}
      </div>

      {onToggleAutoBattle && (
        <FloatingAutoBattleToggle
          active={autoBattle}
          onToggle={onToggleAutoBattle}
          speed={battleSpeed}
          onSpeedChange={onBattleSpeedChange}
        />
      )}

        {tactical && !autoBattle && <BattleTurnBanner phase={phase} />}

        <div
          className={cn(
            "rounded-xl transition-all duration-300 p-1 -m-1",
            tactical && battleSectionClass("enemy", phase)
          )}
        >
          <p
            className={cn(
              BATTLE_CLASSIC_THEME
                ? "battle-classic-section-label battle-classic-enemy-label"
                : "text-xs text-red-400 font-bold uppercase tracking-wider mb-2",
              !autoBattle && phase === "player-pick-target" && "animate-pulse"
            )}
          >
            {!autoBattle && phase === "player-pick-target" ? (
              <span className="flex items-center gap-1"><Target className="w-3 h-3" /> Escolha o alvo</span>
            ) : (
              "Inimigos"
            )}
          </p>
          <div className="flex items-center gap-2 sm:gap-3">
            {state.trainerDisplay && (
              <BattleTrainerChip
                side="enemy"
                name={state.trainerDisplay.opponent.name}
                spriteUrl={state.trainerDisplay.opponent.spriteUrl}
                accentColor={state.gymMeta?.themeColor}
              />
            )}
          <div className="grid grid-cols-3 gap-2 relative z-10 flex-1 min-w-0">
            {state.enemyTeam.map((f, i) => {
              const slot = f.slotIndex ?? i;
              const flatIdx = 3 + slot;
              const isVictim = combatHighlight?.victimFlat === flatIdx;

              return (
                <PokemonBattleCard
                  key={`enemy-${f.pokemon.id}-${i}`}
                  fighter={f}
                  turnHighlight={turnHighlight(f, 3, slot)}
                  selectionMode={
                    pending.targetSlot === slot ? "selected-target" : enemySelectionMode(slot)
                  }
                  compact
                  side="enemy"
                  selectable={
                    tactical &&
                    !autoBattle &&
                    f.currentHp > 0 &&
                    (phase === "player-pick-target" ||
                      (phase === "player-pick-move" && pending.targetSlot === slot))
                  }
                  onSelect={() => onPickTarget?.(slot)}
                  moveType={isVictim ? combatHighlight?.moveType : undefined}
                  attackPhase={isVictim ? combatHighlight?.phase : undefined}
                  statusApplied={isVictim ? combatHighlight?.statusApplied : undefined}
                  typeMatchup={getEnemyMatchup(f)}
                />
              );
            })}
          </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-3 my-4 relative z-10">
          {!BATTLE_CLASSIC_THEME && (
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
          )}
          {BATTLE_CLASSIC_THEME ? (
            <div className="battle-classic-vs flex items-center gap-1.5">
              <PokeballIcon size={14} />
              VS
            </div>
          ) : (
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="text-indigo-400 font-black text-sm"
            >
              VS
            </motion.span>
          )}
          {!BATTLE_CLASSIC_THEME && (
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
          )}
        </div>

        <div
          className={cn(
            "rounded-xl transition-all duration-300 p-1 -m-1",
            tactical && battleSectionClass("player", phase)
          )}
        >
          <p
            className={cn(
              BATTLE_CLASSIC_THEME
                ? "battle-classic-section-label battle-classic-player-label"
                : "text-xs text-cyan-400 font-bold uppercase tracking-wider mb-2",
              !autoBattle && phase === "player-pick-actor" && "animate-pulse"
            )}
          >
            {!autoBattle && phase === "player-pick-actor" ? (
              <span className="flex items-center gap-1"><Pointer className="w-3 h-3" /> Escolha quem ataca</span>
            ) : (
              "Seu Time"
            )}
          </p>
          <div className="flex items-center gap-2 sm:gap-3 flex-row-reverse">
          <div className="grid grid-cols-3 gap-2 relative z-10 flex-1 min-w-0">
            {state.playerTeam.map((f, i) => {
              const slot = f.slotIndex ?? i;
              const flatIdx = slot;
              const isStriker = combatHighlight?.strikerFlat === flatIdx;
              const isVictim = combatHighlight?.victimFlat === flatIdx;

              return (
                <PokemonBattleCard
                  key={`player-${f.pokemon.id}-${i}`}
                  fighter={f}
                  turnHighlight={turnHighlight(f, 0, slot)}
                  selectionMode={playerSelectionMode(slot)}
                  compact
                  side="player"
                  selectable={
                    tactical &&
                    !autoBattle &&
                    f.currentHp > 0 &&
                    ((phase === "player-pick-actor" && f.status?.effect !== "sleep") ||
                      ((phase === "player-pick-target" || phase === "player-pick-move") &&
                        pending.actorSlot === slot))
                  }
                  onSelect={() => onPickActor?.(slot)}
                  moveType={
                    isVictim || isStriker ? combatHighlight?.moveType : undefined
                  }
                  attackPhase={
                    isVictim || isStriker ? combatHighlight?.phase : undefined
                  }
                  statusApplied={isVictim ? combatHighlight?.statusApplied : undefined}
                  typeMatchup={getPlayerMatchup(f)}
                />
              );
            })}
          </div>
            <BattleTrainerChip
              side="player"
              name={playerTrainer.name}
              spriteUrl={playerTrainer.spriteUrl}
              fallbackLetter={profile.username.charAt(0)}
              avatarStyle={playerTrainer.isProfileAvatar}
            />
          </div>
        </div>

        {tactical && !autoBattle && onPickMove && onCancelSelection && (
          <BattleActionPanel
            state={state}
            bonuses={bonuses}
            onPickMove={onPickMove}
            onCancel={onCancelSelection}
            recentLog={state.log.slice(-4)}
          />
        )}
      </div>
    </div>
  );

  return (
    <>
      <div
        className={cn(
          "relative w-full flex flex-col justify-center py-2",
          "min-h-[calc(100dvh-7.5rem)] md:min-h-[calc(100dvh-5.5rem)] lg:min-h-[calc(100dvh-6rem)]"
        )}
      >
        <div
          className={cn(
            "relative space-y-4 w-full",
            BATTLE_CLASSIC_THEME && "battle-classic-arena"
          )}
        >
          {arenaContent}
        </div>
      </div>

      {showModal && (
        <BattleResultModal
          state={state}
          onContinue={onContinue}
          onPlayAgain={onPlayAgain}
          continueLabel={continueLabel}
        />
      )}
    </>
  );
}
