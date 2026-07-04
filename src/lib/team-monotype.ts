import { POKEMON_MAP } from "@/data/pokemon";
import { getPokemonBattleStats } from "@/data/pokemon-stats";
import { BATTLE_ROSTER_SIZE } from "@/data/battle-theme";
import {
  TEAM_MONOTYPE_DAMAGE_BONUS,
  TEAM_QUAD_MONOTYPE_DAMAGE_BONUS,
} from "@/data/economy-balance";
import { TYPE_LABELS_PT } from "@/data/type-chart";

/** Boost individual de um tipo com 2+ membros no roster */
export interface MonotypeBoost {
  type: string;
  label: string;
  count: number;
  /** fração de dano (0.12 ou 0.25) */
  bonus: number;
  bonusPercent: number;
}

export interface TeamMonotypeSynergy {
  active: boolean;
  boosts: MonotypeBoost[];
  /** compat. — melhor boost do time (usado por UIs antigas) */
  type: string | null;
  label: string;
  bonusPercent: number;
}

/** Regra por tipo: 4 iguais = boost maior; 2–3 iguais = boost padrão */
export function monotypeBonusForCount(count: number): number {
  if (count >= BATTLE_ROSTER_SIZE) return TEAM_QUAD_MONOTYPE_DAMAGE_BONUS;
  if (count >= 2) return TEAM_MONOTYPE_DAMAGE_BONUS;
  return 0;
}

/** Contagem de tipos a partir de uma lista de IDs de Pokémon */
export function getRosterTypeCounts(teamIds: number[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const id of teamIds) {
    const pokemon = POKEMON_MAP[id];
    if (!pokemon) continue;
    const type = getPokemonBattleStats(pokemon).type;
    if (!type) continue;
    counts[type] = (counts[type] ?? 0) + 1;
  }
  return counts;
}

/** Boost de dano por tipo aplicado a um Pokémon específico do jogador */
export function monotypeBonusForType(
  typeCounts: Record<string, number> | undefined,
  type: string | undefined
): number {
  if (!typeCounts || !type) return 0;
  return monotypeBonusForCount(typeCounts[type] ?? 0);
}

export function getTeamMonotypeSynergy(teamIds: number[]): TeamMonotypeSynergy {
  const inactive: TeamMonotypeSynergy = {
    active: false,
    boosts: [],
    type: null,
    label: "",
    bonusPercent: 0,
  };

  if (teamIds.length < 2) return inactive;

  const counts = getRosterTypeCounts(teamIds);

  const boosts: MonotypeBoost[] = Object.entries(counts)
    .filter(([, count]) => count >= 2)
    .map(([type, count]) => {
      const bonus = monotypeBonusForCount(count);
      return {
        type,
        label: TYPE_LABELS_PT[type] ?? type,
        count,
        bonus,
        bonusPercent: Math.round(bonus * 100),
      };
    })
    .sort((a, b) => b.count - a.count || b.bonus - a.bonus);

  if (boosts.length === 0) return inactive;

  const best = boosts[0];
  return {
    active: true,
    boosts,
    type: best.type,
    label: best.label,
    bonusPercent: best.bonusPercent,
  };
}
