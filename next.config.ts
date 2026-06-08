import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
