"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { Ban, Bot, Clock, Flame, Leaf, Swords, TrendingUp, Trophy, User, Waves } from "lucide-react";
import { JitsuElementIcon } from "@/components/minigame/jitsu/JitsuElementIcon";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { JitsuArenaCard } from "@/components/minigame/jitsu/JitsuArenaCard";
import { JitsuArenaFx } from "@/components/minigame/jitsu/JitsuArenaFx";
import { JitsuCard } from "@/components/minigame/jitsu/JitsuCard";
import { createInitialHand, createJitsuCard, JITSU_ELEMENT_META } from "@/data/jitsu-cards";
import { describeSpecialOnPlay } from "@/data/jitsu-specials";
import { JitsuBeltProgress } from "@/components/minigame/jitsu/JitsuBeltProgress";
import {
  checkMatchWin,
  filterPlayableHand,
  getWinProgressHint,
  isElementBlocked,
  JITSU_HAND,
  JITSU_TIMER_SEC,
  pickBotCard,
  pickTrophyToDestroy,
  resolveRound,
  trophyFromCard,
} from "@/lib/jitsu-engine";
import {
  playJitsuCardPlay,
  playJitsuReveal,
  playJitsuRoundLoss,
  playJitsuRoundWin,
  playJitsuTie,
  playJitsuTimerTick,
  playJitsuTrophy,
} from "@/lib/sound-engine";
import { playUiConfirm } from "@/lib/ui-sounds";
import { cn } from "@/lib/utils";
import { useEconomyStore } from "@/stores/economy-store";
import type {
  JitsuCard as JitsuCardType,
  JitsuElement,
  JitsuMatchResult,
  JitsuTrophy,
} from "@/types/jitsu";

function layoutIdFor(card: JitsuCardType) {
  return `jitsu-card-${card.instanceId}`;
}

function queueSpecialEffects(
  card: JitsuCardType,
  isPlayer: boolean,
  setPlayerBlock: (v: JitsuElement | null) => void,
  setBotBlock: (v: JitsuElement | null) => void,
  setPlayerMod: (v: number) => void,
  setBotMod: (v: number) => void
) {
  if (!card.special) return;
  switch (card.special) {
    case "block-element":
      if (isPlayer) setBotBlock(card.blockTarget ?? null);
      else setPlayerBlock(card.blockTarget ?? null);
      break;
    case "buff-next":
      if (isPlayer) setPlayerMod(2);
      else setBotMod(2);
      break;
    case "debuff-next":
      if (isPlayer) setBotMod(-2);
      else setPlayerMod(-2);
      break;
    default:
      break;
  }
}

type Phase = "idle" | "playing" | "reveal" | "resolve";

export interface PokeJitsuGameResult extends JitsuMatchResult {
  won: boolean;
}

interface PokeJitsuGameProps {
  onComplete: (result: PokeJitsuGameResult) => void;
  onReady?: (restart: () => void) => void;
}

function TrophyRow({
  trophies,
  hint,
  side,
}: {
  trophies: JitsuTrophy[];
  hint: ReturnType<typeof getWinProgressHint>;
  side: "player" | "bot";
}) {
  return (
    <div className="flex flex-wrap gap-1.5 min-h-[1.75rem]">
      {trophies.map((t, i) => {
        const meta = JITSU_ELEMENT_META[t.type];
        const pulse =
          side === "player" &&
          (hint.needsType === t.type || hint.needsSameType === t.type);
        return (
          <motion.div
            key={`${side}-${t.pokemonId}-${i}`}
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 18 }}
            className={cn(
              "w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold",
              meta.border,
              meta.text,
              "bg-slate-900/90",
              meta.glow,
              pulse && "ring-2 ring-amber-400/50"
            )}
            title={`${meta.label} · Poder ${t.power}`}
          >
            <JitsuElementIcon type={t.type} className={cn("w-3.5 h-3.5", meta.text)} />
          </motion.div>
        );
      })}
      {side === "player" && hint.needsType && trophies.length > 0 && (
        <motion.div
          animate={{ opacity: [0.35, 0.8, 0.35] }}
          transition={{ duration: 1.2, repeat: Infinity }}
          className={cn(
            "w-7 h-7 rounded-full border border-dashed flex items-center justify-center text-[10px]",
            JITSU_ELEMENT_META[hint.needsType].border,
            JITSU_ELEMENT_META[hint.needsType].text
          )}
        >
          <JitsuElementIcon
            type={hint.needsType}
            className={cn("w-3 h-3", JITSU_ELEMENT_META[hint.needsType].text)}
          />
        </motion.div>
      )}
    </div>
  );
}

