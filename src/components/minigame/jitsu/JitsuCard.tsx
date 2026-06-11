"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { Ban, Sparkles } from "lucide-react";
import { motion, type PanInfo } from "framer-motion";
import { isLocalAsset } from "@/lib/image-utils";
import { cn } from "@/lib/utils";
import { JITSU_ELEMENT_META } from "@/data/jitsu-cards";
import { JitsuElementIcon } from "@/components/minigame/jitsu/JitsuElementIcon";
import { JitsuSpecialIcon } from "@/components/minigame/jitsu/JitsuSpecialIcon";
import { CardBackFace } from "@/components/ui/CardBackFace";
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
  draggable?: boolean;
  onDragStart?: () => void;
  onDragEnd?: (point: { x: number; y: number }) => void;
  className?: string;
}

const DRAG_CLICK_THRESHOLD = 6;

const SIZE = {
  sm: { w: "w-[4.5rem]", h: "h-[6.25rem]", img: 40, power: "text-lg" },
  md: { w: "w-[5.5rem]", h: "h-[7.5rem]", img: 52, power: "text-xl" },
  lg: { w: "w-[7rem]", h: "h-[9.5rem]", img: 68, power: "text-2xl" },
};

const LAYOUT_TRANSITION = { duration: 0.52, ease: [0.22, 1, 0.36, 1] as const };

const TOOLTIP_GAP_PX = 10;

