// ============================================================
// useCountdown — calculates remaining seconds from a server deadline
// Dynamic timeLimit (10s for QUICK, 16s for SITUATIONAL)
// ============================================================

import { useState, useEffect, useRef } from 'react';

export function useCountdown(
  deadline: number | null,
  timeLimit = 16
): {
  secondsLeft: number;
  progress: number; // 0–1, 1=full, 0=empty
  isUrgent: boolean;
  isExpired: boolean;
} {
  const [secondsLeft, setSecondsLeft] = useState(timeLimit);
  const [progress, setProgress] = useState(1);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (deadline === null) {
      setSecondsLeft(timeLimit);
      setProgress(1);
      return;
    }

    const tick = () => {
      const now = Date.now();
      const remaining = Math.max(0, deadline - now);
      const secs = Math.ceil(remaining / 1000);
      const prog = Math.min(1, Math.max(0, remaining / (timeLimit * 1000)));

      setSecondsLeft(secs);
      setProgress(prog);

      if (remaining > 0) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [deadline, timeLimit]);

  return {
    secondsLeft,
    progress,
    isUrgent: secondsLeft <= 3 && secondsLeft > 0,
    isExpired: secondsLeft === 0,
  };
}
