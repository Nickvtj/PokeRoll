"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Disc3, Sparkles, Stars } from "lucide-react";
import { RarityBadge } from "@/components/ui/RarityBadge";
import { StickerBadge } from "@/components/ui/StickerBadge";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { DuplicateSadEffect } from "@/components/spin/DuplicateSadEffect";
import { RARITY_CONFIG } from "@/data/rarity";
import type { SpinResult } from "@/types";
import { cn } from "@/lib/utils";

interface RevealAnimationProps {
  results: SpinResult[];
  show: boolean;
  onClose: () => void;
  onSpinAgain?: () => void;
  canSpinAgain?: boolean;
  spinCost?: number;
  spinMultiplier?: number;
  willUseFreeSpin?: boolean;
}

function ShinyBadge({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 font-black uppercase tracking-wider rounded-full border",
        "bg-gradient-to-r from-amber-400/25 to-yellow-300/15 border-amber-300/50 text-amber-200",
        size === "lg" && "px-4 py-1.5 text-sm",
        size === "md" && "px-3 py-1 text-xs",
        size === "sm" && "px-2 py-0.5 text-[10px]"
      )}
    >
      <Stars className={cn(size === "lg" ? "w-4 h-4" : "w-3 h-3")} />
      Shiny
    </span>
  );
}

