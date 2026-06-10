"use client";

import { ArrowLeft } from "lucide-react";

interface EggBackBarProps {
  label?: string;
  onBack: () => void;
}

export function EggBackBar({ label = "Voltar aos ovos", onBack }: EggBackBarProps) {
  return (
    <button
      type="button"
      onClick={onBack}
      className="inline-flex items-center gap-2 text-sm font-semibold text-white/50 hover:text-white/85 transition-colors group mb-4"
    >
      <span className="flex items-center justify-center w-8 h-8 rounded-xl border border-white/10 bg-white/5 group-hover:bg-white/10 group-hover:border-white/20 transition-all">
        <ArrowLeft className="w-4 h-4" />
      </span>
      {label}
    </button>
  );
}
