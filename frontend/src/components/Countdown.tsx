import { useCountdown } from '../hooks/useCountdown';

interface CountdownProps {
  deadline: number | null;
  hasAnswered: boolean;
}

export function Countdown({ deadline, hasAnswered }: CountdownProps) {
  const { secondsLeft, progress, isUrgent } = useCountdown(deadline);

  return (
    <div className="countdown-area" aria-label={`${secondsLeft} seconds remaining`}>
      <div className="countdown-bar-track">
        <div
          className={`countdown-bar-fill${isUrgent ? ' urgent' : ''}`}
          style={{ width: `${progress * 100}%` }}
        />
      </div>
      <div className="countdown-row">
        <span className={`countdown-number${isUrgent ? ' urgent' : ''}`}>
          {secondsLeft}
        </span>
        <span className="countdown-status">
          {hasAnswered ? 'WAITING ON YOUR PLAYER…' : 'PICK ONE — FAST!'}
        </span>
      </div>
    </div>
  );
}
