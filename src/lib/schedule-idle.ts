type IdleCapableGlobal = typeof globalThis & {
  requestIdleCallback?: (
    callback: IdleRequestCallback,
    options?: IdleRequestOptions
  ) => number;
  cancelIdleCallback?: (handle: number) => void;
};

/** Agenda trabalho em idle; fallback com setTimeout. Retorna função de cancelamento. */
export function scheduleIdleWork(
  work: () => void,
  fallbackDelayMs = 800,
  idleTimeoutMs = 2000
): () => void {
  const g = globalThis as IdleCapableGlobal;
  const idleCallback = g.requestIdleCallback;

  if (typeof idleCallback === "function") {
    const idleId = idleCallback(work, { timeout: idleTimeoutMs });
    return () => g.cancelIdleCallback?.(idleId);
  }

  const timeoutId = globalThis.setTimeout(work, fallbackDelayMs);
  return () => globalThis.clearTimeout(timeoutId);
}

/** Fire-and-forget: agenda trabalho em idle (sem cancelamento). */
export function scheduleIdle(work: () => void, idleTimeoutMs = 2500, fallbackDelayMs = 300): void {
  if (typeof window === "undefined") return;
  scheduleIdleWork(work, fallbackDelayMs, idleTimeoutMs);
}
