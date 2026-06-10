"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
import { Play, Swords, Gamepad2, Disc3 } from "lucide-react";
import { EggIcon } from "@/components/ui/EggIcon";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { useGameStore } from "@/stores/game-store";
import { POKEMON_LIST } from "@/data/pokemon";
import { isLocalAsset } from "@/lib/image-utils";

const featuredPokemon = [
  POKEMON_LIST.find((p) => p.id === 25)!,
  POKEMON_LIST.find((p) => p.id === 6)!,
  POKEMON_LIST.find((p) => p.id === 150)!,
];

const gameModes = [
  {
    href: "/battle",
    icon: Swords,
    title: "Batalha",
    desc: "Treine seu time e conquiste insígnias",
    color: "from-red-500/20 to-orange-500/20 border-red-500/30",
    iconColor: "text-red-400",
  },
  {
    href: "/games",
    icon: Gamepad2,
    title: "Jogos",
    desc: "Minigames rápidos para farmar moedas",
    color: "from-indigo-500/20 to-violet-500/20 border-indigo-500/30",
    iconColor: "text-indigo-400",
  },
  {
    href: "/spin",
    icon: Disc3,
    title: "Roleta",
    desc: "Gire e complete seu álbum",
    color: "from-indigo-500/20 to-purple-500/20 border-indigo-500/30",
    iconColor: "text-indigo-400",
  },
  {
    href: "/cases",
    icon: EggIcon,
    title: "Ovos",
    desc: "Choque ovos temáticos e complete o álbum",
    color: "from-amber-500/20 to-orange-500/20 border-amber-500/30",
    iconColor: "text-amber-400",
  },
];

export default function HomePage() {
  const getUniqueCount = useGameStore((s) => s.getUniqueCount);
  const getProgress = useGameStore((s) => s.getProgress);

  return (
    <div className="page-fit relative px-4 overflow-hidden">
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
            unoptimized={!isLocalAsset(pokemon.image)}
          />
        </motion.div>
      ))}

      <div className="relative z-10 text-center max-w-2xl mx-auto space-y-6 w-full">
        <div className="space-y-3">
          <h1 className="text-5xl md:text-7xl font-black tracking-tight">
            <span className="neon-text bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              PokéRoll
            </span>
          </h1>

          <p className="text-lg md:text-xl text-white/60 text-balance max-w-md mx-auto">
            Ganhe moedas, batalhe, jogue minigames e gire a roleta para completar seu álbum!
          </p>
        </div>

        <div className="flex items-center justify-center gap-4 flex-wrap">
          <div className="glass-card px-5 py-3 text-center min-w-[7rem]">
            <p className="text-2xl font-bold text-cyan-400">{getUniqueCount()}</p>
            <p className="text-xs text-white/50">Coletados</p>
          </div>
          <div className="glass-card px-5 py-3 text-center min-w-[7rem]">
            <p className="text-2xl font-bold text-indigo-400">{getProgress()}%</p>
            <p className="text-xs text-white/50">Progresso</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 max-w-3xl mx-auto">
          {gameModes.map(({ href, icon: Icon, title, desc, color, iconColor }) => (
            <Link key={href} href={href}>
              <motion.div
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                className={`glass-card p-4 text-left border bg-gradient-to-br ${color} h-full`}
              >
                <Icon className={`w-6 h-6 ${iconColor} mb-2`} />
                <p className="font-bold text-sm">{title}</p>
                <p className="text-[10px] text-white/40 mt-1 leading-snug">{desc}</p>
              </motion.div>
            </Link>
          ))}
        </div>

        <div>
          <Link href="/battle">
            <AnimatedButton variant="gold" size="xl" icon={<Play className="w-6 h-6 fill-current" />}>
              BATALHAR AGORA
            </AnimatedButton>
          </Link>
        </div>
      </div>
    </div>
  );
}
