"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Sparkles } from "lucide-react";
import { RarityBadge } from "@/components/ui/RarityBadge";
import { StickerBadge } from "@/components/ui/StickerBadge";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { DuplicateSadEffect } from "@/components/spin/DuplicateSadEffect";
import { RARITY_CONFIG } from "@/data/rarity";
import type { SpinResult } from "@/types";

interface RevealAnimationProps {
  results: SpinResult[];
  show: boolean;
  onClose: () => void;
}

function ResultCard({ result, index }: { result: SpinResult; index: number }) {
  const config = RARITY_CONFIG[result.rarity];
  const isDuplicate = result.isDuplicate;

  return (
    <div className="relative pt-3">
      {/* Adesivo fora do overflow-hidden */}
      <div className="absolute top-0 right-0 z-30">
        <StickerBadge variant={result.isNew ? "new" : "duplicate"} size="sm" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.9 }}
        animate={{
          opacity: 1,
          y: 0,
          scale: 1,
          ...(isDuplicate ? { x: [0, -3, 3, -2, 2, 0] } : {}),
        }}
        transition={{
          delay: index * 0.15,
          type: "spring",
          damping: 15,
          x: { delay: index * 0.15 + 0.3, duration: 0.5 },
        }}
        className="glass-card p-4 pt-5 text-center space-y-3 relative overflow-hidden"
        style={{
          borderColor: isDuplicate ? "#64748b50" : `${config.color}40`,
          boxShadow: isDuplicate
            ? "0 0 20px rgba(100,116,139,0.2)"
            : `0 0 30px ${config.glowColor}`,
          filter: isDuplicate ? "saturate(0.5) brightness(0.85)" : undefined,
        }}
      >
        {isDuplicate && <DuplicateSadEffect />}

        <div className="relative z-10">
          <RarityBadge rarity={result.rarity} size="sm" />
        </div>

      <div className="relative mx-auto w-24 h-24 z-10">
        {!isDuplicate && (
          <div
            className="absolute inset-0 rounded-full opacity-30 blur-xl"
            style={{ backgroundColor: config.color }}
          />
        )}
        <Image
          src={result.pokemon.image}
          alt={result.pokemon.name}
          width={96}
          height={96}
          className="relative z-10 object-contain drop-shadow-xl mx-auto"
          style={isDuplicate ? { filter: "grayscale(40%)" } : undefined}
          unoptimized
        />
        {result.rarity === "legendary" && !isDuplicate && (
          <Sparkles className="absolute -top-1 -right-1 w-5 h-5 text-amber-400 animate-pulse" />
        )}
      </div>

      <div className="relative z-10">
        <h3
          className="font-bold text-lg"
          style={{ color: isDuplicate ? "#94a3b8" : config.color }}
        >
          {result.pokemon.name}
        </h3>
        <p className="text-xs text-white/40">
          #{String(result.pokemon.id).padStart(3, "0")}
        </p>
      </div>
      </motion.div>
    </div>
  );
}

