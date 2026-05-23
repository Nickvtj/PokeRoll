import type { GymId } from "@/types/gym";

const BADGE_CDN =
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/badges";

/** Insígnias de Kanto (PokeAPI/sprites — mesmo CDN dos Pokémon) */
export const GYM_BADGE_IMAGES: Record<GymId, string> = {
  brock: `${BADGE_CDN}/1.png`,
  misty: `${BADGE_CDN}/2.png`,
  surge: `${BADGE_CDN}/3.png`,
  erika: `${BADGE_CDN}/4.png`,
  koga: `${BADGE_CDN}/5.png`,
  sabrina: `${BADGE_CDN}/6.png`,
  blaine: `${BADGE_CDN}/7.png`,
  giovanni: `${BADGE_CDN}/8.png`,
};

export const GYM_LEADER_COIN_REWARD = 15;

export function getBadgeImage(gymId: GymId): string {
  return GYM_BADGE_IMAGES[gymId];
}
