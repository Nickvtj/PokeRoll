import { getAudioContext } from "@/lib/sound-engine";
import type { BattleHitSound } from "@/types/battle";

type OscType = OscillatorType;

interface ToneSpec {
  freq: number;
  dur: number;
  vol: number;
  type?: OscType;
  at: number;
  freqEnd?: number;
}

function pickAttackType(sound: BattleHitSound): string {
  if (sound.secondaryType && Math.random() < 0.35) {
    return sound.secondaryType;
  }
  return sound.attackType;
}

function getModifiers(sound: BattleHitSound): { pitchMult: number; volMult: number } {
  let pitchMult = 1 + (Math.random() - 0.5) * 0.12;
  let volMult = 1 + (Math.random() - 0.5) * 0.14;

  if (sound.isCrit) {
    pitchMult *= 1.2;
    volMult *= 1.28;
  }

  switch (sound.effectiveness) {
    case "super":
      pitchMult *= 1.1;
      volMult *= 1.18;
      break;
    case "weak":
      pitchMult *= 0.9;
      volMult *= 0.78;
      break;
    case "immune":
      pitchMult *= 0.82;
      volMult *= 0.5;
      break;
  }

  return { pitchMult, volMult };
}

function scheduleTone(
  ctx: AudioContext,
  baseTime: number,
  spec: ToneSpec,
  pitchMult: number,
  volMult: number
) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const start = baseTime + spec.at;
  const freq = spec.freq * pitchMult;
  const freqEnd = (spec.freqEnd ?? spec.freq) * pitchMult;
  const vol = Math.min(0.14, spec.vol * volMult);

  osc.type = spec.type ?? "sine";
  osc.frequency.setValueAtTime(Math.max(20, freq), start);
  if (spec.freqEnd !== undefined) {
    osc.frequency.exponentialRampToValueAtTime(Math.max(20, freqEnd), start + spec.dur);
  }

  gain.gain.setValueAtTime(0.001, start);
  gain.gain.linearRampToValueAtTime(vol, start + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.001, start + spec.dur);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(start);
  osc.stop(start + spec.dur + 0.02);
}

function getCritLayer(isCrit: boolean): ToneSpec[] {
  if (!isCrit) return [];
  return [
    { freq: 980, dur: 0.035, vol: 0.09, type: "square", at: 0.02 },
    { freq: 720, dur: 0.05, vol: 0.07, type: "triangle", at: 0.04 },
  ];
}

function getSuperEffectiveLayer(effectiveness: BattleHitSound["effectiveness"]): ToneSpec[] {
  if (effectiveness !== "super") return [];
  return [{ freq: 440, dur: 0.06, vol: 0.055, type: "sine", at: 0.08, freqEnd: 660 }];
}