function TimerRing({ timer, max, urgent }: { timer: number; max: number; urgent: boolean }) {
  const progress = timer / max;
  const circumference = 2 * Math.PI * 18;
  const offset = circumference * (1 - progress);

  return (
    <div className="relative w-11 h-11 shrink-0">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 40 40" aria-hidden>
        <circle cx="20" cy="20" r="18" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3" />
        <motion.circle
          cx="20"
          cy="20"
          r="18"
          fill="none"
          stroke={urgent ? "#f87171" : "#fbbf24"}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={circumference}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        />
      </svg>
      <span
        className={cn(
          "absolute inset-0 flex items-center justify-center text-xs font-black tabular-nums",
          urgent ? "text-red-400" : "text-amber-300"
        )}
      >
        {timer}
      </span>
    </div>
  );
}

const ELEMENT_TRIANGLE = [
  { type: "FOGO" as const, icon: Flame, beats: "PLANTA" },
  { type: "AGUA" as const, icon: Waves, beats: "FOGO" },
  { type: "PLANTA" as const, icon: Leaf, beats: "AGUA" },
];

export function PokeJitsuGame({ onComplete, onReady }: PokeJitsuGameProps) {
  const jitsuXp = useEconomyStore((s) => s.jitsuXp ?? 0);

  const [phase, setPhase] = useState<Phase>("idle");
  const [playerHand, setPlayerHand] = useState<JitsuCardType[]>([]);
  const [botHand, setBotHand] = useState<JitsuCardType[]>([]);
  const [playerTrophies, setPlayerTrophies] = useState<JitsuTrophy[]>([]);
  const [botTrophies, setBotTrophies] = useState<JitsuTrophy[]>([]);
  const [playerPlayed, setPlayerPlayed] = useState<JitsuCardType | null>(null);
  const [botPlayed, setBotPlayed] = useState<JitsuCardType | null>(null);
  const [roundMsg, setRoundMsg] = useState("");
  const [winnerFlash, setWinnerFlash] = useState<"player" | "bot" | "tie" | null>(null);
  const [timer, setTimer] = useState(JITSU_TIMER_SEC);
  const [roundsPlayed, setRoundsPlayed] = useState(0);
  const [playerBlockNext, setPlayerBlockNext] = useState<JitsuElement | null>(null);
  const [botBlockNext, setBotBlockNext] = useState<JitsuElement | null>(null);
  const [playerModNext, setPlayerModNext] = useState(0);
  const [botModNext, setBotModNext] = useState(0);
  const endedRef = useRef(false);
  const prevTimerRef = useRef(JITSU_TIMER_SEC);

  const playerHint = getWinProgressHint(playerTrophies);
  const timerUrgent = phase === "playing" && timer <= 5;
  const arenaStyle =
    playerPlayed && botPlayed
      ? {
          background: `linear-gradient(90deg, ${JITSU_ELEMENT_META[playerPlayed.type].particle}22 0%, transparent 45%, transparent 55%, ${JITSU_ELEMENT_META[botPlayed.type].particle}22 100%)`,
        }
      : undefined;

  const startMatch = useCallback(() => {
    endedRef.current = false;
    setPhase("playing");
    setPlayerHand(createInitialHand(JITSU_HAND));
    setBotHand(createInitialHand(JITSU_HAND));
    setPlayerTrophies([]);
    setBotTrophies([]);
    setPlayerPlayed(null);
    setBotPlayed(null);
    setRoundMsg("Escolha sua carta!");
    setWinnerFlash(null);
    setTimer(JITSU_TIMER_SEC);
    prevTimerRef.current = JITSU_TIMER_SEC;
    setRoundsPlayed(0);
    setPlayerBlockNext(null);
    setBotBlockNext(null);
    setPlayerModNext(0);
    setBotModNext(0);
    playUiConfirm();
  }, []);

  useEffect(() => {
    onReady?.(startMatch);
  }, [onReady, startMatch]);

  const endMatch = useCallback(
    (
      won: boolean,
      pTrophies: JitsuTrophy[],
      bTrophies: JitsuTrophy[],
      reason: JitsuMatchResult["winReason"],
      rounds: number
    ) => {
      if (endedRef.current) return;
      endedRef.current = true;
      const result: PokeJitsuGameResult = {
        won,
        roundsPlayed: rounds,
        playerTrophies: pTrophies,
        botTrophies: bTrophies,
        winReason: won ? reason : null,
      };
      window.setTimeout(() => onComplete(result), 700);
    },
    [onComplete]
  );

  const playCard = useCallback(
    async (card: JitsuCardType) => {
      if (phase !== "playing") return;
      if (isElementBlocked(card.type, playerBlockNext)) return;

      void playJitsuCardPlay();

      const roundMods = { player: playerModNext, bot: botModNext };
      setPlayerModNext(0);
      setBotModNext(0);
      setPlayerBlockNext(null);

      const botBlockedThisTurn = botBlockNext;
      setBotBlockNext(null);

      const botCard = pickBotCard(botHand, playerTrophies, botBlockedThisTurn);
      const newPlayerHand = playerHand.filter((c) => c.instanceId !== card.instanceId);
      const newBotHand = botHand.filter((c) => c.instanceId !== botCard.instanceId);

      setPhase("reveal");
      setPlayerPlayed(card);
      setBotPlayed(botCard);
      setPlayerHand(newPlayerHand);
      setBotHand(newBotHand);
      setRoundMsg("Carta indo para a arena...");

      await new Promise((r) => setTimeout(r, 540));
      void playJitsuReveal();
      setRoundMsg("Revelando cartas...");
      await new Promise((r) => setTimeout(r, 380));
      setPhase("resolve");

      const winner = resolveRound(card, botCard, roundMods);
      setWinnerFlash(winner);

      const specialMsgs = [
        describeSpecialOnPlay(card, "player"),
        describeSpecialOnPlay(botCard, "bot"),
      ].filter(Boolean);

      queueSpecialEffects(card, true, setPlayerBlockNext, setBotBlockNext, setPlayerModNext, setBotModNext);
      queueSpecialEffects(botCard, false, setPlayerBlockNext, setBotBlockNext, setPlayerModNext, setBotModNext);

      if (winner === "tie") {
        void playJitsuTie();
        setRoundMsg(
          specialMsgs.length > 0
            ? `Empate! ${specialMsgs[0]}`
            : "Empate! Cartas devolvidas ao deck."
        );
        await new Promise((r) => setTimeout(r, 1300));
        setPlayerHand((h) => {
          const next = [...h, card];
          while (next.length < JITSU_HAND) next.push(createJitsuCard());
          return next.slice(0, JITSU_HAND);
        });
        setBotHand((h) => {
          const next = [...h, botCard];
          while (next.length < JITSU_HAND) next.push(createJitsuCard());
          return next.slice(0, JITSU_HAND);
        });
      } else {
        const playerWon = winner === "player";
        if (playerWon) void playJitsuRoundWin(card.type);
        else void playJitsuRoundLoss();

        let nextPlayerTrophies = playerTrophies;
        let nextBotTrophies = botTrophies;

        if (playerWon) {
          nextPlayerTrophies = [...playerTrophies, trophyFromCard(card)];
          if (card.special === "destroy-trophy" && botTrophies.length > 0) {
            const idx = pickTrophyToDestroy(botTrophies);
            nextBotTrophies = botTrophies.filter((_, i) => i !== idx);
          }
          setPlayerTrophies(nextPlayerTrophies);
          setBotTrophies(nextBotTrophies);
          void playJitsuTrophy();
        } else {
          nextBotTrophies = [...botTrophies, trophyFromCard(botCard)];
          if (botCard.special === "destroy-trophy" && playerTrophies.length > 0) {
            const idx = pickTrophyToDestroy(playerTrophies);
            nextPlayerTrophies = playerTrophies.filter((_, i) => i !== idx);
          } else {
            nextPlayerTrophies = playerTrophies;
          }
          setPlayerTrophies(nextPlayerTrophies);
          setBotTrophies(nextBotTrophies);
        }

        const destroyNote =
          playerWon && card.special === "destroy-trophy"
            ? " · Troféu rival destruído!"
            : !playerWon && botCard.special === "destroy-trophy"
              ? " · Perdeu um troféu!"
              : "";

        const baseMsg = playerWon
          ? `Você venceu a rodada!${destroyNote}`
          : `O Sensei venceu a rodada!${destroyNote}`;

        setRoundMsg(specialMsgs.length > 0 ? `${baseMsg} ${specialMsgs[0]}` : baseMsg);

        await new Promise((r) => setTimeout(r, 1500));

        setPlayerHand((h) => {
          const next = [...h];
          while (next.length < JITSU_HAND) next.push(createJitsuCard());
          return next.slice(0, JITSU_HAND);
        });
        setBotHand((h) => {
          const next = [...h];
          while (next.length < JITSU_HAND) next.push(createJitsuCard());
          return next.slice(0, JITSU_HAND);
        });

        const rounds = roundsPlayed + 1;
        setRoundsPlayed(rounds);

        const pWin = checkMatchWin(nextPlayerTrophies);
        const bWin = checkMatchWin(nextBotTrophies);
        if (pWin.won) {
          endMatch(true, nextPlayerTrophies, nextBotTrophies, pWin.reason, rounds);
          return;
        }
        if (bWin.won) {
          endMatch(false, nextPlayerTrophies, nextBotTrophies, null, rounds);
          return;
        }
      }

      setPlayerPlayed(null);
      setBotPlayed(null);
      setWinnerFlash(null);
      setRoundMsg(
        botBlockNext || playerBlockNext
          ? "Escolha sua carta! (há efeitos ativos)"
          : "Escolha sua carta!"
      );
      setTimer(JITSU_TIMER_SEC);
      prevTimerRef.current = JITSU_TIMER_SEC;
      setPhase("playing");
    },
    [
      phase,
      playerHand,
      botHand,
      playerTrophies,
      botTrophies,
      roundsPlayed,
      playerBlockNext,
      botBlockNext,
      playerModNext,
      botModNext,
      endMatch,
    ]
  );

  const playCardRef = useRef(playCard);
  playCardRef.current = playCard;

  useEffect(() => {
    if (phase !== "playing") return;
    if (timer <= 0) {
      const playable = filterPlayableHand(playerHand, playerBlockNext);
      const card = playable[0];
      if (card) void playCardRef.current(card);
      return;
    }
    const id = window.setTimeout(() => setTimer((t) => t - 1), 1000);
    return () => window.clearTimeout(id);
  }, [phase, timer, playerHand]);

  useEffect(() => {
    if (phase !== "playing" || timer >= prevTimerRef.current) {
      prevTimerRef.current = timer;
      return;
    }
    if (timer <= 5 && timer > 0) {
      void playJitsuTimerTick();
    }
    prevTimerRef.current = timer;
  }, [phase, timer]);

  if (phase === "idle") {
    return (
      <div className="relative glass-card p-6 sm:p-8 text-center space-y-5 border border-rose-500/20">
        <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 via-transparent to-indigo-500/10 pointer-events-none rounded-[inherit] overflow-hidden" />
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="relative mx-auto w-16 h-16 rounded-2xl bg-rose-500/15 border border-rose-500/35 flex items-center justify-center shadow-[0_0_30px_rgba(244,63,94,0.2)]"
        >
          <Swords className="w-8 h-8 text-rose-400" />
        </motion.div>
        <div className="relative">
          <h3 className="text-xl font-bold">Desafio Elemental</h3>
          <p className="text-white/50 text-sm mt-2 leading-relaxed max-w-sm mx-auto">
            Duelo tático Fogo · Água · Planta. Cartas especiais com efeitos únicos. Vença com 3
            elementos diferentes ou 3 do mesmo tipo.
          </p>
        </div>

        <div className="relative flex justify-center gap-3 py-2">
          {ELEMENT_TRIANGLE.map(({ type, icon: Icon, beats }) => {
            const meta = JITSU_ELEMENT_META[type];
            return (
              <div key={type} className="flex flex-col items-center gap-1">
                <div
                  className={cn(
                    "w-10 h-10 rounded-xl border flex items-center justify-center",
                    meta.border,
                    meta.bg
                  )}
                >
                  <Icon className={cn("w-5 h-5", meta.text)} />
                </div>
                <span className="text-[9px] text-white/35">
                  vence {JITSU_ELEMENT_META[beats].label}
                </span>
              </div>
            );
          })}
        </div>

        <JitsuBeltProgress wins={jitsuXp} className="relative" />
        <AnimatedButton
          variant="primary"
          size="lg"
          onClick={startMatch}
          className="relative w-full max-w-xs mx-auto"
        >
          INICIAR DUELO
        </AnimatedButton>
      </div>
    );
  }

  return (
    <LayoutGroup id="jitsu-match">
    <div className="relative space-y-3 max-w-3xl mx-auto">
      {/* Oponente */}
      <div className="glass-card p-3 border border-rose-500/15 space-y-2 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-center justify-between gap-2 relative">
          <div className="flex items-center gap-2 text-sm font-bold text-white/75">
            <Bot className="w-4 h-4 text-rose-400" />
            Sensei Bot
          </div>
          <TrophyRow trophies={botTrophies} hint={{ needsType: null, needsSameType: null }} side="bot" />
        </div>
        <div className="flex justify-center gap-1 opacity-60">
          {botHand.map((c) => (
            <JitsuCard key={c.instanceId} card={c} faceDown size="sm" disabled />
          ))}
        </div>
      </div>

      {/* Placar central */}
      <div className="flex items-center justify-between gap-3 px-1">
        <span className="flex items-center gap-1.5 text-xs font-semibold text-cyan-300/90">
          <User className="w-3.5 h-3.5" /> Você
        </span>
        <div className="flex items-center gap-2">
          {phase === "playing" ? (
            <TimerRing timer={timer} max={JITSU_TIMER_SEC} urgent={timerUrgent} />
          ) : (
            <span className="flex items-center gap-1 text-xs text-white/35 font-mono">
              <Clock className="w-3.5 h-3.5" /> —
            </span>
          )}
          <span className="text-[10px] text-white/30 font-mono tabular-nums">
            R{roundsPlayed}
          </span>
        </div>
        <span className="flex items-center gap-1.5 text-xs font-semibold text-rose-300/80">
          Bot <Bot className="w-3.5 h-3.5" />
        </span>
      </div>

      {/* Arena */}
      <div
        style={arenaStyle}
        className={cn(
          "glass-card p-4 border min-h-[12.5rem] flex flex-col items-center justify-center gap-3 relative overflow-hidden transition-colors duration-500 bg-gradient-to-br from-indigo-950/40 via-slate-900/60 to-violet-950/30",
          winnerFlash === "player" && "border-emerald-400/40",
          winnerFlash === "bot" && "border-rose-400/40",
          winnerFlash === "tie" && "border-amber-400/35",
          !winnerFlash && "border-indigo-500/25"
        )}
      >
        <JitsuArenaFx
          playerType={playerPlayed?.type}
          botType={botPlayed?.type}
          winner={winnerFlash}
          phase={phase === "reveal" || phase === "resolve" ? phase : null}
        />

        <AnimatePresence mode="wait">
          <motion.p
            key={roundMsg}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="text-sm font-semibold text-white/70 h-5 relative z-10"
          >
            {roundMsg}
          </motion.p>
        </AnimatePresence>

        <div className="flex items-center justify-center gap-3 sm:gap-6 relative z-10 min-h-[8.5rem]">
          <div
            className={cn(
              "rounded-xl border p-2 min-w-[5.5rem] min-h-[7.5rem] flex items-center justify-center transition-colors duration-300",
              winnerFlash === "player"
                ? "border-emerald-400/50 bg-emerald-500/10"
                : "border-dashed border-white/15 bg-black/20"
            )}
          >
            {playerPlayed ? (
              <motion.div
                animate={
                  winnerFlash === "bot" && phase === "resolve"
                    ? { x: [0, -5, 5, -3, 0] }
                    : { x: 0 }
                }
                transition={{ duration: 0.38, ease: "easeInOut" }}
              >
                <JitsuCard
                  card={playerPlayed}
                  layoutId={layoutIdFor(playerPlayed)}
                  size="md"
                  disabled
                  dimmed={winnerFlash === "bot" && phase === "resolve"}
                  pulsing={winnerFlash === "player" && phase === "resolve"}
                />
              </motion.div>
            ) : (
              <span className="text-[10px] text-white/25 uppercase tracking-wider">Sua carta</span>
            )}
          </div>

          <motion.div
            animate={
              phase === "reveal"
                ? { scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }
                : phase === "resolve"
                  ? { rotate: [0, -10, 10, 0], scale: [1, 1.15, 1] }
                  : { scale: 1, opacity: 1, rotate: 0 }
            }
            transition={{ duration: phase === "reveal" ? 0.85 : 0.45, ease: "easeInOut" }}
          >
            <Swords className="w-7 h-7 text-indigo-300/60 shrink-0 drop-shadow-[0_0_8px_rgba(129,140,248,0.4)]" />
          </motion.div>

          <div
            className={cn(
              "rounded-xl border p-2 min-w-[5.5rem] min-h-[7.5rem] flex items-center justify-center transition-colors duration-300",
              winnerFlash === "bot"
                ? "border-rose-400/50 bg-rose-500/10"
                : "border-dashed border-white/15 bg-black/20"
            )}
          >
            {botPlayed ? (
              <JitsuArenaCard
                card={botPlayed}
                side="bot"
                winnerFlash={winnerFlash}
                isResolving={phase === "resolve"}
              />
            ) : (
              <span className="text-[10px] text-white/25 uppercase tracking-wider">Sensei</span>
            )}
          </div>
        </div>

        {winnerFlash === "tie" && (
          <motion.p
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-amber-300 text-sm font-bold relative z-10"
          >
            Empate total!
          </motion.p>
        )}
      </div>

      {/* Jogador */}
      <div className="glass-card p-3 border border-cyan-500/15 space-y-2 relative overflow-hidden">
        <div className="absolute bottom-0 left-0 w-28 h-28 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-center justify-between gap-2 relative">
          <div className="flex items-center gap-2 text-sm font-bold text-cyan-300/90">
            <Trophy className="w-4 h-4" />
            Suas vitórias
          </div>
          <TrophyRow trophies={playerTrophies} hint={playerHint} side="player" />
        </div>
        {playerBlockNext && phase === "playing" && (
          <p className="text-center text-[10px] text-red-300/90 font-semibold flex items-center justify-center gap-1">
            <Ban className="w-3 h-3" />
            {JITSU_ELEMENT_META[playerBlockNext].label} bloqueado nesta rodada
          </p>
        )}
        {playerModNext !== 0 && phase === "playing" && (
          <p className="text-center text-[10px] text-emerald-300/90 font-semibold flex items-center justify-center gap-1">
            <TrendingUp className="w-3 h-3" />
            Próxima carta: {playerModNext > 0 ? "+" : ""}
            {playerModNext} poder
          </p>
        )}
        <div className="flex justify-center gap-2 flex-wrap relative">
          {playerHand.map((c) => {
            const blocked = isElementBlocked(c.type, playerBlockNext);
            return (
              <JitsuCard
                key={c.instanceId}
                card={c}
                layoutId={layoutIdFor(c)}
                size="md"
                disabled={phase !== "playing" || blocked}
                blocked={blocked && phase === "playing"}
                selected={phase === "playing" && !timerUrgent && !blocked}
                onClick={() => playCard(c)}
              />
            );
          })}
        </div>
        {timerUrgent && (
          <motion.p
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 0.8, repeat: Infinity }}
            className="text-center text-[10px] text-red-400 font-semibold uppercase tracking-wider"
          >
            Tempo acabando!
          </motion.p>
        )}
      </div>

    </div>
    </LayoutGroup>
  );
}
