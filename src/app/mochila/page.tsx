"use client";

import dynamic from "next/dynamic";
import { Backpack } from "lucide-react";
import { PanelSkeleton } from "@/components/ui/RouteLoading";

const MochilaView = dynamic(
  () => import("@/components/mochila/MochilaView").then((m) => ({ default: m.MochilaView })),
  { loading: () => <PanelSkeleton label="Carregando mochila..." /> }
);

export default function MochilaPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Backpack className="w-8 h-8 text-indigo-400" />
          Mochila
        </h1>
        <p className="text-white/50 text-sm">
          Seus itens, doces e pedras de evolução.
        </p>
      </div>

      <MochilaView />
    </div>
  );
}
