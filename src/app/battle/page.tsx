"use client";

import dynamic from "next/dynamic";
import { useState, useCallback } from "react";
import { Swords } from "lucide-react";
import { BattleTabs, type BattleTabId } from "@/components/battle/BattleTabs";
import { TrainingPanel } from "@/components/battle/TrainingPanel";
import { PanelSkeleton } from "@/components/ui/RouteLoading";
import { useGymStore } from "@/stores/gym-store";
import { useBattleSessionStore } from "@/stores/battle-session-store";
import { cn } from "@/lib/utils";

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
  const [battleActive, setBattleActive] = useState(false);
  const sessionActive = useBattleSessionStore((s) => s.isActive);
  const openSurrenderModal = useBattleSessionStore((s) => s.openSurrenderModal);
  const isEliteUnlocked = useGymStore((s) => s.isEliteUnlocked);

  const tryChangeTab = useCallback(
    (next: BattleTabId) => {
      if (sessionActive && next !== tab) {
        openSurrenderModal(() => {
          setBattleActive(false);
          setTab(next);
        });
        return;
      }
      setTab(next);
    },
    [sessionActive, tab, openSurrenderModal]
  );

  return (
    <>
      <div
        className={cn(
          "mx-auto px-4",
          battleActive ? "max-w-2xl py-2" : "max-w-2xl lg:max-w-5xl py-6 space-y-5 lg:flex lg:flex-col lg:min-h-0 lg:h-[calc(100dvh-5.5rem)]"
        )}
      >
        {!battleActive && (
          <>
            <div className="space-y-2 shrink-0">
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Swords className="w-8 h-8 text-red-400" />
                Batalha
              </h1>
              <p className="text-white/55 text-sm leading-relaxed max-w-lg">
                Monte seu time, treine contra oponentes e avance pelos ginásios. Vitórias rendem
                moedas e XP para você e seu Pokémon.
              </p>
            </div>

            <BattleTabs active={tab} onChange={tryChangeTab} eliteLocked={!isEliteUnlocked()} />
          </>
        )}

        <div className={cn(!battleActive && "flex-1 min-h-0 flex flex-col")}>
          {tab === "training" && <TrainingPanel onBattleActiveChange={setBattleActive} />}
          {tab === "gyms" && <GymMap onBattleActiveChange={setBattleActive} />}
          {tab === "elite" && <EliteFourScreen onBattleActiveChange={setBattleActive} />}
        </div>
      </div>

    </>
  );
}
