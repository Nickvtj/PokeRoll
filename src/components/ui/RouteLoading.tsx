interface RouteLoadingProps {
  label?: string;
}

export function RouteLoading({ label = "Carregando..." }: RouteLoadingProps) {
  return (
    <div className="max-w-lg mx-auto px-4 py-16 flex flex-col items-center gap-3">
      <div
        className="w-8 h-8 rounded-full border-2 border-indigo-400/30 border-t-indigo-400 animate-spin"
        aria-hidden
      />
      <p className="text-white/40 text-sm">{label}</p>
    </div>
  );
}

export function PanelSkeleton({ label = "Carregando..." }: RouteLoadingProps) {
  return (
    <div className="glass-card p-8 text-center text-white/40 text-sm animate-pulse">
      {label}
    </div>
  );
}
