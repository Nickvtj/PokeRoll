import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Permite acesso ao dev server via IP de LAN (ex.: http://192.168.0.12:3000)
  // sem avisos de cross-origin e com HMR/chunks funcionando corretamente.
  allowedDevOrigins: ["192.168.0.12", "localhost", "127.0.0.1"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "raw.githubusercontent.com",
        pathname: "/PokeAPI/sprites/**",
      },
      {
        protocol: "https",
        hostname: "archives.bulbagarden.net",
        pathname: "/media/upload/**",
      },
      {
        protocol: "https",
        hostname: "play.pokemonshowdown.com",
        pathname: "/sprites/trainers/**",
      },
      {
        protocol: "https",
        hostname: "raw.githubusercontent.com",
        pathname: "/smogon/pokemon-showdown/**",
      },
    ],
  },
};

export default nextConfig;
