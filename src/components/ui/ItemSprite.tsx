"use client";

import Image from "next/image";
import { isLocalAsset } from "@/lib/image-utils";
import { cn } from "@/lib/utils";

interface ItemSpriteProps {
  src: string;
  alt: string;
  size?: number;
  className?: string;
  /** Rotação contínua (ex.: Lucky Egg ativo) */
  spinning?: boolean;
}

export function ItemSprite({
  src,
  alt,
  size = 24,
  className,
  spinning = false,
}: ItemSpriteProps) {
  return (
    <Image
      src={src}
      alt={alt}
      width={size}
      height={size}
      unoptimized={!isLocalAsset(src)}
      className={cn(
        "object-contain drop-shadow-sm shrink-0",
        spinning && "animate-spin",
        className
      )}
      style={spinning ? { animationDuration: "2s" } : undefined}
    />
  );
}
