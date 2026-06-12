import { create } from "zustand";
import {
  applyPreferenceSideEffects,
  loadPlayerPreferences,
  savePlayerPreferences,
  type PlayerPreferences,
  type VisualQualityMode,
} from "@/lib/player-preferences";
import { applyVisualQuality, detectVisualQuality, type VisualQuality } from "@/lib/visual-quality";

interface PreferencesStore extends PlayerPreferences {
  ceremonySkipToken: number;
  initializePreferences: () => void;
  setSoundEnabled: (enabled: boolean) => void;
  setSkipBattleIntro: (skip: boolean) => void;
  setVisualQualityMode: (mode: VisualQualityMode) => void;
  setCustomCursorEnabled: (enabled: boolean) => void;
  requestCeremonySkip: () => void;
  resolveEffectiveVisualQuality: () => VisualQuality;
}

function persist(partial: Partial<PlayerPreferences>) {
  const next = savePlayerPreferences(partial);
  applyPreferenceSideEffects(next);
  if (next.visualQualityMode !== "auto") {
    applyVisualQuality(next.visualQualityMode);
  } else {
    applyVisualQuality(detectVisualQuality());
  }
  return next;
}

export const usePreferencesStore = create<PreferencesStore>((set, get) => ({
  ...loadPlayerPreferences(),
  ceremonySkipToken: 0,

  initializePreferences: () => {
    const prefs = loadPlayerPreferences();
    set({ ...prefs });
    applyPreferenceSideEffects(prefs);
    if (prefs.visualQualityMode !== "auto") {
      applyVisualQuality(prefs.visualQualityMode);
    }
  },

  setSoundEnabled: (enabled) => {
    persist({ soundEnabled: enabled });
    set({ soundEnabled: enabled });
  },

  setSkipBattleIntro: (skip) => {
    persist({ skipBattleIntro: skip });
    set({ skipBattleIntro: skip });
  },

  setVisualQualityMode: (mode) => {
    persist({ visualQualityMode: mode });
    set({ visualQualityMode: mode });
  },

  setCustomCursorEnabled: (enabled) => {
    persist({ customCursorEnabled: enabled });
    set({ customCursorEnabled: enabled });
  },

  requestCeremonySkip: () => {
    set((s) => ({ ceremonySkipToken: s.ceremonySkipToken + 1 }));
  },

  resolveEffectiveVisualQuality: () => {
    const mode = get().visualQualityMode;
    if (mode !== "auto") return mode;
    return detectVisualQuality();
  },
}));
