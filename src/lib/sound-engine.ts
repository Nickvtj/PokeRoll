/** Motor de áudio compartilhado — leve, sem arquivos externos */

let audioContext: AudioContext | null = null;

export async function getAudioContext(): Promise<AudioContext | null> {
  if (typeof window === "undefined") return null;

  if (!audioContext) {
    audioContext = new AudioContext();
  }

  if (audioContext.state === "suspended") {
    await audioContext.resume();
  }

  return audioContext;
}

export async function playTone(
  frequency: number,
  duration: number,
  type: OscillatorType = "sine",
  volume = 0.15,
  delay = 0
): Promise<void> {
  const ctx = await getAudioContext();
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
}

async function playNoteSequence(
  notes: { freq: number; dur: number; vol?: number; type?: OscillatorType }[],
  gap = 0
): Promise<void> {
  let delay = 0;
  for (const n of notes) {
    await playTone(n.freq, n.dur, n.type ?? "sine", n.vol ?? 0.1, delay);
    delay += n.dur + gap;
  }
}

export async function playSpinTick(pitch = 300): Promise<void> {
  await playTone(pitch, 0.035, "triangle", 0.05);
}

export { playBattleHit } from "@/lib/battle-hit-sounds";

let lastBattleResultSoundKey = "";

/** Toca vitória/derrota no máximo uma vez por chave de resultado */
export async function playBattleResultSound(
  won: boolean,
  soundKey: string
): Promise<void> {
  if (lastBattleResultSoundKey === soundKey) return;
  lastBattleResultSoundKey = soundKey;
  if (won) await playBattleWin();
  else await playBattleLoss();
}

export async function playBattleWin(): Promise<void> {
  await playNoteSequence(
    [
      { freq: 523, dur: 0.1, vol: 0.11, type: "triangle" },
      { freq: 659, dur: 0.1, vol: 0.11, type: "triangle" },
      { freq: 784, dur: 0.1, vol: 0.12, type: "triangle" },
      { freq: 988, dur: 0.22, vol: 0.13, type: "triangle" },
    ],
    0.04
  );
}

export async function playBattleLoss(): Promise<void> {
  await playNoteSequence(
    [
      { freq: 330, dur: 0.15, vol: 0.08, type: "sine" },
      { freq: 262, dur: 0.2, vol: 0.07, type: "sine" },
      { freq: 196, dur: 0.25, vol: 0.06, type: "sine" },
    ],
    0.06
  );
}

/** Pokémon desmaiou — tom descendente estilo clássico */
export async function playBattleFaint(): Promise<void> {
  await playNoteSequence(
    [
      { freq: 420, dur: 0.08, vol: 0.09, type: "square" },
      { freq: 310, dur: 0.1, vol: 0.085, type: "square" },
      { freq: 220, dur: 0.14, vol: 0.075, type: "triangle" },
      { freq: 165, dur: 0.2, vol: 0.06, type: "sine" },
    ],
    0.04
  );
}

/** Lançamento da moeda — whoosh curto para cima */
export async function playBattleCoinToss(): Promise<void> {
  const ctx = await getAudioContext();
  if (!ctx) return;

  const start = ctx.currentTime + 0.01;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "sine";
  osc.frequency.setValueAtTime(180, start);
  osc.frequency.exponentialRampToValueAtTime(920, start + 0.14);

  gain.gain.setValueAtTime(0.001, start);
  gain.gain.linearRampToValueAtTime(0.032, start + 0.03);
  gain.gain.exponentialRampToValueAtTime(0.001, start + 0.16);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(start);
  osc.stop(start + 0.18);
}

/**
 * Giro da moeda no ar — “tins” metálicos que vão desacelerando até parar.
 * Duração alinhada à animação (~2s).
 */
export async function playBattleCoinSpinSequence(durationSec = 2.05): Promise<void> {
  const ctx = await getAudioContext();
  if (!ctx) return;

  const baseTime = ctx.currentTime + 0.08;
  let elapsed = 0;
  let flipIndex = 0;

  while (elapsed < durationSec * 0.93) {
    const progress = elapsed / durationSec;
    const interval = 0.055 + progress * progress * 0.22;
    const start = baseTime + elapsed;
    const vol = 0.022 + (1 - progress) * 0.018;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const freq = 1180 - progress * 520 + (flipIndex % 2) * 90;

    osc.type = "triangle";
    osc.frequency.setValueAtTime(freq, start);
    osc.frequency.exponentialRampToValueAtTime(Math.max(120, freq * 0.55), start + 0.032);

    gain.gain.setValueAtTime(0.001, start);
    gain.gain.linearRampToValueAtTime(vol, start + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.038);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(start);
    osc.stop(start + 0.045);

    elapsed += interval;
    flipIndex++;
  }
}

