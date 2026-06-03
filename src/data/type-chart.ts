/** Chart de efetividade Pokémon — tipos em minúsculas */

export const TYPE_STRONG_AGAINST: Record<string, string[]> = {
  fire: ["grass", "ice", "bug", "steel"],
  water: ["fire", "ground", "rock"],
  grass: ["water", "ground", "rock"],
  electric: ["water", "flying"],
  ice: ["grass", "ground", "flying", "dragon"],
  fighting: ["normal", "ice", "rock", "dark", "steel"],
  poison: ["grass", "fairy"],
  ground: ["fire", "electric", "poison", "rock", "steel"],
  flying: ["grass", "fighting", "bug"],
  psychic: ["fighting", "poison"],
  bug: ["grass", "psychic", "dark"],
  rock: ["fire", "ice", "flying", "bug"],
  ghost: ["psychic", "ghost"],
  dragon: ["dragon"],
  dark: ["psychic", "ghost"],
  steel: ["ice", "rock", "fairy"],
  fairy: ["fighting", "dragon", "dark"],
  normal: [],
};

export const TYPE_WEAK_AGAINST: Record<string, string[]> = {
  fire: ["water", "ground", "rock"],
  water: ["electric", "grass"],
  grass: ["fire", "ice", "poison", "flying", "bug"],
  electric: ["ground"],
  ice: ["fire", "fighting", "rock", "steel"],
  fighting: ["flying", "psychic", "fairy"],
  poison: ["ground", "psychic"],
  ground: ["water", "grass", "ice"],
  flying: ["electric", "ice", "rock"],
  psychic: ["bug", "ghost", "dark"],
  bug: ["fire", "flying", "rock"],
  rock: ["water", "grass", "fighting", "ground", "steel"],
  ghost: ["ghost", "dark"],
  dragon: ["ice", "dragon", "fairy"],
  dark: ["fighting", "bug", "fairy"],
  steel: ["fire", "fighting", "ground"],
  fairy: ["poison", "steel"],
  normal: ["fighting", "rock", "steel"],
};

export const TYPE_IMMUNE_TO: Record<string, string[]> = {
  normal: ["ghost"],
  electric: ["ground"],
  fighting: ["ghost"],
  poison: ["steel"],
  ground: ["flying"],
  ghost: ["normal", "fighting"],
};

export interface TypeEffectResult {
  multiplier: number;
  label: string | null;
}

export function normalizeType(type: string): string {
  return type.toLowerCase();
}

export function getTypeEffectiveness(
  attackType: string,
  defendType: string
): TypeEffectResult {
  const atk = normalizeType(attackType);
  const def = normalizeType(defendType);

  if (TYPE_IMMUNE_TO[def]?.includes(atk)) {
    return { multiplier: 0, label: "imune" };
  }
  if (TYPE_STRONG_AGAINST[atk]?.includes(def)) {
    return { multiplier: 2.0, label: "super efetivo" };
  }
  if (TYPE_WEAK_AGAINST[atk]?.includes(def)) {
    return { multiplier: 0.5, label: "pouco efetivo" };
  }
  return { multiplier: 1, label: null };
}

export function getTypesStrongAgainst(defenderType: string): string[] {
  const def = normalizeType(defenderType);
  return Object.entries(TYPE_STRONG_AGAINST)
    .filter(([, weak]) => weak.includes(def))
    .map(([type]) => type);
}

export const TYPE_LABELS_PT: Record<string, string> = {
  fire: "Fogo",
  water: "Água",
  grass: "Planta",
  electric: "Elétrico",
  ice: "Gelo",
  fighting: "Lutador",
  poison: "Veneno",
  ground: "Terra",
  flying: "Voador",
  psychic: "Psíquico",
  bug: "Inseto",
  rock: "Pedra",
  ghost: "Fantasma",
  dragon: "Dragão",
  dark: "Sombrio",
  steel: "Aço",
  fairy: "Fada",
  normal: "Normal",
};
