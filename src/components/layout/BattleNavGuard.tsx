"use client";

import Link from "next/link";
import { useBattleSessionStore } from "@/stores/battle-session-store";
import { usePrefetchOnIntent } from "@/lib/use-prefetch-on-intent";

export function GuardedNavLink({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  const sessionActive = useBattleSessionStore((s) => s.isActive);
  const openSurrenderModal = useBattleSessionStore((s) => s.openSurrenderModal);
  const intent = usePrefetchOnIntent(href);

  const onClick = (e: React.MouseEvent) => {
    if (!sessionActive) return;
    e.preventDefault();
    openSurrenderModal();
  };

  return (
    <Link href={href} {...intent} className={className} onClick={onClick}>
      {children}
    </Link>
  );
}

