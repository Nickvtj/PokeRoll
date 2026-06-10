import { PanelSkeleton } from "@/components/ui/RouteLoading";

export default function Loading() {
  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <PanelSkeleton label="Carregando roleta..." />
    </div>
  );
}
