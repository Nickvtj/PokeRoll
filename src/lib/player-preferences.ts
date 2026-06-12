import type { VisualQuality } from "@/lib/visual-quality";

export type VisualQualityMode = "auto" | VisualQuality;

export interface PlayerPreferences {
  soundEnabled: boolean;
  skipBattleIntro: boolean;
  visualQualityMode: VisualQualityMode;
  customCursorEnabled: boolean;
}

const STORAGE_KEY = "pokeroll_preferences";

const DEFAULTS: PlayerPreferences = {
  soundEnabled: true,
  skipBattleIntro: false,
  visualQualityMode: "auto",
  customCursorEnabled: true,
};

let cache: PlayerPreferences | null = null;

function parseStored(raw: string | null): PlayerPreferences {
  if (!raw) return { ...DEFAULTS };
  try {
    const parsed = JSON.parse(raw) as Partial<PlayerPreferences>;
    return {
      soundEnabled: parsed.soundEnabled ?? DEFAULTS.soundEnabled,
      skipBattleIntro: parsed.skipBattleIntro ?? DEFAULTS.skipBattleIntro,
      visualQualityMode: parsed.visualQualityMode ?? DEFAULTS.visualQualityMode,
      customCursorEnabled: parsed.customCursorEnabled ?? DEFAULTS.customCursorEnabled,
    };
  } catch {
    return { ...DEFAULTS };
  }
}

export function loadPlayerPreferences(): PlayerPreferences {
  if (cache) return cache;
  if (typeof window === "undefined") {
    cache = { ...DEFAULTS };
    return cache;
  }
  cache = parseStored(localStorage.getItem(STORAGE_KEY));
  return cache;
}

export function savePlayerPreferences(partial: Partial<PlayerPreferences>): PlayerPreferences {
  const next = { ...loadPlayerPreferences(), ...partial };
  cache = next;
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }
  return next;
}

export function isSoundEnabled(): boolean {
  return loadPlayerPreferences().soundEnabled;
}

export function shouldSkipBattleIntro(): boolean {
  return loadPlayerPreferences().skipBattleIntro;
}

export function getVisualQualityMode(): VisualQualityMode {
  return loadPlayerPreferences().visualQualityMode;
}

export function isCustomCursorEnabled(): boolean {
  return loadPlayerPreferences().customCursorEnabled;
}

export function applyPreferenceSideEffects(prefs: PlayerPreferences): void {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute(
    "data-custom-cursor",
    prefs.customCursorEnabled ? "on" : "off"
  );
}
