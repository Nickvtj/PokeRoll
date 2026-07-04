import type { GymId } from "@/types/gym";

/** Insígnias de Kanto no estilo GBA (FireRed/LeafGreen) — sprites locais em /public */
export const GYM_BADGE_IMAGES: Record<GymId, string> = {
  brock: "/sprites/badges/brock.png",
  misty: "/sprites/badges/misty.png",
  surge: "/sprites/badges/surge.png",
  erika: "/sprites/badges/erika.png",
  koga: "/sprites/badges/koga.png",
  sabrina: "/sprites/badges/sabrina.png",
  blaine: "/sprites/badges/blaine.png",
  giovanni: "/sprites/badges/giovanni.png",
};

export const GYM_LEADER_COIN_REWARD = 15;

export function getBadgeImage(gymId: GymId): string {
  return GYM_BADGE_IMAGES[gymId];
}