/** Moeda parou + revelação de quem ataca primeiro */
export async function playBattleCoinResultReveal(playerStarts: boolean): Promise<void> {
  const ctx = await getAudioContext();
  if (!ctx) return;

  const land = ctx.currentTime + 0.02;

  const thud = ctx.createOscillator();
  const thudGain = ctx.createGain();
  thud.type = "sine";
  thud.frequency.setValueAtTime(320, land);
  thud.frequency.exponentialRampToValueAtTime(140, land + 0.1);
  thudGain.gain.setValueAtTime(0.001, land);
  thudGain.gain.linearRampToValueAtTime(0.05, land + 0.012);
  thudGain.gain.exponentialRampToValueAtTime(0.001, land + 0.12);
  thud.connect(thudGain);
  thudGain.connect(ctx.destination);
  thud.start(land);
  thud.stop(land + 0.14);

  const ringStart = land + 0.09;
  const ring = ctx.createOscillator();
  const ringGain = ctx.createGain();
  ring.type = "triangle";
  ring.frequency.value = playerStarts ? 784 : 440;
  ringGain.gain.setValueAtTime(0.001, ringStart);
  ringGain.gain.linearRampToValueAtTime(0.048, ringStart + 0.015);
  ringGain.gain.exponentialRampToValueAtTime(0.001, ringStart + (playerStarts ? 0.35 : 0.28));
  ring.connect(ringGain);
  ringGain.connect(ctx.destination);
  ring.start(ringStart);
  ring.stop(ringStart + 0.4);

  if (playerStarts) {
    const chimeStart = ringStart + 0.12;
    for (const [i, freq] of [988, 1175].entries()) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const t = chimeStart + i * 0.09;
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.035, t + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.2);
    }
  }
}

export async function playXpGain(): Promise<void> {
  await playNoteSequence(
    [
      { freq: 587, dur: 0.06, vol: 0.07 },
      { freq: 740, dur: 0.08, vol: 0.08 },
    ],
    0.03
  );
}

/** Som ascendente enquanto a barra de XP enche (estilo jogos Pokémon) */
export async function playXpBarFill(durationSec = 1): Promise<void> {
  const ctx = await getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime + 0.02;
  const tickCount = Math.max(12, Math.round(durationSec * 16));

  for (let i = 0; i < tickCount; i++) {
    const progress = tickCount === 1 ? 1 : i / (tickCount - 1);
    // easeOut cúbico — alinhado com a animação da barra (rápido no início, lento no fim)
    const eased = 1 - Math.pow(1 - progress, 3);
    const t = eased * durationSec;

    const freq = 270 + eased * 560;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "triangle";
    osc.frequency.value = freq;

    const tickDur = 0.055;
    const start = now + t;

    gain.gain.setValueAtTime(0.001, start);
    gain.gain.linearRampToValueAtTime(0.1, start + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.001, start + tickDur);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(start);
    osc.stop(start + tickDur + 0.02);
  }
}

export async function playLevelUp(): Promise<void> {
  await playNoteSequence(
    [
      { freq: 523, dur: 0.08, vol: 0.1, type: "triangle" },
      { freq: 659, dur: 0.08, vol: 0.1, type: "triangle" },
      { freq: 784, dur: 0.08, vol: 0.11, type: "triangle" },
      { freq: 988, dur: 0.15, vol: 0.12, type: "triangle" },
      { freq: 1175, dur: 0.2, vol: 0.13, type: "triangle" },
    ],
    0.05
  );
}

export async function playReward(): Promise<void> {
  await playNoteSequence(
    [
      { freq: 880, dur: 0.07, vol: 0.1 },
      { freq: 1175, dur: 0.1, vol: 0.11 },
      { freq: 1319, dur: 0.14, vol: 0.1 },
    ],
    0.04
  );
}

export async function playCoinGain(): Promise<void> {
  await playNoteSequence(
    [
      { freq: 1319, dur: 0.04, vol: 0.09 },
      { freq: 1760, dur: 0.06, vol: 0.08 },
    ],
    0.02
  );
}

export async function playClickPop(): Promise<void> {
  await playTone(520 + Math.random() * 80, 0.05, "triangle", 0.07);
}

