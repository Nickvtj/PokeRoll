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
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png",
  },
  {
    id: "trainer-hiker",
    kind: "trainer",
    unlockLevel: 10,
    label: "Montanhista",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/95.png",
  },
  {
    id: "trainer-swimmer",
    kind: "trainer",
    unlockLevel: 15,
    label: "Nadador",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/121.png",
  },
  {
    id: "trainer-ace",
    kind: "trainer",
    unlockLevel: 20,
    label: "Áss Ace",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/65.png",
  },
  {
    id: "trainer-psychic",
    kind: "trainer",
    unlockLevel: 25,
    label: "Psíquico",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/94.png",
  },
  {
    id: "trainer-dragon",
    kind: "trainer",
    unlockLevel: 30,
    label: "Domador",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/149.png",
  },
  {
    id: "trainer-veteran",
    kind: "trainer",
    unlockLevel: 35,
    label: "Veterano",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/130.png",
  },
  {
    id: "trainer-elite",
    kind: "trainer",
    unlockLevel: 40,
    label: "Elite",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/6.png",
  },
  {
    id: "trainer-champion",
    kind: "trainer",
    unlockLevel: 45,
    label: "Campeão",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/150.png",
  },
  {
    id: "trainer-master",
    kind: "trainer",
    unlockLevel: 50,
    label: "Mestre",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/144.png",
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
