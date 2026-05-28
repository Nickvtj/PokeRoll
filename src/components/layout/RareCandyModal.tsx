"use client";

import Image from "next/image";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { POKEMON_LIST, POKEMON_MAP } from "@/data/pokemon";
import { RARE_CANDY_SPRITE } from "@/data/item-sprites";
import { useGameStore } from "@/stores/game-store";
import { useEconomyStore } from "@/stores/economy-store";
import { ItemSprite } from "@/components/ui/ItemSprite";
import { cn } from "@/lib/utils";

interface RareCandyModalProps {
  open: boolean;
  onClose: () => void;
}

export function RareCandyModal({ open, onClose }: RareCandyModalProps) {
  const collection = useGameStore((s) => s.collection);
  const rareCandyCount = useEconomyStore((s) => s.rareCandyCount ?? 0);
  const useRareCandyOnPokemon = useEconomyStore((s) => s.useRareCandyOnPokemon);
  const getPokemonProgress = useEconomyStore((s) => s.getPokemonProgress);
  const getLevelCap = useEconomyStore((s) => s.getLevelCap);

  const collected = POKEMON_LIST.filter((p) => collection[p.id]);
  const levelCap = getLevelCap();

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            aria-label="Fechar"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            className="fixed left-1/2 top-1/2 z-50 w-[min(92vw,420px)] max-h-[80vh] -translate-x-1/2 -translate-y-1/2 glass-card border border-pink-400/30 p-4 flex flex-col"
          >
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <ItemSprite src={RARE_CANDY_SPRITE} alt="Rare Candy" size={28} />
                <h3 className="font-bold text-sm">Rare Candy</h3>
                <span className="text-xs text-pink-300 font-semibold">×{rareCandyCount}</span>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4 text-white/50" />
              </button>
            </div>

            <p className="text-[11px] text-white/50 mb-3">
              1 Rare Candy = +1 nível. Cap atual: Nv.{levelCap}
            </p>

            <div className="grid grid-cols-4 gap-2 overflow-y-auto flex-1 min-h-0 pr-1">
              {collected.map((p) => {
                const pokemon = POKEMON_MAP[p.id];
                if (!pokemon) return null;
                const progress = getPokemonProgress(p.id);
                const atCap = progress.level >= levelCap;
                const disabled = rareCandyCount <= 0 || atCap;

                return (
                  <button
                    key={p.id}
                    type="button"
                    disabled={disabled}
                    onClick={() => useRareCandyOnPokemon(p.id, 1)}
                    className={cn(
                      "rounded-xl border border-white/10 bg-white/5 p-2 text-center transition-colors",
                      !disabled && "hover:border-pink-400/40 hover:bg-pink-500/10",
                      disabled && "opacity-40 cursor-not-allowed"
                    )}
                  >
                    <Image
                      src={pokemon.image}
                      alt={pokemon.name}
                      width={44}
                      height={44}
                      className="object-contain mx-auto"
                      unoptimized
                    />
                    <p className="text-[9px] truncate mt-1">{pokemon.name}</p>
                    <p className="text-[8px] text-indigo-400">Nv.{progress.level}</p>
                  </button>
                );
              })}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
