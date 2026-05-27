"use client";

import { useState } from "react";
import { Swords } from "lucide-react";
import { BattleTabs, type BattleTabId } from "@/components/battle/BattleTabs";
import { TrainingPanel } from "@/components/battle/TrainingPanel";
import { GymMap } from "@/components/gym/GymMap";
import { EliteFourScreen } from "@/components/gym/EliteFourScreen";
import { useGymStore } from "@/stores/gym-store";

export default function BattlePage() {
  const [tab, setTab] = useState<BattleTabId>("training");
  const isEliteUnlocked = useGymStore((s) => s.isEliteUnlocked);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Swords className="w-8 h-8 text-red-400" />
          Batalha
        </h1>
        <p className="text-white/55 text-sm leading-relaxed max-w-lg">
          Monte seu time, treine contra oponentes e avance pelos ginásios. Vitórias rendem
          moedas e XP para você e seu Pokémon.
        </p>
      </div>

      <BattleTabs active={tab} onChange={setTab} eliteLocked={!isEliteUnlocked()} />

      {tab === "training" && <TrainingPanel />}
      {tab === "gyms" && <GymMap />}
      {tab === "elite" && <EliteFourScreen />}
    </div>
  );
}
