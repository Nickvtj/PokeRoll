export type VisualQuality = "high" | "medium" | "low";

const QUALITY_ATTR = "data-visual-quality";

export function detectVisualQuality(): VisualQuality {
  if (typeof window === "undefined") return "medium";

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return "low";
  }

  const isMobile = window.matchMedia("(max-width: 768px)").matches;
  const nav = navigator as Navigator & { deviceMemory?: number };
  const lowCores = (navigator.hardwareConcurrency ?? 8) <= 4;
  const lowMemory = nav.deviceMemory !== undefined && nav.deviceMemory <= 4;

  if (isMobile || lowCores || lowMemory) return "medium";
  return "high";
}

export function applyVisualQuality(quality: VisualQuality): void {
  document.documentElement.setAttribute(QUALITY_ATTR, quality);
}

export function getVisualQualityFromDom(): VisualQuality {
  if (typeof document === "undefined") return "medium";
  const value = document.documentElement.getAttribute(QUALITY_ATTR);
  if (value === "high" || value === "medium" || value === "low") return value;
  return "medium";
}