function JitsuSpecialTooltip({
  card,
  specialMeta,
  anchorRect,
}: {
  card: JitsuCardType;
  specialMeta: (typeof JITSU_SPECIAL_META)[keyof typeof JITSU_SPECIAL_META];
  anchorRect: DOMRect;
}) {
  const centerX = anchorRect.left + anchorRect.width / 2;
  const anchorTop = anchorRect.top;

  return createPortal(
    <div
      role="tooltip"
      className="fixed z-[10050] pointer-events-none flex flex-col items-center opacity-100 transition-opacity duration-150"
      style={{
        left: centerX,
        top: anchorTop,
        transform: `translate(-50%, calc(-100% - ${TOOLTIP_GAP_PX}px))`,
      }}
    >
      <div
        className="w-44 rounded-lg border border-amber-400/60 px-2.5 py-2 text-left shadow-[0_10px_32px_rgba(0,0,0,0.75)]"
        style={{ backgroundColor: "#020617" }}
      >
        <p className="text-[11px] font-bold text-amber-200 flex items-center gap-1">
          <JitsuSpecialIcon effect={card.special!} className="text-amber-300 w-3.5 h-3.5 shrink-0" />
          {specialMeta.label}
        </p>
        <p className="text-[10px] text-white/75 leading-snug mt-1">{specialMeta.description}</p>
      </div>
      <div
        className="w-2.5 h-2.5 -mt-[5px] rotate-45 border-r border-b border-amber-400/60"
        style={{ backgroundColor: "#020617" }}
        aria-hidden
      />
    </div>,
    document.body
  );
}

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
  draggable = false,
  onDragStart,
  onDragEnd,
  className,
}: JitsuCardProps) {
  const s = SIZE[size];
  const meta = card ? JITSU_ELEMENT_META[card.type] : null;
  const specialMeta = card?.special ? JITSU_SPECIAL_META[card.special] : null;
  const isSpecial = Boolean(card?.special && specialMeta);
  const isDisabled = disabled || faceDown || blocked;
  const canDrag = draggable && !isDisabled;
  const buttonRef = useRef<HTMLButtonElement>(null);
  const draggedRef = useRef(false);
  const [showTip, setShowTip] = useState(false);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const measureAnchor = useCallback(() => {
    const el = buttonRef.current;
    if (!el) return;
    setAnchorRect(el.getBoundingClientRect());
  }, []);

  const openTip = useCallback(() => {
    if (!isSpecial) return;
    measureAnchor();
    setShowTip(true);
  }, [isSpecial, measureAnchor]);

  const closeTip = useCallback(() => {
    setShowTip(false);
    setAnchorRect(null);
  }, []);

  useEffect(() => {
    if (!showTip) return;

    const onScrollOrResize = () => measureAnchor();
    window.addEventListener("scroll", onScrollOrResize, true);
    window.addEventListener("resize", onScrollOrResize);

    return () => {
      window.removeEventListener("scroll", onScrollOrResize, true);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, [showTip, measureAnchor]);

  const handleClick = useCallback(() => {
    if (draggedRef.current) {
      draggedRef.current = false;
      return;
    }
    onClick?.();
  }, [onClick]);

  const handleDragStart = useCallback(() => {
    draggedRef.current = false;
    closeTip();
    setIsDragging(true);
    onDragStart?.();
  }, [closeTip, onDragStart]);

  const handleDrag = useCallback((_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (
      Math.abs(info.offset.x) > DRAG_CLICK_THRESHOLD ||
      Math.abs(info.offset.y) > DRAG_CLICK_THRESHOLD
    ) {
      draggedRef.current = true;
    }
  }, []);

  const handleDragEnd = useCallback(
    (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      setIsDragging(false);
      onDragEnd?.({ x: info.point.x, y: info.point.y });
    },
    [onDragEnd]
  );

  const inner = (
    <div
      className={cn(
        "relative shrink-0",
        s.w,
        s.h,
        showTip && "z-[200]",
        isSpecial && "overflow-visible"
      )}
      onMouseEnter={canDrag ? undefined : openTip}
      onMouseLeave={canDrag ? undefined : closeTip}
    >
      {showTip && specialMeta && card && anchorRect && typeof window !== "undefined" && (
        <JitsuSpecialTooltip card={card} specialMeta={specialMeta} anchorRect={anchorRect} />
      )}

      <motion.button
        ref={buttonRef}
        type="button"
        disabled={isDisabled}
        drag={canDrag}
        dragSnapToOrigin
        dragElastic={0.12}
        dragMomentum={false}
        onClick={handleClick}
        onDragStart={handleDragStart}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        onFocus={openTip}
        onBlur={closeTip}
        whileDrag={{ scale: 1.06, zIndex: 400, cursor: "grabbing" }}
        animate={
          pulsing
            ? {
                boxShadow: [
                  "0 0 0px transparent",
                  "0 0 20px rgba(250,204,21,0.55)",
                  "0 0 0px transparent",
                ],
              }
            : { opacity: dimmed ? 0.4 : blocked ? 0.35 : 1, y: 0, scale: 1 }
        }
        transition={
          pulsing ? { duration: 1.2, repeat: Infinity, ease: "easeInOut" } : { duration: 0.25 }
        }
        whileHover={
          !isDisabled && !canDrag ? { y: -14, scale: 1.04 } : !isDisabled && canDrag ? { scale: 1.03 } : undefined
        }
        whileTap={!isDisabled && !isDragging ? { scale: 0.96, y: canDrag ? 0 : -2 } : undefined}
        className={cn(
          "relative w-full h-full rounded-xl border-2 overflow-hidden transition-[filter] duration-300 touch-none",
          faceDown && "border-white/15 cursor-default",
          !faceDown &&
            meta &&
            cn(
              meta.bg,
              meta.border,
              isSpecial &&
                "border-amber-400/70 ring-2 ring-amber-300/35 shadow-[0_0_24px_rgba(251,191,36,0.25)] bg-gradient-to-br from-violet-950/80 via-slate-900/90 to-amber-950/50",
              selected && meta.glow
            ),
          dimmed && "grayscale",
          isDisabled && !faceDown && "opacity-55 cursor-not-allowed",
          blocked && "grayscale contrast-75",
          canDrag && "cursor-grab active:cursor-grabbing",
          !isDisabled && !canDrag && "cursor-pointer hover:brightness-110",
          isDragging && "shadow-[0_16px_40px_rgba(0,0,0,0.45)]",
          className
        )}
      >
        {faceDown ? (
          <CardBackFace iconSize={size === "sm" ? 28 : size === "lg" ? 44 : 34} />
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
            {isSpecial && (
              <>
                <div className="absolute top-8 left-1 right-1 z-10 flex justify-center">
                  <Sparkles className="w-3 h-3 text-amber-300 animate-pulse" />
                </div>
                <div className="absolute bottom-1 left-1 right-1 z-10 flex items-center justify-center gap-0.5 rounded-md border border-amber-400/50 bg-gradient-to-r from-violet-950/95 to-amber-950/90 px-1 py-0.5">
                  <JitsuSpecialIcon effect={card.special!} className="text-amber-300" />
                  <span className="text-[8px] font-bold text-amber-100 truncate">{specialMeta!.short}</span>
                </div>
              </>
            )}
            <div className="relative flex flex-col items-center justify-center h-full pt-4 pb-5 px-1 z-[1]">
              <Image
                src={card.image}
                alt={card.name}
                width={s.img}
                height={s.img}
                className="object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]"
                unoptimized={!isLocalAsset(card.image)}
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
    </div>
  );

  if (layoutId) {
    return (
      <motion.div
        layoutId={layoutId}
        transition={{ layout: LAYOUT_TRANSITION }}
        className={cn("shrink-0 relative", isDragging ? "z-[500]" : "z-[200]")}
        style={{ zIndex: isDragging ? 500 : 200 }}
      >
        {inner}
      </motion.div>
    );
  }

  return inner;
}
