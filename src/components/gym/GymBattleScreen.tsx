"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
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
import { useBattleCoinFlip } from "@/hooks/use-battle-coin-flip";
import { useBattleTurnLoop } from "@/hooks/use-battle-turn-loop";
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
  const grantPokemonBattleXp = useEconomyStore((s) => s.grantPokemonBattleXp);
  const recordGymStageWin = useGymStore((s) => s.recordGymStageWin);

  const [stage, setStage] = useState(1);
  const [battleState, setBattleState] = useState<BattleState | null>(null);
  const [fighting, setFighting] = useState(false);
  const [badgeReward, setBadgeReward] = useState<{
    bonus: PerfectRunBonus;
    teamIds: number[];
  } | null>(null);

  useBattleCoinFlip(battleState, setBattleState);

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

  const { arenaState, combatHighlight, resetLoop } = useBattleTurnLoop({
    fighting,
    battleState,
    setBattleState,
    getBonuses: () => {
      const bonuses = getEconomyBonuses(team);
      return {
        battleDamage: bonuses.battleDamage,
        critChance: bonuses.critChance,
      };
    },
    onTurnComplete: handleTurnComplete,
  });

  const startStage = useCallback(
    (s: number) => {
      if (team.length < 3) return;
      const pokemon = getTeamPokemonForBattle(team);
      if (pokemon.length < 3) return;
      resetLoop();
      setStage(s);
      setBattleState(initGymBattle(gymId, s, pokemon, getPokemonLevelsMap()));
      setFighting(true);
    },
    [team, gymId, getPokemonLevelsMap]
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

  const handlePlayAgain = () => {
    resetBattle();
    startStage(stage);
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

  return (
    <div className="space-y-3">
      {!fighting && !battleState && (
        <button
          type="button"
          onClick={onExit}
          className="flex items-center gap-1 text-xs text-white/50 hover:text-white"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Voltar aos ginásios
        </button>
      )}

      {!fighting && !battleState && (
        <div
          className="glass-card p-3 text-center border"
          style={{ borderColor: `${gym.themeColor}40` }}
        >
          <p className="text-xs font-bold" style={{ color: gym.themeColor }}>
            {gym.arenaName} · Batalha {stage}/5
          </p>
        </div>
      )}

      {!fighting && !battleState && (
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
      )}

      {(fighting || battleState) && (
        <BattleArena
          state={arenaState}
          combatHighlight={combatHighlight}
          onContinue={handleContinue}
          onPlayAgain={battleState?.phase === "defeat" ? handlePlayAgain : undefined}
          continueLabel={gymContinueLabel}
        />
      )}

      <BadgeRewardAnimation
        show={!!badgeReward}
        gym={gym}
        teamIds={badgeReward?.teamIds ?? []}
        bonus={badgeReward?.bonus ?? { noDeaths: false, fastClear: false, underleveled: false, typeChallenge: false, stars: 1, rank: "C" }}
        onClose={() => {
          setBadgeReward(null);
          onExit();
        }}
      />
    </div>
  );
}
