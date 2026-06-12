import type { FlappySkinConfig } from "@/data/flappy-skins";
import {
  FLAPPY_BIRD_SIZE,
  FLAPPY_BIRD_X_RATIO,
  FLAPPY_PIPE_GAP,
  FLAPPY_PIPE_WIDTH,
  getFlappyGroundY,
  type FlappyPipe,
} from "@/lib/flappy-zubat-engine";

type ScenePalette = FlappySkinConfig["scene"];

function px(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string
) {
  if (w <= 0 || h <= 0) return;
  ctx.fillStyle = color;
  ctx.fillRect(Math.floor(x), Math.floor(y), Math.ceil(w), Math.ceil(h));
}

function lerpChannel(a: number, b: number, t: number) {
  return Math.round(a + (b - a) * t);
}

function parseHex(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

function lerpHex(a: string, b: string, t: number) {
  const [ar, ag, ab] = parseHex(a);
  const [br, bg, bb] = parseHex(b);
  return `rgb(${lerpChannel(ar, br, t)},${lerpChannel(ag, bg, t)},${lerpChannel(ab, bb, t)})`;
}

/** Céu em gradiente de blocos + estrelas/partículas com parallax leve */
function drawPixelSky(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  scrollPx: number,
  scene: ScenePalette
) {
  const horizon = getFlappyGroundY(h);
  const band = 4;

  for (let y = 0; y < horizon; y += band) {
    const t = y / horizon;
    const color =
      t < 0.5
        ? lerpHex(scene.skyTop, scene.skyMid, t * 2)
        : lerpHex(scene.skyMid, scene.skyBot, (t - 0.5) * 2);
    px(ctx, 0, y, w, band, color);
  }

  const starOff = scrollPx * 0.12;
  for (let i = 0; i < 26; i++) {
    const baseX = (i * 67) % (w + 40);
    const sx = ((baseX - starOff) % (w + 40) + (w + 40)) % (w + 40) - 20;
    const sy = 8 + ((i * 41) % Math.floor(horizon * 0.5));
    const big = i % 5 === 0;
    px(ctx, sx, sy, big ? 2 : 1, big ? 2 : 1, scene.star);
  }
}

/** Silhueta de morros/colinas suave, amostrada em blocos, com parallax */
function drawHillLayer(
  ctx: CanvasRenderingContext2D,
  w: number,
  groundY: number,
  scrollPx: number,
  color: string,
  parallax: number,
  amp: number,
  baseH: number,
  freq: number,
  phase: number,
  step: number
) {
  const off = scrollPx * parallax;
  for (let x = 0; x < w; x += step) {
    const worldX = x + off;
    const wave =
      Math.sin(worldX * freq + phase) * amp +
      Math.sin(worldX * freq * 0.5 + phase * 1.7) * amp * 0.45;
    const peak = Math.max(6, Math.floor(baseH + wave));
    const top = groundY - peak;
    px(ctx, x, top, step, groundY - top, color);
  }
}

function drawPixelHills(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  scrollPx: number,
  scene: ScenePalette
) {
  const groundY = getFlappyGroundY(h);
  drawHillLayer(ctx, w, groundY, scrollPx, scene.mountainDark, 0.18, 18, 46, 0.012, 0, 6);
  drawHillLayer(ctx, w, groundY, scrollPx, scene.mountain, 0.32, 14, 26, 0.02, 2.1, 6);
}

/** Elementos decorativos por skin, com wrap e parallax (não ficam "grudados") */
function drawSkinDecor(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  scrollPx: number,
  scene: ScenePalette,
  skinId: string
) {
  const groundY = getFlappyGroundY(h);
  const spacing = 150;
  const parallax = 0.5;
  const off = (scrollPx * parallax) % spacing;

  for (let i = -1; i <= Math.ceil(w / spacing) + 1; i++) {
    const x = Math.floor(i * spacing - off);

    if (skinId === "zubat") {
      const len = 22 + ((i * 13) % 14);
      px(ctx, x, 0, 6, len, scene.mountainDark);
      px(ctx, x + 1, 0, 2, len - 4, scene.mountain);
      px(ctx, x + 2, len, 2, 4, scene.mountainDark);
    } else if (skinId === "pidgey") {
      px(ctx, x, groundY - 18, 4, 18, scene.dirt);
      px(ctx, x - 6, groundY - 26, 16, 10, scene.mountainDark);
      px(ctx, x - 3, groundY - 30, 10, 8, scene.mountain);
    } else if (skinId === "butterfree") {
      px(ctx, x, groundY - 30, 3, 30, scene.dirt);
      px(ctx, x - 7, groundY - 40, 17, 14, scene.mountainDark);
      px(ctx, x - 4, groundY - 46, 11, 10, scene.mountain);
    } else if (skinId === "charizard") {
      const cl = 18 + ((i * 17) % 16);
      px(ctx, x, 0, 8, cl, scene.mountainDark);
      px(ctx, x + 2, 0, 3, cl - 5, scene.mountain);
    }
  }
}

/** Chão com superfície destacada e textura que rola junto com os canos */
function drawPixelGround(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  scrollPx: number,
  scene: ScenePalette
) {
  const groundY = getFlappyGroundY(h);

  px(ctx, 0, groundY, w, h - groundY, scene.ground);
  px(ctx, 0, groundY, w, 4, scene.groundHighlight);
  px(ctx, 0, groundY + 4, w, 2, scene.dirt);

  const tile = 18;
  const off = scrollPx % tile;
  for (let x = -off; x < w + tile; x += tile) {
    px(ctx, x + 2, groundY + 9, tile - 8, 3, scene.dirt);
    px(ctx, x + tile - 4, groundY + 16, 3, 3, scene.dirt);
  }

  px(ctx, 0, h - 5, w, 5, scene.dirt);
}

/** Corpo de cano com brilho à esquerda, sombra à direita e boca destacada */
function drawPipeBody(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  height: number,
  scene: ScenePalette
) {
  if (height <= 0) return;
  const w = FLAPPY_PIPE_WIDTH;
  px(ctx, x, y, w, height, scene.pipe);
  px(ctx, x, y, 4, height, scene.pipeHi);
  px(ctx, x + 6, y, 2, height, scene.pipeHi);
  px(ctx, x + w - 6, y, 6, height, scene.pipeLo);
}

function drawPipeCap(
  ctx: CanvasRenderingContext2D,
  x: number,
  capY: number,
  scene: ScenePalette
) {
  const w = FLAPPY_PIPE_WIDTH;
  const capH = 16;
  px(ctx, x - 4, capY, w + 8, capH, scene.pipe);
  px(ctx, x - 4, capY, 5, capH, scene.pipeHi);
  px(ctx, x - 4, capY, w + 8, 3, scene.pipeHi);
  px(ctx, x + w + 1, capY, 3, capH, scene.pipeLo);
  px(ctx, x - 4, capY + capH - 3, w + 8, 3, scene.pipeLo);
}

function drawPixelPipes(
  ctx: CanvasRenderingContext2D,
  pipes: FlappyPipe[],
  h: number,
  scene: ScenePalette
) {
  const groundY = getFlappyGroundY(h);
  const capH = 16;

  for (const pipe of pipes) {
    const gapTop = Math.floor(pipe.gapY - FLAPPY_PIPE_GAP / 2);
    const gapBottom = Math.floor(pipe.gapY + FLAPPY_PIPE_GAP / 2);
    const x = Math.floor(pipe.x);

    // Cano superior (boca apontada para baixo)
    drawPipeBody(ctx, x, 0, gapTop - capH, scene);
    drawPipeCap(ctx, x, gapTop - capH, scene);

    // Cano inferior (boca apontada para cima) — para no chão
    drawPipeCap(ctx, x, gapBottom, scene);
    drawPipeBody(ctx, x, gapBottom + capH, groundY - (gapBottom + capH), scene);
  }
}

function drawBird(
  ctx: CanvasRenderingContext2D,
  birdX: number,
  birdY: number,
  vel: number,
  wingPhase: number,
  sprite: HTMLImageElement | null,
  accent: string
) {
  const size = FLAPPY_BIRD_SIZE + 8;
  const flapUp = Math.sin(wingPhase) > 0;
  // squash & stretch leve sincronizado com a batida de asa
  const sx = flapUp ? 1.06 : 0.96;
  const sy = flapUp ? 0.94 : 1.05;
  const tilt = Math.max(-0.5, Math.min(0.7, vel * 0.06));

  ctx.save();
  ctx.translate(Math.floor(birdX), Math.floor(birdY));
  ctx.rotate(tilt);

  if (sprite && sprite.complete && sprite.naturalWidth > 0) {
    const scale = size / Math.max(sprite.width, sprite.height);
    const dw = Math.floor(sprite.width * scale * sx);
    const dh = Math.floor(sprite.height * scale * sy);
    ctx.drawImage(sprite, -dw / 2, -dh / 2, dw, dh);
  } else {
    px(ctx, (-size / 2) * sx, (-size / 2) * sy, size * sx, size * sy, accent);
  }

  ctx.restore();
}

export function drawFlappyScene(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  birdY: number,
  vel: number,
  wingPhase: number,
  pipes: FlappyPipe[],
  sprite: HTMLImageElement | null,
  scrollPx: number,
  skin: FlappySkinConfig
) {
  const scene = skin.scene;
  ctx.imageSmoothingEnabled = false;

  drawPixelSky(ctx, w, h, scrollPx, scene);
  drawPixelHills(ctx, w, h, scrollPx, scene);
  drawSkinDecor(ctx, w, h, scrollPx, scene, skin.id);
  drawPixelGround(ctx, w, h, scrollPx, scene);
  drawPixelPipes(ctx, pipes, h, scene);

  if (scene.fog) {
    px(ctx, 0, Math.floor(h * 0.52), w, Math.floor(h * 0.1), scene.fog);
  }

  const birdX = w * FLAPPY_BIRD_X_RATIO;
  drawBird(ctx, birdX, birdY, vel, wingPhase, sprite, skin.accent);
}

export { FLAPPY_BIRD_SIZE, FLAPPY_BIRD_X_RATIO };
