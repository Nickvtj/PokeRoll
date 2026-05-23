"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Swords, Shield } from "lucide-react";
import { BattleArena } from "@/components/battle/BattleArena";
import { TeamSelector } from "@/components/battle/TeamSelector";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { CoinCounter } from "@/components/ui/CoinCounter";
import { POKEMON_MAP } from "@/data/pokemon";
import { executeBattleTurn, initBattle } from "@/lib/battle-engine";
import { getEconomyBonuses, useEconomyStore } from "@/stores/economy-store";
import { recordBattleToSupabase } from "@/lib/economy-supabase";
import type { BattleState } from "@/types/battle";

export default function BattlePage() {
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

  const startBattle = () => {
    if (team.length < 3) return;
    const pokemon = team.map((id) => POKEMON_MAP[id]).filter(Boolean);
    if (pokemon.length < 3) return;

    const levels = getPokemonLevelsMap();
    const state = initBattle(pokemon, 1, levels);
    setBattleState(state);
    setFighting(true);
  };

  const processTurns = useCallback(() => {
    setBattleState((prev) => {
      if (!prev || prev.phase !== "fighting") return prev;
      const bonuses = getEconomyBonuses(team);
      const { state, done } = executeBattleTurn(prev, {
        battleDamage: bonuses.battleDamage,
        critChance: bonuses.critChance,
      });

      if (done) {
        setFighting(false);
        const won = state.phase === "victory";
        const levelUps = grantPokemonBattleXp(team, won);

        let finalState = { ...state, levelUps };

        if (won && state.reward) {
          const coinBonus = bonuses.coinBonus;
          const xpBonus = bonuses.xpBonus;
          const coins = Math.round(state.reward.coins * (1 + coinBonus));
          const xp = Math.round(state.reward.xp * (1 + xpBonus));
          addCoins(coins);
          addXp(xp);
          recordBattleWin();
          if (state.reward.freeSpin) grantFreeSpin();
          void recordBattleToSupabase(
            true,
            coins,
            xp,
            !!state.reward.freeSpin,
            state.wave,
            team
          );
          finalState = {
            ...finalState,
            reward: { ...state.reward, coins, xp },
          };
        } else if (!won) {
          recordBattleLoss();
          void recordBattleToSupabase(false, 0, 0, false, state.wave, team);
        }

        return finalState;
      }
      return state;
    });
  }, [
    team,
    addCoins,
    addXp,
    recordBattleWin,
    recordBattleLoss,
    grantFreeSpin,
    grantPokemonBattleXp,
  ]);

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

  const handleContinue = () => {
    setBattleState(null);
    setFighting(false);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Swords className="w-8 h-8 text-red-400" />
            Auto Battle
          </h1>
          <p className="text-white/50 text-sm mt-1">
            Principal fonte de moedas · 3~8 🪙 · Pokémon upam de nível
          </p>
        </div>
        <CoinCounter size="sm" />
      </motion.div>

      {!fighting && !battleState && (
        <>
          <TeamSelector />
          <AnimatedButton
            variant="gold"
            size="lg"
            onClick={startBattle}
            disabled={team.length < 3}
            icon={<Shield className="w-5 h-5" />}
            className="w-full"
          >
            {team.length < 3 ? "Selecione 3 Pokémon" : "INICIAR BATALHA"}
          </AnimatedButton>
        </>
      )}

      {(fighting || battleState) && (
        <BattleArena state={battleState} onContinue={handleContinue} />
      )}

      <div className="glass-card p-4 text-xs text-white/40 space-y-1">
        <p>⚔️ Pokémons ganham XP individual e ficam mais fortes</p>
        <p>🪙 Recompensa: 3~8 moedas + XP + chance de spin grátis</p>
        <p>💡 Inimigos escalam com o nível do seu time (~65% vitória)</p>
      </div>
    </div>
  );
}
