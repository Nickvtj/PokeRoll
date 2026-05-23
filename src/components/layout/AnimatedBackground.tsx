"use client";

import { motion } from "framer-motion";

/** Valor pseudo-aleatório estável (mesmo no SSR e no cliente) */
function seededUnit(index: number, salt: number) {
  const x = Math.sin(index * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

export function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Gradiente base */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0e1a] via-[#121829] to-[#0a0e1a]" />

      {/* Orbs animados */}
      {[
        { color: "#6366f1", size: 400, x: "10%", y: "20%", delay: 0 },
        { color: "#22d3ee", size: 300, x: "70%", y: "60%", delay: 2 },
        { color: "#a855f7", size: 350, x: "50%", y: "10%", delay: 4 },
        { color: "#f59e0b", size: 200, x: "80%", y: "30%", delay: 1 },
      ].map((orb, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full opacity-20 blur-3xl"
          style={{
            width: orb.size,
            height: orb.size,
            backgroundColor: orb.color,
            left: orb.x,
            top: orb.y,
          }}
          animate={{
            x: [0, 30, -20, 0],
            y: [0, -40, 20, 0],
            scale: [1, 1.1, 0.95, 1],
          }}
          transition={{
            duration: 12 + i * 2,
            repeat: Infinity,
            delay: orb.delay,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Grid sutil */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Partículas */}
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={`particle-${i}`}
          className="absolute w-1 h-1 rounded-full bg-white/20"
          style={{
            left: `${seededUnit(i, 1) * 100}%`,
            top: `${seededUnit(i, 2) * 100}%`,
          }}
          animate={{
            opacity: [0.2, 0.8, 0.2],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 3 + seededUnit(i, 3) * 4,
            repeat: Infinity,
            delay: seededUnit(i, 4) * 5,
          }}
        />
      ))}
    </div>
  );
}
