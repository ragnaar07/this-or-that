interface GameHeaderProps {
  matches: number;
  total: number;
  hostName?: string;
  guestName?: string | null;
  onLeave: () => void;
}

export function GameHeader({ matches, total, hostName, guestName, onLeave }: GameHeaderProps) {
  return (
    <header className="game-header">
      {hostName && guestName ? (
        <div className="header-matchup" aria-label={`Matchup: ${hostName} versus ${guestName}`}>
          <span className="matchup-p1">{hostName}</span>
          <span className="matchup-vs">⚡</span>
          <span className="matchup-p2">{guestName}</span>
        </div>
      ) : (
        <div className="score-pill" aria-label={`${matches} of ${total} rounds matched`}>
          <span>{matches}</span> / {total} MATCHED
        </div>
      )}

      <div className="header-right-group">
        {hostName && guestName && (
          <div className="score-pill score-pill--mini" aria-label={`${matches} of ${total} rounds matched`}>
            <span>{matches}</span>/{total}
          </div>
        )}
        <button
          className="leave-btn"
          onClick={onLeave}
          aria-label="Leave game"
          id="leave-game-btn"
        >
          LEAVE
        </button>
      </div>
    </header>
  );
}