function getTypePreset(type: string): ToneSpec[] {
  switch (type) {
    case "grass":
      return [
        { freq: 200, dur: 0.045, vol: 0.065, type: "triangle", at: 0 },
        { freq: 260, dur: 0.055, vol: 0.07, type: "triangle", at: 0.04 },
        { freq: 320, dur: 0.065, vol: 0.06, type: "sine", at: 0.085 },
        { freq: 380, dur: 0.05, vol: 0.055, type: "sine", at: 0.13, freqEnd: 280 },
      ];
    case "fire":
      return [
        { freq: 480, dur: 0.035, vol: 0.095, type: "square", at: 0, freqEnd: 240 },
        { freq: 380, dur: 0.04, vol: 0.085, type: "square", at: 0.03, freqEnd: 160 },
        { freq: 260, dur: 0.055, vol: 0.065, type: "triangle", at: 0.065, freqEnd: 120 },
      ];
    case "water":
      return [
        { freq: 680, dur: 0.12, vol: 0.085, type: "sine", at: 0, freqEnd: 200 },
        { freq: 420, dur: 0.08, vol: 0.065, type: "sine", at: 0.09, freqEnd: 160 },
        { freq: 280, dur: 0.06, vol: 0.05, type: "triangle", at: 0.15, freqEnd: 140 },
      ];
    case "electric":
      return [
        { freq: 880, dur: 0.025, vol: 0.095, type: "square", at: 0 },
        { freq: 1180, dur: 0.022, vol: 0.1, type: "square", at: 0.024 },
        { freq: 920, dur: 0.028, vol: 0.08, type: "square", at: 0.048 },
        { freq: 640, dur: 0.04, vol: 0.06, type: "triangle", at: 0.07 },
      ];
    case "rock":
      return [
        { freq: 100, dur: 0.095, vol: 0.105, type: "square", at: 0 },
        { freq: 78, dur: 0.105, vol: 0.085, type: "triangle", at: 0.07 },
      ];
    case "ground":
      return [
        { freq: 88, dur: 0.105, vol: 0.105, type: "square", at: 0 },
        { freq: 62, dur: 0.115, vol: 0.09, type: "triangle", at: 0.075 },
        { freq: 48, dur: 0.08, vol: 0.07, type: "sine", at: 0.14 },
      ];
    case "psychic":
      return [
        { freq: 420, dur: 0.075, vol: 0.075, type: "sine", at: 0 },
        { freq: 540, dur: 0.085, vol: 0.08, type: "sine", at: 0.065 },
        { freq: 660, dur: 0.095, vol: 0.075, type: "triangle", at: 0.13 },
        { freq: 780, dur: 0.08, vol: 0.065, type: "sine", at: 0.19, freqEnd: 520 },
      ];
    case "poison":
      return [
        { freq: 280, dur: 0.055, vol: 0.07, type: "sine", at: 0 },
        { freq: 340, dur: 0.06, vol: 0.075, type: "sine", at: 0.05 },
        { freq: 300, dur: 0.07, vol: 0.065, type: "triangle", at: 0.105 },
        { freq: 260, dur: 0.08, vol: 0.055, type: "sine", at: 0.16, freqEnd: 220 },
      ];
    case "flying":
      return [
        { freq: 460, dur: 0.055, vol: 0.07, type: "sine", at: 0, freqEnd: 760 },
        { freq: 620, dur: 0.065, vol: 0.065, type: "sine", at: 0.048, freqEnd: 300 },
        { freq: 520, dur: 0.05, vol: 0.055, type: "triangle", at: 0.1, freqEnd: 380 },
      ];
    case "bug":
      return [
        { freq: 500, dur: 0.022, vol: 0.06, type: "triangle", at: 0 },
        { freq: 560, dur: 0.022, vol: 0.065, type: "triangle", at: 0.025 },
        { freq: 620, dur: 0.025, vol: 0.06, type: "triangle", at: 0.05 },
        { freq: 680, dur: 0.028, vol: 0.055, type: "triangle", at: 0.075 },
      ];
    case "ice":
      return [
        { freq: 700, dur: 0.05, vol: 0.075, type: "sine", at: 0 },
        { freq: 860, dur: 0.06, vol: 0.08, type: "triangle", at: 0.042 },
        { freq: 940, dur: 0.07, vol: 0.07, type: "sine", at: 0.092 },
        { freq: 820, dur: 0.065, vol: 0.06, type: "sine", at: 0.14, freqEnd: 640 },
      ];
    case "fighting":
      return [
        { freq: 150, dur: 0.045, vol: 0.1, type: "square", at: 0 },
        { freq: 110, dur: 0.065, vol: 0.09, type: "square", at: 0.04 },
        { freq: 85, dur: 0.07, vol: 0.075, type: "triangle", at: 0.09 },
      ];
    case "ghost":
      return [
        { freq: 260, dur: 0.095, vol: 0.06, type: "sine", at: 0, freqEnd: 160 },
        { freq: 200, dur: 0.105, vol: 0.055, type: "triangle", at: 0.085, freqEnd: 130 },
        { freq: 180, dur: 0.09, vol: 0.045, type: "sine", at: 0.16, freqEnd: 120 },
      ];
    case "dragon":
      return [
        { freq: 130, dur: 0.075, vol: 0.095, type: "square", at: 0, freqEnd: 280 },
        { freq: 190, dur: 0.085, vol: 0.085, type: "triangle", at: 0.065, freqEnd: 380 },
        { freq: 240, dur: 0.07, vol: 0.07, type: "sine", at: 0.13, freqEnd: 420 },
      ];
    case "steel":
      return [
        { freq: 860, dur: 0.038, vol: 0.08, type: "triangle", at: 0 },
        { freq: 1080, dur: 0.048, vol: 0.075, type: "triangle", at: 0.032 },
        { freq: 920, dur: 0.055, vol: 0.065, type: "sine", at: 0.07 },
      ];
    case "dark":
      return [
        { freq: 190, dur: 0.07, vol: 0.085, type: "square", at: 0, freqEnd: 110 },
        { freq: 150, dur: 0.085, vol: 0.075, type: "triangle", at: 0.062 },
        { freq: 120, dur: 0.09, vol: 0.06, type: "sine", at: 0.13 },
      ];
    case "fairy":
      return [
        { freq: 640, dur: 0.048, vol: 0.07, type: "sine", at: 0 },
        { freq: 860, dur: 0.058, vol: 0.075, type: "sine", at: 0.044 },
        { freq: 980, dur: 0.065, vol: 0.065, type: "triangle", at: 0.09 },
      ];
    case "normal":
    default:
      return [
        { freq: 180, dur: 0.05, vol: 0.09, type: "square", at: 0 },
        { freq: 140, dur: 0.07, vol: 0.07, type: "triangle", at: 0.04 },
      ];
  }
}

