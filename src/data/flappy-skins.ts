import { FLAPPY_CHARIZARD_LIFETIME_COINS } from "@/data/economy-balance";
import { getPokemonRetroSpriteUrl } from "@/data/pokemon-sprites";

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
}

export const FLAPPY_SKINS: FlappySkinConfig[] = [
  {
    id: "zubat",
    label: "Zubat",
    dexNo: 41,
    pokemonId: 41,
    spriteUrl: getPokemonRetroSpriteUrl(41),
    unlockLabel: "Skin inicial",
    unlockType: "default",
    accent: "#a78bfa",
  },
  {
    id: "pidgey",
    label: "Pidgey",
    dexNo: 16,
    pokemonId: 16,
    spriteUrl: getPokemonRetroSpriteUrl(16),
    unlockLabel: "Alcance 15 pontos",
    unlockType: "score",
    unlockValue: 15,
    accent: "#fcd34d",
  },
  {
    id: "butterfree",
    label: "Butterfree",
    dexNo: 12,
    pokemonId: 12,
    spriteUrl: getPokemonRetroSpriteUrl(12),
    unlockLabel: "Alcance 50 pontos",
    unlockType: "score",
    unlockValue: 50,
    accent: "#93c5fd",
  },
  {
    id: "charizard",
    label: "Charizard",
    dexNo: 6,
    pokemonId: 6,
    spriteUrl: getPokemonRetroSpriteUrl(6),
    unlockLabel: `Colete ${FLAPPY_CHARIZARD_LIFETIME_COINS.toLocaleString("pt-BR")} moedas no total`,
    unlockType: "lifetime",
    unlockValue: FLAPPY_CHARIZARD_LIFETIME_COINS,
    accent: "#fb923c",
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
