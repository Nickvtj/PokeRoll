import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        pokeroll: {
          bg: "#0a0e1a",
          surface: "#121829",
          card: "#1a2238",
          accent: "#6366f1",
          gold: "#fbbf24",
          neon: "#22d3ee",
        },
        rarity: {
          common: "#94a3b8",
          uncommon: "#22c55e",
          rare: "#3b82f6",
          epic: "#a855f7",
          legendary: "#f59e0b",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      animation: {
        shimmer: "shimmer 2s linear infinite",
        float: "float 6s ease-in-out infinite",
        pulseGlow: "pulseGlow 2s ease-in-out infinite",
        spinSlow: "spin 8s linear infinite",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(99, 102, 241, 0.3)" },
          "50%": { boxShadow: "0 0 40px rgba(99, 102, 241, 0.6)" },
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "glass-gradient":
          "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.02) 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
