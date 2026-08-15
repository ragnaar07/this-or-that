import type { GameResult } from '../types/game';

interface RevealScreenProps {
  result: GameResult;
  hostChoice: string | null;
  guestChoice: string | null;
  hostName: string;
  guestName: string | null;
}

export function RevealScreen({
  result,
  hostChoice,
  guestChoice,
  hostName,
  guestName,
}: RevealScreenProps) {
  const isMatch = result === 'MATCH';

  return (
    <div
      className={`reveal-screen reveal-screen--${isMatch ? 'match' : 'nomatch'}`}
      role="status"
      aria-live="assertive"
      aria-label={isMatch ? 'Match! Both players chose the same option' : 'No match. Players chose different options'}
    >
      {/* Big result text */}
      <div className="reveal-result">
        {isMatch ? 'MATCH!' : 'NO MATCH'}
      </div>

      {/* Player name labels */}
      {guestName && (
        <div className="reveal-names">
          <div className="reveal-name-tag" style={{ minWidth: 80 }}>
            {hostName}
          </div>
          <div style={{ width: 32 }} />
          <div className="reveal-name-tag" style={{ minWidth: 80 }}>
            {guestName}
          </div>
        </div>
      )}

      {/* The actual choices */}
      <div className="reveal-choices">
        <div className="reveal-choice">{hostChoice ?? '—'}</div>
        <div className="reveal-dot">•</div>
        <div className="reveal-choice">{guestChoice ?? '—'}</div>
      </div>

      {/* Auto-advance notice */}
      <div className="reveal-next">Next round incoming…</div>
    </div>
  );
}
