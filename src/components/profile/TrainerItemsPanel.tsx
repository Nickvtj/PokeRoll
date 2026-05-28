"use client";

import { LUCKY_EGG_SPRITE, RARE_CANDY_SPRITE } from "@/data/item-sprites";
import { useEconomyStore } from "@/stores/economy-store";
import { ProfileSection } from "@/components/profile/ProfileSection";
import { ItemSprite } from "@/components/ui/ItemSprite";

/** Resumo no perfil — ações ficam no header (TrainerItemsBar). */
export function TrainerItemsPanel() {
  const luckyEggCount = useEconomyStore((s) => s.luckyEggCount ?? 0);
  const rareCandyCount = useEconomyStore((s) => s.rareCandyCount ?? 0);
  const isLuckyEggActive = useEconomyStore((s) => s.isLuckyEggActive());

  if (luckyEggCount <= 0 && rareCandyCount <= 0 && !isLuckyEggActive) return null;

  return (
    <ProfileSection
      title="Itens do Treinador"
      description="Use Lucky Egg e Rare Candy no topo da tela."
    >
      <div className="flex flex-wrap gap-4 text-sm">
        {luckyEggCount > 0 && (
          <span className="inline-flex items-center gap-2 text-amber-200">
            <ItemSprite src={LUCKY_EGG_SPRITE} alt="Lucky Egg" size={24} />
            Lucky Egg ×{luckyEggCount}
          </span>
        )}
        {isLuckyEggActive && (
          <span className="inline-flex items-center gap-2 text-amber-400 font-semibold">
            <ItemSprite src={LUCKY_EGG_SPRITE} alt="Lucky Egg" size={24} spinning />
            Lucky Egg ativo (2× XP)
          </span>
        )}
        {rareCandyCount > 0 && (
          <span className="inline-flex items-center gap-2 text-pink-200">
            <ItemSprite src={RARE_CANDY_SPRITE} alt="Rare Candy" size={24} />
            Rare Candy ×{rareCandyCount}
          </span>
        )}
      </div>
    </ProfileSection>
  );
}
