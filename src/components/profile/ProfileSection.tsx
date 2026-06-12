"use client";

import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProfileSectionProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  iconClassName?: string;
  children: React.ReactNode;
  className?: string;
  scrollable?: boolean;
}

export function ProfileSection({
  title,
  description,
  icon: Icon,
  iconClassName,
  children,
  className,
  scrollable,
}: ProfileSectionProps) {
  return (
    <section
      className={cn(
        "rounded-2xl bg-slate-900/45 ring-1 ring-inset ring-indigo-500/10 p-5",
        "shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]",
        scrollable ? "flex flex-col min-h-0 overflow-hidden" : "space-y-4 overflow-hidden",
        className
      )}
    >
      <div className="shrink-0 space-y-0.5">
        <h3 className="font-bold text-sm flex items-center gap-2">
          {Icon && <Icon className={cn("w-4 h-4", iconClassName ?? "text-indigo-400")} />}
          {title}
        </h3>
        {description && (
          <p className="text-[11px] text-white/40 leading-snug">{description}</p>
        )}
      </div>
      <div
        className={cn(
          scrollable
            ? "flex-1 min-h-0 mt-4 overflow-y-auto profile-scroll-area overscroll-contain pr-1 -mr-1 pb-2"
            : "mt-4"
        )}
      >
        {children}
      </div>
    </section>
  );
}
