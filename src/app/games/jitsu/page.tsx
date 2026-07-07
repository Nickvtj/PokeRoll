"use client";

import Link from "next/link";
import { useRef } from "react";
import { ArrowLeft, Swords } from "lucide-react";
import { JitsuBeltIcon } from "@/components/minigame/jitsu/JitsuBeltIcon";
import {
  PokeJitsuGame,
  type PokeJitsuGameResult,
} from "@/components/minigame/PokeJitsuGame";
import { getBeltForXp, getBeltProgress, getBeltWinBonus, getJitsuCoinRange } from "@/data/jitsu-belts";
import { calcJitsuRewards } from "@/lib/jitsu-engine";
import { recordMinigameToSupabase } from "@/lib/economy-supabase";
import { getEconomyBonuses, useEconomyStore } from "@/stores/economy-store";

export default function JitsuGamePage() {
  const addCoins = useEconomyStore((s) => s.addCoins);
  const addXp = useEconomyStore((s) => s.addXp);
  const recordClickGame = useEconomyStore((s) => s.recordClickGame);
  const updateHighScore = useEconomyStore((s) => s.updateHighScore);
  const recordJitsuMatch = useEconomyStore((s) => s.recordJitsuMatch);
  const showRewardPopup = useEconomyStore((s) => s.showRewardPopup);
  const jitsuXp = useEconomyStore((s) => s.jitsuXp ?? 0);
  const team = useEconomyStore((s) => s.team);
  const bonuses = getEconomyBonuses(team);
  const belt = getBeltForXp(jitsuXp);
  const beltProgress = getBeltProgress(jitsuXp);
  const jitsuCoinRange = getJitsuCoinRange();
  const currentBeltBonus = getBeltWinBonus(belt.id);
  const restartRef = useRef<(() => void) | null>(null);

  const handleComplete = (result: PokeJitsuGameResult) => {
    const { beltPromoted, rankCoinBonus } = recordJitsuMatch(result.won);
    const beltAfter = getBeltForXp(useEconomyStore.getState().jitsuXp ?? 0);
    const beltWinBonus = result.won ? getBeltWinBonus(beltAfter.id) : 0;
    const { coins, accountXp, score } = calcJitsuRewards(
      result.won,
      bonuses.coinBonus,
      beltWinBonus + rankCoinBonus
    );

    if (coins > 0) addCoins(coins);
    if (accountXp > 0) addXp(accountXp);
    recordClickGame(coins);

    const isNewRecord = updateHighScore("jitsu", score);
    void recordMinigameToSupabase(score, coins, result.roundsPlayed);

    const comboLabel =
      result.winReason === "triple-type"
        ? "Combo elemental completo"
        : result.winReason === "triple-same"
          ? "Combo triplo do mesmo elemento"
          : null;

    const detail = result.won
      ? [
          comboLabel,
          `${result.roundsPlayed} rodadas, ${result.playerTrophies.length} troféus`,
          beltPromoted ? "Nova faixa desbloqueada!" : null,
          isNewRecord ? "Novo recorde de pontuação!" : null,
        ]
          .filter(Boolean)
          .join(", ")
      : `${result.roundsPlayed} rodadas disputadas. Continue treinando para subir de faixa.`;

    showRewardPopup(
      {
        outcome: result.won ? "win" : "loss",
        coins,
        xp: accountXp,
        message: detail,
        isNewRecord,
        onClosePath: "/games",
        closeLabel: "Voltar",
      },
      () => restartRef.current?.()
    );
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6 relative">
      <div
        className="absolute inset-0 -z-10 pointer-events-none opacity-40"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(244,63,94,0.12), transparent 70%)",
        }}
      />
      <div className="flex items-center gap-3 min-w-0">
        <Link
          href="/games"
          className="shrink-0 p-2 rounded-xl glass border border-white/10 text-white/50 hover:text-white hover:bg-white/5 transition-colors"
          title="Voltar ao hub"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold flex items-center gap-2 truncate">
            <Swords className="w-7 h-7 text-rose-400 shrink-0" />
            <span className="truncate">Desafio Elemental</span>
          </h1>
          <p className="text-white/50 text-xs mt-0.5 leading-relaxed">
            Card-Jitsu, Fogo, Água e Planta, {jitsuCoinRange.min} a {jitsuCoinRange.max} moedas/vitória
            {currentBeltBonus > 0 && ` (+${currentBeltBonus} faixa ${belt.label.replace("Faixa ", "")})`}
          </p>
        </div>
        <div
          className="shrink-0 rounded-lg border border-white/10 bg-white/5 overflow-hidden min-w-[5.5rem]"
          title={
            beltProgress.next
              ? `${beltProgress.winsToNext} vitórias para ${beltProgress.next.label}`
              : "Faixa máxima"
          }
        >
          <div
            className="px-2.5 py-1 text-xs font-bold flex items-center gap-1.5"
            style={{ color: belt.color }}
          >
            <JitsuBeltIcon color={belt.color} size="xs" />
            <span className="hidden sm:inline truncate max-w-[6rem]">{belt.label}</span>
          </div>
          {beltProgress.next && (
            <div className="h-0.5 bg-white/10">
              <div
                className="h-full transition-all duration-500"
                style={{
                  width: `${beltProgress.segmentProgress * 100}%`,
                  background: `linear-gradient(90deg, ${belt.color}, ${beltProgress.next.color})`,
                }}
              />
            </div>
          )}
        </div>
      </div>

      <PokeJitsuGame
        onComplete={handleComplete}
        onReady={(restart) => {
          restartRef.current = restart;
        }}
      />
    </div>
  );
}
