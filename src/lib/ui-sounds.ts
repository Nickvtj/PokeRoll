import { playTone } from "@/lib/sound-engine";

/** Clique leve — botões e tabs */
export function playUiClick(): void {
  void playTone(784, 0.04, "sine", 0.042);
}

/** Selecionar item (ex.: Pokémon no time) */
export function playUiSelect(): void {
  void playTone(587, 0.055, "sine", 0.048);
  void playTone(784, 0.045, "sine", 0.035);
}

/** Remover seleção */
export function playUiDeselect(): void {
  void playTone(494, 0.065, "sine", 0.038);
  void playTone(392, 0.07, "sine", 0.028);
}

/** Ação confirmada / primária */
export function playUiConfirm(): void {
  void playTone(659, 0.07, "sine", 0.05);
  void playTone(880, 0.09, "sine", 0.042);
}

/** Troca de aba ou filtro */
export function playUiTab(): void {
  void playTone(698, 0.035, "sine", 0.036);
}

/** Som de conquista desbloqueada */
export function playAchievementUnlock(): void {
  void playTone(523, 0.08, "sine", 0.05);
  void playTone(659, 0.1, "sine", 0.055);
  void playTone(784, 0.12, "sine", 0.05);
  void playTone(988, 0.14, "sine", 0.045);
}