export function RevealAnimation({ results, show, onClose }: RevealAnimationProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!show) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [show]);

  if (results.length === 0 || !mounted) return null;

  const isSingle = results.length === 1;
  const result = results[0];
  const config = RARITY_CONFIG[result.rarity];
  const isDuplicate = result.isDuplicate;

  const modal = (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          style={{ width: "100vw", height: "100dvh", top: 0, left: 0 }}
          onClick={onClose}
        >
          <div
            className="absolute inset-0 backdrop-blur-md"
            style={{
              background: isDuplicate && isSingle
                ? "rgba(15, 23, 42, 0.9)"
                : "rgba(0, 0, 0, 0.85)",
            }}
          />

          <motion.div
            initial={{ scale: 0.3, opacity: 0 }}
            animate={{
              scale: 1,
              opacity: 1,
              ...(isDuplicate && isSingle ? { x: [0, -6, 6, -4, 4, 0] } : {}),
            }}
            transition={{
              scale: { type: "spring", damping: 15, stiffness: 200 },
              x: { delay: 0.4, duration: 0.6 },
            }}
            onClick={(e) => e.stopPropagation()}
            className="relative z-10 w-full max-w-lg max-h-[85dvh] overflow-y-auto overflow-x-visible"
          >
            {isSingle ? (
              <div
                className="glass-card p-8 text-center space-y-6 relative overflow-hidden"
                style={{
                  borderColor: isDuplicate ? "#64748b50" : `${config.color}50`,
                  boxShadow: isDuplicate
                    ? "0 0 30px rgba(100,116,139,0.3)"
                    : `0 0 60px ${config.glowColor}, 0 20px 60px rgba(0,0,0,0.5)`,
                  filter: isDuplicate ? "saturate(0.55) brightness(0.9)" : undefined,
                }}
              >
                {isDuplicate && <DuplicateSadEffect />}

                <div className="flex justify-center pt-1 relative z-10">
                  <StickerBadge
                    variant={result.isNew ? "new" : "duplicate"}
                    size="lg"
                  />
                </div>

                <div className="relative z-10">
                  <RarityBadge rarity={result.rarity} size="lg" />
                </div>

                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: isDuplicate ? [0, 1, 0.95, 1] : 1 }}
                  transition={{ type: "spring", delay: 0.2, damping: isDuplicate ? 8 : 10 }}
                  className="relative mx-auto w-48 h-48 z-10"
                >
                  {!isDuplicate && (
                    <motion.div
                      animate={{ rotate: [0, 5, -5, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute inset-0 rounded-full opacity-30 blur-2xl"
                      style={{ backgroundColor: config.color }}
                    />
                  )}
                  <Image
                    src={result.pokemon.image}
                    alt={result.pokemon.name}
                    width={192}
                    height={192}
                    className="relative z-10 object-contain drop-shadow-2xl"
                    style={isDuplicate ? { filter: "grayscale(50%) opacity(0.8)" } : undefined}
                    unoptimized
                  />
                  {result.rarity === "legendary" && !isDuplicate && (
                    <Sparkles className="absolute -top-2 -right-2 w-8 h-8 text-amber-400 animate-pulse" />
                  )}
                </motion.div>

                <div className="relative z-10">
                  <h2
                    className="text-3xl font-bold"
                    style={{ color: isDuplicate ? "#94a3b8" : config.color }}
                  >
                    {result.pokemon.name}
                  </h2>
                  <p className="text-white/50 mt-1">
                    #{String(result.pokemon.id).padStart(3, "0")} · Gen{" "}
                    {result.pokemon.generation}
                  </p>
                  {isDuplicate && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="text-slate-400 text-sm mt-2 italic"
                    >
                      Duplicata! +XP para fortalecer este Pokémon 🪙
                    </motion.p>
                  )}
                </div>

                <div className="relative z-10">
                  <AnimatedButton variant="secondary" onClick={onClose} className="w-full">
                    Continuar
                  </AnimatedButton>
                </div>
              </div>
            ) : (
              <div className="glass-card p-6 pt-8 space-y-5 overflow-visible">
                <div className="text-center space-y-1">
                  <h2 className="text-xl font-bold">Resultados do Spin!</h2>
                  <p className="text-sm text-white/50">
                    {results.filter((r) => r.isNew).length} novo(s) ·{" "}
                    {results.filter((r) => r.isDuplicate).length} repetido(s)
                  </p>
                </div>

                <div
                  className={`grid gap-4 pt-2 overflow-visible ${
                    results.length === 2 ? "grid-cols-2" : "grid-cols-1 sm:grid-cols-3"
                  }`}
                >
                  {results.map((r, i) => (
                    <ResultCard key={`${r.pokemon.id}-${i}`} result={r} index={i} />
                  ))}
                </div>

                <AnimatedButton variant="secondary" onClick={onClose} className="w-full">
                  Continuar
                </AnimatedButton>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return createPortal(modal, document.body);
}
