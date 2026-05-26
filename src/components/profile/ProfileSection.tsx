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
}

export function ProfileSection({
  title,
  description,
  icon: Icon,
  iconClassName,
  children,
  className,
}: ProfileSectionProps) {
  return (
    <section className={cn("glass-card p-5 space-y-4", className)}>
      <div className="space-y-0.5">
        <h3 className="font-bold text-sm flex items-center gap-2">
          {Icon && <Icon className={cn("w-4 h-4", iconClassName ?? "text-indigo-400")} />}
          {title}
        </h3>
        {description && (
          <p className="text-[11px] text-white/40 leading-snug">{description}</p>
        )}
      </div>
      {children}
    </section>
  );
}
