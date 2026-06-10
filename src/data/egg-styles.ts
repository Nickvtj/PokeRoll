import type { CapsuleId } from "@/types/capsule";

/** Tipos oficiais do Pokémon GO (sprites PokeMiners/pogo_assets) */
export type PokemonGoEggType = "2km" | "5km" | "7km" | "10km" | "12km";

/** Sprites extraídos do APK do Pokémon GO — PokeMiners/pogo_assets */
export const EGG_SPRITES: Record<PokemonGoEggType, string> = {
  "2km": "/sprites/eggs/egg-2km.png",
  "5km": "/sprites/eggs/egg-5km.png",
  "7km": "/sprites/eggs/egg-7km.png",
  "10km": "/sprites/eggs/egg-10km.png",
  "12km": "/sprites/eggs/egg-12km.png",
};

export const EGG_TYPE_BY_CAPSULE: Record<CapsuleId, PokemonGoEggType> = {
  "rota-1": "2km",
  viridian: "2km",
  "mt-moon": "5km",
  marinha: "5km",
  lavender: "10km",
  dojo: "5km",
  safari: "7km",
  fossil: "5km",
  silph: "10km",
  mestra: "12km",
};

/** Cores dos cards alinhadas aos ovos oficiais do GO */
export const EGG_CARD_THEMES: Record<
  PokemonGoEggType,
  { gradient: string; borderColor: string; glow: string }
> = {
  "2km": {
    gradient: "from-emerald-600/16 via-green-950/22 to-slate-900/50",
    borderColor: "rgba(74, 222, 128, 0.32)",
    glow: "rgba(74, 222, 128, 0.2)",
  },
  "5km": {
    gradient: "from-orange-500/16 via-amber-950/22 to-slate-900/50",
    borderColor: "rgba(251, 146, 60, 0.32)",
    glow: "rgba(251, 146, 60, 0.2)",
  },
  "7km": {
    gradient: "from-pink-500/14 via-amber-900/20 to-slate-900/50",
    borderColor: "rgba(244, 114, 182, 0.32)",
    glow: "rgba(244, 114, 182, 0.2)",
  },
  "10km": {
    gradient: "from-violet-600/16 via-purple-950/24 to-slate-900/50",
    borderColor: "rgba(167, 139, 250, 0.34)",
    glow: "rgba(167, 139, 250, 0.22)",
  },
  "12km": {
    gradient: "from-red-600/16 via-rose-950/24 to-slate-900/50",
    borderColor: "rgba(248, 113, 113, 0.36)",
    glow: "rgba(248, 113, 113, 0.22)",
  },
};

export function getEggCardTheme(capsuleId: CapsuleId) {
  return EGG_CARD_THEMES[EGG_TYPE_BY_CAPSULE[capsuleId]];
}

export function getEggSprite(capsuleId: CapsuleId): string {
  const type = EGG_TYPE_BY_CAPSULE[capsuleId];
  return EGG_SPRITES[type];
}

export function getEggType(capsuleId: CapsuleId): PokemonGoEggType {
  return EGG_TYPE_BY_CAPSULE[capsuleId];
}
