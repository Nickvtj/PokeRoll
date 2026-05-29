"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { BATTLE_COIN_REVEAL_MS } from "@/data/economy-balance";
import { PokeballIcon } from "@/components/ui/PokeballIcon";
import { GreatBallIcon } from "@/components/ui/PokeBallIcons";
import { cn } from "@/lib/utils";

interface BattleCoinFlipOverlayProps {
  playerStarts: boolean;
}

const SPIN_DURATION_SEC = BATTLE_COIN_REVEAL_MS / 1000 + 0.15;
const REVEAL_TEXT_DELAY_SEC = BATTLE_COIN_REVEAL_MS / 1000;

const SPARKLES = [
  { x: -52, y: -28, delay: 0 },
  { x: 58, y: -18, delay: 0.08 },
  { x: -44, y: 36, delay: 0.12 },
  { x: 48, y: 42, delay: 0.05 },
  { x: 0, y: -56, delay: 0.15 },
];

function PokemonDialogBox({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative rounded-xl border-[3px] border-white/95 bg-slate-900/95 px-4 py-2.5",
        "shadow-[inset_0_2px_0_rgba(255,255,255,0.12),0_4px_16px_rgba(0,0,0,0.45)]",
        className
      )}
    >
      <div className="absolute top-1 left-2 right-2 h-px bg-white/10 rounded-full" />
      {children}
    </div>
  );
}

function CoinFace({ side }: { side: "player" | "rival" }) {
  const isPlayer = side === "player";

  return (
    <div
      className={cn(
        "absolute inset-0 rounded-full [backface-visibility:hidden] [-webkit-backface-visibility:hidden]",
        !isPlayer && "[transform:rotateY(180deg)]"
      )}
    >
      {/* Borda metálica estilo medalha da Liga */}
      <div className="absolute inset-0 rounded-full p-[6px] bg-gradient-to-br from-amber-100 via-yellow-400 to-amber-800 shadow-[inset_0_2px_3px_rgba(255,255,255,0.55),inset_0_-3px_5px_rgba(120,53,15,0.45)]">
        <div
          className={cn(
            "relative w-full h-full rounded-full flex flex-col items-center justify-center gap-0.5 overflow-hidden",
            isPlayer
              ? "bg-gradient-to-b from-teal-300 via-emerald-500 to-emerald-900"
              : "bg-gradient-to-b from-rose-400 via-red-600 to-red-950"
          )}
        >
          <div className="absolute inset-0 opacity-30 bg-[repeating-linear-gradient(135deg,transparent,transparent_4px,rgba(255,255,255,0.08)_4px,rgba(255,255,255,0.08)_8px)]" />
          <div className="absolute inset-0 bg-gradient-to-tr from-white/30 via-transparent to-black/20 pointer-events-none" />

          <div className="relative z-10 drop-shadow-[0_3px_6px_rgba(0,0,0,0.45)]">
            {isPlayer ? (
              <PokeballIcon size={54} />
            ) : (
              <GreatBallIcon size={54} />
            )}
          </div>

          <span className="relative z-10 text-[10px] font-black text-white uppercase tracking-[0.18em] drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
            {isPlayer ? "Cara" : "Coroa"}
          </span>
          <span
            className={cn(
              "relative z-10 text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full",
              isPlayer
                ? "text-emerald-950 bg-emerald-200/90"
                : "text-red-950 bg-red-200/90"
            )}
          >
            {isPlayer ? "Você" : "Rival"}
          </span>
        </div>
      </div>

      {/* Serrilhado da moeda */}
      <div
        className="absolute inset-0 rounded-full opacity-40 pointer-events-none"
        style={{
          background:
            "repeating-conic-gradient(from 0deg, rgba(251,191,36,0.5) 0deg 8deg, transparent 8deg 16deg)",
        }}
      />
    </div>
  );
}

export function BattleCoinFlipOverlay({ playerStarts }: BattleCoinFlipOverlayProps) {
  const finalRotation = playerStarts ? 0 : 180;

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none overflow-hidden">
      <div
        className={cn(
          "absolute inset-0 transition-opacity duration-700",
          playerStarts
            ? "bg-[radial-gradient(ellipse_at_center,rgba(52,211,153,0.12)_0%,transparent_65%)]"
            : "bg-[radial-gradient(ellipse_at_center,rgba(248,113,113,0.12)_0%,transparent_65%)]"
        )}
      />

      <motion.div
        initial={{ opacity: 0, y: -40, scale: 0.6 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="relative flex flex-col items-center gap-3"
      >
        <PokemonDialogBox>
          <p className="text-[11px] font-bold text-white text-center tracking-wide">
            Quem ataca primeiro?
          </p>
          <p className="text-[9px] text-white/45 text-center mt-0.5">Cara ou coroa</p>
        </PokemonDialogBox>

        <div className="relative w-[7.5rem] h-[7.5rem] [perspective:900px]">
          <motion.div
            className="relative w-full h-full [transform-style:preserve-3d]"
            initial={{ rotateY: 0, rotateX: 24, y: -60 }}
            animate={{
              rotateY: [0, 1080 + finalRotation],
              rotateX: [24, 8, 18, 8],
              y: [-60, 0, -12, 0],
            }}
            transition={{ duration: SPIN_DURATION_SEC, ease: [0.22, 1, 0.36, 1] }}
          >
            <CoinFace side="player" />
            <CoinFace side="rival" />
          </motion.div>

          <motion.div
            className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-20 h-3 rounded-[100%] bg-black/35 blur-md -z-10"
            animate={{ scaleX: [0.6, 1, 0.85], opacity: [0.2, 0.55, 0.4] }}
            transition={{ duration: SPIN_DURATION_SEC }}
          />

          <motion.div
            className={cn(
              "absolute -inset-5 rounded-full blur-2xl -z-10",
              playerStarts ? "bg-emerald-400/30" : "bg-red-400/30"
            )}
            animate={{ opacity: [0.15, 0.7, 0.35], scale: [0.9, 1.15, 1] }}
            transition={{ duration: SPIN_DURATION_SEC }}
          />

          {SPARKLES.map((s, i) => (
            <motion.div
              key={i}
              className="absolute left-1/2 top-1/2 text-amber-300"
              initial={{ opacity: 0, x: 0, y: 0, scale: 0 }}
              animate={{
                opacity: [0, 0, 1, 0],
                x: s.x,
                y: s.y,
                scale: [0, 0, 1.2, 0.6],
              }}
              transition={{
                duration: 0.55,
                delay: REVEAL_TEXT_DELAY_SEC + s.delay,
                ease: "easeOut",
              }}
            >
              <Sparkles className="w-4 h-4" strokeWidth={2.5} />
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 6 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: REVEAL_TEXT_DELAY_SEC, duration: 0.45 }}
        >
          <PokemonDialogBox
            className={cn(
              playerStarts
                ? "border-emerald-200/90 shadow-emerald-500/15"
                : "border-red-200/90 shadow-red-500/15"
            )}
          >
            <p
              className={cn(
                "text-xs font-bold text-center flex items-center justify-center gap-1.5",
                playerStarts ? "text-emerald-200" : "text-red-200"
              )}
            >
              {playerStarts ? (
                <>
                  <PokeballIcon size={16} />
                  Você começa atacando!
                </>
              ) : (
                <>
                  <GreatBallIcon size={16} />
                  Oponente começa atacando!
                </>
              )}
            </p>
          </PokemonDialogBox>
        </motion.div>
      </motion.div>
    </div>
  );
}
