import type { CapsuleId } from "@/types/capsule";
import type { EvoItemId } from "@/types/instance";
import { getCapsuleById } from "@/data/capsules";

/** Nível mínimo do treinador para desbloquear cada ovo. */
export const CAPSULE_MIN_TRAINER_LEVEL: Record<CapsuleId, number> = {
  "rota-1": 1,
  viridian: 1,
  "mt-moon": 1,
  marinha: 15,
  lavender: 15,
  dojo: 15,
  safari: 30,
  fossil: 30,
  silph: 45,
  mestra: 45,
};

/** Chance de pedra/cabo ao chocar o Ovo Mestre (5–8%). */
export const MASTER_EGG_EVO_ITEM_CHANCE = 0.06;

const EVO_ITEMS: EvoItemId[] = [
  "fire-stone",
  "water-stone",
  "thunder-stone",
  "leaf-stone",
  "moon-stone",
  "linking-cord",
];

/** Doces da família bônus ao chocar qualquer ovo (escala com custo). */
export function getEggHatchFamilyCandyBonus(capsuleId: CapsuleId): number {
  const cost = getCapsuleById(capsuleId).cost;
  if (cost <= 15) return 10;
  if (cost <= 30) return 15;
  if (cost <= 50) return 20;
  if (cost <= 80) return 25;
  return 35;
}

export function isCapsuleUnlocked(capsuleId: CapsuleId, trainerLevel: number): boolean {
  return trainerLevel >= CAPSULE_MIN_TRAINER_LEVEL[capsuleId];
}

/** Sorteia item de evolução bônus do Ovo Mestre. */
export function rollMasterEggEvoItem(): EvoItemId | null {
  if (Math.random() >= MASTER_EGG_EVO_ITEM_CHANCE) return null;
  return EVO_ITEMS[Math.floor(Math.random() * EVO_ITEMS.length)];
}
