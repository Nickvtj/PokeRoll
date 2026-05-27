/**
 * Baixa sprites oficiais (Gen 1) para public/sprites/.
 * Uso: node scripts/download-sprites.mjs
 */
import { mkdir, writeFile, access } from "node:fs/promises";
import { constants } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, "..", "public", "sprites");
const BASE_URL =
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork";
const TOTAL = 150;
const CONCURRENCY = 8;

async function exists(filePath) {
  try {
    await access(filePath, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function download(id) {
  const outPath = path.join(OUT_DIR, `${id}.png`);
  if (await exists(outPath)) {
    return { id, status: "skipped" };
  }

  const res = await fetch(`${BASE_URL}/${id}.png`);
  if (!res.ok) {
    return { id, status: "failed", error: res.statusText };
  }

  const buffer = Buffer.from(await res.arrayBuffer());
  await writeFile(outPath, buffer);
  return { id, status: "saved" };
}

async function runPool(ids, limit) {
  const results = [];
  let index = 0;

  async function worker() {
    while (index < ids.length) {
      const current = ids[index++];
      results.push(await download(current));
    }
  }

  await Promise.all(Array.from({ length: limit }, worker));
  return results;
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const ids = Array.from({ length: TOTAL }, (_, i) => i + 1);
  const results = await runPool(ids, CONCURRENCY);

  const saved = results.filter((r) => r.status === "saved").length;
  const skipped = results.filter((r) => r.status === "skipped").length;
  const failed = results.filter((r) => r.status === "failed");

  console.log(`Sprites: ${saved} baixados, ${skipped} já existiam.`);
  if (failed.length > 0) {
    console.warn(`Falhas (${failed.length}):`, failed.map((f) => f.id).join(", "));
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
