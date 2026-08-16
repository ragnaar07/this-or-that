import type { GameResult, RoundType } from '../types/game';
import { TigerMascot } from './TigerMascot';

interface RevealScreenProps {
  result: GameResult;
  hostChoice: string | null;
  guestChoice: string | null;
  hostName: string;
  guestName: string | null;
  roundType?: RoundType;
  liveReaction?: string | null;
  hostPrediction?: string | null;
  guestPrediction?: string | null;
  hostPredictionResult?: 'CORRECT' | 'WRONG' | null;
  guestPredictionResult?: 'CORRECT' | 'WRONG' | null;
}

export function RevealScreen({
  result,
  hostChoice,
  guestChoice,
  hostName,
  guestName,
  roundType = 'NORMAL',
  liveReaction,
  hostPrediction,
  guestPrediction,
  hostPredictionResult,
  guestPredictionResult,
}: RevealScreenProps) {
  const isMatch = result === 'MATCH';

  return (
    <div
      className={`reveal-screen reveal-screen--${isMatch ? 'match' : 'nomatch'}`}
      role="status"
      aria-live="assertive"
      aria-label={isMatch ? 'Match! Both players chose the same option' : 'No match. Players chose different options'}
    >
      {/* Double Points Special Banner */}
      {roundType === 'DOUBLE_POINTS' && isMatch && (
        <div className="reveal-double-badge">
          🔥 DOUBLE POINTS (+2) EARNED!
        </div>
      )}

      {/* Chaos Round Banner */}
      {roundType === 'CHAOS' && (
        <div className="reveal-chaos-badge">
          ⚠️ CHAOS ROUND VERDICT
        </div>
      )}

      {/* Mascot in Reveal */}
      <div className="reveal-mascot-container">
        <TigerMascot
          mood={isMatch ? 'match' : roundType === 'CHAOS' ? 'chaos' : 'noMatch'}
          position="reveal"
          size="lg"
          showSpeech={true}
        />
      </div>

      {/* Big result text */}
      <div className="reveal-result">
        {isMatch ? 'MATCH!' : 'NO MATCH'}
      </div>

      {/* Live reaction / witty string */}
      {liveReaction && (
        <div className="reveal-live-reaction">
          "{liveReaction}"
        </div>
      )}

      {/* Player name labels */}
      {guestName && (
        <div className="reveal-names">
          <div className="reveal-name-tag">
            {hostName}
          </div>
          <div style={{ width: 24 }} />
          <div className="reveal-name-tag">
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

      {/* Prediction Outcome (If Prediction Round) */}
      {(hostPrediction || guestPrediction) && (
        <div className="reveal-predictions-card">
          <div className="reveal-predictions-title">🧠 MIND READER PREDICTIONS</div>
          <div className="reveal-predictions-row">
            <div className="reveal-pred-item">
              <span className="pred-who">{hostName} guessed:</span>
              <span className="pred-val">"{hostPrediction ?? '—'}"</span>
              <span className={`pred-status pred-status--${hostPredictionResult === 'CORRECT' ? 'correct' : 'wrong'}`}>
                {hostPredictionResult === 'CORRECT' ? '🎯 NAILED IT' : '❌ MISSED'}
              </span>
            </div>
            <div className="reveal-pred-item">
              <span className="pred-who">{guestName} guessed:</span>
              <span className="pred-val">"{guestPrediction ?? '—'}"</span>
              <span className={`pred-status pred-status--${guestPredictionResult === 'CORRECT' ? 'correct' : 'wrong'}`}>
                {guestPredictionResult === 'CORRECT' ? '🎯 NAILED IT' : '❌ MISSED'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Auto-advance notice */}
      <div className="reveal-next">Next round incoming…</div>
    </div>
  );
}
