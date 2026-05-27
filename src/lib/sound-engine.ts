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

export async function playBattleHit(): Promise<void> {
  await playNoteSequence(
    [
      { freq: 180, dur: 0.05, vol: 0.09, type: "square" },
      { freq: 140, dur: 0.07, vol: 0.07, type: "triangle" },
    ],
    0.02
  );
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
