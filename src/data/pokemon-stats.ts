import { getPokedexInfo } from "@/data/pokedex";
import { getBaseStats } from "@/data/pokemon-base-stats";
import { POKEMON_MAP } from "@/data/pokemon";
import { TEAM_MONOTYPE_DAMAGE_BONUS } from "@/data/economy-balance";
import { BATTLE_TEAM_SIZE } from "@/data/battle-theme";
import type { Pokemon } from "@/types";
import type { PokemonBattleStats, PokemonAbility } from "@/types/battle";

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
    description: "Ataque em área, atinge todos inimigos",
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
  const base = getBaseStats(pokemon.id);
  const info = getPokedexInfo(pokemon.id, pokemon.name);
  const type = info.types[0].toLowerCase();

  return {
    hp: base.hp,
    attack: base.attack,
    defense: base.defense,
    speed: base.speed,
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

  if (pokemonIds.length >= BATTLE_TEAM_SIZE) {
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
