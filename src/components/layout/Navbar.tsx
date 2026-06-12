"use client";

import { usePathname } from "next/navigation";
import { Home, Disc3, BookOpen, Swords, Gamepad2, ChevronRight } from "lucide-react";
import { EggOutlineIcon } from "@/components/ui/EggIcon";
import { PokeballIcon } from "@/components/ui/PokeballIcon";
import { CoinCounter } from "@/components/ui/CoinCounter";
import { TrainerItemsBar } from "@/components/layout/TrainerItemsBar";
import { cn } from "@/lib/utils";
import { useGameStore } from "@/stores/game-store";
import { TOTAL_POKEMON } from "@/data/pokemon";
import { useEconomyStore } from "@/stores/economy-store";
import { TrainerAvatarDisplay } from "@/components/profile/TrainerAvatarDisplay";
import { GuardedNavLink } from "@/components/layout/BattleNavGuard";
import { usePrefetchOnIntent } from "@/lib/use-prefetch-on-intent";

const navItems = [
  { href: "/", label: "Início", icon: Home },
  { href: "/battle", label: "Batalha", icon: Swords },
  { href: "/games", label: "Jogos", icon: Gamepad2 },
  { href: "/spin", label: "Roleta", icon: Disc3 },
  { href: "/cases", label: "Ovos", icon: EggOutlineIcon },
  { href: "/album", label: "Álbum", icon: BookOpen },
] as const;

function NavItemLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return <GuardedNavLink href={href}>{children}</GuardedNavLink>;
}

function ProfileButton({ className }: { className?: string }) {
  usePrefetchOnIntent("/profile");
  const username = useGameStore((s) => s.profile.username);
  const level = useEconomyStore((s) => s.level);
  const selectedAvatarId = useEconomyStore((s) => s.selectedAvatarId ?? "default");

  return (
    <GuardedNavLink
      href="/profile"
      className={cn(
        "group flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-xl text-xs",
        "bg-slate-900/60 border border-white/10 shrink-0",
        "hover:bg-indigo-500/10 hover:border-indigo-400/35 hover:shadow-[0_0_20px_rgba(99,102,241,0.15)]",
        "active:scale-[0.98] transition-all duration-200 cursor-pointer",
        className
      )}
    >
      <TrainerAvatarDisplay avatarId={selectedAvatarId} username={username} size="xs" />
      <span className="text-white/75 font-semibold truncate max-w-[88px] group-hover:text-white transition-colors hidden xl:inline">
        {username}
      </span>
      <span className="text-indigo-300 font-bold group-hover:text-indigo-200 whitespace-nowrap tabular-nums">
        Nv.{level}
      </span>
      <ChevronRight className="w-3.5 h-3.5 text-white/20 group-hover:text-indigo-300 group-hover:translate-x-0.5 transition-all hidden sm:block" />
    </GuardedNavLink>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const uniqueCount = useGameStore((s) => {
    let count = 0;
    for (const entry of Object.values(s.collection)) {
      if (entry.count >= 1) count++;
    }
    return count;
  });

  return (
    <>
      <header className="hidden lg:block fixed top-0 left-0 right-0 z-40 border-b border-indigo-500/15 bg-slate-950/75 backdrop-blur-xl">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-400/30 to-transparent" />
        <div className="relative flex items-center justify-between h-14 px-6">
          <GuardedNavLink
            href="/"
            className="flex items-center gap-2.5 group shrink-0 z-10"
          >
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-violet-600 to-fuchsia-600 flex items-center justify-center shadow-[0_0_24px_rgba(99,102,241,0.35)] group-hover:scale-105 transition-transform">
              <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/20" />
              <PokeballIcon size={22} />
            </div>
            <h1 className="font-black text-base neon-text leading-none">PokéRoll</h1>
          </GuardedNavLink>

          <nav
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-1"
            aria-label="Menu principal"
          >
            {navItems.map(({ href, label, icon: Icon }) => {
              const active =
                href === "/"
                  ? pathname === "/"
                  : pathname === href || pathname.startsWith(`${href}/`);
              return (
                <NavItemLink key={href} href={href}>
                  <span
                    className={cn(
                      "relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap",
                      active
                        ? "text-white"
                        : "text-white/45 hover:text-white/85"
                    )}
                  >
                    <Icon className={cn("w-3.5 h-3.5 shrink-0", active && "text-indigo-300")} />
                    {label}
                    {active && (
                      <span className="absolute inset-x-2 -bottom-0.5 h-0.5 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.6)]" />
                    )}
                  </span>
                </NavItemLink>
              );
            })}
          </nav>

          <div className="flex items-center justify-end gap-2 shrink-0 z-10">
            <TrainerItemsBar />
            <CoinCounter size="sm" />
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/60 border border-cyan-500/15 text-xs whitespace-nowrap">
              <BookOpen className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className="font-semibold tabular-nums">
                {uniqueCount}/{TOTAL_POKEMON}
              </span>
            </div>
            <ProfileButton />
          </div>
        </div>
      </header>

      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-indigo-500/15 bg-slate-950/85 backdrop-blur-xl">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-400/25 to-transparent" />
        <div className="grid grid-cols-6 items-center py-1 px-0.5">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active =
              href === "/"
                ? pathname === "/"
                : pathname === href || pathname.startsWith(`${href}/`);
            return (
              <NavItemLink key={href} href={href}>
                <span
                  className={cn(
                    "flex flex-col items-center justify-center gap-0.5 py-2 rounded-xl nav-touch-target transition-colors",
                    active ? "text-indigo-300" : "text-white/35"
                  )}
                >
                  <Icon className={cn("w-4 h-4", active && "drop-shadow-[0_0_8px_rgba(129,140,248,0.6)]")} />
                  <span className="text-micro font-semibold leading-none">{label}</span>
                </span>
              </NavItemLink>
            );
          })}
        </div>
      </nav>

      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-3 py-2 pointer-events-none">
        <div className="flex items-center gap-1.5 pointer-events-auto">
          <TrainerItemsBar />
          <CoinCounter size="sm" className="shadow-xl border border-white/10" />
        </div>
        <ProfileButton className="pointer-events-auto shadow-xl" />
      </div>
    </>
  );
}
