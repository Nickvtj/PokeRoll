"use client";

import { motion } from "framer-motion";
import { GYMS } from "@/data/gyms";
import { useGymStore } from "@/stores/gym-store";
import { GymBadge } from "@/components/gym/GymBadge";

export function ProfileBadgesPanel() {
  const badges = useGymStore((s) => s.badges);
  const championDefeated = useGymStore((s) => s.championDefeated);

  const earned = GYMS.filter((g) => badges.includes(g.id));
  const missing = GYMS.filter((g) => !badges.includes(g.id));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="glass-card p-6 space-y-4"
    >
      <div className="flex items-center justify-between">
        <h3 className="font-bold">Insígnias Kanto</h3>
        <span className="text-sm font-bold text-indigo-300">{badges.length}/8</span>
      </div>

      {earned.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] text-emerald-400/80 uppercase tracking-wider font-semibold">
            Conquistadas
          </p>
          <div className="grid grid-cols-4 gap-3">
            {earned.map((g) => (
              <div key={g.id} className="flex flex-col items-center gap-1">
                <GymBadge gymId={g.id} name={g.badgeName} earned color={g.themeColor} size="sm" />
                <p className="text-[8px] text-white/50 text-center leading-tight">{g.badgeName}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {missing.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] text-white/40 uppercase tracking-wider font-semibold">
            Faltam conquistar
          </p>
          <div className="grid grid-cols-4 gap-3">
            {missing.map((g) => (
              <div key={g.id} className="flex flex-col items-center gap-1 opacity-60">
                <GymBadge gymId={g.id} name={g.badgeName} earned={false} color={g.themeColor} size="sm" />
                <p className="text-[8px] text-white/30 text-center leading-tight">{g.leaderName}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {championDefeated && (
        <p className="text-center text-xs text-amber-400 font-semibold pt-2 border-t border-white/10">
          🏆 Campeão da Liga — Hall of Fame
        </p>
      )}
    </motion.div>
  );
}
