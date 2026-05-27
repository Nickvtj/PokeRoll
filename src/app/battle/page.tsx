"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { Swords } from "lucide-react";
import { BattleTabs, type BattleTabId } from "@/components/battle/BattleTabs";
import { TrainingPanel } from "@/components/battle/TrainingPanel";
import { PanelSkeleton } from "@/components/ui/RouteLoading";
import { useGymStore } from "@/stores/gym-store";

const GymMap = dynamic(
  () => import("@/components/gym/GymMap").then((m) => ({ default: m.GymMap })),
  { loading: () => <PanelSkeleton label="Carregando ginásios..." /> }
);

const EliteFourScreen = dynamic(
  () => import("@/components/gym/EliteFourScreen").then((m) => ({ default: m.EliteFourScreen })),
  { loading: () => <PanelSkeleton label="Carregando Elite Four..." /> }
);

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
