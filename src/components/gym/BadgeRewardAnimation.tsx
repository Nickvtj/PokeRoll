"use client";

import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { POKEMON_MAP } from "@/data/pokemon";
import { Coins } from "lucide-react";
import { isLocalAsset } from "@/lib/image-utils";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { GymBadge } from "@/components/gym/GymBadge";
import type { GymDefinition } from "@/types/gym";
import type { PerfectRunBonus } from "@/types/gym";

interface BadgeRewardAnimationProps {
  show: boolean;
  gym: GymDefinition;
  teamIds: number[];
  bonus: PerfectRunBonus;
  onClose: () => void;
}

export function BadgeRewardAnimation({
  show,
  gym,
  teamIds,
  bonus,
  onClose,
}: BadgeRewardAnimationProps) {
  if (typeof window === "undefined" || !show) return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[10001] flex items-center justify-center p-4"
      >
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />
        <motion.div
          initial={{ scale: 0.5, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", damping: 12 }}
          className="relative glass-card p-8 max-w-sm w-full text-center space-y-5 border max-h-[90dvh] overflow-y-auto"
          style={{
            borderColor: `${gym.themeColor}50`,
            boxShadow: `0 0 80px ${gym.themeColor}40`,
          }}
        >
          <div className="w-full flex justify-center">
            <GymBadge gymId={gym.id} name={gym.badgeName} earned size="lg" color={gym.themeColor} />
          </div>

          <div>
            <h2 className="text-2xl font-black text-amber-400">Insígnia Conquistada!</h2>
            <p className="text-sm text-white/60 mt-1">{gym.badgeName}</p>
            <p className="text-xs text-white/40">{gym.leaderName}, {gym.arenaName}</p>
          </div>

          <div className="space-y-2">
            <p className="text-[10px] text-white/50 uppercase tracking-wider font-semibold">
              Campeões registrados
            </p>
            <div className="grid grid-cols-3 gap-2">
              {teamIds.map((id) => {
                const p = POKEMON_MAP[id];
                if (!p) return null;
                return (
                  <div
                    key={id}
                    className="rounded-xl bg-white/5 p-2 border space-y-1"
                    style={{ borderColor: `${gym.themeColor}40` }}
                  >
                    <Image
                      src={p.image}
                      alt={p.name}
                      width={48}
                      height={48}
                      className="object-contain mx-auto"
                      unoptimized={!isLocalAsset(p.image)}
                    />
                    <p className="text-[9px] font-bold truncate">{p.name}</p>
                    <div className="flex justify-center">
                      <GymBadge
                        gymId={gym.id}
                        name={gym.badgeName}
                        earned
                        color={gym.themeColor}
                        size="xs"
                      />
                    </div>
                    <p className="text-[8px] text-amber-400/90 leading-tight">{gym.badgeName}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <p className="text-sm font-bold text-indigo-300">
            Rank {bonus.rank}, {"★".repeat(bonus.stars)}
          </p>
          <p className="text-[10px] text-amber-400/80 flex items-center justify-center gap-1">
            <Coins className="w-3 h-3" />
            Colete {15} moedas no card do ginásio
          </p>

          <AnimatedButton variant="gold" onClick={onClose} className="w-full">
            Continuar Jornada
          </AnimatedButton>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}
