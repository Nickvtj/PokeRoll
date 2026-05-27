"use client";

import { Coins } from "lucide-react";
import { useEconomyStore } from "@/stores/economy-store";

/** Partículas de moeda leves (CSS) quando o jogador ganha/perde */
export function RewardAnimation() {
  const coinAnimation = useEconomyStore((s) => s.coinAnimation);

  if (!coinAnimation) return null;

  return (
    <div
      className="fixed inset-0 pointer-events-none z-[9998] overflow-hidden"
      aria-hidden
    >
      {Array.from({ length: 8 }).map((_, i) => (
        <span
          key={`${coinAnimation}-${i}`}
          className={`absolute left-1/2 top-1/2 reward-coin-burst ${
            coinAnimation === "gain" ? "text-amber-400" : "text-red-400"
          }`}
          style={{
            animationDelay: `${i * 0.05}s`,
            ["--burst-x" as string]: `${(Math.random() - 0.5) * 40}vw`,
            ["--burst-y" as string]: `${-10 - Math.random() * 25}vh`,
          }}
        >
          <Coins className="w-6 h-6" />
        </span>
      ))}
    </div>
  );
}
