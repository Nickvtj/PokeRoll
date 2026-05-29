"use client";

import { motion } from "framer-motion";
import { Disc3, Loader2 } from "lucide-react";
import { PokeballIcon } from "@/components/ui/PokeballIcon";
import { cn } from "@/lib/utils";

interface SpinLeverButtonProps {
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  canAfford?: boolean;
  spinCost: number;
  spinMultiplier: number;
  willUseFreeSpin?: boolean;
  freeSpins?: number;
  className?: string;
}

export function SpinLeverButton({
  onClick,
  disabled = false,
  loading = false,
  canAfford = true,
  spinCost,
  spinMultiplier,
  willUseFreeSpin = false,
  freeSpins = 0,
  className,
}: SpinLeverButtonProps) {
  const inactive = disabled || loading;

  return (
    <motion.button
      type="button"
      whileHover={inactive ? undefined : { scale: 1.02, y: -1 }}
      whileTap={inactive ? undefined : { scale: 0.98, y: 2 }}
      onClick={onClick}
      disabled={inactive}
      aria-busy={loading}
      className={cn(
        "spin-lever-btn group block w-full max-w-xs mx-auto",
        inactive && "spin-lever-btn-disabled",
        willUseFreeSpin && !loading && "spin-lever-btn-free",
        className
      )}
    >
      <div className="spin-lever-frame">
        <div className="spin-lever-rail" aria-hidden />

        <div className="spin-lever-bezel">
        <div className="spin-lever-marquee" aria-hidden>
          <PokeballIcon size={12} className="opacity-70" />
          <span>CAÇA-NÍQUEL</span>
          <PokeballIcon size={12} className="opacity-70" />
        </div>

        <div className="spin-lever-lights" aria-hidden>
          {Array.from({ length: 5 }).map((_, i) => (
            <span
              key={i}
              className="spin-lever-light"
              style={{ animationDelay: `${i * 0.18}s` }}
            />
          ))}
        </div>

        <div className="spin-lever-dome">
          {loading ? (
            <Loader2 className="w-8 h-8 animate-spin text-slate-900/90" />
          ) : (
            <div className="spin-lever-icon-ring">
              <Disc3 className="w-7 h-7 text-slate-900 transition-transform duration-500 group-hover:rotate-[220deg]" />
            </div>
          )}

          <span className="spin-lever-label">
            {loading
              ? "GIRANDO..."
              : willUseFreeSpin
                ? "GIRAR GRÁTIS"
                : `GIRAR${spinMultiplier > 1 ? ` ${spinMultiplier}x` : ""}`}
          </span>

          {!loading && (
            <span
              className={cn(
                "spin-lever-sub",
                !canAfford && !willUseFreeSpin && "text-red-950/90"
              )}
            >
              {willUseFreeSpin
                ? `${freeSpins} restante${freeSpins > 1 ? "s" : ""}`
                : canAfford
                  ? `${spinCost} moedas`
                  : `Precisa de ${spinCost}`}
            </span>
          )}
        </div>
        </div>

        <div className="spin-lever-rail" aria-hidden />
      </div>
    </motion.button>
  );
}
