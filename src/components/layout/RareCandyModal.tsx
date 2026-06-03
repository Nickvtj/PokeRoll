"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { X, Search } from "lucide-react";
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
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const collection = useGameStore((s) => s.collection);
  const rareCandyCount = useEconomyStore((s) => s.rareCandyCount ?? 0);
  const useRareCandyOnPokemon = useEconomyStore((s) => s.useRareCandyOnPokemon);
  const getPokemonProgress = useEconomyStore((s) => s.getPokemonProgress);
  const getLevelCap = useEconomyStore((s) => s.getLevelCap);

  const collected = useMemo(
    () =>
      POKEMON_LIST.filter((p) => {
        if (!collection[p.id]) return false;
        const q = searchQuery.trim().toLowerCase();
        if (q && !p.name.toLowerCase().includes(q)) return false;
        return true;
      }).sort((a, b) => {
        const levelA = getPokemonProgress(a.id).level;
        const levelB = getPokemonProgress(b.id).level;
        return levelB - levelA;
      }),
    [collection, searchQuery, getPokemonProgress]
  );
  const levelCap = getLevelCap();

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) {
      setSearchQuery("");
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!mounted) return null;

  const modal = (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          style={{ width: "100vw", height: "100dvh" }}
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-black/75 backdrop-blur-md" />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-[min(92vw,420px)] max-h-[min(80dvh,640px)] glass-card border border-pink-400/30 p-4 flex flex-col overflow-hidden"
          >
            <div className="flex items-center justify-between gap-2 mb-3 shrink-0">
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

            <p className="text-[11px] text-white/50 mb-3 shrink-0">
              1 Rare Candy = +1 nível. Cap atual: Nv.{levelCap}
            </p>

            {collected.length > 0 && (
              <div className="relative mb-3 shrink-0">
                <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/35" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar Pokémon..."
                  className="w-full pl-10 pr-3 py-2 text-xs rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-pink-400/40"
                />
              </div>
            )}

            {collected.length === 0 ? (
              <p className="text-center text-sm text-white/40 py-8">
                {searchQuery.trim()
                  ? "Nenhum Pokémon encontrado."
                  : "Colete Pokémon no álbum para usar Rare Candy."}
              </p>
            ) : (
              <div className="grid grid-cols-4 gap-2 overflow-y-auto overscroll-contain flex-1 min-h-0 pr-1 -mr-1">
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
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return createPortal(modal, document.body);
}
