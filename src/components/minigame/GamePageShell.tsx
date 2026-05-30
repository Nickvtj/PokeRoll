"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
interface GamePageShellProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

export function GamePageShell({
  title,
  subtitle,
  icon,
  children,
}: GamePageShellProps) {
  return (
    <div className="max-w-lg mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center gap-3 min-w-0">
        <Link
          href="/games"
          className="shrink-0 p-2 rounded-xl glass border border-white/10 text-white/50 hover:text-white hover:bg-white/5 transition-colors"
          title="Voltar ao hub"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="min-w-0">
          <h1 className="text-2xl font-bold flex items-center gap-2 truncate">
            {icon}
            <span className="truncate">{title}</span>
          </h1>
          <p className="text-white/50 text-xs mt-0.5 leading-relaxed">{subtitle}</p>
        </div>
      </div>

      {children}
    </div>
  );
}
