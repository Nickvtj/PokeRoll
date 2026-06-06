"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { User, Gift, Trophy, CalendarDays, Palette, Award } from "lucide-react";
import { PanelSkeleton } from "@/components/ui/RouteLoading";
import { playUiClick } from "@/lib/ui-sounds";
import { cn } from "@/lib/utils";

const ProfileCard = dynamic(
  () => import("@/components/profile/ProfileCard").then((m) => ({ default: m.ProfileCard })),
  { loading: () => <PanelSkeleton label="Carregando resumo..." /> }
);

const ProfileCustomizePanel = dynamic(
  () => import("@/components/profile/ProfileCustomizePanel").then((m) => m.ProfileCustomizePanel),
  { loading: () => <PanelSkeleton /> }
);

const ProfileBadgesPanel = dynamic(
  () => import("@/components/profile/ProfileBadgesPanel").then((m) => m.ProfileBadgesPanel),
  { loading: () => <PanelSkeleton /> }
);

const MissionsPanel = dynamic(
  () => import("@/components/missions/MissionsPanel").then((m) => m.MissionsPanel),
  { loading: () => <PanelSkeleton /> }
);

const AchievementsPanel = dynamic(
  () => import("@/components/missions/AchievementsPanel").then((m) => m.AchievementsPanel),
  { loading: () => <PanelSkeleton /> }
);

const DailyReward = dynamic(
  () => import("@/components/ui/DailyReward").then((m) => m.DailyReward),
  { loading: () => <PanelSkeleton /> }
);

const TABS = [
  { id: "resumo", label: "Resumo", icon: User },
  { id: "personalizar", label: "Aparência", icon: Palette },
  { id: "insignias", label: "Insígnias", icon: Award },
  { id: "missoes", label: "Missões", icon: Gift },
  { id: "login", label: "Diário", icon: CalendarDays },
  { id: "conquistas", label: "Conquistas", icon: Trophy },
] as const;

type TabId = (typeof TABS)[number]["id"];

function ProfileTabContent({ tab }: { tab: TabId }) {
  switch (tab) {
    case "resumo":
      return <ProfileCard />;
    case "personalizar":
      return <ProfileCustomizePanel />;
    case "insignias":
      return <ProfileBadgesPanel />;
    case "missoes":
      return <MissionsPanel />;
    case "login":
      return <DailyReward />;
    case "conquistas":
      return <AchievementsPanel />;
  }
}

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<TabId>("resumo");

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 lg:py-8">
      <div className="flex flex-col lg:flex-row lg:gap-8">
        <aside className="lg:w-56 shrink-0 mb-6 lg:mb-0">
          <div className="lg:fixed lg:top-20 lg:w-56 lg:max-h-[calc(100dvh-6rem)] lg:overflow-y-auto no-scrollbar space-y-4">
            <header className="space-y-1 lg:px-1 hidden lg:block">
              <h1 className="text-2xl lg:text-3xl font-bold flex items-center gap-2">
                <User className="w-7 h-7 lg:w-8 lg:h-8 text-purple-400" />
                Perfil
              </h1>
              <p className="text-white/45 text-xs">Jornada, aparência e conquistas</p>
            </header>

            <header className="space-y-1 lg:hidden mb-2">
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <User className="w-7 h-7 text-purple-400" />
                Perfil
              </h1>
            </header>

            <nav>
              <div className="rounded-2xl bg-slate-900/50 ring-1 ring-inset ring-indigo-500/10 p-1.5 flex lg:flex-col gap-0.5 overflow-x-auto lg:overflow-visible no-scrollbar shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                {TABS.map(({ id, label, icon: Icon }) => {
                  const isActive = activeTab === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => {
                        if (id !== activeTab) playUiClick();
                        setActiveTab(id);
                      }}
                      className={cn(
                        "flex items-center gap-2.5 py-2.5 px-3 rounded-xl text-xs font-bold transition-colors duration-200 shrink-0 lg:w-full",
                        isActive
                          ? "text-indigo-100 bg-indigo-500/25 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
                          : "text-white/40 hover:text-white/70 hover:bg-white/[0.04]"
                      )}
                    >
                      <Icon
                        className={cn(
                          "w-4 h-4 shrink-0",
                          isActive ? "text-indigo-300" : "text-white/30"
                        )}
                      />
                      <span className="leading-tight whitespace-nowrap">{label}</span>
                    </button>
                  );
                })}
              </div>
            </nav>
          </div>
        </aside>

        <main className="flex-1 min-w-0 lg:ml-0">
          <ProfileTabContent tab={activeTab} />
        </main>
      </div>
    </div>
  );
}
