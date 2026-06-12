"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  applyVisualQuality,
  detectVisualQuality,
  type VisualQuality,
} from "@/lib/visual-quality";
import { usePreferencesStore } from "@/stores/preferences-store";

export type { VisualQuality } from "@/lib/visual-quality";

const VisualQualityContext = createContext<VisualQuality>("medium");

export function VisualQualityProvider({ children }: { children: ReactNode }) {
  const visualQualityMode = usePreferencesStore((s) => s.visualQualityMode);
  const [quality, setQuality] = useState<VisualQuality>("medium");

  useEffect(() => {
    const update = () => {
      const next =
        visualQualityMode !== "auto" ? visualQualityMode : detectVisualQuality();
      setQuality(next);
      applyVisualQuality(next);
    };

    update();

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mobileQuery = window.matchMedia("(max-width: 768px)");

    motionQuery.addEventListener("change", update);
    mobileQuery.addEventListener("change", update);

    return () => {
      motionQuery.removeEventListener("change", update);
      mobileQuery.removeEventListener("change", update);
    };
  }, [visualQualityMode]);

  return (
    <VisualQualityContext.Provider value={quality}>
      {children}
    </VisualQualityContext.Provider>
  );
}

export function useVisualQuality(): VisualQuality {
  return useContext(VisualQualityContext);
}
