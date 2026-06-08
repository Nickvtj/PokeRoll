/** Sprites de treinadores (Gen 3 / FireRed) em /public/sprites/trainers */

export const TRAINER_SPRITE_BASE = "/sprites/trainers";

export const FALLBACK_TRAINER_SPRITE = `${TRAINER_SPRITE_BASE}/youngster.png`;

export function getTrainerSpritePath(spriteId: string): string {
  return `${TRAINER_SPRITE_BASE}/${spriteId}.png`;
}
