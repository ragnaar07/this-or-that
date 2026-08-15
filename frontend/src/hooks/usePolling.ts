// ============================================================
// usePolling — polls a function at a given interval
// Cleans up automatically on unmount or when active=false
// ============================================================

import { useEffect, useRef } from 'react';

export function usePolling(
  fn: () => void | Promise<void>,
  intervalMs: number,
  active: boolean
) {
  const fnRef = useRef(fn);
  fnRef.current = fn;

  useEffect(() => {
    if (!active) return;

    // Poll immediately on activation
    fnRef.current();

    const id = setInterval(() => {
      fnRef.current();
    }, intervalMs);

    return () => clearInterval(id);
  }, [active, intervalMs]);
}
