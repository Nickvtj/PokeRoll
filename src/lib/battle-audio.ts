"use client";

/**
 * Utilitário simples para tocar sons de batalha sem precisar de arquivos locais.
 * Usa URLs de sons de código aberto (ou placeholders estáveis).
 */

const SOUND_URLS: Record<string, string> = {
  // Sons de Ataque por Tipo (Exemplos de URLs públicas ou placeholders)
  fire: "https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3", // Fire woosh
  water: "https://assets.mixkit.co/active_storage/sfx/1105/1105-preview.mp3", // Water splash
  electric: "https://assets.mixkit.co/active_storage/sfx/2578/2578-preview.mp3", // Zap
  grass: "https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3", // Leaf rustle/cut
  ice: "https://assets.mixkit.co/active_storage/sfx/1118/1118-preview.mp3", // Ice shatter
  fighting: "https://assets.mixkit.co/active_storage/sfx/2567/2567-preview.mp3", // Punch
  poison: "https://assets.mixkit.co/active_storage/sfx/2580/2580-preview.mp3", // Bubble/Acid
  ground: "https://assets.mixkit.co/active_storage/sfx/2570/2570-preview.mp3", // Rock/Earth
  psychic: "https://assets.mixkit.co/active_storage/sfx/2582/2582-preview.mp3", // Very soft shimmer
  ghost: "https://assets.mixkit.co/active_storage/sfx/2585/2585-preview.mp3", // Spooky
  dragon: "https://assets.mixkit.co/active_storage/sfx/2569/2569-preview.mp3", // Roar/Flame
  normal: "https://assets.mixkit.co/active_storage/sfx/2572/2572-preview.mp3", // Simple hit
  
  // Interface e Feedback
  button: "https://assets.mixkit.co/active_storage/sfx/2573/2573-preview.mp3",
  impact: "https://assets.mixkit.co/active_storage/sfx/2567/2567-preview.mp3", // Heavy hit
  faint: "https://assets.mixkit.co/active_storage/sfx/2577/2577-preview.mp3", // Pokemon fainted
};

class BattleAudioManager {
  private static instance: BattleAudioManager;
  private audioCache: Record<string, HTMLAudioElement> = {};
  private enabled: boolean = true;

  private constructor() {
    if (typeof window !== "undefined") {
      // Pre-load sounds
      Object.entries(SOUND_URLS).forEach(([key, url]) => {
        const audio = new Audio(url);
        audio.preload = "auto";
        this.audioCache[key] = audio;
      });
    }
  }

  static getInstance() {
    if (!BattleAudioManager.instance) {
      BattleAudioManager.instance = new BattleAudioManager();
    }
    return BattleAudioManager.instance;
  }

  play(soundKey: string, volume: number = 0.4) {
    if (!this.enabled || typeof window === "undefined") return;

    const audio = this.audioCache[soundKey] || this.audioCache.normal;
    if (audio) {
      const playPromise = audio.cloneNode() as HTMLAudioElement;
      playPromise.volume = volume;
      playPromise.play().catch(() => {
        // Ignora erros de política de auto-play do navegador
      });
    }
  }

  playAttack(type: string) {
    const volume = type === "psychic" ? 0.15 : 0.4;
    this.play(type, volume);
  }

  playImpact() {
    this.play("impact", 0.3);
  }
}

export const battleAudio = BattleAudioManager.getInstance();
