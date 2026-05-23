"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
import { Play, Sparkles, Star, Zap } from "lucide-react";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { useGameStore } from "@/stores/game-store";
import { POKEMON_LIST } from "@/data/pokemon";

const featuredPokemon = [
  POKEMON_LIST.find((p) => p.id === 25)!,  // Pikachu
  POKEMON_LIST.find((p) => p.id === 6)!,   // Charizard
  POKEMON_LIST.find((p) => p.id === 150)!, // Mewtwo
];

export default function HomePage() {
  const getUniqueCount = useGameStore((s) => s.getUniqueCount);
  const getProgress = useGameStore((s) => s.getProgress);

  return (
    <div className="relative min-h-[calc(100dvh-5rem)] flex flex-col items-center justify-center px-4 py-12 overflow-hidden">
      {/* Pokémon flutuantes decorativos */}
      {featuredPokemon.map((pokemon, i) => (
        <motion.div
          key={pokemon.id}
          className="absolute opacity-20 pointer-events-none"
          style={{
            left: `${15 + i * 30}%`,
            top: `${20 + (i % 2) * 40}%`,
          }}
          animate={{
            y: [0, -20, 0],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 4 + i,
            repeat: Infinity,
            ease: "easeInOut",
          }}
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
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-sm text-indigo-300 border border-indigo-500/30">
            <Sparkles className="w-4 h-4" />
            Coleção Premium
          </div>

          <h1 className="text-5xl md:text-7xl font-black tracking-tight">
            <span className="neon-text bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              PokéRoll
            </span>
          </h1>

          <p className="text-lg md:text-xl text-white/60 text-balance max-w-md mx-auto">
            Gire a roleta, colete{" "}
            <span className="text-cyan-400 font-semibold">150 Pokémon</span> e
            complete seu álbum de figurinhas!
          </p>
        </motion.div>

        {/* Stats rápidos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center justify-center gap-6"
        >
          <div className="glass-card px-5 py-3 text-center">
            <p className="text-2xl font-bold text-cyan-400">{getUniqueCount()}</p>
            <p className="text-xs text-white/50">Coletados</p>
          </div>
          <div className="glass-card px-5 py-3 text-center">
            <p className="text-2xl font-bold text-indigo-400">{getProgress()}%</p>
            <p className="text-xs text-white/50">Progresso</p>
          </div>
          <div className="glass-card px-5 py-3 text-center">
            <p className="text-2xl font-bold text-amber-400">150</p>
            <p className="text-xs text-white/50">Total</p>
          </div>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex flex-wrap justify-center gap-3"
        >
          {[
            { icon: Zap, text: "5 Raridades" },
            { icon: Star, text: "Animações Épicas" },
            { icon: Sparkles, text: "Álbum Completo" },
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

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, type: "spring" }}
        >
          <Link href="/spin">
            <AnimatedButton variant="gold" size="xl" icon={<Play className="w-6 h-6 fill-current" />}>
              JOGAR AGORA
            </AnimatedButton>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
