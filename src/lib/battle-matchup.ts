import { getDualTypeEffectiveness, getDefenderTypes } from "@/data/type-chart";
import type { BattleFighter, BattleHitEffectiveness } from "@/types/battle";

export interface TypeMatchupHint {
  kind: BattleHitEffectiveness;
  label: string;
  mult: number;
}

function effectivenessFromMult(mult: number): BattleHitEffectiveness {
  if (mult === 0) return "immune";
  if (mult > 1) return "super";
  if (mult < 1) return "weak";
  return "normal";
}

function labelFromMult(mult: number, label: string | null): string {
  if (mult === 0) return "Imune";
  if (mult > 1) return label ?? "Super efetivo";
  if (mult < 1) return label ?? "Pouco efetivo";
  return "Convencional";
}

/** Melhor golpe do atacante contra um alvo específico */
export function getBestMoveMatchup(
  actor: BattleFighter,
  target: BattleFighter
): TypeMatchupHint {
  let bestMult = 0;
  let bestLabel: string | null = null;

  for (const move of actor.equippedMoves ?? []) {
    if (move.category === "status") continue;
    const { multiplier, label } = getDualTypeEffectiveness(
      move.type,
      getDefenderTypes(target.pokemon.id, target.pokemon.name)
    );
    if (multiplier > bestMult) {
      bestMult = multiplier;
      bestLabel = label;
    }
  }

  if (bestMult === 0 && (actor.equippedMoves?.length ?? 0) > 0) {
    return { kind: "normal", label: "Sem golpe útil", mult: 1 };
  }

  return {
    kind: effectivenessFromMult(bestMult || 1),
    label: labelFromMult(bestMult || 1, bestLabel),
    mult: bestMult || 1,
  };
}

/** Melhor oportunidade do Pokémon contra qualquer inimigo vivo */
export function getActorBestOpportunity(
  actor: BattleFighter,
  enemies: BattleFighter[]
): TypeMatchupHint | null {
  const living = enemies.filter((e) => e.currentHp > 0);
  if (living.length === 0) return null;

  let best: TypeMatchupHint | null = null;
  for (const enemy of living) {
    const matchup = getBestMoveMatchup(actor, enemy);
    if (!best || matchup.mult > best.mult) best = matchup;
  }
  return best;
}
