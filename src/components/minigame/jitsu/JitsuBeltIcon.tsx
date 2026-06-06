"use client";

import { cn } from "@/lib/utils";

interface JitsuBeltIconProps {
  color: string;
  size?: "xs" | "sm" | "md";
  className?: string;
}

const SIZE = {
  xs: { wrap: "w-3", bar: "h-[3px] w-3", knot: "h-1 w-2.5" },
  sm: { wrap: "w-4", bar: "h-1 w-4", knot: "h-1.5 w-3" },
  md: { wrap: "w-5", bar: "h-1.5 w-5", knot: "h-2 w-4" },
};

/** Ícone de faixa no estilo do sistema (sem emoji) */
export function JitsuBeltIcon({ color, size = "sm", className }: JitsuBeltIconProps) {
  const s = SIZE[size];
  return (
    <span
      className={cn("inline-flex flex-col items-center justify-center gap-px shrink-0", s.wrap, className)}
      aria-hidden
    >
      <span
        className={cn("rounded-full opacity-90", s.bar)}
        style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}55` }}
      />
      <span
        className={cn("rounded-[2px] border border-white/25", s.knot)}
        style={{ backgroundColor: color }}
      />
    </span>
  );
}
