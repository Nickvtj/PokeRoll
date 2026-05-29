"use client";

import { useCallback, useEffect, useState } from "react";
import { BattleArena } from "@/components/battle/BattleArena";
import { BattleTeamPrepLayout } from "@/components/battle/BattleTeamPrepLayout";
import { TeamSelector } from "@/components/battle/TeamSelector";
import { SavedTeamsPanel } from "@/components/gym/SavedTeamsPanel";
import { BadgeRewardAnimation } from "@/components/gym/BadgeRewardAnimation";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { GYM_MAP } from "@/data/gyms";
import { initGymBattle } from "@/lib/gym-battle-engine";
import { getEconomyBonuses, useEconomyStore } from "@/stores/economy-store";
import { calcPerfectRun, useGymStore } from "@/stores/gym-store";
import { getTeamPokemonForBattle } from "@/lib/team-pokemon";
import { useTacticalBattle } from "@/hooks/use-tactical-battle";
import type { BattleState } from "@/types/battle";
import type { GymId } from "@/types/gym";
import type { PerfectRunBonus } from "@/types/gym";

interface GymBattleScreenProps {
  gymId: GymId;
  onExit: () => void;
  onBattleActiveChange?: (active: boolean) => void;
}

export function GymBattleScreen({ gymId, onExit, onBattleActiveChange }: GymBattleScreenProps) {
  const gym = GYM_MAP[gymId];
  const team = useEconomyStore((s) => s.team);
  const getPokemonLevelsMap = useEconomyStore((s) => s.getPokemonLevelsMap);
  const pokemonMoveLoadouts = useEconomyStore((s) => s.pokemonMoveLoadouts);
  const grantPokemonBattleXp = useEconomyStore((s) => s.grantPokemonBattleXp);
  const recordGymStageWin = useGymStore((s) => s.recordGymStageWin);

  const [stage, setStage] = useState(1);
  const [battleState, setBattleState] = useState<BattleState | null>(null);
  const [fighting, setFighting] = useState(false);
  const [badgeReward, setBadgeReward] = useState<{
    bonus: PerfectRunBonus;
    teamIds: number[];
  } | null>(null);

  const economyBonuses = getEconomyBonuses(team);

  const handleTurnComplete = useCallback(
    (state: BattleState, done: boolean) => {
      if (!done) return;

      setFighting(false);
      const won = state.phase === "victory";
      const levelUps = grantPokemonBattleXp(team, won, "gym");
      const finalState: BattleState = { ...state, levelUps };

      if (won && state.gymMeta) {
        const avgLevel =
          team.reduce((sum, id) => sum + (getPokemonLevelsMap()[id] ?? 1), 0) / team.length;
        const bonus = calcPerfectRun(
          true,
          state.playerDeaths ?? 0,
          state.turnCount ?? 0,
          avgLevel,
          state.gymMeta.recommendedLevel
        );
        const { badgeEarned } = recordGymStageWin(gymId, stage, team, bonus);

        if (badgeEarned) {
          setBadgeReward({ bonus, teamIds: [...team] });
        }
      }
      setBattleState(finalState);
    },
    [team, stage, gymId, grantPokemonBattleXp, getPokemonLevelsMap, recordGymStageWin]
  );

  const {
    arenaState,
    combatHighlight,
    pickActor,
    pickTarget,
    pickMove,
    cancelSelection,
    resetLoop,
  } = useTacticalBattle({
    fighting,
    battleState,
    setBattleState,
    getBonuses: () => ({
      battleDamage: economyBonuses.battleDamage,
      critChance: economyBonuses.critChance,
    }),
    onTurnComplete: handleTurnComplete,
  });

  const startStage = useCallback(
    (s: number) => {
      if (team.length < 3) return;
      const pokemon = getTeamPokemonForBattle(team);
      if (pokemon.length < 3) return;
      resetLoop();
      setStage(s);
      setBattleState(initGymBattle(gymId, s, pokemon, getPokemonLevelsMap(), pokemonMoveLoadouts));
      setFighting(true);
    },
    [team, gymId, getPokemonLevelsMap, pokemonMoveLoadouts, resetLoop]
  );

  const resetBattle = () => {
    resetLoop();
    setBattleState(null);
    setFighting(false);
  };

  const handleContinue = () => {
    const won = battleState?.phase === "victory";
    const currentStage = stage;
    resetBattle();
    if (won && currentStage < 5) {
      startStage(currentStage + 1);
    } else if (!won) {
      onExit();
    } else {
      onExit();
    }
  };

  const gymContinueLabel =
    battleState?.phase === "victory" && stage < 5
      ? "Próxima Batalha"
      : battleState?.phase === "victory" && stage >= 5
        ? "Terminar"
        : "Continuar";

  useEffect(() => {
    const active = fighting || battleState != null;
    onBattleActiveChange?.(active);
    return () => onBattleActiveChange?.(false);
  }, [fighting, battleState, onBattleActiveChange]);

  if (fighting || battleState) {
    return (
      <>
        <BattleArena
          state={arenaState}
          combatHighlight={combatHighlight}
          bonuses={{
            battleDamage: economyBonuses.battleDamage,
            critChance: economyBonuses.critChance,
          }}
          onPickActor={pickActor}
          onPickTarget={pickTarget}
          onPickMove={pickMove}
          onCancelSelection={cancelSelection}
          onContinue={handleContinue}
          onPlayAgain={
            battleState?.phase === "defeat"
              ? () => {
                  resetLoop();
                  startStage(stage);
                }
              : undefined
          }
          continueLabel={gymContinueLabel}
        />
        <BadgeRewardAnimation
          show={!!badgeReward}
          gym={gym}
          teamIds={badgeReward?.teamIds ?? []}
          bonus={
            badgeReward?.bonus ?? {
              noDeaths: false,
              fastClear: false,
              underleveled: false,
              typeChallenge: false,
              stars: 1,
              rank: "C",
            }
          }
          onClose={() => {
            setBadgeReward(null);
            onExit();
          }}
        />
      </>
    );
  }

  return (
    <>
      <BattleTeamPrepLayout
        previewLayout="bar-only"
        action={
          <AnimatedButton
            variant="gold"
            className="w-full"
            onClick={() => startStage(1)}
            disabled={team.length < 3}
          >
            Iniciar Ginásio (5 batalhas)
          </AnimatedButton>
        }
      >
        <SavedTeamsPanel />
        <TeamSelector className="flex-1 min-h-0" />
      </BattleTeamPrepLayout>

      <BadgeRewardAnimation
        show={!!badgeReward}
        gym={gym}
        teamIds={badgeReward?.teamIds ?? []}
        bonus={
          badgeReward?.bonus ?? {
            noDeaths: false,
            fastClear: false,
            underleveled: false,
            typeChallenge: false,
            stars: 1,
            rank: "C",
          }
        }
        onClose={() => {
          setBadgeReward(null);
          onExit();
        }}
      />
    </>
  );
}