export async function playBattleStrike(): Promise<void> {
  const ctx = await getAudioContext();
  if (!ctx) return;

  const baseTime = ctx.currentTime + 0.01;
  const tones: ToneSpec[] = [
    { freq: 240, dur: 0.035, vol: 0.1, type: "square", at: 0, freqEnd: 140 },
    { freq: 160, dur: 0.05, vol: 0.085, type: "triangle", at: 0.028 },
  ];

  for (const tone of tones) {
    scheduleTone(ctx, baseTime, tone, 1, 1);
  }
}

/** Som curto ao piscar (dano recebido) — estilo Game Boy */
export async function playBattleDamage(sound: BattleHitSound): Promise<void> {
  const ctx = await getAudioContext();
  if (!ctx) return;

  const { pitchMult, volMult } = getModifiers(sound);
  const baseTime = ctx.currentTime + 0.01;
  const blips: ToneSpec[] = [
    { freq: 620, dur: 0.028, vol: 0.09, type: "square", at: 0 },
    { freq: 480, dur: 0.028, vol: 0.085, type: "square", at: 0.065 },
    { freq: 360, dur: 0.035, vol: 0.075, type: "square", at: 0.13 },
  ];

  if (sound.isCrit) {
    blips.push({ freq: 820, dur: 0.025, vol: 0.08, type: "square", at: 0.19 });
  }

  for (const tone of blips) {
    scheduleTone(ctx, baseTime, tone, pitchMult, volMult);
  }
}

export async function playBattleHit(sound: BattleHitSound): Promise<void> {
  const ctx = await getAudioContext();
  if (!ctx) return;

  const attackType = pickAttackType(sound);
  const { pitchMult, volMult } = getModifiers(sound);
  const preset = [
    ...getTypePreset(attackType),
    ...getCritLayer(sound.isCrit),
    ...getSuperEffectiveLayer(sound.effectiveness),
  ];
  const baseTime = ctx.currentTime + 0.015;

  for (const tone of preset) {
    scheduleTone(ctx, baseTime, tone, pitchMult, volMult);
  }
}
