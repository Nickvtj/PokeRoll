"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, Coins, Route } from "lucide-react";
import { JitsuBeltIcon } from "@/components/minigame/jitsu/JitsuBeltIcon";
import {
  getBeltProgress,
  JITSU_BELT_RANK_REWARDS,
  JITSU_BELTS,
} from "@/data/jitsu-belts";
import { playUiTab } from "@/lib/ui-sounds";
import { cn } from "@/lib/utils";

interface JitsuBeltProgressProps {
  wins: number;
  className?: string;
}

function beltStatus(beltIndex: number, currentIndex: number): "done" | "current" | "locked" {
  if (beltIndex < currentIndex) return "done";
  if (beltIndex === currentIndex) return "current";
  return "locked";
}

export function JitsuBeltProgress({ wins, className }: JitsuBeltProgressProps) {
  const [pathOpen, setPathOpen] = useState(false);
  const progress = getBeltProgress(wins);
  const { current, next, beltIndex, winsInSegment, segmentSize, winsToNext, segmentProgress } =
    progress;

  const togglePath = () => {
    playUiTab();
    setPathOpen((v) => !v);
  };

  return (
    <div className={cn("w-full max-w-md mx-auto text-left space-y-2", className)}>
      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3.5 space-y-3">
        <div className="flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-xl border flex items-center justify-center text-xl shrink-0"
            style={{
              borderColor: `${current.color}66`,
              background: `linear-gradient(135deg, ${current.color}28, ${current.color}08)`,
              boxShadow: `inset 0 0 12px ${current.color}22`,
            }}
          >
            <JitsuBeltIcon color={current.color} size="md" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] uppercase tracking-wider text-white/35 font-semibold">
              Sua faixa
            </p>
            <p className="font-bold truncate" style={{ color: current.color }}>
              {current.label}
            </p>
            <p className="text-[11px] text-white/40 tabular-nums">
              {wins} vitória{wins !== 1 ? "s" : ""} no total
            </p>
          </div>
          <button
            type="button"
            onClick={togglePath}
            className={cn(
              "shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-[11px] font-semibold transition-colors",
              pathOpen
                ? "border-rose-400/40 bg-rose-500/15 text-rose-200"
                : "border-white/10 bg-white/5 text-white/55 hover:text-white hover:bg-white/10"
            )}
          >
            <Route className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Caminho</span>
            <ChevronDown
              className={cn("w-3.5 h-3.5 transition-transform", pathOpen && "rotate-180")}
            />
          </button>
        </div>

        {next ? (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-white/45">
                Próxima:{" "}
                <span className="font-semibold" style={{ color: next.color }}>
                  {next.label}
                </span>
              </span>
              <span className="text-white/55 font-bold tabular-nums">
                {winsInSegment}/{segmentSize}
              </span>
            </div>
            <div className="h-2 rounded-full overflow-hidden bg-white/[0.08]">
              <motion.div
                className="h-full rounded-full"
                initial={false}
                animate={{ width: `${segmentProgress * 100}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                style={{
                  background: `linear-gradient(90deg, ${current.color}, ${next.color})`,
                }}
              />
            </div>
            <p className="text-[10px] text-white/35 text-center">
              {winsToNext} vitória{winsToNext !== 1 ? "s" : ""} para subir de faixa
            </p>
          </div>
        ) : (
          <div className="rounded-xl border border-amber-500/25 bg-amber-500/10 px-3 py-2 text-center">
            <p className="text-xs font-bold text-amber-300">Faixa máxima alcançada!</p>
            <p className="text-[10px] text-white/40 mt-0.5">Mestre do Desafio Elemental</p>
          </div>
        )}
      </div>

      <AnimatePresence initial={false}>
        {pathOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22 }}
          >
            <div className="rounded-2xl border border-white/10 bg-black/25 p-3 sm:p-4">
              <p className="text-[10px] uppercase tracking-wider text-white/35 font-semibold mb-3 text-center">
                Jornada das faixas
              </p>

              <div className="space-y-0 max-h-[14rem] overflow-y-auto py-1 pl-1 pr-2 [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.15)_transparent]">
                {JITSU_BELTS.map((belt, i) => {
                  const status = beltStatus(i, beltIndex);
                  const reward = JITSU_BELT_RANK_REWARDS[belt.id];
                  const isLast = i === JITSU_BELTS.length - 1;
                  const isActiveSegment = i === beltIndex && next != null;

                  return (
                    <div key={belt.id} className="flex gap-3">
                      <div className="flex flex-col items-center shrink-0 w-10 pt-0.5">
                        <div
                          className={cn(
                            "relative w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm",
                            status === "done" && "border-emerald-400/60",
                            status === "current" && "ring-2 ring-white/15",
                            status === "locked" && "border-white/10 opacity-50"
                          )}
                          style={{
                            borderColor:
                              status !== "locked" ? `${belt.color}aa` : undefined,
                            background:
                              status === "current"
                                ? `linear-gradient(145deg, ${belt.color}30, ${belt.color}08)`
                                : status === "done"
                                  ? `${belt.color}12`
                                  : undefined,
                            boxShadow:
                              status === "current"
                                ? `inset 0 0 10px ${belt.color}35`
                                : undefined,
                          }}
                        >
                          <JitsuBeltIcon
                            color={belt.color}
                            size="sm"
                            className={status === "locked" ? "grayscale opacity-45" : undefined}
                          />
                          {status === "done" && (
                            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 flex items-center justify-center ring-2 ring-[#0f172a]">
                              <Check className="w-2 h-2 text-white" strokeWidth={3} />
                            </span>
                          )}
                        </div>
                        {!isLast && (
                          <div className="w-0.5 flex-1 min-h-[1.25rem] my-0.5 relative rounded-full bg-white/10 overflow-hidden">
                            {status === "done" && (
                              <div className="absolute inset-0 bg-emerald-400/50 rounded-full" />
                            )}
                            {isActiveSegment && (
                              <motion.div
                                className="absolute inset-x-0 top-0 rounded-full"
                                initial={false}
                                animate={{ height: `${segmentProgress * 100}%` }}
                                style={{
                                  background: `linear-gradient(180deg, ${belt.color}, ${next!.color})`,
                                }}
                              />
                            )}
                          </div>
                        )}
                      </div>

                      <div
                        className={cn(
                          "flex-1 pb-3 min-w-0",
                          isLast && "pb-0"
                        )}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p
                            className={cn(
                              "text-xs font-bold truncate",
                              status === "locked" ? "text-white/30" : "text-white/75"
                            )}
                            style={status !== "locked" ? { color: belt.color } : undefined}
                          >
                            {belt.label}
                          </p>
                          {status === "current" && (
                            <span className="text-[9px] font-bold uppercase tracking-wide text-rose-300/80 shrink-0">
                              Atual
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-white/30 tabular-nums">
                          {belt.minXp} vitórias para desbloquear
                        </p>
                        {reward != null && status !== "locked" && (
                          <span className="inline-flex items-center gap-0.5 mt-1 text-[10px] text-amber-400/85 font-semibold">
                            <Coins className="w-3 h-3" />
                            Bônus +{reward} moedas
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <p className="text-[10px] text-white/30 text-center mt-3 leading-relaxed">
                Cada vitória no duelo conta para a próxima faixa.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
