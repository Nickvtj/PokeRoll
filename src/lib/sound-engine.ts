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

/** Tick curto da roleta — sincronizado com cada sprite */
export async function playSpinTick(pitch = 280): Promise<void> {
  await playTone(pitch, 0.04, "square", 0.06);
}
