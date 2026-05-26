"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
import { Play, Sparkles, Star, Zap, Swords, MousePointerClick, Coins } from "lucide-react";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { CoinCounter } from "@/components/ui/CoinCounter";
import { useGameStore } from "@/stores/game-store";
import { useEconomyStore } from "@/stores/economy-store";
import { POKEMON_LIST } from "@/data/pokemon";

const featuredPokemon = [
  POKEMON_LIST.find((p) => p.id === 25)!,
  POKEMON_LIST.find((p) => p.id === 6)!,
  POKEMON_LIST.find((p) => p.id === 150)!,
];

const gameModes = [
  {
    href: "/battle",
    icon: Swords,
    title: "Auto Battle",
    desc: "4~7 moedas · Principal progressão",
    color: "from-red-500/20 to-orange-500/20 border-red-500/30",
    iconColor: "text-red-400",
  },
  {
    href: "/minigame",
    icon: MousePointerClick,
    title: "Click Rush",
    desc: "1~3 moedas · Casual rápido",
    color: "from-cyan-500/20 to-blue-500/20 border-cyan-500/30",
    iconColor: "text-cyan-400",
  },
  {
    href: "/spin",
    icon: Coins,
    title: "Roleta",
    desc: "5 moedas/spin · Colete Pokémon",
    color: "from-indigo-500/20 to-purple-500/20 border-indigo-500/30",
    iconColor: "text-indigo-400",
  },
];

export default function HomePage() {
  const getUniqueCount = useGameStore((s) => s.getUniqueCount);
  const getProgress = useGameStore((s) => s.getProgress);
  const level = useEconomyStore((s) => s.level);
  const rank = useEconomyStore((s) => s.rank);

  return (
    <div className="relative min-h-[calc(100dvh-5rem)] flex flex-col items-center justify-center px-4 py-12 overflow-hidden">
      {featuredPokemon.map((pokemon, i) => (
        <motion.div
          key={pokemon.id}
          className="absolute opacity-20 pointer-events-none"
          style={{
            left: `${15 + i * 30}%`,
            top: `${20 + (i % 2) * 40}%`,
          }}
          animate={{ y: [0, -20, 0], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 4 + i, repeat: Infinity, ease: "easeInOut" }}
        >
          <Image
            src={pokemon.image}
            alt={pokemon.name}
            width={120}
            height={120}
            className="object-contain"
            unoptimized
          />
        </motion.div>
      ))}

      <div className="relative z-10 text-center max-w-2xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-4"
        >
          <div className="flex justify-center">
            <CoinCounter size="lg" />
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-sm text-indigo-300 border border-indigo-500/30">
            <Sparkles className="w-4 h-4" />
            Nível {level} · Rank {rank}
          </div>

          <h1 className="text-5xl md:text-7xl font-black tracking-tight">
            <span className="neon-text bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              PokéRoll
            </span>
          </h1>

          <p className="text-lg md:text-xl text-white/60 text-balance max-w-md mx-auto">
            Ganhe moedas, batalhe, clique e gire a roleta para completar seu álbum!
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center justify-center gap-4 flex-wrap"
        >
          <div className="glass-card px-5 py-3 text-center">
            <p className="text-2xl font-bold text-cyan-400">{getUniqueCount()}</p>
            <p className="text-xs text-white/50">Coletados</p>
          </div>
          <div className="glass-card px-5 py-3 text-center">
            <p className="text-2xl font-bold text-indigo-400">{getProgress()}%</p>
            <p className="text-xs text-white/50">Progresso</p>
          </div>
        </motion.div>

        {/* Game modes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-lg mx-auto"
        >
          {gameModes.map(({ href, icon: Icon, title, desc, color, iconColor }) => (
            <Link key={href} href={href}>
              <motion.div
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                className={`glass-card p-4 text-left border bg-gradient-to-br ${color} h-full`}
              >
                <Icon className={`w-6 h-6 ${iconColor} mb-2`} />
                <p className="font-bold text-sm">{title}</p>
                <p className="text-[10px] text-white/40 mt-1">{desc}</p>
              </motion.div>
            </Link>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex flex-wrap justify-center gap-3"
        >
          {[
            { icon: Zap, text: "Economia Balanceada" },
            { icon: Star, text: "Auto Battle" },
            { icon: Sparkles, text: "Click Minigame" },
          ].map(({ icon: Icon, text }) => (
            <span
              key={text}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 text-xs text-white/60 border border-white/10"
            >
              <Icon className="w-3.5 h-3.5" />
              {text}
            </span>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, type: "spring" }}
        >
          <Link href="/battle">
            <AnimatedButton variant="gold" size="xl" icon={<Play className="w-6 h-6 fill-current" />}>
              BATALHAR AGORA
            </AnimatedButton>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
