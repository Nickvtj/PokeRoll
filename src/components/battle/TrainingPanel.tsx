"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Shield } from "lucide-react";
import { BattleArena } from "@/components/battle/BattleArena";
import { TeamSelector } from "@/components/battle/TeamSelector";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { POKEMON_MAP } from "@/data/pokemon";
import { executeBattleTurn, initBattle } from "@/lib/battle-engine";
import { getEconomyBonuses, useEconomyStore } from "@/stores/economy-store";
import { recordBattleToSupabase } from "@/lib/economy-supabase";
import { playNewBattleHitSounds } from "@/lib/battle-sound-utils";
import type { BattleState } from "@/types/battle";

export function TrainingPanel() {
  const team = useEconomyStore((s) => s.team);
  const addCoins = useEconomyStore((s) => s.addCoins);
  const addXp = useEconomyStore((s) => s.addXp);
  const grantFreeSpin = useEconomyStore((s) => s.grantFreeSpin);
  const recordBattleWin = useEconomyStore((s) => s.recordBattleWin);
  const recordBattleLoss = useEconomyStore((s) => s.recordBattleLoss);
  const grantPokemonBattleXp = useEconomyStore((s) => s.grantPokemonBattleXp);
  const getPokemonLevelsMap = useEconomyStore((s) => s.getPokemonLevelsMap);

  const [battleState, setBattleState] = useState<BattleState | null>(null);
  const [fighting, setFighting] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const battleStateRef = useRef<BattleState | null>(null);
  const lastLogLenRef = useRef(0);
  battleStateRef.current = battleState;

  const beginBattle = useCallback(() => {
    if (team.length < 3) return null;
    const pokemon = team.map((id) => POKEMON_MAP[id]).filter(Boolean);
    if (pokemon.length < 3) return null;
    lastLogLenRef.current = 0;
    const state = initBattle(pokemon, 1, getPokemonLevelsMap());
    setBattleState(state);
    setFighting(true);
    return state;
  }, [team, getPokemonLevelsMap]);

  const startBattle = () => {
    beginBattle();
  };

  const processTurns = useCallback(() => {
    const prev = battleStateRef.current;
    if (!prev || prev.phase !== "fighting") return;

    const bonuses = getEconomyBonuses(team);
    const { state, done } = executeBattleTurn(prev, {
      battleDamage: bonuses.battleDamage,
      critChance: bonuses.critChance,
    });

    if (state.log.length > lastLogLenRef.current) {
      playNewBattleHitSounds(state.log, lastLogLenRef.current);
      lastLogLenRef.current = state.log.length;
    }

    if (!done) {
      setBattleState(state);
      return;
    }

    setFighting(false);
    const won = state.phase === "victory";
    const levelUps = grantPokemonBattleXp(team, won, "training");
    let finalState: BattleState = { ...state, levelUps };

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
      addXp(6);
      recordBattleLoss();
      void recordBattleToSupabase(false, 0, 6, false, state.wave, team);
    }

    setBattleState(finalState);
  }, [team, addCoins, addXp, recordBattleWin, recordBattleLoss, grantFreeSpin, grantPokemonBattleXp]);

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

  if (fighting || battleState) {
    return (
      <BattleArena
        state={battleState}
        onContinue={resetBattle}
        onPlayAgain={() => {
          resetBattle();
          setTimeout(() => beginBattle(), 50);
        }}
      />
    );
  }

  return (
    <div className="space-y-4">
      <TeamSelector />
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
    </div>
  );
}
