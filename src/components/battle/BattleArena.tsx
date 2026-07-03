"use client";

import { useMemo } from "react";
import { AnimatePresence } from "framer-motion";
import { Swords } from "lucide-react";
import { BattleActionPanel } from "@/components/battle/BattleActionPanel";
import { BattleResultModal } from "@/components/battle/BattleResultModal";
import { BattleCoinFlipOverlay } from "@/components/battle/BattleCoinFlipOverlay";
import { BattleFaceOffOverlay } from "@/components/battle/BattleFaceOffOverlay";
import { FloatingAutoBattleToggle, type BattleSpeed } from "@/components/battle/FloatingAutoBattleToggle";
import {
  getPlayerTrainerPortrait,
  rollTrainingOpponent,
} from "@/data/battle-trainers";
import { useGameStore } from "@/stores/game-store";
import { useEconomyStore } from "@/stores/economy-store";
import type { BattleCombatHighlight } from "@/hooks/use-tactical-battle";
import type { BattleState } from "@/types/battle";
import { cn } from "@/lib/utils";
import { BattleFightRevealOverlay } from "@/components/battle/BattleFightRevealOverlay";
import { ClassicBattleScene } from "@/components/battle/ClassicBattleScene";

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
  const isPreFight =
    state?.phase === "faceOff" ||
    state?.phase === "coinFlip" ||
    state?.phase === "fightReveal";

  if (!state) {
    return (
      <div className="glass-card p-12 text-center text-white/40">
        <Swords className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p>Selecione seu time e inicie a batalha</p>
      </div>
    );
  }

  const tactical = state.tacticalMode && state.phase === "fighting";
  const showModal =
    (state.phase === "victory" || state.phase === "defeat") && onContinue;

  const arenaContent = (
    <div className="relative min-h-[22rem] sm:min-h-[24rem]">
      {isPreFight && <div className="battle-classic-prefight-veil" aria-hidden />}

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

      <AnimatePresence>
        {state.phase === "fightReveal" && (
          <BattleFightRevealOverlay
            key="fight-reveal"
            playerStarts={state.playerStarts ?? true}
            accentColor={state.gymMeta?.themeColor}
          />
        )}
      </AnimatePresence>

      <div className={isPreFight ? "opacity-25 pointer-events-none select-none" : ""}>
        <div className="flex items-center justify-between gap-4 mb-2">
          {state.gymMeta ? (
            <div
              className="battle-classic-gym-banner flex-1"
              style={{ color: state.gymMeta.themeColor }}
            >
              {state.gymMeta.gymName} · {state.gymMeta.trainerName}
              {state.gymMeta.stage > 0 && (
                <span className="text-[#585858] font-normal">
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

        <ClassicBattleScene
          state={state}
          combatHighlight={combatHighlight}
          autoBattle={autoBattle}
          onPickActor={onPickActor}
          onPickTarget={onPickTarget}
        />

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
        <div className="relative space-y-4 w-full battle-classic-arena">{arenaContent}</div>
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
