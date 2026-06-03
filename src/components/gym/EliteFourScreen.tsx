"use client";

import { ELITE_FOUR, isEliteMemberUnlocked } from "@/data/gyms";
import { Lock, Swords } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { BattleArena } from "@/components/battle/BattleArena";
import { TeamSelector } from "@/components/battle/TeamSelector";
import { SavedTeamsPanel } from "@/components/gym/SavedTeamsPanel";
import { initEliteBattle } from "@/lib/gym-battle-engine";
import { getEconomyBonuses, useEconomyStore } from "@/stores/economy-store";
import { calcPerfectRun, useGymStore } from "@/stores/gym-store";
import { getTeamPokemonForBattle } from "@/lib/team-pokemon";
import { useTacticalBattle } from "@/hooks/use-tactical-battle";
import type { BattleState } from "@/types/battle";
import type { EliteId } from "@/types/gym";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export function EliteFourScreen({
  onBattleActiveChange,
}: {
  onBattleActiveChange?: (active: boolean) => void;
}) {
  const isEliteUnlocked = useGymStore((s) => s.isEliteUnlocked);
  const eliteProgress = useGymStore((s) => s.eliteProgress);
  const championDefeated = useGymStore((s) => s.championDefeated);
  const badgeCount = useGymStore((s) => s.badges.length);
  const recordEliteWin = useGymStore((s) => s.recordEliteWin);
  const team = useEconomyStore((s) => s.team);
  const getPokemonLevelsMap = useEconomyStore((s) => s.getPokemonLevelsMap);
  const pokemonMoveLoadouts = useEconomyStore((s) => s.pokemonMoveLoadouts);
  const grantPokemonBattleXp = useEconomyStore((s) => s.grantPokemonBattleXp);

  const [activeElite, setActiveElite] = useState<EliteId | null>(null);
  const [battleState, setBattleState] = useState<BattleState | null>(null);
  const [fighting, setFighting] = useState(false);
  const [autoBattle, setAutoBattle] = useState(false);

  const leagueUnlocked = isEliteUnlocked();
  const economyBonuses = getEconomyBonuses(team);

  const handleTurnComplete = useCallback(
    (state: BattleState, done: boolean) => {
      if (!done) return;

      setFighting(false);
      const won = state.phase === "victory";
      const levelUps = grantPokemonBattleXp(team, won, "elite");

      if (won && activeElite) {
        const avgLevel =
          team.reduce((sum, id) => sum + (getPokemonLevelsMap()[id] ?? 1), 0) / team.length;
        const rec = ELITE_FOUR.find((e) => e.id === activeElite);
        const bonus = calcPerfectRun(
          true,
          state.playerDeaths ?? 0,
          state.turnCount ?? 0,
          avgLevel,
          rec?.recommendedLevel ?? 40
        );
        recordEliteWin(activeElite, team, bonus);
      }
      setBattleState({ ...state, levelUps });
    },
    [team, activeElite, grantPokemonBattleXp, getPokemonLevelsMap, recordEliteWin]
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
      defenseBoost: economyBonuses.defenseBoost,
    }),
    onTurnComplete: handleTurnComplete,
    autoBattle,
  });

  const startElite = useCallback(
    (eliteId: EliteId) => {
      if (!leagueUnlocked || !isEliteMemberUnlocked(eliteId, eliteProgress)) return;
      if (team.length < 3) return;
      const pokemon = getTeamPokemonForBattle(team);
      if (pokemon.length < 3) return;
      resetLoop();
      setActiveElite(eliteId);
      setBattleState(initEliteBattle(eliteId, pokemon, getPokemonLevelsMap(), pokemonMoveLoadouts));
      setFighting(true);
    },
    [leagueUnlocked, eliteProgress, team, getPokemonLevelsMap, pokemonMoveLoadouts, resetLoop]
  );

  const resetBattle = () => {
    resetLoop();
    setBattleState(null);
    setFighting(false);
  };

  useEffect(() => {
    const active = fighting || battleState != null;
    onBattleActiveChange?.(active);
    return () => onBattleActiveChange?.(false);
  }, [fighting, battleState, onBattleActiveChange]);

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
        onContinue={() => {
          resetBattle();
          setActiveElite(null);
        }}
        onPlayAgain={() => {
          const elite = activeElite;
          if (!elite) return;
          resetLoop();
          startElite(elite);
        }}
        autoBattle={autoBattle}
        onToggleAutoBattle={() => setAutoBattle(!autoBattle)}
      />
    );
  }

  return (
    <div className="space-y-4">
      {!leagueUnlocked && (
        <div className="glass-card p-4 text-center border border-white/10 bg-white/5 space-y-1">
          <Lock className="w-8 h-8 mx-auto text-white/30 mb-2" />
          <p className="text-sm text-white/50">
            Colete as 8 insígnias ({badgeCount}/8)
          </p>
        </div>
      )}

      {championDefeated && (
        <div className="glass-card p-4 text-center border border-amber-500/30 bg-amber-500/10">
          <p className="text-amber-400 font-bold">🏆 Hall of Fame — Campeão Kanto!</p>
        </div>
      )}

      {leagueUnlocked && (
        <>
          <SavedTeamsPanel />
          <TeamSelector />
        </>
      )}

      <div className="grid gap-2">
        {ELITE_FOUR.map((elite, index) => {
          const cleared = !!eliteProgress[elite.id]?.cleared;
          const memberUnlocked = leagueUnlocked && isEliteMemberUnlocked(elite.id, eliteProgress);
          const disabled = !memberUnlocked || team.length < 3;

          return (
            <button
              key={elite.id}
              type="button"
              onClick={() => startElite(elite.id)}
              disabled={disabled}
              className={cn(
                "glass-card p-4 text-left border transition-all relative overflow-hidden",
                memberUnlocked && !disabled && "hover:scale-[1.01]",
                !memberUnlocked && "opacity-45 cursor-not-allowed",
                cleared && memberUnlocked && "border-amber-500/30"
              )}
              style={{
                borderColor: cleared && memberUnlocked ? `${elite.themeColor}50` : undefined,
              }}
            >
              {!memberUnlocked && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[1px] z-10">
                  <div className="flex items-center gap-2 text-white/50 text-xs font-semibold">
                    <Lock className="w-4 h-4" />
                    {!leagueUnlocked
                      ? "8 insígnias necessárias"
                      : index === 0
                        ? "Bloqueado"
                        : `Derrote ${ELITE_FOUR[index - 1]?.name} primeiro`}
                  </div>
                </div>
              )}
              <p className="font-bold text-sm" style={{ color: memberUnlocked ? elite.themeColor : undefined }}>
                {elite.name}
              </p>
              <p className="text-[10px] text-white/40">{elite.title} · Nv. {elite.recommendedLevel}+</p>
              {cleared && memberUnlocked && (
                <p className="text-[10px] text-amber-400 mt-1">✓ Derrotado</p>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
