import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { AnimatedBackground } from "@/components/layout/AnimatedBackground";
import { GameProvider } from "@/components/layout/GameProvider";
import { VisualQualityProvider } from "@/components/layout/VisualQualityProvider";
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
    <html lang="pt-BR" data-visual-quality="medium" data-custom-cursor="on">
      <body className="font-body antialiased">
        <VisualQualityProvider>
          <AnimatedBackground />
          <GameProvider>
            <Navbar />
            <main className="page-shell pt-10 md:pt-0 lg:pt-16 pb-20 md:pb-8">
              {children}
            </main>
          </GameProvider>
        </VisualQualityProvider>
      </body>
    </html>
  );
}
