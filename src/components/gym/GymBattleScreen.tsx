"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { BattleArena } from "@/components/battle/BattleArena";
import { TeamSelector } from "@/components/battle/TeamSelector";
import { SavedTeamsPanel } from "@/components/gym/SavedTeamsPanel";
import { BadgeRewardAnimation } from "@/components/gym/BadgeRewardAnimation";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { GYM_MAP } from "@/data/gyms";
import { executeBattleTurn } from "@/lib/battle-engine";
import { initGymBattle } from "@/lib/gym-battle-engine";
import { getEconomyBonuses, useEconomyStore } from "@/stores/economy-store";
import { calcPerfectRun, useGymStore } from "@/stores/gym-store";
import { POKEMON_MAP } from "@/data/pokemon";
import {
  playBattleHit,
} from "@/lib/sound-engine";
import type { BattleState } from "@/types/battle";
import type { GymId } from "@/types/gym";
import type { PerfectRunBonus } from "@/types/gym";

interface GymBattleScreenProps {
  gymId: GymId;
  onExit: () => void;
}

export function GymBattleScreen({ gymId, onExit }: GymBattleScreenProps) {
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
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const battleStateRef = useRef<BattleState | null>(null);
  const lastLogLenRef = useRef(0);
  battleStateRef.current = battleState;

  const startStage = useCallback(
    (s: number) => {
      if (team.length < 3) return;
      const pokemon = team.map((id) => POKEMON_MAP[id]).filter(Boolean);
      if (pokemon.length < 3) return;
      lastLogLenRef.current = 0;
      setStage(s);
      setBattleState(initGymBattle(gymId, s, pokemon, getPokemonLevelsMap()));
      setFighting(true);
    },
    [team, gymId, getPokemonLevelsMap]
  );

  const processTurns = useCallback(() => {
    const prev = battleStateRef.current;
    if (!prev || prev.phase !== "fighting") return;

    const bonuses = getEconomyBonuses(team);
    const { state, done } = executeBattleTurn(prev, {
      battleDamage: bonuses.battleDamage,
      critChance: bonuses.critChance,
    });

    if (state.log.length > lastLogLenRef.current) {
      lastLogLenRef.current = state.log.length;
      void playBattleHit();
    }

    if (!done) {
      setBattleState(state);
      return;
    }

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
  }, [team, stage, gymId, grantPokemonBattleXp, getPokemonLevelsMap, recordGymStageWin]);

  useEffect(() => {
    if (!fighting) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(processTurns, 900);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fighting, processTurns]);

  const resetBattle = () => {
    setBattleState(null);
    setFighting(false);
  };

  const handleContinue = () => {
    const won = battleState?.phase === "victory";
    const currentStage = stage;
    resetBattle();
    if (won && currentStage < 5 && !badgeReward) {
      startStage(currentStage + 1);
    } else if (battleState?.phase === "defeat") {
      onExit();
    }
  };

  const handlePlayAgain = () => {
    const currentStage = stage;
    const won = battleState?.phase === "victory";
    resetBattle();
    if (won && currentStage < 5) {
      startStage(currentStage + 1);
    } else {
      startStage(won ? 1 : currentStage);
    }
  };

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={onExit}
        className="flex items-center gap-1 text-xs text-white/50 hover:text-white"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Voltar aos ginásios
      </button>

      <div
        className="glass-card p-3 text-center border"
        style={{ borderColor: `${gym.themeColor}40` }}
      >
        <p className="text-xs font-bold" style={{ color: gym.themeColor }}>
          {gym.arenaName} · Batalha {stage}/5
        </p>
      </div>

      {!fighting && !battleState && (
        <>
          <SavedTeamsPanel />
          <TeamSelector />
          <AnimatedButton variant="gold" className="w-full" onClick={() => startStage(1)} disabled={team.length < 3}>
            Iniciar Ginásio (5 batalhas)
          </AnimatedButton>
        </>
      )}

      {(fighting || battleState) && (
        <BattleArena
          state={battleState}
          onContinue={handleContinue}
          onPlayAgain={handlePlayAgain}
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
