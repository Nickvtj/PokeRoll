"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { motion } from "framer-motion";
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
    <div className="max-w-5xl mx-auto px-4 py-8 lg:py-12">
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Sidebar */}
        <div className="w-full lg:w-64 shrink-0 space-y-6">
          <div className="space-y-2 lg:px-2">
            <h1 className="text-3xl font-bold flex items-center gap-2 lg:gap-3">
              <User className="w-8 h-8 text-purple-400" />
              Perfil
            </h1>
            <p className="text-white/50 text-sm hidden lg:block">Gerencie sua jornada e aparência</p>
          </div>

          <nav className="glass-card p-2 flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible no-scrollbar">
            {TABS.map(({ id, label, icon: Icon }) => {
              const isActive = activeTab === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setActiveTab(id)}
                  className={cn(
                    "relative flex items-center gap-3 py-3 px-4 rounded-xl text-xs font-bold transition-all duration-200 shrink-0 lg:shrink",
                    isActive
                      ? "text-indigo-300 bg-indigo-500/20 border border-indigo-500/30 shadow-lg shadow-indigo-500/10"
                      : "text-white/40 hover:text-white/70 border border-transparent hover:bg-white/5"
                  )}
                >
                  <Icon className={cn("w-4 h-4 shrink-0", isActive ? "text-indigo-300" : "text-white/30")} />
                  <span className="leading-tight">{label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute left-0 lg:w-1 lg:h-4 lg:bg-indigo-400 lg:rounded-r-full hidden lg:block"
                    />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1 w-full min-w-0">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <ProfileTabContent tab={activeTab} />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
