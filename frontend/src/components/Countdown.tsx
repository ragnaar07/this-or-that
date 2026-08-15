import { useCountdown } from '../hooks/useCountdown';

interface CountdownProps {
  deadline: number | null;
  hasAnswered: boolean;
  timeLimit?: number;
  format?: 'QUICK' | 'SITUATIONAL';
}

export function Countdown({ deadline, hasAnswered, timeLimit = 16, format = 'SITUATIONAL' }: CountdownProps) {
  const { secondsLeft, progress, isUrgent, isExpired } = useCountdown(deadline, timeLimit);

  let statusText = format === 'QUICK' ? '⚡ PICK ONE — FAST!' : '🧠 THINK & CHOOSE!';
  if (isExpired) {
    statusText = "⏰ TIME'S UP!";
  } else if (hasAnswered) {
    statusText = 'WAITING ON YOUR PLAYER…';
  }

  return (
    <div className="countdown-area" aria-label={`${secondsLeft} seconds remaining`}>
      <div className="countdown-bar-track">
        <div
          className={`countdown-bar-fill${isUrgent ? ' urgent' : ''}${isExpired ? ' expired' : ''}`}
          style={{ width: `${progress * 100}%` }}
        />
      </div>
      <div className="countdown-row">
        <span className={`countdown-number${isUrgent ? ' urgent' : ''}${isExpired ? ' expired' : ''}`}>
          {isExpired ? '0' : secondsLeft}
        </span>
        <span className="countdown-status">
          {statusText}
        </span>
      </div>
    </div>
  );
}
