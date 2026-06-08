import {
  FALLBACK_TRAINER_SPRITE,
  getTrainerSpritePath,
} from "@/data/trainer-sprites";
import { parseAvatarId, getAvatarImageUrl } from "@/data/trainer-avatars";
import type { EliteId, GymId } from "@/types/gym";

export { FALLBACK_TRAINER_SPRITE };

export interface BattleTrainerPortrait {
  name: string;
  spriteUrl: string;
  /** Imagem do perfil (Pokémon/avatar) em vez de sprite de treinador pixelado */
  isProfileAvatar?: boolean;
}

const TRAINING_CLASSES: { sprite: string; title: string }[] = [
  { sprite: "youngster", title: "Criança do Matinho" },
  { sprite: "bugcatcher", title: "Caçador de Insetos" },
  { sprite: "lass", title: "Garota Treinadora" },
  { sprite: "hiker", title: "Montanhista" },
  { sprite: "picnicker", title: "Piqueniqueira" },
  { sprite: "camper", title: "Campista" },
  { sprite: "fisherman", title: "Pescador" },
  { sprite: "swimmer", title: "Nadador" },
  { sprite: "sailor", title: "Marinheiro" },
  { sprite: "medium", title: "Médium" },
  { sprite: "blackbelt", title: "Faixa Preta" },
  { sprite: "gentleman", title: "Treinador Aspirante" },
];

const RANDOM_FIRST_NAMES = [
  "Alex", "Rita", "Marcos", "Lia", "Pedro", "Ana", "Bruno", "Maya",
  "Lucas", "Sofia", "Davi", "Lara", "Igor", "Nina", "Caio", "Eva",
];

const GYM_STAGE_SPRITES = ["youngster", "bugcatcher", "hiker", "gentleman"] as const;

const GYM_LEADER_SPRITES: Record<GymId, string> = {
  brock: "brock",
  misty: "misty",
  surge: "ltsurge",
  erika: "erika",
  koga: "koga",
  sabrina: "sabrina",
  blaine: "blaine",
  giovanni: "giovanni",
};

const ELITE_SPRITES: Record<EliteId, string> = {
  lorelei: "lorelei-gen3",
  bruno: "bruno",
  agatha: "agatha-gen3",
  lance: "lance",
  champion: "blue",
};

export function trainerSpriteUrl(spriteId: string): string {
  return getTrainerSpritePath(spriteId);
}

function pickRandom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

export function rollTrainingOpponent(): BattleTrainerPortrait {
  const cls = pickRandom(TRAINING_CLASSES);
  const first = pickRandom(RANDOM_FIRST_NAMES);
  return {
    name: `${cls.title} ${first}`,
    spriteUrl: trainerSpriteUrl(cls.sprite),
  };
}

export function getGymOpponentPortrait(
  gymId: GymId,
  stage: number,
  trainerName: string
): BattleTrainerPortrait {
  const isLeader = stage >= 5;
  const spriteId = isLeader
    ? GYM_LEADER_SPRITES[gymId]
    : GYM_STAGE_SPRITES[Math.min(stage - 1, 3)] ?? "youngster";

  return {
    name: trainerName,
    spriteUrl: trainerSpriteUrl(spriteId),
  };
}

export function getEliteOpponentPortrait(eliteId: EliteId, displayName: string): BattleTrainerPortrait {
  return {
    name: displayName,
    spriteUrl: trainerSpriteUrl(ELITE_SPRITES[eliteId]),
  };
}

const PLAYER_AVATAR_SPRITES: Record<string, string> = {
  "trainer-youngster": "youngster",
  "trainer-hiker": "hiker",
  "trainer-swimmer": "swimmer",
  "trainer-ace": "blackbelt",
  "trainer-psychic": "medium",
  "trainer-dragon": "gentleman",
  "trainer-veteran": "gentleman",
  "trainer-elite": "lance",
  "trainer-champion": "blue",
  "trainer-master": "blue",
};

export function getPlayerTrainerPortrait(
  username: string,
  avatarId: string
): BattleTrainerPortrait {
  const profileImage = getAvatarImageUrl(avatarId);
  if (profileImage) {
    return {
      name: username,
      spriteUrl: profileImage,
      isProfileAvatar: true,
    };
  }

  const parsed = parseAvatarId(avatarId);
  if (parsed.kind === "default") {
    return { name: username, spriteUrl: "", isProfileAvatar: true };
  }

  const spriteId =
    parsed.kind === "trainer"
      ? (PLAYER_AVATAR_SPRITES[parsed.ref] ?? "youngster")
      : "youngster";

  return {
    name: username,
    spriteUrl: trainerSpriteUrl(spriteId),
    isProfileAvatar: false,
  };
}

export const BATTLE_FACE_OFF_GREETINGS = [
  "É um prazer te conhecer!",
  "Vamos batalhar!",
  "Prepare-se!",
  "Não vou pegar leve!",
  "Mostre o que você tem!",
] as const;
