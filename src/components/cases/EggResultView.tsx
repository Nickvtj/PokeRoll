"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Coins, Sparkles, BookOpen, Candy, Gem } from "lucide-react";
import { EVO_ITEM_LABEL } from "@/data/evo-item-labels";
import type { EvoItemId } from "@/types/instance";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { RarityBadge } from "@/components/ui/RarityBadge";
import { StickerBadge } from "@/components/ui/StickerBadge";
import { DuplicateSadEffect } from "@/components/spin/DuplicateSadEffect";
import { EggCelebration } from "@/components/cases/EggCelebration";
import { EggNewRevealFx } from "@/components/cases/EggNewRevealFx";
import { RARITY_CONFIG } from "@/data/rarity";
import { getCapsuleSellPrice } from "@/lib/capsule-sell";
import { isLocalAsset } from "@/lib/image-utils";
import type { CapsuleRollResult } from "@/types/capsule";
import { cn } from "@/lib/utils";

interface EggResultViewProps {
  result: CapsuleRollResult;
  onSell: () => void;
  onKeepDuplicate: () => void;
  onContinue: () => void;
  onPlaySounds: () => void;
}

export function EggResultView({
  result,
  onSell,
  onKeepDuplicate,
  onContinue,
  onPlaySounds,
}: EggResultViewProps) {
  const { pokemon, isShiny, isNew, isDuplicate, isNewShinyUnlock, hatchFamilyCandy, bonusEvoItem } =
    result;
  const meta = RARITY_CONFIG[pokemon.rarity];
  const sellPrice = getCapsuleSellPrice(pokemon.rarity, isShiny);
  const showDuplicateActions = isDuplicate && !isNew && !isNewShinyUnlock;
  const isFreshUnlock = (isNew || isNewShinyUnlock) && !showDuplicateActions;
  const revealColor = isShiny ? "#fbbf24" : meta.color;
  const isHighTier =
    isShiny || pokemon.rarity === "legendary" || pokemon.rarity === "epic" || pokemon.rarity === "rare";

  useEffect(() => {
    onPlaySounds();
  }, [onPlaySounds]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md mx-auto space-y-5"
    >
      <div className="text-center space-y-1">
        <p
          className={cn(
            "font-black uppercase tracking-widest",
            isHighTier ? "text-sm" : "text-xs"
          )}
          style={{ color: revealColor }}
        >
          {isShiny
            ? "Nasceu um Shiny!"
            : pokemon.rarity === "legendary"
              ? "Lendário!"
              : pokemon.rarity === "epic"
                ? "Épico!"
                : isFreshUnlock
                  ? "Novo Pokémon!"
                  : "O ovo chocou!"}
        </p>
        <h2 className="text-2xl font-black text-white">{pokemon.name}</h2>
      </div>

      <div
        className={cn(
          "relative overflow-hidden rounded-2xl border-2 text-center",
          showDuplicateActions
            ? "glass-card p-6 saturate-[0.85]"
            : isFreshUnlock
              ? "bg-gradient-to-b from-slate-950 via-slate-900/95 to-slate-950 p-5 sm:p-6"
              : "glass-card p-6"
        )}
        style={{
          borderColor: isShiny
            ? "#fde04770"
            : showDuplicateActions
              ? "#64748b50"
              : `${meta.color}55`,
          boxShadow: isShiny
            ? "0 0 60px rgba(251,191,36,0.4)"
            : pokemon.rarity === "legendary"
              ? "0 0 55px rgba(245,158,11,0.45)"
              : isFreshUnlock
                ? `0 0 48px ${meta.glowColor}`
                : `0 0 40px ${meta.glowColor}`,
        }}
      >
        {isFreshUnlock && <EggNewRevealFx color={revealColor} isShiny={isShiny} />}
        <EggCelebration rarity={pokemon.rarity} isShiny={isShiny} />

        {showDuplicateActions && <DuplicateSadEffect />}

        <div className="absolute top-3 right-3 z-20 flex flex-col items-end gap-1">
          {isShiny && (
            <span className="px-2 py-0.5 rounded-full bg-amber-500/25 border border-amber-400/40 text-[9px] font-black text-amber-200 uppercase flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Shiny
            </span>
          )}
          <StickerBadge variant={isNew || isNewShinyUnlock ? "new" : "duplicate"} size="sm" />
        </div>

        <div className="relative z-10">
          <RarityBadge rarity={pokemon.rarity} className="mx-auto mb-4" />

          <motion.div
            initial={{ scale: 0.4, opacity: 0, y: 12 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 16, delay: 0.08 }}
            className={cn(
              "relative mx-auto mb-4",
              isFreshUnlock ? "w-48 h-48 sm:w-52 sm:h-52" : "w-44 h-44"
            )}
          >
            {!showDuplicateActions && (
              <motion.div
                animate={
                  isShiny
                    ? { scale: [1, 1.18, 1], opacity: [0.35, 0.65, 0.35] }
                    : isFreshUnlock
                      ? { scale: [1, 1.1, 1], opacity: [0.2, 0.4, 0.2] }
                      : { scale: [1, 1.08, 1], opacity: [0.25, 0.45, 0.25] }
                }
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 rounded-full blur-2xl"
                style={{ backgroundColor: revealColor }}
              />
            )}
            <Image
              src={pokemon.image}
              alt={pokemon.name}
              fill
              className={cn(
                "relative z-10 object-contain drop-shadow-2xl",
                showDuplicateActions && "grayscale-[30%]",
                isFreshUnlock && "drop-shadow-[0_8px_24px_rgba(0,0,0,0.45)]"
              )}
              unoptimized={!isLocalAsset(pokemon.image)}
            />
          </motion.div>

          {isNewShinyUnlock && (
            <p className="text-sm font-bold text-amber-300 flex items-center justify-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              Shiny desbloqueado no álbum!
            </p>
          )}
          {isNew && !isNewShinyUnlock && (
            <p className="text-sm font-bold text-emerald-300 flex items-center justify-center gap-1.5">
              <BookOpen className="w-4 h-4" />
              Adicionado ao álbum!
            </p>
          )}
          {showDuplicateActions && (
            <p className="text-xs text-orange-200/80 mt-1">
              Você já tem este Pokémon. O que deseja fazer?
            </p>
          )}
          {(hatchFamilyCandy ?? 0) > 0 && (
            <p className="text-xs text-pink-300/90 mt-2 flex items-center justify-center gap-1">
              <Candy className="w-3.5 h-3.5" />
              +{hatchFamilyCandy} Doces da Família (bônus do ovo)
            </p>
          )}
          {bonusEvoItem && (
            <p className="text-xs text-violet-300/90 mt-1 flex items-center justify-center gap-1">
              <Gem className="w-3.5 h-3.5" />
              Bônus: {EVO_ITEM_LABEL[bonusEvoItem as EvoItemId]}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {showDuplicateActions ? (
          <>
            <AnimatedButton
              variant="gold"
              size="lg"
              className="w-full"
              icon={<Coins className="w-5 h-5" />}
              onClick={onSell}
            >
              Vender por {sellPrice} moedas
            </AnimatedButton>
            <AnimatedButton
              variant="secondary"
              size="lg"
              className="w-full border-indigo-400/30 hover:border-indigo-400/50"
              icon={<BookOpen className="w-5 h-5" />}
              onClick={onKeepDuplicate}
            >
              Manter no álbum
            </AnimatedButton>
          </>
        ) : (
          <AnimatedButton variant="primary" size="lg" className="w-full" onClick={onContinue}>
            Voltar aos ovos
          </AnimatedButton>
        )}
      </div>
    </motion.div>
  );
}
