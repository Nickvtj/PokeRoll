import type { Pokemon, Rarity } from "@/types";
import { getPokemonSpriteUrl } from "@/data/pokemon-sprites";

const GEN1_NAMES: Record<number, string> = {
  1: "Bulbasaur", 2: "Ivysaur", 3: "Venusaur", 4: "Charmander", 5: "Charmeleon",
  6: "Charizard", 7: "Squirtle", 8: "Wartortle", 9: "Blastoise", 10: "Caterpie",
  11: "Metapod", 12: "Butterfree", 13: "Weedle", 14: "Kakuna", 15: "Beedrill",
  16: "Pidgey", 17: "Pidgeotto", 18: "Pidgeot", 19: "Rattata", 20: "Raticate",
  21: "Spearow", 22: "Fearow", 23: "Ekans", 24: "Arbok", 25: "Pikachu",
  26: "Raichu", 27: "Sandshrew", 28: "Sandslash", 29: "Nidoran♀", 30: "Nidorina",
  31: "Nidoqueen", 32: "Nidoran♂", 33: "Nidorino", 34: "Nidoking", 35: "Clefairy",
  36: "Clefable", 37: "Vulpix", 38: "Ninetales", 39: "Jigglypuff", 40: "Wigglytuff",
  41: "Zubat", 42: "Golbat", 43: "Oddish", 44: "Gloom", 45: "Vileplume",
  46: "Paras", 47: "Parasect", 48: "Venonat", 49: "Venomoth", 50: "Diglett",
  51: "Dugtrio", 52: "Meowth", 53: "Persian", 54: "Psyduck", 55: "Golduck",
  56: "Mankey", 57: "Primeape", 58: "Growlithe", 59: "Arcanine", 60: "Poliwag",
  61: "Poliwhirl", 62: "Poliwrath", 63: "Abra", 64: "Kadabra", 65: "Alakazam",
  66: "Machop", 67: "Machoke", 68: "Machamp", 69: "Bellsprout", 70: "Weepinbell",
  71: "Victreebel", 72: "Tentacool", 73: "Tentacruel", 74: "Geodude", 75: "Graveler",
  76: "Golem", 77: "Ponyta", 78: "Rapidash", 79: "Slowpoke", 80: "Slowbro",
  81: "Magnemite", 82: "Magneton", 83: "Farfetch'd", 84: "Doduo", 85: "Dodrio",
  86: "Seel", 87: "Dewgong", 88: "Grimer", 89: "Muk", 90: "Shellder",
  91: "Cloyster", 92: "Gastly", 93: "Haunter", 94: "Gengar", 95: "Onix",
  96: "Drowzee", 97: "Hypno", 98: "Krabby", 99: "Kingler", 100: "Voltorb",
  101: "Electrode", 102: "Exeggcute", 103: "Exeggutor", 104: "Cubone", 105: "Marowak",
  106: "Hitmonlee", 107: "Hitmonchan", 108: "Lickitung", 109: "Koffing", 110: "Weezing",
  111: "Rhyhorn", 112: "Rhydon", 113: "Chansey", 114: "Tangela", 115: "Kangaskhan",
  116: "Horsea", 117: "Seadra", 118: "Goldeen", 119: "Seaking", 120: "Staryu",
  121: "Starmie", 122: "Mr. Mime", 123: "Scyther", 124: "Jynx", 125: "Electabuzz",
  126: "Magmar", 127: "Pinsir", 128: "Tauros", 129: "Magikarp", 130: "Gyarados",
  131: "Lapras", 132: "Ditto", 133: "Eevee", 134: "Vaporeon", 135: "Jolteon",
  136: "Flareon", 137: "Porygon", 138: "Omanyte", 139: "Omastar", 140: "Kabuto",
  141: "Kabutops", 142: "Aerodactyl", 143: "Snorlax", 144: "Articuno", 145: "Zapdos",
  146: "Moltres", 147: "Dratini", 148: "Dragonair", 149: "Dragonite", 150: "Mewtwo",
};

