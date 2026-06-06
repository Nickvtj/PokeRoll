"use client";

import { motion } from "framer-motion";
import { JITSU_ELEMENT_META } from "@/data/jitsu-cards";
import type { JitsuElement } from "@/types/jitsu";

interface JitsuArenaFxProps {
  playerType?: JitsuElement;
  botType?: JitsuElement;
  winner: "player" | "bot" | "tie" | null;
  phase: "reveal" | "resolve" | null;
}

function FireElementFx({ color, side, intense }: { color: string; side: "left" | "right"; intense: boolean }) {
  const drift = side === "left" ? 1 : -1;
  return (
    <div className="absolute inset-0">
      {[...Array(intense ? 14 : 8)].map((_, i) => (
        <motion.div
          key={`fire-${i}`}
          initial={{ opacity: 0, y: 20, x: drift * (i - 4) * 6, scale: 0.3 }}
          animate={{
            opacity: [0, 1, 0.7, 0],
            y: [20, -30 - i * 8, -70 - i * 10],
            x: [drift * (i - 4) * 6, drift * (i - 4) * 14],
            scale: [0.3, intense ? 1.6 : 1.1, 0.4],
          }}
          transition={{ duration: intense ? 0.75 : 0.55, delay: i * 0.04, ease: "easeOut" }}
          className="absolute left-1/2 top-1/2 w-3 h-5 rounded-full blur-[2px]"
          style={{
            background: `linear-gradient(to top, ${color}, #fef08a, transparent)`,
            borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%",
          }}
        />
      ))}
      <motion.div
        animate={{ opacity: [0.3, 0.7, 0.3], scale: [0.9, 1.15, 0.9] }}
        transition={{ duration: 0.45, repeat: intense ? 2 : 1 }}
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full blur-xl"
        style={{ background: `radial-gradient(circle, ${color}88, transparent 70%)` }}
      />
    </div>
  );
}

function WaterElementFx({ color, side, intense }: { color: string; side: "left" | "right"; intense: boolean }) {
  const drift = side === "left" ? 1 : -1;
  return (
    <div className="absolute inset-0">
      {[...Array(intense ? 12 : 7)].map((_, i) => (
        <motion.div
          key={`drop-${i}`}
          initial={{ opacity: 0, y: -30, x: drift * (i - 3) * 8, scale: 0 }}
          animate={{
            opacity: [0, 1, 0.8, 0],
            y: [-30, 10, 45 + i * 4],
            x: [drift * (i - 3) * 8, drift * (i - 3) * 16 + (i % 2 ? 6 : -6)],
            scale: [0, 1.2, 0.3],
          }}
          transition={{ duration: intense ? 0.7 : 0.5, delay: i * 0.05, ease: "easeIn" }}
          className="absolute left-1/2 top-1/2 w-3 h-3 rounded-full border border-white/30"
          style={{ backgroundColor: color }}
        />
      ))}
      {[0, 1, 2].map((ring) => (
        <motion.div
          key={`ripple-${ring}`}
          initial={{ opacity: 0, scale: 0.2 }}
          animate={{ opacity: [0, 0.6, 0], scale: [0.2, intense ? 2.2 : 1.5] }}
          transition={{ duration: 0.8, delay: ring * 0.15 }}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2"
          style={{ borderColor: `${color}99`, width: 24, height: 24 }}
        />
      ))}
    </div>
  );
}

