"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy } from "lucide-react";
import { ACHIEVEMENTS, getAchievementIcon } from "@/data/achievements";
import { useEconomyStore } from "@/stores/economy-store";
import { playAchievementUnlock } from "@/lib/ui-sounds";
import { cn } from "@/lib/utils";

export function AchievementUnlockToast() {
  const queue = useEconomyStore((s) => s.achievementToastQueue ?? []);
  const dequeueAchievementToast = useEconomyStore((s) => s.dequeueAchievementToast);

  const current = queue[0];
  const achievement = current ? ACHIEVEMENTS.find((a) => a.id === current.id) : null;

  useEffect(() => {
    if (!current) return;
    playAchievementUnlock();
    const t = setTimeout(() => dequeueAchievementToast(current.id), 4200);
    return () => clearTimeout(t);
  }, [current, dequeueAchievementToast]);

  const Icon = achievement ? getAchievementIcon(achievement.iconKey) : Trophy;

  return (
    <div className="fixed bottom-20 lg:bottom-6 right-4 z-[180] pointer-events-none max-w-[min(92vw,320px)]">
      <AnimatePresence mode="wait">
        {achievement && (
          <motion.div
            key={achievement.id}
            initial={{ opacity: 0, x: 80, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 40, scale: 0.95 }}
            transition={{ type: "spring", damping: 22, stiffness: 280 }}
            className={cn(
              "pointer-events-auto rounded-xl overflow-hidden",
              "bg-gradient-to-r from-amber-950/95 via-slate-900/98 to-slate-900/95",
              "ring-1 ring-amber-400/35 shadow-2xl shadow-amber-500/15"
            )}
          >
            <div className="flex items-center gap-3 p-3">
              <div className="w-12 h-12 rounded-lg bg-amber-500/20 border border-amber-400/30 flex items-center justify-center shrink-0">
                <Icon className="w-6 h-6 text-amber-300" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-amber-400/90">
                  Conquista desbloqueada
                </p>
                <p className="text-sm font-bold truncate">{achievement.label}</p>
                <p className="text-[10px] text-white/45 truncate">{achievement.description}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
