import { SynqLogo } from './SynqLogo';

interface GameHeaderProps {
  matches: number;
  total: number;
  hostName?: string;
  guestName?: string | null;
  onLeave: () => void;
  showScore?: boolean;
  showMatchup?: boolean;
}

export function GameHeader({
  matches,
  total,
  hostName,
  guestName,
  onLeave,
  showScore = true,
  showMatchup = true,
}: GameHeaderProps) {
  return (
    <header className="game-header">
      <div className="header-left-group">
        <div className="header-brand-icon">
          <SynqLogo size="sm" showText={false} />
        </div>
        {showMatchup && hostName && guestName ? (
          <div className="header-matchup" aria-label={`Matchup: ${hostName} versus ${guestName}`}>
            <span className="matchup-p1">{hostName}</span>
            <span className="matchup-vs">⚡</span>
            <span className="matchup-p2">{guestName}</span>
          </div>
        ) : showScore ? (
          <div className="score-pill" aria-label={`${matches} of ${total} rounds matched`}>
            <span>{matches}</span> / {total} MATCHED
          </div>
        ) : null}
      </div>

      <div className="header-right-group">
        {showScore && hostName && guestName && (
          <div className="score-pill score-pill--mini" aria-label={`${matches} of ${total} rounds matched`}>
            <span>{matches}</span>/{total}
          </div>
        )}
        <button
          className="leave-btn"
          onClick={onLeave}
          aria-label="Leave game and view results"
          id="leave-game-btn"
        >
          <span className="leave-btn-icon" aria-hidden="true">🚪</span>
          <span className="leave-btn-text">LEAVE</span>
        </button>
      </div>
    </header>
  );
}