function GrassElementFx({ color, side, intense }: { color: string; side: "left" | "right"; intense: boolean }) {
  const drift = side === "left" ? 1 : -1;
  return (
    <div className="absolute inset-0">
      {[...Array(intense ? 10 : 6)].map((_, i) => (
        <motion.div
          key={`leaf-${i}`}
          initial={{ opacity: 0, scale: 0, rotate: 0, x: 0, y: 0 }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, intense ? 1.3 : 1, 0.5],
            rotate: [0, drift * (120 + i * 30)],
            x: [0, drift * (20 + i * 10)],
            y: [0, (i % 2 === 0 ? -1 : 1) * (15 + i * 6)],
          }}
          transition={{ duration: intense ? 0.8 : 0.6, delay: i * 0.05 }}
          className="absolute left-1/2 top-1/2 w-4 h-2"
          style={{
            backgroundColor: color,
            borderRadius: "100% 0% 100% 0% / 100% 0% 100% 0%",
          }}
        />
      ))}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={`spore-${i}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: [0, 0.8, 0], y: [10, -25 - i * 8] }}
          transition={{ duration: 0.9, delay: 0.1 + i * 0.08 }}
          className="absolute left-1/2 top-1/2 w-1.5 h-1.5 rounded-full"
          style={{ backgroundColor: "#bef264", x: drift * (i - 2) * 12 }}
        />
      ))}
    </div>
  );
}

function ElementFx({
  type,
  side,
  intense,
}: {
  type: JitsuElement;
  side: "left" | "right";
  intense: boolean;
}) {
  const color = JITSU_ELEMENT_META[type].particle;
  if (type === "FOGO") return <FireElementFx color={color} side={side} intense={intense} />;
  if (type === "AGUA") return <WaterElementFx color={color} side={side} intense={intense} />;
  return <GrassElementFx color={color} side={side} intense={intense} />;
}

export function JitsuArenaFx({ playerType, botType, winner, phase }: JitsuArenaFxProps) {
  if (!phase || !playerType || !botType) return null;

  const isResolve = phase === "resolve";
  const playerIntense = isResolve && (winner === "player" || winner === "tie");
  const botIntense = isResolve && (winner === "bot" || winner === "tie");

  const clashColor =
    winner === "player"
      ? JITSU_ELEMENT_META[playerType].particle
      : winner === "bot"
        ? JITSU_ELEMENT_META[botType].particle
        : "#facc15";

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl" aria-hidden>
      {isResolve && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: [0, 0.5, 0], scale: [0.5, 1.6, 2] }}
          transition={{ duration: 0.65 }}
          className="absolute inset-0"
          style={{
            background: `radial-gradient(circle at 50% 50%, ${clashColor}44, transparent 62%)`,
          }}
        />
      )}

      <div className="absolute left-[18%] top-1/2 -translate-y-1/2 w-20 h-24">
        <ElementFx type={playerType} side="left" intense={playerIntense} />
      </div>
      <div className="absolute right-[18%] top-1/2 -translate-y-1/2 w-20 h-24">
        <ElementFx type={botType} side="right" intense={botIntense} />
      </div>

      {isResolve && winner === "tie" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.4 }}
          animate={{ opacity: [0, 1, 0], scale: [0.4, 1.3, 1.6], rotate: [0, 180] }}
          transition={{ duration: 0.55 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <span className="text-4xl font-black text-amber-300/90 drop-shadow-lg">⚡</span>
        </motion.div>
      )}

      {isResolve && winner === "player" && (
        <motion.div
          initial={{ x: "-40%", opacity: 0.8 }}
          animate={{ x: "20%", opacity: 0 }}
          transition={{ duration: 0.45 }}
          className="absolute top-1/2 left-1/4 w-1/2 h-8 -translate-y-1/2 blur-md rounded-full"
          style={{ background: `linear-gradient(90deg, ${JITSU_ELEMENT_META[playerType].particle}, transparent)` }}
        />
      )}

      {isResolve && winner === "bot" && (
        <motion.div
          initial={{ x: "40%", opacity: 0.8 }}
          animate={{ x: "-20%", opacity: 0 }}
          transition={{ duration: 0.45 }}
          className="absolute top-1/2 right-1/4 w-1/2 h-8 -translate-y-1/2 blur-md rounded-full"
          style={{ background: `linear-gradient(270deg, ${JITSU_ELEMENT_META[botType].particle}, transparent)` }}
        />
      )}

      {isResolve && winner && winner !== "tie" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.6, 0] }}
          transition={{ duration: 0.22 }}
          className="absolute inset-0 bg-white mix-blend-overlay"
        />
      )}
    </div>
  );
}
