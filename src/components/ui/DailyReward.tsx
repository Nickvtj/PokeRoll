"use client";

import { motion } from "framer-motion";
import { CalendarDays, Flame } from "lucide-react";
import { DAILY_LOGIN_COINS } from "@/data/economy-balance";
import { useEconomyStore } from "@/stores/economy-store";
import { cn } from "@/lib/utils";

export function DailyReward() {
  const dailyStreak = useEconomyStore((s) => s.dailyStreak);
  const lastLoginDate = useEconomyStore((s) => s.lastLoginDate);
  const today = new Date().toISOString().slice(0, 10);
  const claimedToday = lastLoginDate === today;

  return (
    <div className="glass-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold flex items-center gap-2">
          <CalendarDays className="w-5 h-5 text-amber-400" />
          Login Diário
        </h3>
        <span className="inline-flex items-center gap-1 text-xs text-orange-400 font-bold">
          <Flame className="w-3.5 h-3.5" />
          {dailyStreak} dias
        </span>
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {DAILY_LOGIN_COINS.map((coins, i) => {
          const dayNum = i + 1;
          const isPast = dailyStreak >= dayNum;
          const isToday = claimedToday && dailyStreak === dayNum;
          const isCurrent = !claimedToday && dailyStreak + 1 === dayNum;

          return (
            <motion.div
              key={dayNum}
              whileHover={{ scale: 1.05 }}
              className={cn(
                "rounded-xl p-2 text-center border transition-all",
                isPast || isToday
                  ? "bg-amber-500/20 border-amber-500/40"
                  : isCurrent
                    ? "bg-indigo-500/20 border-indigo-400/50 ring-1 ring-indigo-400/30"
                    : "bg-white/5 border-white/10 opacity-50"
              )}
            >
              <p className="text-[9px] text-white/40">D{dayNum}</p>
              <p className="text-xs font-bold text-amber-400">{coins}</p>
            </motion.div>
          );
        })}
      </div>

      <p className="text-xs text-white/40 text-center">
        {claimedToday
          ? "✅ Recompensa de hoje já coletada! Volte amanhã."
          : "Faça login amanhã para manter o streak!"}
      </p>
    </div>
  );
}
