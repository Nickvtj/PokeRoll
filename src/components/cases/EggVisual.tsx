"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { getEggCardTheme, getEggSprite } from "@/data/egg-styles";
import type { CapsuleDefinition } from "@/types/capsule";
import { cn } from "@/lib/utils";

interface EggVisualProps {
  egg: CapsuleDefinition;
  size?: "sm" | "md" | "lg";
  cracking?: boolean;
  className?: string;
}

const SIZES = {
  sm: { box: "w-16 h-20", img: 64 },
  md: { box: "w-[5.5rem] h-[6.75rem]", img: 88 },
  lg: { box: "w-32 h-40", img: 128 },
};

export function EggVisual({
  egg,
  size = "md",
  cracking = false,
  className,
}: EggVisualProps) {
  const s = SIZES[size];
  const sprite = getEggSprite(egg.id);
  const glow = getEggCardTheme(egg.id).glow;

  return (
    <div className={cn("relative flex flex-col items-center", className)}>
      <motion.div
        animate={
          cracking ? { rotate: [-3, 3, -2, 2, 0], x: [-2, 2, 0] } : undefined
        }
        transition={cracking ? { duration: 0.35, repeat: Infinity } : undefined}
        className={cn("relative flex items-center justify-center", s.box)}
        style={{ filter: `drop-shadow(0 4px 10px ${glow})` }}
      >
        <Image
          src={sprite}
          alt={egg.name}
          width={s.img}
          height={s.img}
          className="object-contain w-full h-full"
          unoptimized
          priority={size === "lg"}
        />
      </motion.div>

      <div
        className={cn(
          "rounded-full bg-black/20",
          size === "lg" ? "w-20 h-1.5 mt-1" : size === "md" ? "w-14 h-1 mt-0.5" : "w-10 h-0.5"
        )}
      />
    </div>
  );
}
