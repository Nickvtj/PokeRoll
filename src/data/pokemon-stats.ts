import { getPokedexInfo } from "@/data/pokedex";
import { getEvolutionStatMult } from "@/data/pokemon-evolution";
import { POKEMON_MAP } from "@/data/pokemon";
import { TEAM_MONOTYPE_DAMAGE_BONUS } from "@/data/economy-balance";
import type { Pokemon, Rarity } from "@/types";
import type { PokemonBattleStats, PokemonAbility } from "@/types/battle";

/** Multiplicadores de stats por raridade */
const RARITY_STAT_MULT: Record<Rarity, number> = {
  common: 1.0,
  uncommon: 1.12,
  rare: 1.28,
  epic: 1.48,
  legendary: 1.65,
};

/** Stats base por id — valores derivados + overrides para ícones */
const STAT_OVERRIDES: Partial<
  Record<number, Pick<PokemonBattleStats, "hp" | "attack" | "defense" | "speed">>
> = {
  25: { hp: 35, attack: 55, defense: 40, speed: 90 }, // Pikachu
  6: { hp: 78, attack: 84, defense: 78, speed: 100 }, // Charizard
  9: { hp: 79, attack: 83, defense: 100, speed: 78 }, // Blastoise
  3: { hp: 80, attack: 82, defense: 83, speed: 80 }, // Venusaur
  143: { hp: 160, attack: 110, defense: 65, speed: 30 }, // Snorlax
  52: { hp: 40, attack: 45, defense: 35, speed: 90 }, // Meowth
  113: { hp: 250, attack: 5, defense: 5, speed: 50 }, // Chansey
  149: { hp: 91, attack: 134, defense: 95, speed: 80 }, // Dragonite
  94: { hp: 60, attack: 65, defense: 60, speed: 110 }, // Gengar
  150: { hp: 106, attack: 110, defense: 90, speed: 130 }, // Mewtwo
  151: { hp: 100, attack: 100, defense: 100, speed: 100 }, // Mew
  144: { hp: 90, attack: 85, defense: 100, speed: 85 }, // Articuno
  145: { hp: 90, attack: 90, defense: 85, speed: 100 }, // Zapdos
};

/** Habilidades especiais por Pokémon */
export const POKEMON_ABILITIES: Record<number, PokemonAbility> = {
  25: {
    id: "thunder_shock",
    name: "Choque Elétrico",
    description: "Dano elétrico extra + chance de paralisar",
    type: "active",
    effect: "damage_boost",
    value: 1.4,
  },
  6: {
    id: "flamethrower",
    name: "Lança-chamas",
    description: "Ataque em área — atinge todos inimigos",
    type: "active",
    effect: "aoe",
    value: 0.75,
  },
  143: {
    id: "thick_fat",
    name: "Gordura Espessa",
    description: "+50% defesa",
    type: "passive",
    effect: "defense_boost",
    value: 1.5,
  },
  52: {
    id: "pay_day",
    name: "Pay Day",
    description: "+25% moedas em batalhas e minigame",
    type: "passive",
    effect: "coin_bonus",
    value: 0.25,
  },
  113: {
    id: "natural_cure",
    name: "Cura Natural",
    description: "+30% XP ganho",
    type: "passive",
    effect: "xp_bonus",
    value: 0.3,
  },
  149: {
    id: "inner_focus",
    name: "Foco Interior",
    description: "+15% dano em batalhas",
    type: "passive",
    effect: "battle_damage",
    value: 0.15,
  },
  94: {
    id: "cursed_body",
    name: "Corpo Amaldiçoado",
    description: "15% chance de crítico",
    type: "passive",
    effect: "crit_chance",
    value: 0.15,
  },
  150: {
    id: "pressure",
    name: "Pressão",
    description: "Dano devastador em alvo único",
    type: "active",
    effect: "damage_boost",
    value: 1.8,
  },
  133: {
    id: "adaptability",
    name: "Adaptabilidade",
    description: "+10% recompensa nos minigames",
    type: "passive",
    effect: "combo_bonus",
    value: 0.1,
  },
};

export function getPokemonBattleStats(pokemon: Pokemon): PokemonBattleStats {
  const mult = RARITY_STAT_MULT[pokemon.rarity];
  const evo = getEvolutionStatMult(pokemon.id);
  const override = STAT_OVERRIDES[pokemon.id];
  const info = getPokedexInfo(pokemon.id, pokemon.name);
  const type = info.types[0].toLowerCase();

  const baseHp = 40 + pokemon.id * 0.3;
  const baseAtk = 35 + pokemon.id * 0.25;
  const baseDef = 30 + pokemon.id * 0.2;
  const baseSpd = 25 + (pokemon.id % 50) * 0.8;

  return {
    hp: Math.round((override?.hp ?? baseHp) * mult * evo.hp),
    attack: Math.round((override?.attack ?? baseAtk) * mult * evo.attack),
    defense: Math.round((override?.defense ?? baseDef) * mult * evo.defense),
    speed: Math.round((override?.speed ?? baseSpd) * mult),
    type,
    ability: POKEMON_ABILITIES[pokemon.id],
  };
}

export function getTeamPassiveBonuses(pokemonIds: number[]) {
  let coinBonus = 0;
  let xpBonus = 0;
  let battleDamage = 0;
  let defenseBoost = 0;
  let critChance = 0;
  let comboBonus = 0;

  for (const id of pokemonIds) {
    const ability = POKEMON_ABILITIES[id];
    if (!ability || ability.type !== "passive") continue;
    switch (ability.effect) {
      case "coin_bonus":
        coinBonus += ability.value;
        break;
      case "xp_bonus":
        xpBonus += ability.value;
        break;
      case "battle_damage":
        battleDamage += ability.value;
        break;
      case "defense_boost":
        defenseBoost += ability.value;
        break;
      case "crit_chance":
        critChance += ability.value;
        break;
      case "combo_bonus":
        comboBonus += ability.value;
        break;
    }
  }

  if (pokemonIds.length >= 3) {
    const types = pokemonIds
      .map((id) => POKEMON_MAP[id])
      .filter(Boolean)
      .map((p) => getPokemonBattleStats(p).type);
    if (types.length === pokemonIds.length && types.every((t) => t === types[0])) {
      battleDamage += TEAM_MONOTYPE_DAMAGE_BONUS;
    }
  }

  return { coinBonus, xpBonus, battleDamage, defenseBoost, critChance, comboBonus };
}
