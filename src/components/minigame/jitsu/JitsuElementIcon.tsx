"use client";

import { Flame, Leaf, Waves, type LucideIcon } from "lucide-react";
import type { JitsuElement } from "@/types/jitsu";
import { cn } from "@/lib/utils";

const ELEMENT_ICONS: Record<JitsuElement, LucideIcon> = {
  FOGO: Flame,
  AGUA: Waves,
  PLANTA: Leaf,
};

interface JitsuElementIconProps {
  type: JitsuElement;
  className?: string;
}

export function JitsuElementIcon({ type, className }: JitsuElementIconProps) {
  const Icon = ELEMENT_ICONS[type];
  return <Icon className={cn("shrink-0", className)} strokeWidth={2.5} />;
}
