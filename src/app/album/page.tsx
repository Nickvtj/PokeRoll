"use client";

import dynamic from "next/dynamic";
import { BookOpen } from "lucide-react";
import { PanelSkeleton } from "@/components/ui/RouteLoading";

const AlbumGrid = dynamic(
  () => import("@/components/album/AlbumGrid").then((m) => ({ default: m.AlbumGrid })),
  { loading: () => <PanelSkeleton label="Carregando álbum..." /> }
);

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
