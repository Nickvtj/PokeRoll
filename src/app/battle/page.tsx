"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { Swords } from "lucide-react";
import { BattleTabs, type BattleTabId } from "@/components/battle/BattleTabs";
import { CoinCounter } from "@/components/ui/CoinCounter";
import { PanelSkeleton } from "@/components/ui/RouteLoading";
import { getLevelCapLabel } from "@/data/pokemon-xp-curve";
import { useGymStore } from "@/stores/gym-store";
import { useEconomyStore } from "@/stores/economy-store";

const TrainingPanel = dynamic(
  () => import("@/components/battle/TrainingPanel").then((m) => m.TrainingPanel),
  { loading: () => <PanelSkeleton label="Carregando treino..." /> }
);

const GymMap = dynamic(
  () => import("@/components/gym/GymMap").then((m) => m.GymMap),
  { loading: () => <PanelSkeleton label="Carregando ginásios..." /> }
);

const EliteFourScreen = dynamic(
  () => import("@/components/gym/EliteFourScreen").then((m) => m.EliteFourScreen),
  { loading: () => <PanelSkeleton label="Carregando Liga Elite..." /> }
);

export default function BattlePage() {
  const [tab, setTab] = useState<BattleTabId>("training");
  const isEliteUnlocked = useGymStore((s) => s.isEliteUnlocked);
  const badgeCount = useGymStore((s) => s.badges.length);
  const championDefeated = useGymStore((s) => s.championDefeated);
  const getLevelCap = useEconomyStore((s) => s.getLevelCap);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Swords className="w-8 h-8 text-red-400" />
            Batalha
          </h1>
          <p className="text-white/50 text-sm mt-1">
            Liga Kanto · {getLevelCapLabel(badgeCount, championDefeated)} (Nv.{getLevelCap()})
          </p>
        </div>
        <CoinCounter size="sm" />
      </div>

      <BattleTabs active={tab} onChange={setTab} eliteLocked={!isEliteUnlocked()} />

      {tab === "training" && <TrainingPanel />}
      {tab === "gyms" && <GymMap />}
      {tab === "elite" && <EliteFourScreen />}
    </div>
  );
}
