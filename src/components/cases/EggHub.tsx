"use client";

import { motion } from "framer-motion";
import { CAPSULE_DEFINITIONS } from "@/data/capsules";
import { CAPSULE_MIN_TRAINER_LEVEL } from "@/data/capsule-balance";
import { EggHubCard } from "@/components/cases/EggHubCard";
import type { CapsuleId } from "@/types/capsule";

interface EggHubProps {
  coins: number;
  trainerLevel: number;
  onSelectEgg: (id: CapsuleId) => void;
}

export function EggHub({ coins, trainerLevel, onSelectEgg }: EggHubProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
      {CAPSULE_DEFINITIONS.map((egg, i) => {
        const minLevel = CAPSULE_MIN_TRAINER_LEVEL[egg.id];
        const isUnlocked = trainerLevel >= minLevel;
        return (
          <motion.div
            key={egg.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.035, duration: 0.35 }}
          >
            <EggHubCard
              egg={egg}
              canAfford={coins >= egg.cost}
              isUnlocked={isUnlocked}
              minTrainerLevel={minLevel}
              onSelect={() => onSelectEgg(egg.id)}
            />
          </motion.div>
        );
      })}
    </div>
  );
}
