"use client";

import { motion } from "framer-motion";
import { Dumbbell, Map, Crown } from "lucide-react";
import { cn } from "@/lib/utils";
import { playUiTab } from "@/lib/ui-sounds";

export type BattleTabId = "training" | "gyms" | "elite";

const TABS: { id: BattleTabId; label: string; icon: typeof Dumbbell }[] = [
  { id: "training", label: "Casual", icon: Dumbbell },
  { id: "gyms", label: "Ginásios", icon: Map },
  { id: "elite", label: "Liga Elite", icon: Crown },
];

interface BattleTabsProps {
  active: BattleTabId;
  onChange: (tab: BattleTabId) => void;
  eliteLocked?: boolean;
}

export function BattleTabs({ active, onChange, eliteLocked }: BattleTabsProps) {
  return (
    <div className="glass-card p-1.5 grid grid-cols-3 gap-1">
      {TABS.map(({ id, label, icon: Icon }) => {
        const locked = id === "elite" && eliteLocked;
        return (
          <button
            key={id}
            type="button"
            disabled={locked}
            onClick={() => {
              if (locked || id === active) return;
              playUiTab();
              onChange(id);
            }}
            className={cn(
              "relative flex flex-col items-center gap-1 py-2.5 px-1 rounded-xl text-[10px] font-semibold transition-colors",
              active === id ? "text-indigo-300" : "text-white/40 hover:text-white/70",
              locked && "opacity-40 cursor-not-allowed"
            )}
          >
            {active === id && (
              <motion.div
                layoutId="battle-tab-bg"
                className="absolute inset-0 bg-indigo-500/20 border border-indigo-500/30 rounded-xl"
                transition={{ type: "spring", damping: 20, stiffness: 300 }}
              />
            )}
            <Icon className="w-4 h-4 relative z-10" />
            <span className="relative z-10">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
