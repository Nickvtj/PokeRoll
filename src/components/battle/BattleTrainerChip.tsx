"use client";

import { useEffect, useState } from "react";
import { FALLBACK_TRAINER_SPRITE } from "@/data/trainer-sprites";
import { cn } from "@/lib/utils";

interface BattleTrainerChipProps {
  name: string;
  spriteUrl?: string;
  fallbackLetter?: string;
  side: "player" | "enemy";
  accentColor?: string;
  className?: string;
  /** Imagem do perfil (Pokémon/avatar) — object-contain em ambos os lados */
  avatarStyle?: boolean;
}

export function BattleTrainerChip({
  name,
  spriteUrl,
  fallbackLetter,
  side,
  accentColor,
  className,
  avatarStyle = false,
}: BattleTrainerChipProps) {
  const [imgSrc, setImgSrc] = useState(spriteUrl);
  const [showLetter, setShowLetter] = useState(!spriteUrl);

  useEffect(() => {
    setImgSrc(spriteUrl);
    setShowLetter(!spriteUrl);
  }, [spriteUrl]);

  const ring =
    side === "player"
      ? "ring-cyan-400/45 border-cyan-500/30"
      : "ring-rose-400/45 border-rose-500/30";

  const handleError = () => {
    // Avatar de perfil (jogador) nunca vira sprite de treinador: cai para a inicial.
    if (avatarStyle || side === "player") {
      setShowLetter(true);
      return;
    }
    if (imgSrc && imgSrc !== FALLBACK_TRAINER_SPRITE) {
      setImgSrc(FALLBACK_TRAINER_SPRITE);
      return;
    }
    setShowLetter(true);
  };

  return (
    <div
      className={cn("flex flex-col items-center gap-1.5 shrink-0 w-[4.5rem]", className)}
    >
      <div
        className={cn(
          "relative w-14 h-14 rounded-full overflow-hidden border-2 ring-2 bg-slate-950/80",
          ring
        )}
        style={
          accentColor
            ? { boxShadow: `0 0 16px ${accentColor}35`, borderColor: `${accentColor}55` }
            : undefined
        }
      >
        {!showLetter && imgSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imgSrc}
            alt=""
            width={56}
            height={56}
            decoding="async"
            onError={handleError}
            className={cn(
              "w-full h-full bg-slate-900",
              avatarStyle || side === "player" || side === "enemy"
                ? "object-contain object-center p-1"
                : "object-cover object-[center_15%] scale-125"
            )}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-lg font-black text-white/80 bg-gradient-to-br from-indigo-600 to-purple-700">
            {(fallbackLetter ?? name.charAt(0)).toUpperCase()}
          </div>
        )}
      </div>
      <p
        className={cn(
          "text-[9px] font-bold text-center leading-tight line-clamp-2 w-full",
          side === "player" ? "text-cyan-200/90" : "text-rose-200/90"
        )}
      >
        {name}
      </p>
    </div>
  );
}
