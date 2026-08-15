interface GameHeaderProps {
  matches: number;
  total: number;
  onLeave: () => void;
}

export function GameHeader({ matches, total, onLeave }: GameHeaderProps) {
  return (
    <header className="game-header">
      <div className="score-pill" aria-label={`${matches} of ${total} rounds matched`}>
        <span>{matches}</span> / {total} MATCHED
      </div>
      <button
        className="leave-btn"
        onClick={onLeave}
        aria-label="Leave game"
        id="leave-game-btn"
      >
        LEAVE
      </button>
    </header>
  );
}
