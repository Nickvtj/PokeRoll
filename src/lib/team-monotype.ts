import { POKEMON_MAP } from "@/data/pokemon";
import { getPokemonBattleStats } from "@/data/pokemon-stats";
import { TEAM_MONOTYPE_DAMAGE_BONUS } from "@/data/economy-balance";
import { TYPE_LABELS_PT } from "@/data/type-chart";

export interface TeamMonotypeSynergy {
  active: boolean;
  type: string | null;
  label: string;
  bonusPercent: number;
}

export function getTeamMonotypeSynergy(teamIds: number[]): TeamMonotypeSynergy {
  const inactive: TeamMonotypeSynergy = {
    active: false,
    type: null,
    label: "",
    bonusPercent: 0,
  };

  if (teamIds.length < 3) return inactive;

  const types = teamIds.map((id) => {
    const pokemon = POKEMON_MAP[id];
    if (!pokemon) return null;
    return getPokemonBattleStats(pokemon).type;
  });

  if (types.some((t) => !t)) return inactive;

  const shared = types[0]!;
  if (!types.every((t) => t === shared)) return inactive;

  return {
    active: true,
    type: shared,
    label: TYPE_LABELS_PT[shared] ?? shared,
    bonusPercent: Math.round(TEAM_MONOTYPE_DAMAGE_BONUS * 100),
  };
}
