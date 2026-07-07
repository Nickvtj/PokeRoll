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

/** Placeholder leve, evita spinner duplo na navegação */
export function RouteLoadingMinimal() {
  return <div className="min-h-[1px]" aria-hidden />;
}

export function MinigameGameSkeleton() {
  return (
    <div className="glass-card p-8 space-y-4 animate-pulse" aria-hidden>
      <div className="mx-auto w-14 h-14 rounded-2xl bg-white/5" />
      <div className="h-5 w-36 bg-white/5 rounded mx-auto" />
      <div className="h-3 max-w-sm w-full bg-white/5 rounded mx-auto" />
      <div className="h-11 w-44 bg-white/5 rounded-xl mx-auto mt-2" />
    </div>
  );
}

interface MinigameRouteSkeletonProps {
  title?: string;
}

/** Shell instantâneo enquanto a rota do minigame carrega. */
export function MinigameRouteSkeleton({ title }: MinigameRouteSkeletonProps) {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center gap-3 min-w-0 animate-pulse">
        <div className="w-10 h-10 rounded-xl bg-white/5 shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-7 w-48 bg-white/5 rounded-lg" />
          {title ? (
            <p className="text-white/35 text-xs">{title}</p>
          ) : (
            <div className="h-3 w-64 bg-white/5 rounded" />
          )}
        </div>
      </div>
      <MinigameGameSkeleton />
    </div>
  );
}
