"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Timer } from "lucide-react";
import { LUCKY_EGG_SPRITE, RARE_CANDY_SPRITE } from "@/data/item-sprites";
import { useEconomyStore } from "@/stores/economy-store";
import { RareCandyModal } from "@/components/layout/RareCandyModal";
import { LuckyEggConfirmModal } from "@/components/layout/LuckyEggConfirmModal";
import { ItemSprite } from "@/components/ui/ItemSprite";
import { cn } from "@/lib/utils";

interface TrainerItemsBarProps {
  className?: string;
}

export function TrainerItemsBar({ className }: TrainerItemsBarProps) {
  const luckyEggCount = useEconomyStore((s) => s.luckyEggCount ?? 0);
  const luckyEggExpiresAt = useEconomyStore((s) => s.luckyEggExpiresAt);
  const rareCandyCount = useEconomyStore((s) => s.rareCandyCount ?? 0);
  const activateLuckyEgg = useEconomyStore((s) => s.activateLuckyEgg);
  const isLuckyEggActive = useEconomyStore((s) => s.isLuckyEggActive());

  const [secondsLeft, setSecondsLeft] = useState(0);
  const [candyOpen, setCandyOpen] = useState(false);
  const [luckyEggConfirmOpen, setLuckyEggConfirmOpen] = useState(false);

  useEffect(() => {
    if (!isLuckyEggActive || !luckyEggExpiresAt) {
      setSecondsLeft(0);
      return;
    }

    const tick = () => {
      setSecondsLeft(Math.max(0, Math.ceil((luckyEggExpiresAt - Date.now()) / 1000)));
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [isLuckyEggActive, luckyEggExpiresAt]);

  if (luckyEggCount <= 0 && rareCandyCount <= 0 && !isLuckyEggActive) {
    return null;
  }

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <>
      <div className={cn("flex items-center gap-1.5 shrink-0", className)}>
        {(luckyEggCount > 0 || isLuckyEggActive) && (
          <motion.button
            type="button"
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              if (isLuckyEggActive) return;
              setLuckyEggConfirmOpen(true);
            }}
            disabled={isLuckyEggActive && luckyEggCount <= 0}
            title={
              isLuckyEggActive
                ? `Lucky Egg ativo · 2× XP · ${formatTime(secondsLeft)}`
                : `Ativar Lucky Egg (2× XP por 5 min) · ${luckyEggCount} no inventário`
            }
            className={cn(
              "inline-flex items-center gap-1.5 px-2 py-1 rounded-xl glass text-xs border transition-all",
              isLuckyEggActive
                ? "border-amber-400/50 bg-amber-500/15"
                : "border-white/10 hover:border-amber-400/40 hover:bg-amber-500/10"
            )}
          >
            <motion.span
              animate={isLuckyEggActive ? { rotate: 360 } : { rotate: 0 }}
              transition={
                isLuckyEggActive
                  ? { duration: 2, repeat: Infinity, ease: "linear" }
                  : undefined
              }
              className="inline-flex"
            >
              <ItemSprite src={LUCKY_EGG_SPRITE} alt="Lucky Egg" size={22} />
            </motion.span>
            {isLuckyEggActive ? (
              <>
                <Timer className="w-3 h-3 text-amber-300" />
                <span className="font-mono font-bold tabular-nums text-amber-300">
                  {formatTime(secondsLeft)}
                </span>
              </>
            ) : (
              <span className="font-semibold text-amber-200">×{luckyEggCount}</span>
            )}
          </motion.button>
        )}

        {rareCandyCount > 0 && (
          <motion.button
            type="button"
            whileTap={{ scale: 0.95 }}
            onClick={() => setCandyOpen(true)}
            title="Usar Rare Candy (+1 nível)"
            className="inline-flex items-center gap-1.5 px-2 py-1 rounded-xl glass text-xs border border-white/10 hover:border-pink-400/40 hover:bg-pink-500/10 transition-all"
          >
            <ItemSprite src={RARE_CANDY_SPRITE} alt="Rare Candy" size={22} />
            <span className="font-semibold text-pink-200">×{rareCandyCount}</span>
          </motion.button>
        )}
      </div>

      <RareCandyModal open={candyOpen} onClose={() => setCandyOpen(false)} />
      <LuckyEggConfirmModal
        open={luckyEggConfirmOpen}
        count={luckyEggCount}
        onConfirm={activateLuckyEgg}
        onClose={() => setLuckyEggConfirmOpen(false)}
      />
    </>
  );
}
