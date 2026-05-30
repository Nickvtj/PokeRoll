"use client";

import { useRouter } from "next/navigation";
import { useCallback, useRef } from "react";

/** Prefetch da rota só ao passar o mouse ou focar (evita baixar tudo de uma vez). */
export function usePrefetchOnIntent(href: string) {
  const router = useRouter();
  const prefetched = useRef(false);

  const prefetch = useCallback(() => {
    if (prefetched.current) return;
    prefetched.current = true;
    router.prefetch(href);
  }, [router, href]);

  return {
    prefetch: false as const,
    onMouseEnter: prefetch,
    onFocus: prefetch,
  };
}
