"use client";

import { useCallback, useRef } from "react";

/** Efeitos sonoros estilo caça-níquel via Web Audio API */
export function useSoundEffects() {
  const audioContext = useRef<AudioContext | null>(null);

  const getContext = useCallback(async () => {
    if (typeof window === "undefined") return null;

    if (!audioContext.current) {
      audioContext.current = new AudioContext();
    }

    // Necessário após interação do usuário (política de autoplay)
    if (audioContext.current.state === "suspended") {
      await audioContext.current.resume();
    }

    return audioContext.current;
  }, []);

  const playTone = useCallback(
    async (
      frequency: number,
      duration: number,
      type: OscillatorType = "sine",
      volume = 0.15,
      delay = 0
    ) => {
      const ctx = await getContext();
      if (!ctx) return;

      const start = ctx.currentTime + delay;
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = type;

      gainNode.gain.setValueAtTime(volume, start);
      gainNode.gain.exponentialRampToValueAtTime(0.001, start + duration);

      oscillator.start(start);
      oscillator.stop(start + duration);
    },
    [getContext]
  );

  /** Som de moeda caindo — clink curto */
  const playCoinClink = useCallback(
    async (delay = 0, pitch = 1800) => {
      const ctx = await getContext();
      if (!ctx) return;

      const start = ctx.currentTime + delay;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(pitch, start);
      osc.frequency.exponentialRampToValueAtTime(pitch * 0.5, start + 0.08);

      gain.gain.setValueAtTime(0.18, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.1);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.1);
    },
    [getContext]
  );

  /** Roleta girando — ticks rápidos */
  const playSpin = useCallback(async () => {
    await playTone(220, 0.08, "square", 0.1);
    await playTone(280, 0.08, "square", 0.1, 0.08);
    await playTone(330, 0.1, "square", 0.12, 0.16);
  }, [playTone]);

  /**
   * Vitória de Pokémon NOVO — jingle clássico de caça-níquel
   * Melodia ascendente + cascata de moedas
   */
  const playNewPokemonWin = useCallback(async () => {
    const ctx = await getContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Melodia "jackpot" ascendente
    const melody: { freq: number; time: number; dur: number; type: OscillatorType }[] = [
      { freq: 392, time: 0, dur: 0.1, type: "square" },
      { freq: 494, time: 0.09, dur: 0.1, type: "square" },
      { freq: 587, time: 0.18, dur: 0.1, type: "square" },
      { freq: 784, time: 0.27, dur: 0.15, type: "square" },
      { freq: 988, time: 0.38, dur: 0.2, type: "square" },
      { freq: 1175, time: 0.52, dur: 0.35, type: "triangle" },
    ];

    for (const note of melody) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = note.type;
      osc.frequency.value = note.freq;
      gain.gain.setValueAtTime(0, now + note.time);
      gain.gain.linearRampToValueAtTime(0.14, now + note.time + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, now + note.time + note.dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + note.time);
      osc.stop(now + note.time + note.dur);
    }

    // Acorde final de vitória
    [784, 988, 1175].forEach((freq) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, now + 0.55);
      gain.gain.linearRampToValueAtTime(0.08, now + 0.58);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.0);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + 0.55);
      osc.stop(now + 1.0);
    });

    // Cascata de moedas
    const coinDelays = [0.3, 0.38, 0.46, 0.54, 0.62, 0.7, 0.78, 0.86];
    coinDelays.forEach((d, i) => {
      void playCoinClink(d, 1400 + i * 120);
    });
  }, [getContext, playCoinClink]);

  /** Som suave para duplicata — tom baixo curto */
  const playDuplicate = useCallback(async () => {
    await playTone(220, 0.15, "sine", 0.08);
    await playTone(185, 0.2, "sine", 0.06, 0.1);
  }, [playTone]);

  /** Vitória genérica (fallback) */
  const playWin = useCallback(async () => {
    await playTone(523, 0.15, "triangle", 0.12);
    await playTone(659, 0.15, "triangle", 0.12, 0.12);
    await playTone(784, 0.25, "triangle", 0.14, 0.24);
  }, [playTone]);

  /** Lendário — fanfarra épica + moedas extras */
  const playLegendary = useCallback(async () => {
    const ctx = await getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const fanfare = [523, 659, 784, 988, 1175, 1319, 1568];

    fanfare.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = i < 4 ? "square" : "triangle";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, now + i * 0.1);
      gain.gain.linearRampToValueAtTime(0.13, now + i * 0.1 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.28);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.1);
      osc.stop(now + i * 0.1 + 0.3);
    });

    for (let i = 0; i < 12; i++) {
      void playCoinClink(0.5 + i * 0.07, 1200 + i * 80);
    }
  }, [getContext, playCoinClink]);

  return {
    playSpin,
    playWin,
    playNewPokemonWin,
    playDuplicate,
    playLegendary,
  };
}
