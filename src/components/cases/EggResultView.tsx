"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Coins, Sparkles, BookOpen } from "lucide-react";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { RarityBadge } from "@/components/ui/RarityBadge";
import { StickerBadge } from "@/components/ui/StickerBadge";
import { DuplicateSadEffect } from "@/components/spin/DuplicateSadEffect";
import { EggCelebration } from "@/components/cases/EggCelebration";
import { RARITY_CONFIG } from "@/data/rarity";
import { getCapsuleSellPrice } from "@/lib/capsule-sell";
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
  const { pokemon, isShiny, isNew, isDuplicate, isNewShinyUnlock } = result;
  const meta = RARITY_CONFIG[pokemon.rarity];
  const sellPrice = getCapsuleSellPrice(pokemon.rarity, isShiny);
  const showDuplicateActions = isDuplicate && !isNew && !isNewShinyUnlock;
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
          style={{ color: isShiny ? "#fbbf24" : meta.color }}
        >
          {isShiny
            ? "Nasceu um Shiny!"
            : pokemon.rarity === "legendary"
              ? "Lendário!"
              : pokemon.rarity === "epic"
                ? "Épico!"
                : "O ovo chocou!"}
        </p>
        <h2 className="text-2xl font-black text-white">{pokemon.name}</h2>
      </div>

      <div
        className={cn(
          "glass-card p-6 text-center relative overflow-hidden border-2",
          showDuplicateActions && "saturate-[0.85]"
        )}
        style={{
          borderColor: isShiny
            ? "#fde04770"
            : showDuplicateActions
              ? "#64748b50"
              : `${meta.color}50`,
          boxShadow: isShiny
            ? "0 0 60px rgba(251,191,36,0.4)"
            : pokemon.rarity === "legendary"
              ? "0 0 55px rgba(245,158,11,0.45)"
              : `0 0 40px ${meta.glowColor}`,
        }}
      >
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

        <RarityBadge rarity={pokemon.rarity} className="mx-auto mb-4" />

        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 180, damping: 14, delay: 0.1 }}
          className="relative mx-auto w-44 h-44 mb-4"
        >
          {!showDuplicateActions && (
            <motion.div
              animate={
                isShiny
                  ? { scale: [1, 1.18, 1], opacity: [0.35, 0.65, 0.35] }
                  : { scale: [1, 1.08, 1], opacity: [0.25, 0.45, 0.25] }
              }
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 rounded-full blur-2xl"
              style={{ backgroundColor: isShiny ? "#fbbf24" : meta.color }}
            />
          )}
          <Image
            src={pokemon.image}
            alt={pokemon.name}
            fill
            className={cn(
              "relative z-10 object-contain drop-shadow-2xl",
              showDuplicateActions && "grayscale-[30%]"
            )}
            unoptimized
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
