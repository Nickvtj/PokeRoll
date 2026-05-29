"use client";

import { BookOpen } from "lucide-react";
import { AlbumGrid } from "@/components/album/AlbumGrid";

export default function AlbumPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <BookOpen className="w-8 h-8 text-cyan-400" />
          Álbum de Figurinhas
        </h1>
        <p className="text-white/50 text-sm">
          Colete todos os 150 Pokémon da 1ª geração!
        </p>
      </div>

      <AlbumGrid />
    </div>
  );
}
