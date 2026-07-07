"use client";

import { useEffect, useMemo } from "react";
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
import type { BattleFighter, BattleState } from "@/types/battle";
import { cn } from "@/lib/utils";
import { BattleFightRevealOverlay } from "@/components/battle/BattleFightRevealOverlay";
import { BattleSwitchModal } from "@/components/battle/BattleSwitchModal";
import { ClassicBattleScene } from "@/components/battle/ClassicBattleScene";
import { BattleTrainerChip } from "@/components/battle/BattleTrainerChip";
import { startBattleMusic, stopBattleMusic } from "@/lib/battle-music";

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
  onPickSwitch?: (benchIndex: number) => void;
  onCancelSelection?: () => void;
  autoBattle?: boolean;
  onToggleAutoBattle?: () => void;
  battleSpeed?: BattleSpeed;
  onBattleSpeedChange?: (speed: BattleSpeed) => void;
}

/** Pokébola sob o perfil: cinza = em campo, vermelha = reserva viva, apagada = vazio/derrotado */
function ReserveBall({ variant }: { variant: "active" | "reserve" | "empty" }) {
  const top = variant === "reserve" ? "#ef4444" : variant === "active" ? "#6b7280" : "#3f3f46";
  const bottom = variant === "empty" ? "#23272f" : variant === "active" ? "#cbd5e1" : "#f1f5f9";
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      aria-hidden
      style={{ opacity: variant === "empty" ? 0.4 : 1 }}
    >
      <circle cx="12" cy="12" r="11" fill="#0b0d12" />
      <path d="M2 12a10 10 0 0 1 20 0Z" fill={top} />
      <path d="M2 12a10 10 0 0 0 20 0Z" fill={bottom} />
      <rect x="2" y="11" width="20" height="2" fill="#0b0d12" />
      <circle cx="12" cy="12" r="3.2" fill="#0b0d12" />
      <circle cx="12" cy="12" r="1.8" fill={variant === "empty" ? "#3f3f46" : "#f1f5f9"} />
    </svg>
  );
}

/** 4 pokébolas sob o avatar do jogador na batalha (2 em campo + reservas) */
function TrainerReserveBalls({ team, bench }: { team: BattleFighter[]; bench: BattleFighter[] }) {
  const active = team.length;
  const liveBench = bench.filter((f) => f.currentHp > 0).length;
  const variants: Array<"active" | "reserve" | "empty"> = [];
  for (let i = 0; i < 4; i++) {
    if (i < active) variants.push("active");
    else if (i - active < liveBench) variants.push("reserve");
    else variants.push("empty");
  }
  return (
    <div
      className="flex justify-center gap-0.5 mt-1"
      title={`${liveBench} reserva(s), ${active} em campo`}
    >
      {variants.map((v, i) => (
        <ReserveBall key={i} variant={v} />
      ))}
    </div>
  );
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
  onPickSwitch,
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

  useEffect(() => {
    if (!state) {
      stopBattleMusic();
      return;
    }
    if (state.phase === "fighting") {
      startBattleMusic();
    }
    if (state.phase === "victory" || state.phase === "defeat" || state.phase === "idle") {
      stopBattleMusic();
    }
  }, [state?.phase]);

  useEffect(() => () => stopBattleMusic(), []);

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

      <AnimatePresence>
        {state.pendingSwitch?.side === "player" && onPickSwitch && (
          <BattleSwitchModal
            key="switch-modal"
            bench={state.playerBench ?? []}
            faintedName={
              state.playerTeam.find((f) => (f.slotIndex ?? 0) === state.pendingSwitch!.slot)
                ?.pokemon.name
            }
            onPick={onPickSwitch}
          />
        )}
      </AnimatePresence>

      <div className={isPreFight ? "opacity-0 pointer-events-none select-none" : ""}>
        <div className="flex items-center justify-between gap-4 mb-2">
          {state.gymMeta ? (
            <div
              className="battle-classic-gym-banner flex-1"
              style={{ color: state.gymMeta.themeColor }}
            >
              {state.gymMeta.gymName}, {state.gymMeta.trainerName}
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

        <div className="relative">
          <ClassicBattleScene
            state={state}
            combatHighlight={combatHighlight}
            autoBattle={autoBattle}
            onPickActor={onPickActor}
            onPickTarget={onPickTarget}
          />
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
        <div className="relative flex items-stretch gap-1.5 sm:gap-2.5 w-full">
          {/* Treinador jogador, fora da arena (esquerda) */}
          <div className="flex flex-col justify-end shrink-0 w-14 sm:w-[4.25rem] pb-[10%] sm:pb-[14%] pointer-events-none">
            <BattleTrainerChip
              side="player"
              name={playerTrainer.name}
              spriteUrl={playerTrainer.spriteUrl}
              fallbackLetter={profile.username.charAt(0)}
              avatarStyle={playerTrainer.isProfileAvatar}
              className="w-full [&_p]:text-[8px] sm:[&_p]:text-[9px]"
            />
            <TrainerReserveBalls team={state.playerTeam} bench={state.playerBench ?? []} />
          </div>

          <div className="relative space-y-4 flex-1 min-w-0 battle-classic-arena">
            {arenaContent}
          </div>

          {/* Treinador rival, fora da arena (direita) */}
          <div className="flex flex-col justify-start shrink-0 w-14 sm:w-[4.25rem] pt-[4%] sm:pt-[6%] pointer-events-none">
            <BattleTrainerChip
              side="enemy"
              name={opponentTrainer.name}
              spriteUrl={opponentTrainer.spriteUrl}
              accentColor={state.gymMeta?.themeColor}
              className="w-full [&_p]:text-[8px] sm:[&_p]:text-[9px]"
            />
            <TrainerReserveBalls team={state.enemyTeam} bench={state.enemyBench ?? []} />
          </div>
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
