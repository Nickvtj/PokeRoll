"use client";

import { useCallback } from "react";
import { getAudioContext, playTone } from "@/lib/sound-engine";

/** Efeitos sonoros estilo caça-níquel via Web Audio API */
export function useSoundEffects() {
  const playCoinClink = useCallback(async (delay = 0, pitch = 1800) => {
    const ctx = await getAudioContext();
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
  }, []);

  const playSpin = useCallback(async () => {
    await playTone(220, 0.08, "square", 0.1);
    await playTone(280, 0.08, "square", 0.1, 0.08);
    await playTone(330, 0.1, "square", 0.12, 0.16);
  }, []);

  const playNewPokemonWin = useCallback(async () => {
    const ctx = await getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

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

    const coinDelays = [0.3, 0.38, 0.46, 0.54, 0.62, 0.7, 0.78, 0.86];
    coinDelays.forEach((d, i) => {
      void playCoinClink(d, 1400 + i * 120);
    });
  }, [playCoinClink]);

  const playDuplicate = useCallback(async () => {
    await playTone(220, 0.15, "sine", 0.08);
    await playTone(185, 0.2, "sine", 0.06, 0.1);
  }, []);

  const playWin = useCallback(async () => {
    await playTone(523, 0.15, "triangle", 0.12);
    await playTone(659, 0.15, "triangle", 0.12, 0.12);
    await playTone(784, 0.25, "triangle", 0.14, 0.24);
  }, []);

  const playLegendary = useCallback(async () => {
    const ctx = await getAudioContext();
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
  }, [playCoinClink]);

  return {
    playSpin,
    playWin,
    playNewPokemonWin,
    playDuplicate,
    playLegendary,
  };
}

export { playSpinTick } from "@/lib/sound-engine";
