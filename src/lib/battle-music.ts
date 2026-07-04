import { isSoundEnabled } from "@/lib/player-preferences";

const BATTLE_THEME_SRC = "/audio/battle-theme.mp4";
const BATTLE_VOLUME = 0.07;
const FADE_MS = 900;

let audio: HTMLAudioElement | null = null;
let fadeTimer: number | null = null;

function getAudio(): HTMLAudioElement | null {
  if (typeof window === "undefined") return null;
  if (!audio) {
    audio = new Audio(BATTLE_THEME_SRC);
    audio.loop = true;
    audio.preload = "auto";
    audio.volume = BATTLE_VOLUME;
  }
  return audio;
}

function clearFade() {
  if (fadeTimer != null) {
    window.clearInterval(fadeTimer);
    fadeTimer = null;
  }
}

/** Inicia música ambiente de batalha (loop suave). */
export function startBattleMusic(): void {
  if (!isSoundEnabled()) return;
  const el = getAudio();
  if (!el) return;

  clearFade();
  el.volume = BATTLE_VOLUME;
  if (el.paused) {
    el.currentTime = 0;
    void el.play().catch(() => {});
  }
}

/** Para a música com fade-out curto. */
export function stopBattleMusic(): void {
  const el = getAudio();
  if (!el || el.paused) return;

  clearFade();
  const startVol = el.volume;
  const steps = 12;
  let step = 0;

  fadeTimer = window.setInterval(() => {
    step += 1;
    el.volume = Math.max(0, startVol * (1 - step / steps));
    if (step >= steps) {
      clearFade();
      el.pause();
      el.currentTime = 0;
      el.volume = BATTLE_VOLUME;
    }
  }, FADE_MS / steps);
}
