interface GameWordmarkProps {
  compact?: boolean;
}

export function GameWordmark({ compact = false }: GameWordmarkProps) {
  return (
    <div className={`game-wordmark${compact ? ' game-wordmark--compact' : ''}`} aria-label="THIS THAT">
      <span className="game-wordmark__this">THIS</span>
      <span className="game-wordmark__bolt" aria-hidden="true">⚡</span>
      <span className="game-wordmark__that">THAT</span>
    </div>
  );
}
