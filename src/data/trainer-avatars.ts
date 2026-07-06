import {
  getPokemonSpriteUrl,
  getPokemonNormalizedSpriteUrl,
} from "@/data/pokemon-sprites";

/** Avatares desbloqueados a cada 5 níveis da conta (+ Pokémon da coleção) */

export type AvatarKind = "default" | "trainer" | "pokemon";

export interface TrainerAvatarDef {
  id: string;
  kind: "default" | "trainer";
  unlockLevel: number;
  label: string;
  image?: string;
}

export const AVATAR_UNLOCK_INTERVAL = 5;
export const POKEMON_AVATAR_MIN_LEVEL = 5;

export const TRAINER_AVATARS: TrainerAvatarDef[] = [
  { id: "default", kind: "default", unlockLevel: 1, label: "Inicial" },
  {
    id: "trainer-youngster",
    kind: "trainer",
    unlockLevel: 5,
    label: "Jovem Treinador",
    image: getPokemonNormalizedSpriteUrl(25),
  },
  {
    id: "trainer-hiker",
    kind: "trainer",
    unlockLevel: 10,
    label: "Montanhista",
    image: getPokemonNormalizedSpriteUrl(95),
  },
  {
    id: "trainer-swimmer",
    kind: "trainer",
    unlockLevel: 15,
    label: "Nadador",
    image: getPokemonNormalizedSpriteUrl(121),
  },
  {
    id: "trainer-ace",
    kind: "trainer",
    unlockLevel: 20,
    label: "Áss Ace",
    image: getPokemonNormalizedSpriteUrl(65),
  },
  {
    id: "trainer-psychic",
    kind: "trainer",
    unlockLevel: 25,
    label: "Psíquico",
    image: getPokemonNormalizedSpriteUrl(94),
  },
  {
    id: "trainer-dragon",
    kind: "trainer",
    unlockLevel: 30,
    label: "Domador",
    image: getPokemonNormalizedSpriteUrl(149),
  },
  {
    id: "trainer-veteran",
    kind: "trainer",
    unlockLevel: 35,
    label: "Veterano",
    image: getPokemonNormalizedSpriteUrl(130),
  },
  {
    id: "trainer-elite",
    kind: "trainer",
    unlockLevel: 40,
    label: "Elite",
    image: getPokemonNormalizedSpriteUrl(6),
  },
  {
    id: "trainer-champion",
    kind: "trainer",
    unlockLevel: 45,
    label: "Campeão",
    image: getPokemonNormalizedSpriteUrl(150),
  },
  {
    id: "trainer-master",
    kind: "trainer",
    unlockLevel: 50,
    label: "Mestre",
    image: getPokemonNormalizedSpriteUrl(144),
  },
];

export function getUnlockedTrainerAvatars(accountLevel: number): TrainerAvatarDef[] {
  return TRAINER_AVATARS.filter((a) => accountLevel >= a.unlockLevel);
}

export function canUsePokemonAvatar(accountLevel: number): boolean {
  return accountLevel >= POKEMON_AVATAR_MIN_LEVEL;
}

export function parseAvatarId(id: string): { kind: AvatarKind; ref: string } {
  if (id === "default" || !id.includes(":")) {
    return { kind: "default", ref: "default" };
  }
  const [kind, ref] = id.split(":");
  if (kind === "pokemon") return { kind: "pokemon", ref };
  if (kind === "trainer") return { kind: "trainer", ref };
  return { kind: "default", ref: "default" };
}

export function buildPokemonAvatarId(pokemonId: number): string {
  return `pokemon:${pokemonId}`;
}

export function buildTrainerAvatarId(trainerId: string): string {
  return trainerId === "default" ? "default" : `trainer:${trainerId}`;
}

export function getAvatarImageUrl(avatarId: string): string | undefined {
  const parsed = parseAvatarId(avatarId);
  if (parsed.kind === "pokemon") {
    const id = Number(parsed.ref);
    if (id >= 1 && id <= 151) return getPokemonSpriteUrl(id);
  }
  if (parsed.kind === "trainer") {
    return TRAINER_AVATARS.find((a) => a.id === parsed.ref)?.image;
  }
  return undefined;
}
