// ============================================================
// useCountdown — calculates remaining seconds from a server deadline
// Dynamic timeLimit (10s for QUICK, 16s for SITUATIONAL)
// ============================================================

import { useState, useEffect } from 'react';

const COUNTDOWN_PROGRESS_INTERVAL_MS = 100;

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

  useEffect(() => {
    if (deadline === null) {
      setSecondsLeft((prev) => (prev === timeLimit ? prev : timeLimit));
      setProgress((prev) => (prev === 1 ? prev : 1));
      return;
    }

    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let lastSecondsLeft: number | null = null;

    const tick = () => {
      const now = Date.now();
      const remaining = Math.max(0, deadline - now);
      const secs = Math.ceil(remaining / 1000);
      const prog = Math.min(1, Math.max(0, remaining / (timeLimit * 1000)));

      if (secs !== lastSecondsLeft) {
        lastSecondsLeft = secs;
        setSecondsLeft(secs);
      }
      setProgress((prev) => (Math.abs(prev - prog) < 0.005 ? prev : prog));

      if (remaining > 0) {
        timeoutId = window.setTimeout(tick, COUNTDOWN_PROGRESS_INTERVAL_MS);
      }
    };

    tick();
    return () => {
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [deadline, timeLimit]);

  return {
    secondsLeft,
    progress,
    isUrgent: secondsLeft <= 3 && secondsLeft > 0,
    isExpired: secondsLeft === 0,
  };
}
