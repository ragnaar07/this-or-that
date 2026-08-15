// ============================================================
// usePolling — robust, non-overlapping polling hook
// Prevents out-of-order responses and network congestion
// ============================================================

import { useEffect, useRef } from 'react';

export function usePolling(
  fn: () => Promise<void> | void,
  intervalMs: number,
  active: boolean
) {
  const fnRef = useRef(fn);
  fnRef.current = fn;

  useEffect(() => {
    if (!active) return;

    let isMounted = true;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let isExecuting = false;

    async function poll() {
      if (!isMounted || !active || isExecuting) return;
      isExecuting = true;

      try {
        await fnRef.current();
      } catch (err) {
        console.warn('[usePolling] Poll error:', err);
      } finally {
        isExecuting = false;
        if (isMounted && active) {
          timeoutId = setTimeout(poll, intervalMs);
        }
      }
    }

    // Initial poll
    poll();

    return () => {
      isMounted = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [active, intervalMs]);
}
