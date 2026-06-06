"use client";

import Image from "next/image";
import { Ban } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { JITSU_ELEMENT_META } from "@/data/jitsu-cards";
import { JitsuElementIcon } from "@/components/minigame/jitsu/JitsuElementIcon";
import { JitsuSpecialIcon } from "@/components/minigame/jitsu/JitsuSpecialIcon";
import { JITSU_SPECIAL_META } from "@/data/jitsu-specials";
import type { JitsuCard as JitsuCardType } from "@/types/jitsu";

interface JitsuCardProps {
  card?: JitsuCardType;
  faceDown?: boolean;
  selected?: boolean;
  disabled?: boolean;
  blocked?: boolean;
  dimmed?: boolean;
  pulsing?: boolean;
  size?: "sm" | "md" | "lg";
  layoutId?: string;
  onClick?: () => void;
  className?: string;
}

const SIZE = {
  sm: { w: "w-[4.5rem]", h: "h-[6.25rem]", img: 40, power: "text-lg" },
  md: { w: "w-[5.5rem]", h: "h-[7.5rem]", img: 52, power: "text-xl" },
  lg: { w: "w-[7rem]", h: "h-[9.5rem]", img: 68, power: "text-2xl" },
};

const LAYOUT_TRANSITION = { duration: 0.52, ease: [0.22, 1, 0.36, 1] as const };

export function JitsuCard({
  card,
  faceDown = false,
  selected = false,
  disabled = false,
  blocked = false,
  dimmed = false,
  pulsing = false,
  size = "md",
  layoutId,
  onClick,
  className,
}: JitsuCardProps) {
  const s = SIZE[size];
  const meta = card ? JITSU_ELEMENT_META[card.type] : null;
  const specialMeta = card?.special ? JITSU_SPECIAL_META[card.special] : null;
  const isDisabled = disabled || faceDown || blocked;

  const inner = (
    <motion.button
      type="button"
      disabled={isDisabled}
      onClick={onClick}
      animate={
        pulsing
          ? {
              boxShadow: [
                "0 0 0px transparent",
                "0 0 20px rgba(250,204,21,0.55)",
                "0 0 0px transparent",
              ],
            }
          : { opacity: dimmed ? 0.4 : blocked ? 0.35 : 1 }
      }
      transition={
        pulsing ? { duration: 1.2, repeat: Infinity, ease: "easeInOut" } : { duration: 0.25 }
      }
      whileHover={!isDisabled ? { y: -14, scale: 1.04 } : undefined}
      whileTap={!isDisabled ? { scale: 0.96, y: -4 } : undefined}
      className={cn(
        "relative rounded-xl border-2 overflow-hidden shrink-0 transition-[filter] duration-300",
        s.w,
        s.h,
        faceDown &&
          "bg-gradient-to-br from-indigo-950 via-slate-900 to-violet-950 border-indigo-400/35 cursor-default shadow-[inset_0_0_20px_rgba(99,102,241,0.15)]",
        !faceDown &&
          meta &&
          cn(
            meta.bg,
            meta.border,
            card?.special && "border-violet-400/55 ring-1 ring-violet-500/25",
            selected && meta.glow
          ),
        dimmed && "grayscale",
        isDisabled && !faceDown && "opacity-55 cursor-not-allowed",
        blocked && "grayscale contrast-75",
        !isDisabled && "cursor-pointer hover:brightness-110",
        className
      )}
    >
      {faceDown ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5">
          <div className="w-9 h-9 rounded-full border-2 border-indigo-400/50 bg-indigo-500/25 flex items-center justify-center">
            <span className="text-indigo-300/80 text-xs font-black">?</span>
          </div>
          <div className="w-12 h-0.5 rounded-full bg-indigo-500/30" />
        </div>
      ) : card && meta ? (
        <>
          <div className="absolute inset-0 opacity-30 pointer-events-none bg-gradient-to-t from-black/60 via-transparent to-white/5" />
          <div
            className={cn(
              "absolute top-1.5 left-1.5 w-8 h-8 rounded-full border flex items-center justify-center font-black tabular-nums z-10",
              s.power,
              card.power >= 9
                ? "border-amber-400/60 bg-amber-500/25 text-amber-300"
                : "border-white/25 bg-black/50 text-white"
            )}
          >
            {card.power}
          </div>
          <JitsuElementIcon type={card.type} className={cn("absolute top-1.5 right-1.5 w-3.5 h-3.5 z-10", meta.text)} />
          {card.special && specialMeta && (
            <div
              className="absolute bottom-1 left-1 right-1 z-10 flex items-center justify-center gap-0.5 rounded-md border border-violet-400/40 bg-violet-950/85 px-1 py-0.5"
              title={specialMeta.label}
            >
              <JitsuSpecialIcon effect={card.special} className="text-violet-300" />
              <span className="text-[8px] font-bold text-violet-200 truncate">{specialMeta.short}</span>
            </div>
          )}
          <div className="relative flex flex-col items-center justify-center h-full pt-4 pb-5 px-1 z-[1]">
            <Image
              src={card.image}
              alt={card.name}
              width={s.img}
              height={s.img}
              className="object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]"
              unoptimized
            />
            <p className={cn("text-[9px] font-bold truncate w-full text-center mt-1", meta.text)}>
              {card.name}
            </p>
          </div>
          {blocked && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/50 rounded-xl">
              <Ban className="w-5 h-5 text-red-300" strokeWidth={2.5} />
            </div>
          )}
        </>
      ) : null}
    </motion.button>
  );

  if (layoutId) {
    return (
      <motion.div
        layoutId={layoutId}
        layout
        transition={{ layout: LAYOUT_TRANSITION }}
        className="shrink-0"
        style={{ transformStyle: "preserve-3d" }}
      >
        {inner}
      </motion.div>
    );
  }

  return inner;
}
