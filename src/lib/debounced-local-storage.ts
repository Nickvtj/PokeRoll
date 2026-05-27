const DEFAULT_DEBOUNCE_MS = 350;

const flushCallbacks = new Set<() => void>();

export function registerDebouncedFlush(callback: () => void): () => void {
  flushCallbacks.add(callback);
  return () => flushCallbacks.delete(callback);
}

/** Grava imediatamente todos os writes locais pendentes (debounced). */
export function flushAllDebouncedLocalStorage(): void {
  flushCallbacks.forEach((callback) => callback());
}

export interface DebouncedJsonPersist<T> {
  schedule: (value: T) => void;
  flush: () => void;
  writeImmediate: (value: T) => void;
}

/** Persistência JSON no localStorage com debounce para não bloquear a main thread. */
export function createDebouncedJsonPersist<T>(
  storageKey: string,
  debounceMs = DEFAULT_DEBOUNCE_MS
): DebouncedJsonPersist<T> {
  let pending: T | null = null;
  let timer: ReturnType<typeof setTimeout> | null = null;

  const writeImmediate = (value: T) => {
    pending = null;
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    if (typeof window === "undefined") return;
    localStorage.setItem(storageKey, JSON.stringify(value));
  };

  const flush = () => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    if (pending !== null) {
      writeImmediate(pending);
    }
  };

  const schedule = (value: T) => {
    pending = value;
    if (timer) clearTimeout(timer);
    timer = setTimeout(flush, debounceMs);
  };

  registerDebouncedFlush(flush);

  return { schedule, flush, writeImmediate };
}

if (typeof window !== "undefined") {
  window.addEventListener("pagehide", flushAllDebouncedLocalStorage);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      flushAllDebouncedLocalStorage();
    }
  });
}
