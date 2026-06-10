/** Sprites em /public — Next Image pode otimizar sem unoptimized. */
export function isLocalAsset(src: string): boolean {
  return src.startsWith("/") && !src.startsWith("//");
}
