import { PanelSkeleton } from "@/components/ui/RouteLoading";

export default function Loading() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-6 lg:py-8">
      <PanelSkeleton label="Carregando ovos..." />
    </div>
  );
}
