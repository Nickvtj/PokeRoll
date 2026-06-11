"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Swords } from "lucide-react";
import { JitsuBeltIcon } from "@/components/minigame/jitsu/JitsuBeltIcon";
import type { BattleTrainerPortrait } from "@/data/battle-trainers";
import { FALLBACK_TRAINER_SPRITE } from "@/data/trainer-sprites";
import { playJitsuFaceOff } from "@/lib/sound-engine";
import { cn } from "@/lib/utils";
import type { JitsuBeltConfig } from "@/types/jitsu";

const JITSU_FACE_OFF_LINES = [
  "Fogo, Agua e Planta — escolha com sabedoria!",
  "O dojo aguarda seu proximo movimento.",
  "Tres elementos, uma vitoria.",
  "Mostre dominio sobre o triangulo elemental!",
  "Sensei Bot nunca recua — prepare-se!",
];

interface JitsuFaceOffOverlayProps {
  player: BattleTrainerPortrait;
  opponent: BattleTrainerPortrait;
  playerBelt: JitsuBeltConfig;
  opponentBelt?: JitsuBeltConfig;
  playerFallbackLetter?: string;
}

function DuelPortrait({
  portrait,
  belt,
  side,
  delay,
  fallbackLetter,
}: {
  portrait: BattleTrainerPortrait;
  belt: JitsuBeltConfig;
  side: "player" | "opponent";
  delay: number;
  fallbackLetter?: string;
}) {
  const [src, setSrc] = useState(portrait.spriteUrl);
  const [showLetter, setShowLetter] = useState(!portrait.spriteUrl);
  const isAvatar = portrait.isProfileAvatar;
  const isPlayer = side === "player";

  useEffect(() => {
    setSrc(portrait.spriteUrl);
    setShowLetter(!portrait.spriteUrl);
  }, [portrait.spriteUrl]);

  return (
    <motion.div
      initial={{ x: isPlayer ? -48 : 48, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col items-center gap-2 shrink-0"
    >
      <div
        className={cn(
          "relative w-[5.25rem] h-[5.25rem] sm:w-[5.75rem] sm:h-[5.75rem] rounded-2xl border-[3px] overflow-hidden",
          isPlayer
            ? "border-cyan-400/70 shadow-[0_0_28px_rgba(34,211,238,0.35)]"
            : "border-rose-400/60 shadow-[0_0_28px_rgba(251,113,133,0.3)]"
        )}
        style={{ boxShadow: `0 0 24px ${belt.color}44, inset 0 0 20px ${belt.color}18` }}
      >
        <div
          className="absolute inset-x-0 top-0 h-1.5 z-20"
          style={{ backgroundColor: belt.color }}
          aria-hidden
        />
        {!isAvatar && (
          <div
            className={cn(
              "absolute inset-0 opacity-30 pointer-events-none",
              isPlayer
                ? "bg-gradient-to-br from-indigo-900 via-violet-900 to-slate-950"
                : "bg-gradient-to-br from-rose-950 via-orange-950 to-slate-950"
            )}
          />
        )}
        {!showLetter && src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt=""
            width={92}
            height={92}
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
          <div className="relative z-10 w-full h-full flex items-center justify-center text-2xl font-black text-white bg-gradient-to-br from-violet-800 to-indigo-950">
            {(fallbackLetter ?? portrait.name.charAt(0)).toUpperCase()}
          </div>
        )}
      </div>

      <div className="text-center space-y-0.5">
        <p className="text-xs font-black text-white drop-shadow-[0_2px_5px_rgba(0,0,0,0.65)] tracking-wide max-w-[7.5rem] leading-tight">
          {portrait.name}
        </p>
        <div className="flex items-center justify-center gap-1">
          <JitsuBeltIcon color={belt.color} size="xs" />
          <span className="text-[9px] font-semibold text-white/55 uppercase tracking-wider">
            {belt.label.replace("Faixa ", "")}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

function DuelCore() {
  return (
    <motion.div
      initial={{ scale: 0.6, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.4, duration: 0.45, type: "spring", stiffness: 280 }}
      className="flex flex-col items-center justify-center gap-2 shrink-0"
    >
      <div className="w-16 h-16 sm:w-[4.5rem] sm:h-[4.5rem] rounded-2xl border border-emerald-400/35 bg-emerald-500/10 flex items-center justify-center shadow-[0_0_24px_rgba(52,211,153,0.25)]">
        <Swords className="w-8 h-8 text-emerald-300" />
      </div>
      <span className="text-lg sm:text-xl font-black tracking-[0.2em] text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.55)]">
        DUEL
      </span>
    </motion.div>
  );
}

export function JitsuFaceOffOverlay({
  player,
  opponent,
  playerBelt,
  opponentBelt,
  playerFallbackLetter,
}: JitsuFaceOffOverlayProps) {
  const senseiBelt =
    opponentBelt ?? { id: "black", label: "Faixa Preta", emoji: "", color: "#1e293b", minXp: 0 };

  const tagline = useMemo(() => {
    let h = 0;
    for (let i = 0; i < player.name.length; i++) h = (h + player.name.charCodeAt(i) * (i + 3)) % 997;
    return JITSU_FACE_OFF_LINES[h % JITSU_FACE_OFF_LINES.length];
  }, [player.name]);

  useEffect(() => {
    void playJitsuFaceOff();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.28 }}
      className="relative min-h-[420px] overflow-hidden rounded-xl flex flex-col items-center justify-center px-4 py-8"
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 15% 50%, rgba(251,146,60,0.12), transparent 55%), radial-gradient(ellipse 70% 55% at 85% 50%, rgba(34,211,238,0.1), transparent 55%), radial-gradient(ellipse 60% 50% at 50% 100%, rgba(74,222,128,0.1), transparent 60%), linear-gradient(160deg, #0f172a 0%, #1e1b4b 45%, #0f172a 100%)",
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.07] pointer-events-none"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 11px, rgba(255,255,255,0.35) 11px, rgba(255,255,255,0.35) 12px)",
        }}
      />

      <motion.p
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.4 }}
        className="relative z-10 text-[10px] sm:text-xs font-bold uppercase tracking-[0.25em] text-emerald-300/70 mb-6"
      >
        Desafio Elemental
      </motion.p>

      <div className="relative z-10 flex items-center justify-center gap-4 sm:gap-8 w-full max-w-lg">
        <DuelPortrait
          portrait={player}
          belt={playerBelt}
          side="player"
          delay={0.12}
          fallbackLetter={playerFallbackLetter}
        />

        <DuelCore />

        <DuelPortrait portrait={opponent} belt={senseiBelt} side="opponent" delay={0.18} />
      </div>

      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.85, duration: 0.35 }}
        className="relative z-10 mt-7 text-[11px] sm:text-xs text-white/50 text-center max-w-xs leading-relaxed px-2"
      >
        {tagline}
      </motion.p>

      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.65, duration: 0.5, ease: "easeOut" }}
        className="absolute bottom-0 inset-x-0 h-1 bg-gradient-to-r from-orange-500 via-cyan-400 to-emerald-400 origin-left"
      />
    </motion.div>
  );
}
