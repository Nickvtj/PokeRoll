"use client";

import { memo, useEffect, useState } from "react";

/** Valor pseudo-aleatório estável (mesmo no SSR e no cliente) */
function seededUnit(index: number, salt: number) {
  const x = Math.sin(index * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

const ORBS = [
  { color: "#6366f1", size: 400, x: "10%", y: "20%", duration: 12, delay: 0 },
  { color: "#22d3ee", size: 300, x: "70%", y: "60%", duration: 14, delay: 2 },
  { color: "#a855f7", size: 350, x: "50%", y: "10%", duration: 16, delay: 4 },
  { color: "#f59e0b", size: 200, x: "80%", y: "30%", duration: 13, delay: 1 },
] as const;

const PARTICLE_COUNT = 6;

const PARTICLES = Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
  left: `${(seededUnit(i, 1) * 100).toFixed(4)}%`,
  top: `${(seededUnit(i, 2) * 100).toFixed(4)}%`,
  duration: `${(3 + seededUnit(i, 3) * 4).toFixed(2)}s`,
  delay: `${(seededUnit(i, 4) * 5).toFixed(2)}s`,
}));

export const AnimatedBackground = memo(function AnimatedBackground() {
  const [particlesReady, setParticlesReady] = useState(false);

  useEffect(() => {
    setParticlesReady(true);
  }, []);

  return (
    <div
      className="fixed inset-0 -z-10 overflow-hidden pointer-events-none"
      aria-hidden
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0e1a] via-[#121829] to-[#0a0e1a]" />

      {ORBS.map((orb, i) => (
        <div
          key={i}
          className="absolute rounded-full opacity-20 blur-xl bg-orb-drift"
          style={{
            width: orb.size,
            height: orb.size,
            backgroundColor: orb.color,
            left: orb.x,
            top: orb.y,
            animationDuration: `${orb.duration}s`,
            animationDelay: `${orb.delay}s`,
          }}
        />
      ))}

      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {particlesReady &&
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
