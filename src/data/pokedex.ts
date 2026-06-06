import type { PokedexInfo } from "@/types";

/** Tipos clássicos Gen 1 (estilo Fire Red) */
const TYPES: Record<number, [string] | [string, string]> = {
  1: ["Grass", "Poison"], 2: ["Grass", "Poison"], 3: ["Grass", "Poison"],
  4: ["Fire"], 5: ["Fire"], 6: ["Fire"],
  7: ["Water"], 8: ["Water"], 9: ["Water"],
  10: ["Bug"], 11: ["Bug"], 12: ["Bug", "Flying"],
  13: ["Bug", "Poison"], 14: ["Bug", "Poison"], 15: ["Bug", "Poison"],
  16: ["Normal", "Flying"], 17: ["Normal", "Flying"], 18: ["Normal", "Flying"],
  19: ["Normal"], 20: ["Normal"],
  21: ["Normal", "Flying"], 22: ["Normal", "Flying"],
  23: ["Poison"], 24: ["Poison"],
  25: ["Electric"], 26: ["Electric"],
  27: ["Ground"], 28: ["Ground"],
  29: ["Poison"], 30: ["Poison"], 31: ["Poison", "Ground"],
  32: ["Poison"], 33: ["Poison"], 34: ["Poison", "Ground"],
  35: ["Normal"], 36: ["Normal"],
  37: ["Fire"], 38: ["Fire"],
  39: ["Normal"], 40: ["Normal"],
  41: ["Poison", "Flying"], 42: ["Poison", "Flying"],
  43: ["Grass", "Poison"], 44: ["Grass", "Poison"], 45: ["Grass", "Poison"],
  46: ["Bug", "Grass"], 47: ["Bug", "Grass"],
  48: ["Bug", "Poison"], 49: ["Bug", "Poison"],
  50: ["Ground"], 51: ["Ground"],
  52: ["Normal"], 53: ["Normal"],
  54: ["Water"], 55: ["Water"],
  56: ["Fighting"], 57: ["Fighting"],
  58: ["Fire"], 59: ["Fire"],
  60: ["Water"], 61: ["Water"], 62: ["Water", "Fighting"],
  63: ["Psychic"], 64: ["Psychic"], 65: ["Psychic"],
  66: ["Fighting"], 67: ["Fighting"], 68: ["Fighting"],
  69: ["Grass", "Poison"], 70: ["Grass", "Poison"], 71: ["Grass", "Poison"],
  72: ["Water", "Poison"], 73: ["Water", "Poison"],
  74: ["Rock", "Ground"], 75: ["Rock", "Ground"], 76: ["Rock", "Ground"],
  77: ["Fire"], 78: ["Fire"],
  79: ["Water", "Psychic"], 80: ["Water", "Psychic"],
  81: ["Electric"], 82: ["Electric"],
  83: ["Normal", "Flying"], 84: ["Normal", "Flying"], 85: ["Normal", "Flying"],
  86: ["Water"], 87: ["Water"],
  88: ["Poison"], 89: ["Poison"],
  90: ["Water"], 91: ["Water", "Ice"],
  92: ["Ghost", "Poison"], 93: ["Ghost", "Poison"], 94: ["Ghost", "Poison"],
  95: ["Rock", "Ground"],
  96: ["Psychic"], 97: ["Psychic"],
  98: ["Water"], 99: ["Water"],
  100: ["Electric"], 101: ["Electric"],
  102: ["Grass", "Psychic"], 103: ["Grass", "Psychic"],
  104: ["Ground"], 105: ["Ground"],
  106: ["Fighting"], 107: ["Fighting"],
  108: ["Normal"],
  109: ["Poison"], 110: ["Poison"],
  111: ["Ground", "Rock"], 112: ["Ground", "Rock"],
  113: ["Normal"], 114: ["Grass"],
  115: ["Normal"],
  116: ["Water"], 117: ["Water"],
  118: ["Water"], 119: ["Water"],
  120: ["Water"], 121: ["Water", "Psychic"],
  122: ["Psychic"], 123: ["Bug", "Flying"],
  124: ["Ice", "Psychic"], 125: ["Electric"], 126: ["Fire"],
  127: ["Bug"], 128: ["Normal"],
  129: ["Water"], 130: ["Water", "Flying"],
  131: ["Water", "Ice"], 132: ["Normal"],
  133: ["Normal"], 134: ["Water"], 135: ["Electric"], 136: ["Fire"],
  137: ["Normal"],
  138: ["Rock", "Water"], 139: ["Rock", "Water"],
  140: ["Rock", "Water"], 141: ["Rock", "Water"],
  142: ["Rock", "Flying"],
  143: ["Normal"],
  144: ["Ice", "Flying"], 145: ["Electric", "Flying"], 146: ["Fire", "Flying"],
  147: ["Dragon"], 148: ["Dragon"], 149: ["Dragon", "Flying"],
  150: ["Psychic"],
  151: ["Psychic"],
};

