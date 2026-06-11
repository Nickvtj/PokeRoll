import {
  FLAPPY_BIRD_SIZE,
  FLAPPY_BIRD_X_RATIO,
  FLAPPY_PIPE_GAP,
  FLAPPY_PIPE_WIDTH,
  type FlappyPipe,
} from "@/lib/flappy-zubat-engine";

/** Paleta estilo Game Boy / Lavender Town */
const C = {
  skyTop: "#081820",
  skyMid: "#0f2847",
  skyBot: "#1a3a5c",
  star: "#9bbc0f",
  moon: "#8bac0f",
  mountain: "#306850",
  mountainDark: "#0f380f",
  tower: "#483838",
  towerWindow: "#9b0f0f",
  grass: "#306230",
  grassLight: "#8bac0f",
  dirt: "#483838",
  pillar: "#505050",
  pillarHi: "#787878",
  pillarLo: "#303030",
  pillarEdge: "#101010",
  fog: "rgba(155, 188, 15, 0.06)",
};

function px(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.floor(x), Math.floor(y), w, h);
}

function drawPixelSky(ctx: CanvasRenderingContext2D, w: number, h: number, scroll: number) {
  for (let y = 0; y < h * 0.72; y += 4) {
    const t = y / (h * 0.72);
    const r = Math.floor(8 + t * 15);
    const g = Math.floor(24 + t * 40);
    const b = Math.floor(32 + t * 60);
    ctx.fillStyle = `rgb(${r},${g},${b})`;
    ctx.fillRect(0, y, w, 4);
  }

  for (let i = 0; i < 28; i++) {
    const sx = ((i * 47 + scroll * 0.02) % w) | 0;
    const sy = 12 + ((i * 19) % (h * 0.35)) | 0;
    if (i % 5 === 0) px(ctx, sx, sy, 2, 2, C.star);
    else px(ctx, sx, sy, 1, 1, "#306230");
  }

  px(ctx, w - 52, 28, 18, 18, C.moon);
  px(ctx, w - 48, 32, 10, 10, C.skyMid);
}

function drawPixelMountains(ctx: CanvasRenderingContext2D, w: number, h: number, scroll: number) {
  const baseY = h * 0.58;
  const off = (scroll * 0.08) % 80;

  for (let layer = 0; layer < 3; layer++) {
    const color = layer === 0 ? C.mountainDark : layer === 1 ? C.mountain : "#408850";
    const yOff = layer * 14;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(-off, baseY + yOff);
    for (let x = -off; x <= w + 80; x += 40) {
      const peak = baseY + yOff - 18 - layer * 10 - (x % 80 === 0 ? 12 : 0);
      ctx.lineTo(x, peak);
      ctx.lineTo(x + 20, baseY + yOff);
    }
    ctx.lineTo(w + 80, h);
    ctx.lineTo(-off, h);
    ctx.closePath();
    ctx.fill();
  }
}

function drawLavenderTower(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const tx = w * 0.72;
  const ty = h * 0.22;
  const tw = 36;
  const th = 120;

  px(ctx, tx, ty + th - 20, tw, 20, C.tower);
  for (let row = 0; row < 5; row++) {
    px(ctx, tx + 4, ty + row * 22, tw - 8, 18, row % 2 === 0 ? C.tower : "#383030");
    px(ctx, tx + 10, ty + row * 22 + 5, 4, 6, C.towerWindow);
    px(ctx, tx + tw - 14, ty + row * 22 + 5, 4, 6, C.towerWindow);
  }
  px(ctx, tx + 12, ty - 8, 12, 10, C.tower);
  px(ctx, tx + 8, ty - 16, 20, 10, "#383030");
}

function drawGround(ctx: CanvasRenderingContext2D, w: number, h: number, scroll: number) {
  const groundY = (h * 0.72) | 0;
  px(ctx, 0, groundY, w, h - groundY, C.grass);

  const tile = 16;
  const off = (scroll * 0.5) % tile;
  for (let x = -off; x < w + tile; x += tile) {
    px(ctx, x, groundY, tile - 1, 4, C.grassLight);
    px(ctx, x + 2, groundY + 8, tile - 4, 3, C.dirt);
  }

  px(ctx, 0, h - 8, w, 8, C.dirt);
}

function drawPixelPillar(
  ctx: CanvasRenderingContext2D,
  x: number,
  topH: number,
  bottomY: number,
  bottomH: number,
  w: number,
  h: number
) {
  const drawSegment = (sy: number, sh: number) => {
    px(ctx, x, sy, w, sh, C.pillar);
    px(ctx, x, sy, w, 3, C.pillarHi);
    px(ctx, x + w - 2, sy, 2, sh, C.pillarLo);
    px(ctx, x, sy, 2, sh, C.pillarEdge);
    px(ctx, x - 2, sy + sh - 6, w + 4, 6, C.pillarHi);
    for (let ry = sy + 8; ry < sy + sh - 6; ry += 12) {
      px(ctx, x + 4, ry, w - 8, 2, C.pillarLo);
    }
  };

  drawSegment(0, topH);
  drawSegment(bottomY, h - bottomY);
}

function drawPixelScore(ctx: CanvasRenderingContext2D, w: number, score: number) {
  const text = String(score);
  ctx.font = "bold 28px 'Courier New', monospace";
  ctx.textAlign = "center";
  ctx.fillStyle = "#0f380f";
  ctx.fillText(text, w / 2 + 2, 44);
  ctx.fillStyle = "#9bbc0f";
  ctx.fillText(text, w / 2, 42);
}

export function drawFlappyScene(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  birdY: number,
  wingPhase: number,
  pipes: FlappyPipe[],
  score: number,
  sprite: HTMLImageElement | null,
  scrollTime: number
) {
  ctx.imageSmoothingEnabled = false;

  drawPixelSky(ctx, w, h, scrollTime);
  drawPixelMountains(ctx, w, h, scrollTime);
  drawLavenderTower(ctx, w, h);
  drawGround(ctx, w, h, scrollTime);

  ctx.fillStyle = C.fog;
  ctx.fillRect(0, h * 0.45, w, h * 0.2);

  for (const pipe of pipes) {
    const gapTop = pipe.gapY - FLAPPY_PIPE_GAP / 2;
    const gapBottom = pipe.gapY + FLAPPY_PIPE_GAP / 2;
    drawPixelPillar(ctx, pipe.x, gapTop, gapBottom, h - gapBottom, FLAPPY_PIPE_WIDTH, h);
  }

  const birdX = w * FLAPPY_BIRD_X_RATIO;
  const size = FLAPPY_BIRD_SIZE + 8;
  const bob = Math.sin(wingPhase) > 0 ? -3 : 3;

  if (sprite && sprite.complete) {
    ctx.save();
    ctx.translate(birdX, birdY + bob);
    ctx.rotate(Math.min(0.5, Math.max(-0.45, (birdY - h / 2) * 0.0035)));
    const scale = size / Math.max(sprite.width, sprite.height);
    const dw = sprite.width * scale;
    const dh = sprite.height * scale;
    ctx.drawImage(sprite, -dw / 2, -dh / 2, dw, dh);
    ctx.restore();
  } else {
    px(ctx, birdX - size / 2, birdY - size / 2 + bob, size, size, "#a78bfa");
  }

  drawPixelScore(ctx, w, score);
}

export { FLAPPY_BIRD_SIZE, FLAPPY_BIRD_X_RATIO };
