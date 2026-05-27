"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Disc3, BookOpen, Swords, Gamepad2, ChevronRight } from "lucide-react";
import { PokeballIcon } from "@/components/ui/PokeballIcon";
import { CoinCounter } from "@/components/ui/CoinCounter";
import { cn } from "@/lib/utils";
import { useGameStore } from "@/stores/game-store";
import { useEconomyStore } from "@/stores/economy-store";
import { TrainerAvatarDisplay } from "@/components/profile/TrainerAvatarDisplay";

const navItems = [
  { href: "/", label: "Início", icon: Home },
  { href: "/battle", label: "Batalha", icon: Swords },
  { href: "/games", label: "Jogos", icon: Gamepad2 },
  { href: "/spin", label: "Roleta", icon: Disc3 },
  { href: "/album", label: "Álbum", icon: BookOpen },
] as const;

function ProfileButton({ className }: { className?: string }) {
  const username = useGameStore((s) => s.profile.username);
  const level = useEconomyStore((s) => s.level);
  const selectedAvatarId = useEconomyStore((s) => s.selectedAvatarId ?? "default");

  return (
    <Link
      href="/profile"
      className={cn(
        "group flex items-center gap-2 px-3 py-1.5 rounded-xl glass text-xs border border-white/10 shrink-0",
        "hover:bg-indigo-500/15 hover:border-indigo-400/40 hover:shadow-lg hover:shadow-indigo-500/20",
        "hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer",
        className
      )}
    >
      <TrainerAvatarDisplay
        avatarId={selectedAvatarId}
        username={username}
        size="xs"
      />
      <span className="text-white/70 font-medium truncate max-w-[88px] group-hover:text-white transition-colors hidden xl:inline">
        {username}
      </span>
      <span className="text-indigo-400 font-semibold group-hover:text-indigo-300 whitespace-nowrap">
        Nv.{level}
      </span>
      <ChevronRight className="w-3.5 h-3.5 text-white/25 group-hover:text-indigo-300 group-hover:translate-x-0.5 transition-all hidden sm:block" />
    </Link>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const uniqueCount = useGameStore((s) => Object.keys(s.collection).length);

  return (
    <>
      <header className="hidden lg:grid fixed top-0 left-0 right-0 z-40 grid-cols-[1fr_auto_1fr] items-center gap-4 px-6 py-3 glass glass-blur border-b border-white/10">
        <Link
          href="/"
          className="flex items-center gap-2 group shrink-0 justify-self-start"
          title="PokéRoll"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-transform">
            <PokeballIcon size={22} />
          </div>
          <h1 className="font-bold text-lg neon-text leading-none">PokéRoll</h1>
        </Link>

        <nav className="flex items-center gap-0.5 justify-self-center">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active =
              href === "/"
                ? pathname === "/"
                : pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link key={href} href={href}>
                <span
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors whitespace-nowrap",
                    active
                      ? "bg-indigo-500/20 text-indigo-300"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  )}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  {label}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center justify-end gap-2 justify-self-end min-w-0">
          <CoinCounter size="sm" />
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass text-xs whitespace-nowrap shrink-0">
            <BookOpen className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>{uniqueCount}/150</span>
          </div>
          <ProfileButton />
        </div>
      </header>

      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 glass glass-blur border-t border-white/10">
        <div className="grid grid-cols-5 items-center py-1 px-0.5">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active =
              href === "/"
                ? pathname === "/"
                : pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link key={href} href={href}>
                <span
                  className={cn(
                    "flex flex-col items-center gap-0.5 py-1.5 rounded-xl",
                    active ? "text-indigo-400" : "text-white/40"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-[8px] font-medium">{label}</span>
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-3 py-2 pointer-events-none">
        <CoinCounter size="sm" className="pointer-events-auto shadow-xl" />
        <ProfileButton className="pointer-events-auto shadow-xl" />
      </div>
    </>
  );
}