export async function playClickCombo(combo: number): Promise<void> {
  const base = 440 + Math.min(combo, 20) * 25;
  await playNoteSequence(
    [
      { freq: base, dur: 0.05, vol: 0.08, type: "triangle" },
      { freq: base * 1.25, dur: 0.07, vol: 0.09, type: "triangle" },
    ],
    0.02
  );
}

export async function playClickRare(): Promise<void> {
  await playNoteSequence(
    [
      { freq: 740, dur: 0.06, vol: 0.09 },
      { freq: 988, dur: 0.08, vol: 0.1 },
      { freq: 1175, dur: 0.12, vol: 0.11 },
    ],
    0.03
  );
}

export async function playClickFreeze(): Promise<void> {
  await playNoteSequence(
    [
      { freq: 880, dur: 0.05, vol: 0.1, type: "sine" },
      { freq: 1320, dur: 0.15, vol: 0.08, type: "sine" },
    ],
    0.02
  );
}

export async function playClickDouble(): Promise<void> {
  await playNoteSequence(
    [
      { freq: 440, dur: 0.05, vol: 0.1, type: "triangle" },
      { freq: 880, dur: 0.05, vol: 0.1, type: "triangle" },
      { freq: 1760, dur: 0.1, vol: 0.1, type: "triangle" },
    ],
    0.02
  );
}

export async function playClickFrenzy(): Promise<void> {
  await playNoteSequence(
    [
      { freq: 220, dur: 0.05, vol: 0.12, type: "square" },
      { freq: 440, dur: 0.05, vol: 0.1, type: "square" },
      { freq: 880, dur: 0.15, vol: 0.08, type: "square" },
    ],
    0.02
  );
}

export async function playClickBonusActive(): Promise<void> {
  await playTone(880 + Math.random() * 200, 0.04, "sine", 0.06);
}

export async function playCardFlip(): Promise<void> {
  await playTone(380, 0.04, "triangle", 0.06);
}

export async function playMemoryMatch(): Promise<void> {
  await playNoteSequence(
    [
      { freq: 523, dur: 0.07, vol: 0.09, type: "triangle" },
      { freq: 784, dur: 0.1, vol: 0.1, type: "triangle" },
    ],
    0.03
  );
}

export async function playMemoryMismatch(): Promise<void> {
  await playNoteSequence(
    [
      { freq: 220, dur: 0.08, vol: 0.07, type: "sine" },
      { freq: 185, dur: 0.1, vol: 0.06, type: "sine" },
    ],
    0.04
  );
}

export async function playCaptureThrow(): Promise<void> {
  await playTone(320, 0.04, "triangle", 0.06);
}

export async function playCaptureHit(): Promise<void> {
  await playNoteSequence(
    [
      { freq: 440, dur: 0.05, vol: 0.08, type: "triangle" },
      { freq: 554, dur: 0.07, vol: 0.09, type: "triangle" },
      { freq: 659, dur: 0.1, vol: 0.1, type: "triangle" },
    ],
    0.03
  );
}

export async function playCaptureMiss(): Promise<void> {
  await playNoteSequence(
    [
      { freq: 200, dur: 0.1, vol: 0.08, type: "sine" },
      { freq: 150, dur: 0.15, vol: 0.06, type: "sine" },
    ],
    0.05
  );
}

export async function playCapturePerfect(): Promise<void> {
  await playNoteSequence(
    [
      { freq: 659, dur: 0.05, vol: 0.09 },
      { freq: 831, dur: 0.07, vol: 0.1 },
      { freq: 988, dur: 0.1, vol: 0.11 },
    ],
    0.03
  );
}

/** Loop de música rítmica para o minigame de dança */
export async function playDanceBGM(): Promise<{ stop: () => void }> {
  const ctx = await getAudioContext();
  if (!ctx) return { stop: () => {} };

  let active = true;
  const stop = () => { active = false; };

  const playBeat = async () => {
    if (!active) return;
    
    // Bumbo (Low kick)
    void playTone(60, 0.1, "sine", 0.15);
    
    await new Promise(r => setTimeout(r, 250));
    if (!active) return;
    
    // Hi-hat
    void playTone(800, 0.02, "square", 0.05);
    
    await new Promise(r => setTimeout(r, 250));
    if (!active) return;
    
    // Snare (Palminha)
    void playTone(200, 0.1, "triangle", 0.1);
    
    await new Promise(r => setTimeout(r, 250));
    if (!active) return;

    // Hi-hat
    void playTone(800, 0.02, "square", 0.05);

    await new Promise(r => setTimeout(r, 250));
    if (active) void playBeat();
  };

  void playBeat();
  return { stop };
}
