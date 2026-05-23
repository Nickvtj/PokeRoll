"use client";

import { motion } from "framer-motion";
import { User } from "lucide-react";
import { ProfileCard } from "@/components/profile/ProfileCard";

export default function ProfilePage() {
  return (
    <div className="max-w-lg mx-auto px-4 py-8 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-2"
      >
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <User className="w-8 h-8 text-purple-400" />
          Meu Perfil
        </h1>
        <p className="text-white/50 text-sm">Suas estatísticas de treinador</p>
      </motion.div>

      <ProfileCard />
    </div>
  );
}
