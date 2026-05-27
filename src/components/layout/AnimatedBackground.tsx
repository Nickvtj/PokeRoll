"use client";

import { memo, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useVisualQuality } from "@/components/layout/VisualQualityProvider";

function seededUnit(index: number, salt: number) {
  const x = Math.sin(index * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

/** Orbs grandes com gradiente radial — bordas suaves sem parecer “bolas sólidas” */
const ORBS = [
  { rgb: "99, 102, 241", size: 560, x: "5%", y: "12%", duration: 14, delay: 0 },
  { rgb: "34, 211, 238", size: 480, x: "62%", y: "55%", duration: 16, delay: 2 },
  { rgb: "168, 85, 247", size: 520, x: "42%", y: "0%", duration: 18, delay: 4 },
  { rgb: "245, 158, 11", size: 380, x: "78%", y: "22%", duration: 15, delay: 1 },
] as const;

const PARTICLE_COUNT = 6;

const PARTICLES = Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
  left: `${(seededUnit(i, 1) * 100).toFixed(4)}%`,
  top: `${(seededUnit(i, 2) * 100).toFixed(4)}%`,
  duration: `${(3 + seededUnit(i, 3) * 4).toFixed(2)}s`,
  delay: `${(seededUnit(i, 4) * 5).toFixed(2)}s`,
}));

export const AnimatedBackground = memo(function AnimatedBackground() {
  const quality = useVisualQuality();
  const [particlesReady, setParticlesReady] = useState(false);
  const [tabVisible, setTabVisible] = useState(true);

  useEffect(() => {
    setParticlesReady(true);
  }, []);

  useEffect(() => {
    const onVisibility = () => {
      setTabVisible(document.visibilityState === "visible");
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  const showAnimatedOrbs = quality !== "low";
  const showParticles = quality === "high" && particlesReady;

  return (
    <div
      className={cn(
        "fixed inset-0 -z-10 overflow-hidden pointer-events-none",
        !tabVisible && "ambient-paused"
      )}
      aria-hidden
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0e1a] via-[#121829] to-[#0a0e1a]" />

      <div className="absolute inset-0 bg-ambient-wash" />

      {showAnimatedOrbs && (
        <div className="absolute inset-0 bg-ambient-layer">
          {ORBS.map((orb, i) => (
            <div
              key={i}
              className="absolute bg-ambient-orb bg-orb-drift"
              style={{
                width: orb.size,
                height: orb.size,
                left: orb.x,
                top: orb.y,
                ["--orb-color" as string]: orb.rgb,
                animationDuration: `${orb.duration}s`,
                animationDelay: `${orb.delay}s`,
              }}
            />
          ))}
        </div>
      )}

      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="absolute inset-0 bg-ambient-vignette" />

      {showParticles &&
        PARTICLES.map((p, i) => (
          <div
            key={`particle-${i}`}
            className="absolute w-1 h-1 rounded-full bg-white/20 bg-particle-float"
            style={{
              left: p.left,
              top: p.top,
              animationDuration: p.duration,
              animationDelay: p.delay,
            }}
          />
        ))}
    </div>
  );
});
