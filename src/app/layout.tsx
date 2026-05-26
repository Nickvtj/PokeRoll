import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { AnimatedBackground } from "@/components/layout/AnimatedBackground";
import { GameProvider } from "@/components/layout/GameProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "PokéRoll",
  description:
    "Gire a roleta, colete 150 Pokémon e complete seu álbum de figurinhas!",
  keywords: ["pokemon", "jogo", "coleção", "figurinhas", "gacha"],
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="font-body antialiased">
        <AnimatedBackground />
        <GameProvider>
          <Navbar />
          <main className="min-h-dvh pt-10 md:pt-0 lg:pt-16 pb-20 md:pb-8">
            {children}
          </main>
        </GameProvider>
      </body>
    </html>
  );
}
