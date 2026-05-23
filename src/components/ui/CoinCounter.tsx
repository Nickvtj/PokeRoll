"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Coins } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEconomyStore } from "@/stores/economy-store";

interface CoinCounterProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showFreeSpins?: boolean;
}

export function CoinCounter({
  className,
  size = "md",
  showFreeSpins = true,
}: CoinCounterProps) {
  const coins = useEconomyStore((s) => s.coins);
  const freeSpins = useEconomyStore((s) => s.freeSpins);
  const coinAnimation = useEconomyStore((s) => s.coinAnimation);

  const sizes = {
    sm: "px-2.5 py-1 text-xs gap-1",
    md: "px-3 py-1.5 text-sm gap-1.5",
    lg: "px-4 py-2 text-base gap-2",
  };

  return (
    <motion.div
      animate={
        coinAnimation === "gain"
          ? { scale: [1, 1.15, 1], color: ["#fbbf24", "#fde68a", "#fbbf24"] }
          : coinAnimation === "loss"
            ? { scale: [1, 0.9, 1], x: [0, -2, 2, 0] }
            : {}
      }
      className={cn(
        "inline-flex items-center rounded-xl glass border border-amber-500/30 font-bold text-amber-400 shadow-lg shadow-amber-500/10",
        sizes[size],
        className
      )}
    >
      <Coins className={cn(size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4")} />
      <span>{coins.toLocaleString("pt-BR")}</span>
      {showFreeSpins && freeSpins > 0 && (
        <span className="text-[10px] text-cyan-400 font-semibold ml-1">
          +{freeSpins}🎰
        </span>
      )}
    </motion.div>
  );
}

interface SpinCurrencyDisplayProps {
  multiplier: number;
  className?: string;
}

export function SpinCurrencyDisplay({ multiplier, className }: SpinCurrencyDisplayProps) {
  const getSpinCost = useEconomyStore((s) => s.getSpinCost);
  const canAffordSpin = useEconomyStore((s) => s.canAffordSpin);
  const freeSpins = useEconomyStore((s) => s.freeSpins);
  const cost = getSpinCost(multiplier);
  const canAfford = canAffordSpin(multiplier);

  return (
    <div className={cn("text-center text-sm", className)}>
      {freeSpins >= multiplier ? (
        <p className="text-cyan-400 font-semibold">
          Spin grátis disponível! ({freeSpins} restantes)
        </p>
      ) : (
        <p className={cn(canAfford ? "text-white/60" : "text-red-400")}>
          Custo:{" "}
          <span className="font-bold text-amber-400">
            {cost} {cost === 1 ? "moeda" : "moedas"}
          </span>
          {!canAfford && " — moedas insuficientes!"}
        </p>
      )}
    </div>
  );
}
