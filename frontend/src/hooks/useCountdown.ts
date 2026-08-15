// ============================================================
// useCountdown — calculates remaining seconds from a deadline
// Uses server-provided deadline for synchronization
// ============================================================

import { useState, useEffect, useRef } from 'react';

export function useCountdown(deadline: number | null): {
  secondsLeft: number;
  progress: number; // 0–1, 1=full, 0=empty
  isUrgent: boolean;
} {
  const ROUND_DURATION = 10;
  const [secondsLeft, setSecondsLeft] = useState(ROUND_DURATION);
  const [progress, setProgress] = useState(1);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (deadline === null) {
      setSecondsLeft(ROUND_DURATION);
      setProgress(1);
      return;
    }

    const tick = () => {
      const now = Date.now();
      const remaining = Math.max(0, deadline - now);
      const secs = Math.ceil(remaining / 1000);
      const prog = Math.max(0, remaining / (ROUND_DURATION * 1000));

      setSecondsLeft(secs);
      setProgress(prog);

      if (remaining > 0) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [deadline]);

  return {
    secondsLeft,
    progress,
    isUrgent: secondsLeft <= 3,
  };
}
