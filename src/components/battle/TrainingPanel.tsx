"use client";

import { useCallback, useEffect, useState } from "react";
import { Shield } from "lucide-react";
import { BattleArena } from "@/components/battle/BattleArena";
import { BattleTeamPrepLayout } from "@/components/battle/BattleTeamPrepLayout";
import { TeamSelector } from "@/components/battle/TeamSelector";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { getTeamPokemonForBattle } from "@/lib/team-pokemon";
import { initBattle } from "@/lib/battle-engine";
import { getEconomyBonuses, useEconomyStore } from "@/stores/economy-store";
import { recordBattleToSupabase } from "@/lib/economy-supabase";
import { useBattleSessionStore } from "@/stores/battle-session-store";
import { useTacticalBattle } from "@/hooks/use-tactical-battle";
import type { BattleState } from "@/types/battle";

export function TrainingPanel({
  onBattleActiveChange,
}: {
  onBattleActiveChange?: (active: boolean) => void;
}) {
  const team = useEconomyStore((s) => s.team);
  const addCoins = useEconomyStore((s) => s.addCoins);
  const addXp = useEconomyStore((s) => s.addXp);
  const grantFreeSpin = useEconomyStore((s) => s.grantFreeSpin);
  const recordBattleWin = useEconomyStore((s) => s.recordBattleWin);
  const recordBattleLoss = useEconomyStore((s) => s.recordBattleLoss);
  const grantPokemonBattleXp = useEconomyStore((s) => s.grantPokemonBattleXp);
  const getPokemonLevelsMap = useEconomyStore((s) => s.getPokemonLevelsMap);
  const pokemonMoveLoadouts = useEconomyStore((s) => s.pokemonMoveLoadouts);

  const [battleState, setBattleState] = useState<BattleState | null>(null);
  const [fighting, setFighting] = useState(false);
  const [autoBattle, setAutoBattle] = useState(false);

  const handleTurnComplete = useCallback(
    (state: BattleState, done: boolean) => {
      if (!done) return;

      setFighting(false);
      const won = state.phase === "victory";
      const levelUps = grantPokemonBattleXp(team, won, "training");
      let finalState: BattleState = { ...state, levelUps };
      const bonuses = getEconomyBonuses(team);

      if (won && state.reward) {
        const coins = Math.round(state.reward.coins * (1 + bonuses.coinBonus));
        const xp = Math.round(state.reward.xp * (1 + bonuses.xpBonus));
        addCoins(coins);
        addXp(xp);
        recordBattleWin();
        if (state.reward.freeSpin) grantFreeSpin();
        void recordBattleToSupabase(true, coins, xp, !!state.reward.freeSpin, state.wave, team);
        finalState = { ...finalState, reward: { ...state.reward, coins, xp } };
      } else if (!won) {
        addXp(3);
        recordBattleLoss();
        void recordBattleToSupabase(false, 0, 3, false, state.wave, team);
      }

      setBattleState(finalState);
    },
    [
      team,
      addCoins,
      addXp,
      recordBattleWin,
      recordBattleLoss,
      grantFreeSpin,
      grantPokemonBattleXp,
    ]
  );

  const economyBonuses = getEconomyBonuses(team);

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
      defenseBoost: economyBonuses.defenseBoost,
    }),
    onTurnComplete: handleTurnComplete,
    autoBattle,
  });

  const beginBattle = useCallback(() => {
    if (team.length < 3) return null;
    const pokemon = getTeamPokemonForBattle(team);
    if (pokemon.length < 3) return null;
    resetLoop();
    const state = initBattle(pokemon, 1, getPokemonLevelsMap(), pokemonMoveLoadouts);
    setBattleState(state);
    setFighting(true);
    return state;
  }, [team, getPokemonLevelsMap, pokemonMoveLoadouts, resetLoop]);

  const startBattle = () => {
    beginBattle();
  };

  const resetBattle = () => {
    resetLoop();
    setBattleState(null);
    setFighting(false);
    useBattleSessionStore.getState().setSession(false);
  };

  useEffect(() => {
    const inBattleView = fighting || battleState != null;
    const canLeave =
      inBattleView &&
      battleState != null &&
      battleState.phase !== "victory" &&
      battleState.phase !== "defeat";
    onBattleActiveChange?.(inBattleView);
    useBattleSessionStore.getState().setSession(canLeave, canLeave ? resetBattle : undefined);
    return () => {
      onBattleActiveChange?.(false);
      useBattleSessionStore.getState().setSession(false);
    };
  }, [fighting, battleState, onBattleActiveChange, resetBattle]);

  if (fighting || battleState) {
    return (
      <BattleArena
        state={arenaState}
        combatHighlight={combatHighlight}
        bonuses={{
          battleDamage: economyBonuses.battleDamage,
          critChance: economyBonuses.critChance,
          defenseBoost: economyBonuses.defenseBoost,
        }}
        onPickActor={pickActor}
        onPickTarget={pickTarget}
        onPickMove={pickMove}
        onCancelSelection={cancelSelection}
        onContinue={resetBattle}
        onPlayAgain={() => {
          resetLoop();
          beginBattle();
        }}
        autoBattle={autoBattle}
        onToggleAutoBattle={() => setAutoBattle(!autoBattle)}
      />
    );
  }

  return (
    <div className="flex-1 min-h-0 flex flex-col">
    <BattleTeamPrepLayout
      action={
        <AnimatedButton
          variant="gold"
          size="lg"
          onClick={startBattle}
          disabled={team.length < 3}
          icon={<Shield className="w-5 h-5" />}
          className="w-full"
        >
          {team.length < 3 ? "Selecione 3 Pokémon" : "INICIAR TREINO"}
        </AnimatedButton>
      }
    >
      <TeamSelector className="flex-1 min-h-0" />
    </BattleTeamPrepLayout>
    </div>
  );
}
