"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Gift, Trophy, CalendarDays, Palette, Award } from "lucide-react";
import { ProfileCard } from "@/components/profile/ProfileCard";
import { ProfileCustomizePanel } from "@/components/profile/ProfileCustomizePanel";
import { ProfileBadgesPanel } from "@/components/profile/ProfileBadgesPanel";
import { MissionsPanel } from "@/components/missions/MissionsPanel";
import { AchievementsPanel } from "@/components/missions/AchievementsPanel";
import { DailyReward } from "@/components/ui/DailyReward";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "resumo", label: "Resumo", icon: User },
  { id: "personalizar", label: "Avatar", icon: Palette },
  { id: "insignias", label: "Insígnias", icon: Award },
  { id: "missoes", label: "Missões", icon: Gift },
  { id: "login", label: "Login", icon: CalendarDays },
  { id: "conquistas", label: "Conquistas", icon: Trophy },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<TabId>("resumo");

  return (
    <div className="max-w-lg mx-auto px-4 py-8 space-y-5">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-2"
      >
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <User className="w-8 h-8 text-purple-400" />
          Meu Perfil
        </h1>
        <p className="text-white/50 text-sm">Escolha uma seção para explorar</p>
      </motion.div>

      <div className="glass-card p-1.5 grid grid-cols-3 sm:grid-cols-6 gap-1">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={cn(
              "relative flex flex-col items-center gap-1 py-2.5 px-1 rounded-xl text-[10px] font-semibold transition-colors",
              activeTab === id
                ? "text-indigo-300"
                : "text-white/40 hover:text-white/70"
            )}
          >
            {activeTab === id && (
              <motion.div
                layoutId="profile-tab-bg"
                className="absolute inset-0 bg-indigo-500/20 border border-indigo-500/30 rounded-xl"
                transition={{ type: "spring", damping: 20, stiffness: 300 }}
              />
            )}
            <Icon className="w-4 h-4 relative z-10" />
            <span className="relative z-10 leading-tight text-center">{label}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === "resumo" && <ProfileCard />}
          {activeTab === "personalizar" && <ProfileCustomizePanel />}
          {activeTab === "insignias" && <ProfileBadgesPanel />}
          {activeTab === "missoes" && <MissionsPanel />}
          {activeTab === "login" && <DailyReward />}
          {activeTab === "conquistas" && <AchievementsPanel />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
