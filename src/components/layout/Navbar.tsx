"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Home, Disc3, BookOpen, User, Swords, MousePointerClick } from "lucide-react";
import { PokeballIcon } from "@/components/ui/PokeballIcon";
import { CoinCounter } from "@/components/ui/CoinCounter";
import { cn } from "@/lib/utils";
import { useGameStore } from "@/stores/game-store";
import { useEconomyStore } from "@/stores/economy-store";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/battle", label: "Battle", icon: Swords },
  { href: "/minigame", label: "Click", icon: MousePointerClick },
  { href: "/spin", label: "Spin", icon: Disc3 },
  { href: "/album", label: "Álbum", icon: BookOpen },
  { href: "/profile", label: "Perfil", icon: User },
];

export function Navbar() {
  const pathname = usePathname();
  const uniqueCount = useGameStore((s) => Object.keys(s.collection).length);
  const username = useGameStore((s) => s.profile.username);
  const level = useEconomyStore((s) => s.level);

  return (
    <>
      <header className="hidden lg:flex fixed top-0 left-0 right-0 z-40 items-center justify-between px-6 py-3 glass border-b border-white/10">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-transform">
            <PokeballIcon size={22} />
          </div>
          <div>
            <h1 className="font-bold text-lg neon-text leading-none">PokéRoll</h1>
            <p className="text-xs text-white/40">Coleção de Figurinhas</p>
          </div>
        </Link>

        <nav className="flex items-center gap-0.5">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link key={href} href={href}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors",
                    active
                      ? "bg-indigo-500/20 text-indigo-300"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </motion.div>
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <CoinCounter size="sm" />
          <div className="px-3 py-1.5 rounded-xl glass text-xs">
            <BookOpen className="w-3.5 h-3.5 text-cyan-400 inline mr-1" />
            {uniqueCount}/150
          </div>
          <div className="px-3 py-1.5 rounded-xl glass text-xs border border-white/5">
            <span className="text-white/70 font-medium truncate max-w-[100px] inline-block align-bottom">
              {username}
            </span>
            <span className="text-indigo-400 font-semibold ml-1.5">Nv.{level}</span>
          </div>
        </div>
      </header>

      {/* Mobile bottom nav — 6 items */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 glass border-t border-white/10">
        <div className="grid grid-cols-6 items-center py-1 px-0.5">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link key={href} href={href}>
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  className={cn(
                    "flex flex-col items-center gap-0.5 py-1.5 rounded-xl",
                    active ? "text-indigo-400" : "text-white/40"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-[8px] font-medium">{label}</span>
                </motion.div>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Mobile coin counter top */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 flex justify-center py-2 pointer-events-none">
        <CoinCounter size="sm" className="pointer-events-auto shadow-xl" />
      </div>
    </>
  );
}
