"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Brain } from "lucide-react";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { PokeballIcon } from "@/components/ui/PokeballIcon";
import {
  MEMORY_GAME_DURATION_SEC,
  MEMORY_PAIR_COUNT,
  MEMORY_COINS_PER_PAIR,
} from "@/data/economy-balance";
import {
  buildMemoryDeck,
  getMemoryPokemon,
  isMemoryMatch,
  type MemoryCard,
} from "@/lib/memory-minigame-engine";
import { playCardFlip, playMemoryMatch, playMemoryMismatch } from "@/lib/sound-engine";
import { cn } from "@/lib/utils";

export interface MemoryGameResult {
  moves: number;
  pairsFound: number;
  totalPairs: number;
  completed: boolean;
  timedOut: boolean;
}

interface PokeMemoryGameProps {
  onComplete: (result: MemoryGameResult) => void;
  onReady?: (restart: () => void) => void;
}

export function PokeMemoryGame({ onComplete, onReady }: PokeMemoryGameProps) {
  const [started, setStarted] = useState(false);
  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [flipped, setFlipped] = useState<string[]>([]);
  const [matched, setMatched] = useState<string[]>([]);
  const [moves, setMoves] = useState(0);
  const [timeLeft, setTimeLeft] = useState(MEMORY_GAME_DURATION_SEC);
  const [done, setDone] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const [resolving, setResolving] = useState(false);

  const resolvingRef = useRef(false);
  const endedRef = useRef(false);
  const movesRef = useRef(0);
  const matchedRef = useRef<string[]>([]);
  const cardsRef = useRef<MemoryCard[]>([]);
  const onCompleteRef = useRef(onComplete);

  onCompleteRef.current = onComplete;
  movesRef.current = moves;
  matchedRef.current = matched;
  cardsRef.current = cards;

  const endGame = useCallback((result: MemoryGameResult) => {
    if (endedRef.current) return;
    endedRef.current = true;
    setDone(true);
    setTimedOut(result.timedOut);
    onCompleteRef.current(result);
  }, []);

  const start = useCallback(() => {
    const deck = buildMemoryDeck();
    endedRef.current = false;
    resolvingRef.current = false;
    setCards(deck);
    cardsRef.current = deck;
    setFlipped([]);
    setMatched([]);
    matchedRef.current = [];
    setMoves(0);
    movesRef.current = 0;
    setTimeLeft(MEMORY_GAME_DURATION_SEC);
    setDone(false);
    setTimedOut(false);
    setResolving(false);
    setStarted(true);
  }, []);

  useEffect(() => {
    onReady?.(start);
  }, [onReady, start]);

  useEffect(() => {
    if (!started || done) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [started, done]);

  useEffect(() => {
    if (!started || done || timeLeft > 0) return;

    const pairsFound = matchedRef.current.length / 2;
    endGame({
      moves: movesRef.current,
      pairsFound,
      totalPairs: MEMORY_PAIR_COUNT,
      completed: pairsFound === MEMORY_PAIR_COUNT,
      timedOut: true,
    });
  }, [started, done, timeLeft, endGame]);

  const handleFlip = (uid: string) => {
    if (done || resolvingRef.current) return;
    if (matched.includes(uid) || flipped.includes(uid)) return;
    if (flipped.length >= 2) return;

    const nextFlipped = [...flipped, uid];
    setFlipped(nextFlipped);
    void playCardFlip();

    if (nextFlipped.length < 2) return;

    const nextMoves = moves + 1;
    setMoves(nextMoves);
    movesRef.current = nextMoves;
    resolvingRef.current = true;
    setResolving(true);

    const cardA = cards.find((c) => c.uid === nextFlipped[0]);
    const cardB = cards.find((c) => c.uid === nextFlipped[1]);

    if (cardA && cardB && isMemoryMatch(cardA, cardB)) {
      window.setTimeout(() => {
        void playMemoryMatch();
        const nextMatched = [...matchedRef.current, nextFlipped[0], nextFlipped[1]];
        matchedRef.current = nextMatched;
        setMatched(nextMatched);
        setFlipped([]);
        resolvingRef.current = false;
        setResolving(false);

        if (nextMatched.length === cardsRef.current.length) {
          endGame({
            moves: movesRef.current,
            pairsFound: MEMORY_PAIR_COUNT,
            totalPairs: MEMORY_PAIR_COUNT,
            completed: true,
            timedOut: false,
          });
        }
      }, 320);
    } else {
      window.setTimeout(() => {
        void playMemoryMismatch();
        setFlipped([]);
        resolvingRef.current = false;
        setResolving(false);
      }, 580);
    }
  };

  if (!started) {
    return (
      <div className="glass-card p-8 text-center space-y-4">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-violet-500/15 border border-violet-500/30 flex items-center justify-center">
          <Brain className="w-7 h-7 text-violet-400" />
        </div>
        <h3 className="text-xl font-bold">Poké-Memory</h3>
        <p className="text-white/50 text-sm leading-relaxed">
          Encontre os {MEMORY_PAIR_COUNT} pares em {MEMORY_GAME_DURATION_SEC} segundos. Errou? As
          cartas viram de novo — continue até acabar o tempo. Recompensa: {MEMORY_COINS_PER_PAIR}{" "}
          moeda por par, até {MEMORY_PAIR_COUNT * MEMORY_COINS_PER_PAIR} moedas ao completar.
        </p>
        <AnimatedButton variant="primary" size="lg" onClick={start} className="w-full max-w-xs mx-auto">
          COMEÇAR!
        </AnimatedButton>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between glass-card px-4 py-2 text-sm">
        <span className="text-white/50">
          Jogadas: <span className="text-white font-bold">{moves}</span>
        </span>
        <span
          className={cn(
            "font-bold tabular-nums",
            timeLeft <= 5 ? "text-red-400" : "text-cyan-300"
          )}
        >
          {timeLeft}s
        </span>
        <span className="text-white/50">
          Pares:{" "}
          <span className="text-violet-300 font-bold">
            {matched.length / 2}/{MEMORY_PAIR_COUNT}
          </span>
        </span>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5 sm:gap-3">
        {cards.map((card) => {
          const isMatched = matched.includes(card.uid);
          const isFaceUp = flipped.includes(card.uid) || isMatched;
          const pokemon = getMemoryPokemon(card.pokemonId);
          if (!pokemon) return null;

          return (
            <MemoryCardTile
              key={card.uid}
              pokemon={pokemon}
              faceUp={isFaceUp}
              matched={isMatched}
              disabled={done || isFaceUp || resolving}
              onFlip={() => handleFlip(card.uid)}
            />
          );
        })}
      </div>

      {done && (
        <div className="text-center">
          <p
            className={cn(
              "text-sm font-semibold",
              timedOut ? "text-orange-400" : "text-emerald-400"
            )}
          >
            {timedOut
              ? `Tempo esgotado! ${matched.length / 2}/${MEMORY_PAIR_COUNT} pares`
              : `Completo em ${moves} jogadas!`}
          </p>
        </div>
      )}
    </div>
  );
}

interface MemoryCardTileProps {
  pokemon: { id: number; name: string; image: string };
  faceUp: boolean;
  matched: boolean;
  disabled: boolean;
  onFlip: () => void;
}

function MemoryCardTile({
  pokemon,
  faceUp,
  matched,
  disabled,
  onFlip,
}: MemoryCardTileProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onFlip}
      aria-label={faceUp ? pokemon.name : "Carta virada"}
      className={cn(
        "aspect-[4/5] w-full min-h-[88px] sm:min-h-[100px] rounded-xl [perspective:900px] focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/50",
        !disabled && !faceUp && "hover:scale-[1.03] active:scale-95 transition-transform",
        disabled && !faceUp && "cursor-default"
      )}
    >
      <motion.div
        className="relative w-full h-full [transform-style:preserve-3d]"
        animate={{
          rotateY: faceUp ? 180 : 0,
          scale: matched ? 1.03 : 1,
        }}
        transition={{
          rotateY: { duration: 0.26, ease: [0.33, 1, 0.45, 1] },
          scale: matched
            ? { type: "spring", stiffness: 420, damping: 18 }
            : { duration: 0.2 },
        }}
      >
        {/* Verso — Pokébola */}
        <div
          className={cn(
            "absolute inset-0 rounded-xl border flex items-center justify-center [backface-visibility:hidden]",
            "bg-gradient-to-br from-indigo-950/80 to-purple-950/60 border-white/15 shadow-inner"
          )}
        >
          <PokeballIcon size={38} className="opacity-55" />
        </div>

        {/* Frente — Pokémon */}
        <div
          className={cn(
            "absolute inset-0 rounded-xl border flex items-center justify-center [backface-visibility:hidden] [transform:rotateY(180deg)]",
            matched
              ? "border-violet-400/50 bg-violet-500/20 shadow-lg shadow-violet-500/20"
              : "border-cyan-400/30 bg-gradient-to-br from-slate-900/90 to-indigo-950/70"
          )}
        >
          <Image
            src={pokemon.image}
            alt={pokemon.name}
            width={72}
            height={72}
            className="object-contain w-[82%] h-[82%] drop-shadow-md"
            loading="lazy"
          />
        </div>
      </motion.div>
    </button>
  );
}
