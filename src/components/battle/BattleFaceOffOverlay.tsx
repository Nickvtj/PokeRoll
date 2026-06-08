"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  BATTLE_FACE_OFF_GREETINGS,
  type BattleTrainerPortrait,
} from "@/data/battle-trainers";
import { FALLBACK_TRAINER_SPRITE } from "@/data/trainer-sprites";
import { playBattleFaceOffSequence } from "@/lib/sound-engine";
import { cn } from "@/lib/utils";

interface BattleFaceOffOverlayProps {
  player: BattleTrainerPortrait;
  opponent: BattleTrainerPortrait;
  accentColor?: string;
  playerFallbackLetter?: string;
}

function FaceOffBubble({
  children,
  tail,
}: {
  children: React.ReactNode;
  tail: "up" | "down";
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.75, duration: 0.35, type: "spring", stiffness: 300 }}
      className="relative shrink-0"
    >
      <div className="rounded-2xl border-[3px] border-white bg-white px-3.5 py-1.5 shadow-[0_4px_14px_rgba(0,0,0,0.28)]">
        <p className="text-[11px] sm:text-xs font-bold text-slate-800 text-center leading-snug whitespace-nowrap">
          {children}
        </p>
      </div>
      <div
        className={cn(
          "absolute left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 bg-white border-white",
          tail === "down"
            ? "top-full mt-[-7px] border-r border-b"
            : "bottom-full mb-[-7px] border-l border-t"
        )}
        aria-hidden
      />
    </motion.div>
  );
}

function FaceOffPortrait({
  portrait,
  side,
  delay,
  accentColor,
  fallbackLetter,
}: {
  portrait: BattleTrainerPortrait;
  side: "player" | "opponent";
  delay: number;
  accentColor?: string;
  fallbackLetter?: string;
}) {
  const [src, setSrc] = useState(portrait.spriteUrl);
  const [showLetter, setShowLetter] = useState(!portrait.spriteUrl);
  const isPlayer = side === "player";
  const isAvatar = portrait.isProfileAvatar;

  useEffect(() => {
    setSrc(portrait.spriteUrl);
    setShowLetter(!portrait.spriteUrl);
  }, [portrait.spriteUrl]);

  return (
    <motion.div
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay, duration: 0.5, type: "spring", stiffness: 280, damping: 20 }}
      className="flex flex-col items-center gap-1 shrink-0"
    >
      <div
        className={cn(
          "relative w-[5rem] h-[5rem] sm:w-[5.5rem] sm:h-[5.5rem] rounded-full border-[4px] border-white overflow-hidden",
          isPlayer
            ? "shadow-[0_0_24px_rgba(56,189,248,0.5)] ring-4 ring-cyan-200/35"
            : "shadow-[0_0_24px_rgba(251,113,133,0.45)] ring-4 ring-rose-200/30"
        )}
        style={
          !isPlayer && accentColor
            ? { boxShadow: `0 0 22px ${accentColor}50` }
            : undefined
        }
      >
        {!isAvatar && (
          <div
            className={cn(
              "absolute inset-0 opacity-35 pointer-events-none",
              isPlayer
                ? "bg-gradient-to-br from-cyan-300 via-blue-400 to-indigo-600"
                : "bg-gradient-to-br from-rose-300 via-orange-400 to-red-600"
            )}
          />
        )}
        {!showLetter && src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt=""
            width={88}
            height={88}
            decoding="async"
            onError={() => {
              if (src !== FALLBACK_TRAINER_SPRITE) {
                setSrc(FALLBACK_TRAINER_SPRITE);
                return;
              }
              setShowLetter(true);
            }}
            className={cn(
              "relative z-10 w-full h-full bg-slate-900",
              isAvatar
                ? "object-contain p-1.5"
                : "object-cover object-[center_12%] scale-[1.35]"
            )}
          />
        ) : (
          <div className="relative z-10 w-full h-full flex items-center justify-center text-2xl font-black text-white bg-gradient-to-br from-indigo-600 to-purple-700">
            {(fallbackLetter ?? portrait.name.charAt(0)).toUpperCase()}
          </div>
        )}
      </div>
      <p className="text-xs font-black text-white drop-shadow-[0_2px_5px_rgba(0,0,0,0.65)] tracking-wide text-center max-w-[8.5rem] leading-tight">
        {portrait.name}
      </p>
    </motion.div>
  );
}

export function BattleFaceOffOverlay({
  player,
  opponent,
  accentColor,
  playerFallbackLetter,
}: BattleFaceOffOverlayProps) {
  const greetings = useMemo(() => {
    const pick = (seed: string) => {
      let h = 0;
      for (let i = 0; i < seed.length; i++) h = (h + seed.charCodeAt(i) * (i + 1)) % 997;
      return BATTLE_FACE_OFF_GREETINGS[h % BATTLE_FACE_OFF_GREETINGS.length];
    };
    return {
      player: pick(player.name),
      opponent: pick(opponent.name),
    };
  }, [player.name, opponent.name]);

  useEffect(() => {
    void playBattleFaceOffSequence();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="absolute inset-0 z-40 overflow-hidden rounded-xl pointer-events-none flex flex-col"
    >
      {/* Rival — zona superior (sem invadir a faixa central) */}
      <motion.div
        initial={{ y: "-100%" }}
        animate={{ y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="flex-[0_0_42%] bg-gradient-to-r from-rose-700 via-orange-500 to-amber-500 flex flex-col items-center justify-center gap-1.5 px-3"
      >
        <FaceOffPortrait
          portrait={opponent}
          side="opponent"
          delay={0.22}
          accentColor={accentColor}
        />
        <FaceOffBubble tail="down">{greetings.opponent}</FaceOffBubble>
      </motion.div>

      {/* Faixa central exclusiva do VS */}
      <div className="flex-[0_0_16%] relative bg-slate-950/20 flex items-center justify-center">
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.38, duration: 0.35 }}
          className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[3px] bg-white shadow-[0_0_12px_rgba(255,255,255,0.65)]"
        />
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.4, type: "spring", stiffness: 300, damping: 16 }}
          className="relative z-10 bg-slate-950/30 rounded-full px-4 py-0.5"
        >
          <span className="text-3xl sm:text-4xl font-black italic text-white drop-shadow-[0_3px_10px_rgba(0,0,0,0.6)] tracking-tight">
            VS.
          </span>
        </motion.div>
      </div>

      {/* Jogador — zona inferior */}
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="flex-[0_0_42%] bg-gradient-to-r from-blue-800 via-sky-500 to-cyan-400 flex flex-col items-center justify-center gap-1.5 px-3"
      >
        <FaceOffBubble tail="up">{greetings.player}</FaceOffBubble>
        <FaceOffPortrait portrait={player} side="player" delay={0.28} fallbackLetter={playerFallbackLetter} />
      </motion.div>
    </motion.div>
  );
}
