"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Coins, Gift, Sparkles } from "lucide-react";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { WELCOME_PACKAGE_COINS, SPIN_COST_PER_REEL } from "@/data/economy-balance";
import { useEconomyStore } from "@/stores/economy-store";

export function WelcomeModal() {
  const welcomeClaimed = useEconomyStore((s) => s.welcomeClaimed ?? false);
  const claimWelcomePackage = useEconomyStore((s) => s.claimWelcomePackage);

  const show = !welcomeClaimed;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[10001] flex items-center justify-center p-4"
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />
          <motion.div
            initial={{ scale: 0.85, y: 30 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 14 }}
            className="relative glass-card p-8 text-center space-y-5 max-w-sm w-full border border-indigo-500/40"
            style={{ boxShadow: "0 0 60px rgba(99,102,241,0.35)" }}
          >
            <motion.div
              animate={{ rotate: [0, 8, -8, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center"
            >
              <Gift className="w-8 h-8 text-white" />
            </motion.div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-300 to-cyan-300 bg-clip-text text-transparent">
                Pacote de Boas-Vindas!
              </h2>
              <p className="text-white/60 text-sm">
                Bem-vindo ao PokéRoll! Colete seu pacote inicial e gire a roleta.
              </p>
            </div>

            <div className="glass-card p-4 space-y-2 border border-amber-500/30">
              <div className="flex items-center justify-center gap-2 text-amber-400 font-bold text-xl">
                <Coins className="w-6 h-6" />
                +{WELCOME_PACKAGE_COINS} moedas
              </div>
              <p className="text-xs text-white/40 flex items-center justify-center gap-1">
                <Sparkles className="w-3 h-3" />
                Suficiente para 1 giro 3x ({SPIN_COST_PER_REEL * 3} moedas)
              </p>
            </div>

            <AnimatedButton variant="gold" onClick={claimWelcomePackage} className="w-full">
              Coletar Pacote
            </AnimatedButton>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
