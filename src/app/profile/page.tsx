"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { User, Gift, Trophy, CalendarDays, Palette, Award } from "lucide-react";
import { PanelSkeleton } from "@/components/ui/RouteLoading";
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
    <div className="max-w-lg mx-auto px-4 py-8 space-y-5">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <User className="w-8 h-8 text-purple-400" />
          Meu Perfil
        </h1>
        <p className="text-white/50 text-sm">Escolha uma seção para explorar</p>
      </div>

      <div className="glass-card p-1.5 grid grid-cols-3 sm:grid-cols-6 gap-1">
        {TABS.map(({ id, label, icon: Icon }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={cn(
                "relative flex flex-col items-center gap-1 py-2.5 px-1 rounded-xl text-[10px] font-semibold transition-colors duration-200",
                isActive
                  ? "text-indigo-300 bg-indigo-500/20 border border-indigo-500/30"
                  : "text-white/40 hover:text-white/70 border border-transparent"
              )}
            >
              <Icon className="w-4 h-4 relative z-10" />
              <span className="relative z-10 leading-tight text-center">{label}</span>
            </button>
          );
        })}
      </div>

      <ProfileTabContent tab={activeTab} />
    </div>
  );
}
