"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { X, Search, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { POKEMON_LIST, POKEMON_MAP } from "@/data/pokemon";
import { RARE_CANDY_SPRITE } from "@/data/item-sprites";
import { useGameStore } from "@/stores/game-store";
import { useEconomyStore } from "@/stores/economy-store";
import { ItemSprite } from "@/components/ui/ItemSprite";
import { isLocalAsset } from "@/lib/image-utils";
import { cn } from "@/lib/utils";
import { playUiClick, playUiConfirm } from "@/lib/ui-sounds";

interface RareCandyModalProps {
  open: boolean;
  onClose: () => void;
}

export function RareCandyModal({ open, onClose }: RareCandyModalProps) {
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const collection = useGameStore((s) => s.collection);
  const rareCandyCount = useEconomyStore((s) => s.rareCandyCount ?? 0);
  const applyRareCandy = useEconomyStore((s) => s.useRareCandyOnPokemon);
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
  const prevCountRef = useRef(rareCandyCount);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (open && prevCountRef.current > 0 && rareCandyCount <= 0) {
      onClose();
    }
    prevCountRef.current = rareCandyCount;
  }, [open, rareCandyCount, onClose]);

  useEffect(() => {
    if (!open) setSearchQuery("");
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
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-[min(94vw,440px)] max-h-[min(85dvh,680px)] rounded-2xl overflow-hidden ring-1 ring-pink-400/20 bg-gradient-to-b from-slate-900 via-slate-900/98 to-pink-950/20 flex flex-col shadow-2xl shadow-pink-500/10"
          >
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(236,72,153,0.08),transparent_55%)] pointer-events-none" />

            <div className="relative shrink-0 p-4 pb-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-xl bg-pink-500/15 border border-pink-400/25 flex items-center justify-center shrink-0">
                    <ItemSprite src={RARE_CANDY_SPRITE} alt="Rare Candy" size={28} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-base flex items-center gap-2">
                      Rare Candy
                      <span className="text-xs font-black text-pink-300 bg-pink-500/15 px-2 py-0.5 rounded-lg border border-pink-400/20">
                        ×{rareCandyCount}
                      </span>
                    </h3>
                    <p className="text-[11px] text-white/45 mt-0.5">
                      +1 nível por doce, teto Nv.{levelCap}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 rounded-lg hover:bg-white/10 transition-colors shrink-0"
                  onMouseDown={() => playUiClick()}
                >
                  <X className="w-4 h-4 text-white/50" />
                </button>
              </div>

              {collected.length > 0 && (
                <div className="relative mt-3">
                  <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/35" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar Pokémon..."
                    className="w-full pl-10 pr-3 py-2.5 text-xs rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-pink-400/40 focus:ring-1 focus:ring-pink-400/20"
                  />
                </div>
              )}
            </div>

            <div className="relative flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 pt-3">
              {collected.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center gap-2">
                  <Sparkles className="w-8 h-8 text-white/20" />
                  <p className="text-sm text-white/40">
                    {searchQuery.trim()
                      ? "Nenhum Pokémon encontrado."
                      : "Colete Pokémon no álbum para usar Rare Candy."}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
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
                        onClick={() => {
                          playUiConfirm();
                          applyRareCandy(p.id, 1);
                        }}
                        className={cn(
                          "rounded-xl border p-2.5 text-center transition-all",
                          !disabled &&
                            "border-white/10 bg-white/[0.04] hover:border-pink-400/45 hover:bg-pink-500/10 hover:scale-[1.02] active:scale-[0.98]",
                          disabled && "opacity-35 cursor-not-allowed border-white/5 bg-white/[0.02]",
                          atCap && !disabled && "opacity-50"
                        )}
                      >
                        <div className="relative w-12 h-12 mx-auto mb-1.5">
                          <Image
                            src={pokemon.image}
                            alt={pokemon.name}
                            fill
                            sizes="48px"
                            className="object-contain drop-shadow-md"
                            unoptimized={!isLocalAsset(pokemon.image)}
                          />
                        </div>
                        <p className="text-[10px] font-semibold truncate">{pokemon.name}</p>
                        <p
                          className={cn(
                            "text-[10px] font-bold tabular-nums mt-0.5",
                            atCap ? "text-white/30" : "text-indigo-300"
                          )}
                        >
                          Nv.{progress.level}
                          {atCap && ", max"}
                        </p>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return createPortal(modal, document.body);
}
