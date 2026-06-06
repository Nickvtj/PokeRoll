"use client";

import { Ban, Bomb, RotateCcw, TrendingDown, TrendingUp, type LucideIcon } from "lucide-react";
import type { JitsuSpecialEffect } from "@/types/jitsu";
import { cn } from "@/lib/utils";

const SPECIAL_ICONS: Record<JitsuSpecialEffect, LucideIcon> = {
  "invert-power": RotateCcw,
  "block-element": Ban,
  "buff-next": TrendingUp,
  "debuff-next": TrendingDown,
  "destroy-trophy": Bomb,
};

interface JitsuSpecialIconProps {
  effect: JitsuSpecialEffect;
  className?: string;
}

export function JitsuSpecialIcon({ effect, className }: JitsuSpecialIconProps) {
  const Icon = SPECIAL_ICONS[effect];
  return <Icon className={cn("w-3 h-3 shrink-0", className)} strokeWidth={2.5} />;
}
