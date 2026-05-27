"use client";

import { ELITE_FOUR, ELITE_REQUIRED_ACCOUNT_LEVEL, isEliteMemberUnlocked } from "@/data/gyms";
import { Lock } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { BattleArena } from "@/components/battle/BattleArena";
import { TeamSelector } from "@/components/battle/TeamSelector";
import { SavedTeamsPanel } from "@/components/gym/SavedTeamsPanel";
import { executeBattleTurn } from "@/lib/battle-engine";
import { initEliteBattle } from "@/lib/gym-battle-engine";
import { getEconomyBonuses, useEconomyStore } from "@/stores/economy-store";
import { calcPerfectRun, useGymStore } from "@/stores/gym-store";
import { POKEMON_MAP } from "@/data/pokemon";
import { playNewBattleHitSounds } from "@/lib/battle-sound-utils";
import type { BattleState } from "@/types/battle";
import type { EliteId } from "@/types/gym";
import { cn } from "@/lib/utils";

export function EliteFourScreen() {
  const isEliteUnlocked = useGymStore((s) => s.isEliteUnlocked);
  const eliteProgress = useGymStore((s) => s.eliteProgress);
  const championDefeated = useGymStore((s) => s.championDefeated);
  const badgeCount = useGymStore((s) => s.badges.length);
  const recordEliteWin = useGymStore((s) => s.recordEliteWin);
  const team = useEconomyStore((s) => s.team);
  const accountLevel = useEconomyStore((s) => s.level);
  const getPokemonLevelsMap = useEconomyStore((s) => s.getPokemonLevelsMap);
  const grantPokemonBattleXp = useEconomyStore((s) => s.grantPokemonBattleXp);

  const [activeElite, setActiveElite] = useState<EliteId | null>(null);
  const [battleState, setBattleState] = useState<BattleState | null>(null);
  const [fighting, setFighting] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const battleStateRef = useRef<BattleState | null>(null);
  const lastLogLenRef = useRef(0);
  battleStateRef.current = battleState;

  const leagueUnlocked = isEliteUnlocked();

  const startElite = useCallback(
    (eliteId: EliteId) => {
      if (!leagueUnlocked || !isEliteMemberUnlocked(eliteId, eliteProgress)) return;
      if (team.length < 3) return;
      const pokemon = team.map((id) => POKEMON_MAP[id]).filter(Boolean);
      if (pokemon.length < 3) return;
      lastLogLenRef.current = 0;
      setActiveElite(eliteId);
      setBattleState(initEliteBattle(eliteId, pokemon, getPokemonLevelsMap()));
      setFighting(true);
    },
    [leagueUnlocked, eliteProgress, team, getPokemonLevelsMap]
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
      playNewBattleHitSounds(state.log, lastLogLenRef.current);
      lastLogLenRef.current = state.log.length;
    }

    if (!done) {
      setBattleState(state);
      return;
    }

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
  }, [team, activeElite, grantPokemonBattleXp, getPokemonLevelsMap, recordEliteWin]);

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
        onContinue={() => {
          resetBattle();
          setActiveElite(null);
        }}
        onPlayAgain={() => {
          const elite = activeElite;
          resetBattle();
          if (elite) setTimeout(() => startElite(elite), 50);
        }}
      />
    );
  }

  return (
    <div className="space-y-4">
      {!leagueUnlocked && (
        <div className="glass-card p-4 text-center border border-white/10 bg-white/5 space-y-1">
          <Lock className="w-8 h-8 mx-auto text-white/30 mb-2" />
          {accountLevel < ELITE_REQUIRED_ACCOUNT_LEVEL && (
            <p className="text-sm text-white/50">
              Requer Nv. {ELITE_REQUIRED_ACCOUNT_LEVEL} da conta (você: Nv. {accountLevel})
            </p>
          )}
          {badgeCount < 8 && (
            <p className="text-sm text-white/50">
              Colete as 8 insígnias ({badgeCount}/8)
            </p>
          )}
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
                      ? accountLevel < ELITE_REQUIRED_ACCOUNT_LEVEL
                        ? `Nv. ${ELITE_REQUIRED_ACCOUNT_LEVEL}+ necessário`
                        : "8 insígnias necessárias"
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
