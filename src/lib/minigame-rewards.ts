/** Aplica bônus de moedas do time (ex.: Meowth) nos minigames */

export function applyMinigameCoinBonus(baseCoins: number, coinBonus = 0): number {
  if (baseCoins <= 0) return 0;
  return Math.max(1, Math.round(baseCoins * (1 + coinBonus)));
}