function ResultCard({ result, index }: { result: SpinResult; index: number }) {
  const config = RARITY_CONFIG[result.rarity];
  const isDuplicate = result.isDuplicate && !result.isNewShinyUnlock;
  const isShinyEpic = result.isNewShinyUnlock;

  return (
    <div className="relative pt-3">
      <div className="absolute top-0 right-0 z-30 flex flex-col items-end gap-1">
        {isShinyEpic && <ShinyBadge size="sm" />}
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
          opacity: { delay: index * 0.15, type: "spring", damping: 15 },
          y: { delay: index * 0.15, type: "spring", damping: 15 },
          scale: { delay: index * 0.15, type: "spring", damping: 15 },
          ...(isDuplicate
            ? { x: { delay: index * 0.15 + 0.3, duration: 0.5, ease: "easeInOut" } }
            : {}),
        }}
        className="glass-card p-4 pt-5 text-center space-y-3 relative overflow-hidden"
        style={{
          borderColor: isShinyEpic
            ? "#fde04780"
            : isDuplicate
              ? "#64748b50"
              : `${config.color}40`,
          boxShadow: isShinyEpic
            ? "0 0 40px rgba(251,191,36,0.45), 0 0 20px rgba(168,85,247,0.2)"
            : isDuplicate
              ? "0 0 20px rgba(100,116,139,0.2)"
              : `0 0 30px ${config.glowColor}`,
          filter: isDuplicate ? "saturate(0.5) brightness(0.85)" : undefined,
        }}
      >
        {isDuplicate && <DuplicateSadEffect />}
        {isShinyEpic && (
          <div className="absolute inset-0 bg-gradient-to-br from-amber-400/10 via-transparent to-violet-500/10 pointer-events-none" />
        )}

        <div className="relative z-10">
          <RarityBadge rarity={result.rarity} size="sm" />
        </div>

        <div className="relative mx-auto w-24 h-24 z-10">
          {!isDuplicate && (
            <motion.div
              animate={
                isShinyEpic
                  ? { scale: [1, 1.15, 1], opacity: [0.35, 0.6, 0.35] }
                  : undefined
              }
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 rounded-full blur-xl"
              style={{
                backgroundColor: isShinyEpic ? "#fbbf24" : config.color,
              }}
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
          {(result.rarity === "legendary" || isShinyEpic) && !isDuplicate && (
            <Sparkles className="absolute -top-1 -right-1 w-5 h-5 text-amber-400 animate-pulse" />
          )}
        </div>

        <div className="relative z-10">
          <h3
            className="font-bold text-lg"
            style={{ color: isDuplicate ? "#94a3b8" : isShinyEpic ? "#fde047" : config.color }}
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

function RevealActions({
  onClose,
  onSpinAgain,
  canSpinAgain = false,
  spinCost = 0,
  spinMultiplier = 1,
  willUseFreeSpin = false,
}: {
  onClose: () => void;
  onSpinAgain?: () => void;
  canSpinAgain?: boolean;
  spinCost?: number;
  spinMultiplier?: number;
  willUseFreeSpin?: boolean;
}) {
  const spinLabel =
    spinMultiplier > 1 ? `Girar novamente ${spinMultiplier}x` : "Girar novamente";

  return (
    <div className={cn("flex flex-col gap-2", canSpinAgain && "sm:flex-row")}>
      {canSpinAgain && onSpinAgain && (
        <AnimatedButton
          variant="gold"
          onClick={onSpinAgain}
          icon={<Disc3 className="w-4 h-4" />}
          className="w-full sm:flex-1"
        >
          <span className="flex flex-col items-center leading-tight gap-0.5">
            <span>{willUseFreeSpin ? "Girar grátis de novo" : spinLabel}</span>
            {!willUseFreeSpin && (
              <span className="text-[10px] font-semibold opacity-80">
                {spinCost} {spinCost === 1 ? "moeda" : "moedas"}
              </span>
            )}
          </span>
        </AnimatedButton>
      )}
      <AnimatedButton
        variant="secondary"
        onClick={onClose}
        className={cn("w-full", canSpinAgain && "sm:flex-1")}
      >
        Continuar
      </AnimatedButton>
    </div>
  );
}

export function RevealAnimation({
  results,
  show,
  onClose,
  onSpinAgain,
  canSpinAgain = false,
  spinCost = 0,
  spinMultiplier = 1,
  willUseFreeSpin = false,
}: RevealAnimationProps) {
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
  const isDuplicate = result.isDuplicate && !result.isNewShinyUnlock;
  const isShinyEpic = result.isNewShinyUnlock;

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
              background: isShinyEpic
                ? "rgba(20, 10, 0, 0.88)"
                : isDuplicate && isSingle
                  ? "rgba(15, 23, 42, 0.9)"
                  : "rgba(0, 0, 0, 0.85)",
            }}
          />

          {isShinyEpic && isSingle && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.6, 0.3] }}
              transition={{ duration: 1.2 }}
              className="absolute inset-0 pointer-events-none bg-gradient-to-b from-amber-400/20 via-transparent to-violet-500/10"
            />
          )}

          <motion.div
            initial={{ scale: 0.3, opacity: 0 }}
            animate={{
              scale: 1,
              opacity: 1,
              ...(isDuplicate && isSingle ? { x: [0, -6, 6, -4, 4, 0] } : {}),
            }}
            transition={{
              scale: { type: "spring", damping: 15, stiffness: 200 },
              opacity: { type: "spring", damping: 15, stiffness: 200 },
              ...(isDuplicate && isSingle
                ? { x: { delay: 0.4, duration: 0.6, ease: "easeInOut" } }
                : {}),
            }}
            onClick={(e) => e.stopPropagation()}
            className="relative z-10 w-full max-w-lg max-h-[85dvh] overflow-y-auto overflow-x-visible"
          >
            {isSingle ? (
              <div
                className="glass-card p-8 text-center space-y-6 relative overflow-hidden"
                style={{
                  borderColor: isShinyEpic
                    ? "#fde04770"
                    : isDuplicate
                      ? "#64748b50"
                      : `${config.color}50`,
                  boxShadow: isShinyEpic
                    ? "0 0 80px rgba(251,191,36,0.5), 0 0 40px rgba(168,85,247,0.25), 0 20px 60px rgba(0,0,0,0.5)"
                    : isDuplicate
                      ? "0 0 30px rgba(100,116,139,0.3)"
                      : `0 0 60px ${config.glowColor}, 0 20px 60px rgba(0,0,0,0.5)`,
                  filter: isDuplicate ? "saturate(0.55) brightness(0.9)" : undefined,
                }}
              >
                {isDuplicate && <DuplicateSadEffect />}
                {isShinyEpic && (
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-400/15 via-yellow-300/5 to-violet-500/15 pointer-events-none animate-shimmer" />
                )}

                <div className="flex justify-center pt-1 relative z-10 gap-2 flex-wrap">
                  {isShinyEpic && <ShinyBadge size="lg" />}
                  <StickerBadge
                    variant={result.isNew ? "new" : "duplicate"}
                    size="lg"
                  />
                </div>

                <div className="relative z-10">
                  <RarityBadge rarity={result.rarity} size="lg" />
                </div>

                <motion.div
                  initial={{ scale: 0, rotate: isShinyEpic ? -20 : 0 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={
                    isShinyEpic
                      ? { type: "spring", delay: 0.15, damping: 8, stiffness: 180 }
                      : isDuplicate
                        ? { type: "tween", duration: 0.45, ease: "easeOut", delay: 0.2 }
                        : { type: "spring", delay: 0.2, damping: 10 }
                  }
                  className="relative mx-auto w-48 h-48 z-10"
                >
                  {!isDuplicate && (
                    <motion.div
                      animate={
                        isShinyEpic
                          ? { scale: [1, 1.2, 1], rotate: [0, 8, -8, 0] }
                          : { rotate: [0, 5, -5, 0] }
                      }
                      transition={{
                        duration: isShinyEpic ? 2.5 : 2,
                        repeat: Infinity,
                      }}
                      className="absolute inset-0 rounded-full blur-2xl"
                      style={{
                        backgroundColor: isShinyEpic ? "#fbbf24" : config.color,
                        opacity: isShinyEpic ? 0.45 : 0.3,
                      }}
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
                  {(result.rarity === "legendary" || isShinyEpic) && !isDuplicate && (
                    <Sparkles className="absolute -top-2 -right-2 w-8 h-8 text-amber-300 animate-pulse" />
                  )}
                </motion.div>

                <div className="relative z-10">
                  <h2
                    className="text-3xl font-bold"
                    style={{
                      color: isDuplicate ? "#94a3b8" : isShinyEpic ? "#fde047" : config.color,
                    }}
                  >
                    {result.pokemon.name}
                  </h2>
                  <p className="text-white/50 mt-1">
                    #{String(result.pokemon.id).padStart(3, "0")} · Gen{" "}
                    {result.pokemon.generation}
                  </p>
                  {isShinyEpic && (
                    <motion.p
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="text-amber-200 text-sm mt-3 font-semibold flex items-center justify-center gap-1.5"
                    >
                      <Sparkles className="w-4 h-4 shrink-0" />
                      Skin Shiny desbloqueada! Escolha no álbum qual versão usar.
                    </motion.p>
                  )}
                  {isDuplicate && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="text-slate-400 text-sm mt-2 italic"
                    >
                      Duplicata! +XP para fortalecer este Pokémon
                    </motion.p>
                  )}
                </div>

                <div className="relative z-10">
                  <RevealActions
                    onClose={onClose}
                    onSpinAgain={onSpinAgain}
                    canSpinAgain={canSpinAgain}
                    spinCost={spinCost}
                    spinMultiplier={spinMultiplier}
                    willUseFreeSpin={willUseFreeSpin}
                  />
                </div>
              </div>
            ) : (
              <div className="glass-card p-6 pt-8 space-y-5 overflow-visible">
                <div className="text-center space-y-1">
                  <h2 className="text-xl font-bold">Resultados do Spin!</h2>
                  <p className="text-sm text-white/50">
                    {results.filter((r) => r.isNew).length} novo(s) ·{" "}
                    {results.filter((r) => r.isDuplicate).length} repetido(s)
                    {results.some((r) => r.isNewShinyUnlock) && (
                      <span className="text-amber-300 inline-flex items-center gap-0.5">
                        <Sparkles className="w-3 h-3" />
                        Shiny!
                      </span>
                    )}
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

                <RevealActions
                  onClose={onClose}
                  onSpinAgain={onSpinAgain}
                  canSpinAgain={canSpinAgain}
                  spinCost={spinCost}
                  spinMultiplier={spinMultiplier}
                  willUseFreeSpin={willUseFreeSpin}
                />
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return createPortal(modal, document.body);
}