const CATEGORIES: Record<number, string> = {
  1: "Pokémon Semente", 4: "Pokémon Lagarto", 7: "Pokémon Tartaruga",
  25: "Pokémon Rato", 39: "Pokémon Balão", 54: "Pokémon Pato",
  63: "Pokémon Psi", 92: "Pokémon Gás", 129: "Pokémon Peixe",
  131: "Pokémon Transporte", 133: "Pokémon Evolução", 143: "Pokémon Cochilo",
  144: "Pokémon Congelante", 145: "Pokémon Elétrico", 146: "Pokémon Chama",
  150: "Pokémon Genético",
  151: "Pokémon Novo",
};

const DESCRIPTIONS: Record<number, string> = {
  1: "Um estranho Pokémon que nasce com uma semente nas costas. A semente cresce conforme o Pokémon amadurece.",
  4: "Obviamente prefere lugares quentes. Quando chove, dizem que o vapor sai da ponta de sua cauda.",
  7: "Quando retrae seu longo pescoço no casco, dispara água com incrível força por pressão.",
  25: "Quando vários destes Pokémon se juntam, a eletricidade no ar pode causar tempestades de raios.",
  6: "Cospe fogo tão quente que derrete rochas. Causa incêndios florestais sem querer.",
  9: "Um Pokémon brutal com jatos de água capazes de perfurar o aço. Lidera os seus com orgulho.",
  94: "Esconde-se na escuridão total. Dizem que onde Gengar se esconde, a temperatura cai 5°C.",
  131: "Um Pokémon gentil que atravessa oceanos ajudando pessoas em apuros. Adora transportar outros.",
  143: "Come mais de 400 kg de comida por dia. Depois de comer, cai num sono profundo.",
  144: "Uma lendária ave Pokémon. Congela a umidade do ar e faz nevar enquanto voa.",
  145: "Uma lendária ave Pokémon. Dizem que aparece nas nuvens escuras com um estrondo ensurdecedor.",
  146: "Uma lendária ave Pokémon. Dizem que vive no interior de vulcões ativos.",
  150: "Foi criado por um cientista após anos de horríveis experimentos de engenharia genética.",
  151: "Dizem que possui o código genético de todos os Pokémon. Só aparece para treinadores que completaram todas as conquistas.",
};

/** Altura (m) e peso (kg) aproximados */
const HEIGHT: Record<number, number> = {
  25: 0.4, 6: 1.7, 9: 1.6, 143: 2.1, 150: 2.0, 131: 2.5, 129: 0.9,
};
const WEIGHT: Record<number, number> = {
  25: 6.0, 6: 90.5, 9: 85.5, 143: 460.0, 150: 122.0, 131: 220.0, 129: 10.0,
};

export function getPokedexInfo(id: number, name: string): PokedexInfo {
  return {
    types: TYPES[id] ?? ["Normal"],
    category: CATEGORIES[id] ?? "Pokémon",
    description:
      DESCRIPTIONS[id] ??
      `${name} habita a região de Kanto. Treinadores ao redor do mundo colecionam figurinhas desta espécie rara e misteriosa.`,
    height: HEIGHT[id] ?? 1.0 + (id % 10) * 0.1,
    weight: WEIGHT[id] ?? 20 + (id % 15) * 5,
  };
}

export const TYPE_COLORS: Record<string, string> = {
  Normal: "#A8A878",
  Fire: "#F08030",
  Water: "#6890F0",
  Grass: "#78C850",
  Electric: "#F8D030",
  Ice: "#98D8D8",
  Fighting: "#C03028",
  Poison: "#A040A0",
  Ground: "#E0C068",
  Flying: "#A890F0",
  Psychic: "#F85888",
  Bug: "#A8B820",
  Rock: "#B8A038",
  Ghost: "#705898",
  Dragon: "#7038F8",
};

export function getTypeColor(type: string): string {
  return TYPE_COLORS[type] ?? "#A8A878";
}
