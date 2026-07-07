import { FLAPPY_CHARIZARD_LIFETIME_COINS } from "@/data/economy-balance";
import { getPokemonSpriteUrl } from "@/data/pokemon-sprites";

export type FlappySkinId = "zubat" | "pidgey" | "butterfree" | "charizard";

export interface FlappySkinConfig {
  id: FlappySkinId;
  label: string;
  dexNo: number;
  pokemonId: number;
  spriteUrl: string;
  unlockLabel: string;
  /** zubat = sempre; score = recorde minimo; lifetime = moedas totais ganhas */
  unlockType: "default" | "score" | "lifetime";
  unlockValue?: number;
  accent: string;
  scene: {
    location: string;
    skyTop: string;
    skyMid: string;
    skyBot: string;
    star: string;
    mountain: string;
    mountainDark: string;
    ground: string;
    groundHighlight: string;
    dirt: string;
    pipe: string;
    pipeHi: string;
    pipeLo: string;
    fog: string;
  };
}

export const FLAPPY_SKINS: FlappySkinConfig[] = [
  {
    id: "zubat",
    label: "Zubat",
    dexNo: 41,
    pokemonId: 41,
    spriteUrl: getPokemonSpriteUrl(41),
    unlockLabel: "Skin inicial",
    unlockType: "default",
    accent: "#a78bfa",
    scene: {
      location: "Caverna Noturna, Mt. Moon",
      skyTop: "#0c0a1a",
      skyMid: "#1e1b4b",
      skyBot: "#312e81",
      star: "#c4b5fd",
      mountain: "#3730a3",
      mountainDark: "#1e1b4b",
      ground: "#1e293b",
      groundHighlight: "#6366f1",
      dirt: "#0f172a",
      pipe: "#4338ca",
      pipeHi: "#818cf8",
      pipeLo: "#312e81",
      fog: "rgba(167, 139, 250, 0.08)",
    },
  },
  {
    id: "pidgey",
    label: "Pidgey",
    dexNo: 16,
    pokemonId: 16,
    spriteUrl: getPokemonSpriteUrl(16),
    unlockLabel: "Alcance 15 pontos",
    unlockType: "score",
    unlockValue: 15,
    accent: "#fcd34d",
    scene: {
      location: "Rota 1, Campo ensolarado",
      skyTop: "#0c4a6e",
      skyMid: "#0284c7",
      skyBot: "#38bdf8",
      star: "#fef08a",
      mountain: "#166534",
      mountainDark: "#14532d",
      ground: "#22c55e",
      groundHighlight: "#86efac",
      dirt: "#15803d",
      pipe: "#78716c",
      pipeHi: "#a8a29e",
      pipeLo: "#57534e",
      fog: "rgba(254, 240, 138, 0.06)",
    },
  },
  {
    id: "butterfree",
    label: "Butterfree",
    dexNo: 12,
    pokemonId: 12,
    spriteUrl: getPokemonSpriteUrl(12),
    unlockLabel: "Alcance 50 pontos",
    unlockType: "score",
    unlockValue: 50,
    accent: "#93c5fd",
    scene: {
      location: "Floresta Viridian, Névoa matinal",
      skyTop: "#134e4a",
      skyMid: "#0d9488",
      skyBot: "#5eead4",
      star: "#bae6fd",
      mountain: "#047857",
      mountainDark: "#064e3b",
      ground: "#059669",
      groundHighlight: "#6ee7b7",
      dirt: "#065f46",
      pipe: "#475569",
      pipeHi: "#94a3b8",
      pipeLo: "#334155",
      fog: "rgba(186, 230, 253, 0.1)",
    },
  },
  {
    id: "charizard",
    label: "Charizard",
    dexNo: 6,
    pokemonId: 6,
    spriteUrl: getPokemonSpriteUrl(6),
    unlockLabel: `Colete ${FLAPPY_CHARIZARD_LIFETIME_COINS.toLocaleString("pt-BR")} moedas no total`,
    unlockType: "lifetime",
    unlockValue: FLAPPY_CHARIZARD_LIFETIME_COINS,
    accent: "#fb923c",
    scene: {
      location: "Vulcão, Céu em chamas",
      skyTop: "#450a0a",
      skyMid: "#c2410c",
      skyBot: "#fb923c",
      star: "#fde68a",
      mountain: "#7c2d12",
      mountainDark: "#431407",
      ground: "#b45309",
      groundHighlight: "#fbbf24",
      dirt: "#78350f",
      pipe: "#57534e",
      pipeHi: "#78716c",
      pipeLo: "#292524",
      fog: "rgba(251, 146, 60, 0.12)",
    },
  },
];
export function getFlappySkin(id: string): FlappySkinConfig {
  return FLAPPY_SKINS.find((s) => s.id === id) ?? FLAPPY_SKINS[0];
}

export function isFlappySkinUnlocked(
  skin: FlappySkinConfig,
  bestScore: number,
  lifetimeCoins: number,
  unlockedSkins: string[]
): boolean {
  if (skin.unlockType === "default") return true;
  if (unlockedSkins.includes(skin.id)) return true;
  if (skin.unlockType === "score" && skin.unlockValue != null) {
    return bestScore >= skin.unlockValue;
  }
  if (skin.unlockType === "lifetime" && skin.unlockValue != null) {
    return lifetimeCoins >= skin.unlockValue;
  }
  return false;
}

export function computeNewFlappyUnlocks(
  bestScore: number,
  lifetimeCoins: number,
  unlockedSkins: string[]
): FlappySkinId[] {
  const next = [...unlockedSkins];
  const added: FlappySkinId[] = [];

  for (const skin of FLAPPY_SKINS) {
    if (next.includes(skin.id)) continue;
    if (isFlappySkinUnlocked(skin, bestScore, lifetimeCoins, next)) {
      next.push(skin.id);
      added.push(skin.id);
    }
  }

  return added;
}
