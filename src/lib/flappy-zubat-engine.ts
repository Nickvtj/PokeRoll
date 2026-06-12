import { FLAPPY_COINS_TIERS } from "@/data/economy-balance";
import { applyMinigameCoinBonus } from "@/lib/minigame-rewards";

export const FLAPPY_GRAVITY = 0.42;
export const FLAPPY_FLAP_VELOCITY = -7.2;
export const FLAPPY_PIPE_GAP = 124;
export const FLAPPY_PIPE_WIDTH = 58;
export const FLAPPY_PIPE_SPEED = 2.65;
export const FLAPPY_PIPE_SPAWN_MS = 2100;
export const FLAPPY_BIRD_SIZE = 36;
export const FLAPPY_BIRD_X_RATIO = 0.22;
/** Proporção da altura onde começa o chão (render + colisão usam o mesmo valor) */
export const FLAPPY_GROUND_RATIO = 0.84;

/** Linha do chão em pixels — fonte única de verdade para render e colisão */
export function getFlappyGroundY(canvasHeight: number): number {
  return Math.floor(canvasHeight * FLAPPY_GROUND_RATIO);
}

export function calcFlappyCoins(score: number, coinBonus = 0): number {
  if (score <= 0) return 0;
  for (const tier of FLAPPY_COINS_TIERS) {
    if (score >= tier.minScore) {
      return applyMinigameCoinBonus(tier.coins, coinBonus);
    }
  }
  return 0;
}

export function calcFlappyAccountXp(score: number): number {
  if (score <= 0) return 3;
  return Math.max(4, Math.min(18, Math.round(score / 4)));
}

export interface FlappyPipe {
  id: number;
  x: number;
  gapY: number;
  passed: boolean;
}

export function createPipe(id: number, canvasWidth: number, canvasHeight: number): FlappyPipe {
  const groundY = getFlappyGroundY(canvasHeight);
  const topMargin = 56;
  const bottomMargin = 28;
  const minCenter = topMargin + FLAPPY_PIPE_GAP / 2;
  const maxCenter = groundY - bottomMargin - FLAPPY_PIPE_GAP / 2;
  const range = Math.max(40, maxCenter - minCenter);
  const gapCenter = minCenter + Math.random() * range;
  return {
    id,
    x: canvasWidth + 20,
    gapY: gapCenter,
    passed: false,
  };
}

export function tickFlappyPipes(
  pipes: FlappyPipe[],
  dt: number,
  canvasWidth: number,
  canvasHeight: number,
  nextId: number,
  lastSpawn: number,
  now: number
): { pipes: FlappyPipe[]; nextId: number; lastSpawn: number; scoreDelta: number } {
  let scoreDelta = 0;
  const speed = FLAPPY_PIPE_SPEED * (dt / 16.67);
  let updated = pipes
    .map((p) => ({ ...p, x: p.x - speed }))
    .filter((p) => p.x > -FLAPPY_PIPE_WIDTH - 20);

  for (const pipe of updated) {
    const birdX = canvasWidth * FLAPPY_BIRD_X_RATIO + FLAPPY_BIRD_SIZE * 0.4;
    if (!pipe.passed && pipe.x + FLAPPY_PIPE_WIDTH < birdX) {
      pipe.passed = true;
      scoreDelta += 1;
    }
  }

  let spawn = lastSpawn;
  let id = nextId;
  if (updated.length === 0 || now - lastSpawn >= FLAPPY_PIPE_SPAWN_MS) {
    updated.push(createPipe(id, canvasWidth, canvasHeight));
    id += 1;
    spawn = now;
  }

  return { pipes: updated, nextId: id, lastSpawn: spawn, scoreDelta };
}

export function birdHitsPipe(
  birdX: number,
  birdY: number,
  birdSize: number,
  pipe: FlappyPipe
): boolean {
  const half = birdSize / 2 - 3;
  const left = birdX - half;
  const right = birdX + half;
  const top = birdY - half;
  const bottom = birdY + half;

  const pipeLeft = pipe.x;
  const pipeRight = pipe.x + FLAPPY_PIPE_WIDTH;
  const gapTop = pipe.gapY - FLAPPY_PIPE_GAP / 2;
  const gapBottom = pipe.gapY + FLAPPY_PIPE_GAP / 2;

  if (right < pipeLeft || left > pipeRight) return false;

  return top < gapTop || bottom > gapBottom;
}
