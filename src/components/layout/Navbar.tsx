"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Home, Disc3, BookOpen, User } from "lucide-react";
import { PokeballIcon } from "@/components/ui/PokeballIcon";
import { cn } from "@/lib/utils";
import { useGameStore } from "@/stores/game-store";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/spin", label: "Spin", icon: Disc3 },
  { href: "/album", label: "Álbum", icon: BookOpen },
  { href: "/profile", label: "Perfil", icon: User },
];

export function Navbar() {
  const pathname = usePathname();
  const getUniqueCount = useGameStore((s) => s.getUniqueCount);

  return (
    <>
      {/* Top bar — desktop */}
      <header className="hidden md:flex fixed top-0 left-0 right-0 z-40 items-center justify-between px-6 py-4 glass border-b border-white/10">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-transform">
            <PokeballIcon size={22} />
          </div>
          <div>
            <h1 className="font-bold text-lg neon-text leading-none">PokéRoll</h1>
            <p className="text-xs text-white/40">Coleção de Figurinhas</p>
          </div>
        </Link>

        <nav className="flex items-center gap-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link key={href} href={href}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors",
                    active
                      ? "bg-indigo-500/20 text-indigo-300"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </motion.div>
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 px-4 py-2 rounded-xl glass text-sm">
          <BookOpen className="w-4 h-4 text-cyan-400" />
          <span className="text-white/70">{getUniqueCount()}/150</span>
        </div>
      </header>

      {/* Bottom bar — mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 glass border-t border-white/10 safe-area-pb">
        <div className="flex items-center justify-around py-2 px-2">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link key={href} href={href} className="flex-1">
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  className={cn(
                    "flex flex-col items-center gap-0.5 py-2 rounded-xl transition-colors",
                    active ? "text-indigo-400" : "text-white/40"
                  )}
                >
                  <Icon className={cn("w-5 h-5", active && "drop-shadow-[0_0_8px_rgba(99,102,241,0.6)]")} />
                  <span className="text-[10px] font-medium">{label}</span>
                  {active && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute -bottom-0 w-8 h-0.5 bg-indigo-400 rounded-full"
                    />
                  )}
                </motion.div>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
