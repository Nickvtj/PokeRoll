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
  let pitchMult = 1 + (Math.random() - 0.5) * 0.1;
  let volMult = 1 + (Math.random() - 0.5) * 0.12;

  if (sound.isCrit) {
    pitchMult *= 1.18;
    volMult *= 1.22;
  }

  switch (sound.effectiveness) {
    case "super":
      pitchMult *= 1.08;
      volMult *= 1.14;
      break;
    case "weak":
      pitchMult *= 0.92;
      volMult *= 0.82;
      break;
    case "immune":
      pitchMult *= 0.85;
      volMult *= 0.55;
      break;
  }

  return { pitchMult, volMult };
}

function scheduleTone(ctx: AudioContext, baseTime: number, spec: ToneSpec, pitchMult: number, volMult: number) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const start = baseTime + spec.at;
  const freq = spec.freq * pitchMult;
  const freqEnd = (spec.freqEnd ?? spec.freq) * pitchMult;
  const vol = spec.vol * volMult;

  osc.type = spec.type ?? "sine";
  osc.frequency.setValueAtTime(freq, start);
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

function getTypePreset(type: string): ToneSpec[] {
  switch (type) {
    case "grass":
      return [
        { freq: 220, dur: 0.05, vol: 0.06, type: "triangle", at: 0 },
        { freq: 280, dur: 0.06, vol: 0.07, type: "triangle", at: 0.05 },
        { freq: 340, dur: 0.07, vol: 0.065, type: "sine", at: 0.1 },
      ];
    case "fire":
      return [
        { freq: 420, dur: 0.04, vol: 0.09, type: "square", at: 0, freqEnd: 260 },
        { freq: 360, dur: 0.05, vol: 0.08, type: "square", at: 0.045, freqEnd: 180 },
        { freq: 280, dur: 0.06, vol: 0.06, type: "triangle", at: 0.09, freqEnd: 140 },
      ];
    case "water":
      return [
        { freq: 620, dur: 0.11, vol: 0.08, type: "sine", at: 0, freqEnd: 220 },
        { freq: 380, dur: 0.07, vol: 0.06, type: "sine", at: 0.08, freqEnd: 180 },
      ];
    case "electric":
      return [
        { freq: 920, dur: 0.03, vol: 0.09, type: "square", at: 0 },
        { freq: 1180, dur: 0.025, vol: 0.1, type: "square", at: 0.028 },
        { freq: 760, dur: 0.04, vol: 0.07, type: "triangle", at: 0.055 },
      ];
    case "rock":
      return [
        { freq: 110, dur: 0.09, vol: 0.1, type: "square", at: 0 },
        { freq: 85, dur: 0.1, vol: 0.08, type: "triangle", at: 0.06 },
      ];
    case "ground":
      return [
        { freq: 95, dur: 0.1, vol: 0.1, type: "square", at: 0 },
        { freq: 70, dur: 0.11, vol: 0.085, type: "triangle", at: 0.07 },
      ];
    case "psychic":
      return [
        { freq: 440, dur: 0.07, vol: 0.075, type: "sine", at: 0 },
        { freq: 560, dur: 0.08, vol: 0.08, type: "sine", at: 0.06 },
        { freq: 680, dur: 0.09, vol: 0.07, type: "triangle", at: 0.12 },
      ];
    case "poison":
      return [
        { freq: 300, dur: 0.06, vol: 0.07, type: "sine", at: 0 },
        { freq: 360, dur: 0.06, vol: 0.075, type: "sine", at: 0.055 },
        { freq: 310, dur: 0.07, vol: 0.065, type: "triangle", at: 0.11 },
      ];
    case "flying":
      return [
        { freq: 480, dur: 0.05, vol: 0.07, type: "sine", at: 0, freqEnd: 720 },
        { freq: 640, dur: 0.06, vol: 0.065, type: "sine", at: 0.045, freqEnd: 320 },
      ];
    case "bug":
      return [
        { freq: 520, dur: 0.025, vol: 0.06, type: "triangle", at: 0 },
        { freq: 580, dur: 0.025, vol: 0.065, type: "triangle", at: 0.028 },
        { freq: 640, dur: 0.03, vol: 0.06, type: "triangle", at: 0.055 },
      ];
    case "ice":
      return [
        { freq: 720, dur: 0.05, vol: 0.075, type: "sine", at: 0 },
        { freq: 880, dur: 0.06, vol: 0.08, type: "triangle", at: 0.045 },
        { freq: 960, dur: 0.07, vol: 0.07, type: "sine", at: 0.095 },
      ];
    case "fighting":
      return [
        { freq: 160, dur: 0.05, vol: 0.095, type: "square", at: 0 },
        { freq: 120, dur: 0.07, vol: 0.085, type: "square", at: 0.045 },
      ];
    case "ghost":
      return [
        { freq: 280, dur: 0.09, vol: 0.06, type: "sine", at: 0, freqEnd: 180 },
        { freq: 220, dur: 0.1, vol: 0.055, type: "triangle", at: 0.08, freqEnd: 140 },
      ];
    case "dragon":
      return [
        { freq: 140, dur: 0.07, vol: 0.09, type: "square", at: 0, freqEnd: 280 },
        { freq: 200, dur: 0.08, vol: 0.085, type: "triangle", at: 0.065, freqEnd: 360 },
      ];
    case "steel":
      return [
        { freq: 880, dur: 0.04, vol: 0.08, type: "triangle", at: 0 },
        { freq: 1100, dur: 0.05, vol: 0.075, type: "triangle", at: 0.035 },
      ];
    case "dark":
      return [
        { freq: 200, dur: 0.07, vol: 0.08, type: "square", at: 0, freqEnd: 120 },
        { freq: 160, dur: 0.08, vol: 0.07, type: "triangle", at: 0.065 },
      ];
    case "fairy":
      return [
        { freq: 660, dur: 0.05, vol: 0.07, type: "sine", at: 0 },
        { freq: 880, dur: 0.06, vol: 0.075, type: "sine", at: 0.048 },
      ];
    case "normal":
    default:
      return [
        { freq: 180, dur: 0.05, vol: 0.09, type: "square", at: 0 },
        { freq: 140, dur: 0.07, vol: 0.07, type: "triangle", at: 0.04 },
      ];
  }
}

export async function playBattleHit(sound: BattleHitSound): Promise<void> {
  const ctx = await getAudioContext();
  if (!ctx) return;

  const attackType = pickAttackType(sound);
  const { pitchMult, volMult } = getModifiers(sound);
  const preset = getTypePreset(attackType);
  const baseTime = ctx.currentTime + 0.015;

  for (const tone of preset) {
    scheduleTone(ctx, baseTime, tone, pitchMult, volMult);
  }
}