/** Atribuição manual de raridade — finais fortes sobem; rotas fracas ficam comuns */
const RARITY_MAP: Record<number, Rarity> = {
  // Lendários (4)
  144: "legendary",
  145: "legendary",
  146: "legendary",
  150: "legendary",

  // Épicos — finais icônicos, pseudo-lendários e singles raríssimos
  3: "epic",
  6: "epic",
  9: "epic",
  18: "epic",
  26: "epic",
  31: "epic",
  34: "epic",
  59: "epic",
  65: "epic",
  68: "epic",
  94: "epic",
  103: "epic",
  112: "epic",
  113: "epic",
  121: "epic",
  130: "epic",
  131: "epic",
  142: "epic",
  143: "epic",
  149: "epic",

  // Raros — finais sólidos, evoluções difíceis e singles valiosos
  5: "rare",
  8: "rare",
  15: "rare",
  22: "rare",
  24: "rare",
  36: "rare",
  38: "rare",
  40: "rare",
  45: "rare",
  47: "rare",
  49: "rare",
  51: "rare",
  53: "rare",
  55: "rare",
  57: "rare",
  62: "rare",
  71: "rare",
  73: "rare",
  76: "rare",
  91: "rare",
  106: "rare",
  107: "rare",
  115: "rare",
  122: "rare",
  123: "rare",
  124: "rare",
  125: "rare",
  126: "rare",
  127: "rare",
  128: "rare",
  132: "rare",
  134: "rare",
  135: "rare",
  136: "rare",
  137: "rare",
  139: "rare",
  141: "rare",

  // Incomuns — intermediários e populares (rotas iniciais ficam comuns por padrão)
  2: "uncommon",
  11: "uncommon",
  12: "uncommon",
  14: "uncommon",
  17: "uncommon",
  25: "uncommon",
  30: "uncommon",
  33: "uncommon",
  35: "uncommon",
  37: "uncommon",
  42: "uncommon",
  44: "uncommon",
  61: "uncommon",
  63: "uncommon",
  64: "uncommon",
  66: "uncommon",
  67: "uncommon",
  70: "uncommon",
  75: "uncommon",
  78: "uncommon",
  80: "uncommon",
  81: "uncommon",
  82: "uncommon",
  83: "uncommon",
  85: "uncommon",
  87: "uncommon",
  89: "uncommon",
  93: "uncommon",
  95: "uncommon",
  97: "uncommon",
  99: "uncommon",
  101: "uncommon",
  105: "uncommon",
  108: "uncommon",
  109: "uncommon",
  110: "uncommon",
  114: "uncommon",
  116: "uncommon",
  117: "uncommon",
  119: "uncommon",
  120: "uncommon",
  129: "uncommon",
  133: "uncommon",
  138: "uncommon",
  140: "uncommon",
  147: "uncommon",
  148: "uncommon",
};

function getRarity(id: number): Rarity {
  return RARITY_MAP[id] ?? "common";
}

function getImageUrl(id: number): string {
  return getPokemonSpriteUrl(id);
}

function createPokemon(id: number): Pokemon {
  return {
    id,
    name: GEN1_NAMES[id],
    image: getImageUrl(id),
    rarity: getRarity(id),
    generation: 1,
    weight: 1,
  };
}

/** 150 Pokémon da 1ª geração (IDs 1–150) */
export const POKEMON_LIST: Pokemon[] = Array.from({ length: 150 }, (_, i) =>
  createPokemon(i + 1)
);

export const POKEMON_MAP: Record<number, Pokemon> = Object.fromEntries(
  POKEMON_LIST.map((p) => [p.id, p])
);

export const TOTAL_POKEMON = POKEMON_LIST.length;

export function getPokemonById(id: number): Pokemon | undefined {
  return POKEMON_MAP[id];
}

export function getPokemonByRarity(rarity: Rarity): Pokemon[] {
  return POKEMON_LIST.filter((p) => p.rarity === rarity);
}
