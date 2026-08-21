import { useState, useEffect, useCallback, useRef, type CSSProperties } from 'react';
import type { PlayerSession, RoomState } from '../types/game';
import { TigerMascot } from '../components/TigerMascot';
import { shareResultCard } from '../utils/generateResultCard';
import { api } from '../services/api';
import { usePolling } from '../hooks/usePolling';

interface ResultProps {
  session: PlayerSession;
  room: RoomState;
  onPlayAgain: (newRoom?: RoomState) => void;
  onGoHome: () => void;
}

interface AnimatedCompatibilityScoreProps {
  value: number;
}

const REMATCH_POLL_INTERVAL_MS = 800;
const REMATCH_WATCH_WINDOW_MS = 60_000;

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

function AnimatedCompatibilityScore({ value }: AnimatedCompatibilityScoreProps) {
  const scoreRef = useRef<HTMLDivElement | null>(null);
  const hasPlayedRef = useRef(false);
  const frameRef = useRef<number | null>(null);
  const [displayValue, setDisplayValue] = useState(0);
  const [payoff, setPayoff] = useState<'confetti' | 'shake' | null>(null);

  useEffect(() => {
    const node = scoreRef.current;
    if (!node) return;

    function startAnimation() {
      if (hasPlayedRef.current) return;
      hasPlayedRef.current = true;

      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        setDisplayValue(value);
        return;
      }

      const startedAt = performance.now();
      const duration = 1200;

      function tick(now: number) {
        const progress = Math.min(1, (now - startedAt) / duration);
        setDisplayValue(Math.round(value * easeOutCubic(progress)));

        if (progress < 1) {
          frameRef.current = window.requestAnimationFrame(tick);
          return;
        }

        setDisplayValue(value);
        if (value >= 70) {
          setPayoff('confetti');
          window.setTimeout(() => setPayoff(null), 1400);
        } else if (value < 20) {
          setPayoff('shake');
          window.setTimeout(() => setPayoff(null), 700);
        }
      }

      frameRef.current = window.requestAnimationFrame(tick);
    }

    if (!('IntersectionObserver' in window)) {
      startAnimation();
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          startAnimation();
          observer.disconnect();
        }
      },
      { threshold: 0.55 }
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, [value]);

  const confettiPieces = Array.from({ length: 22 }, (_, index) => {
    const style = {
      '--x': `${8 + ((index * 19) % 84)}%`,
      '--dx': `${((index % 7) - 3) * 18}px`,
      '--delay': `${(index % 6) * 32}ms`,
      '--rotate': `${(index * 37) % 180}deg`,
      '--color': ['#ec4899', '#7c3aed', '#00e5a0', '#fff176'][index % 4],
    } as CSSProperties;

    return <span key={index} className="compatibility-confetti__piece" style={style} />;
  });

  return (
    <div
      ref={scoreRef}
      className={`result-match-pill result-match-pill--animated${payoff === 'shake' ? ' result-match-pill--low-shake' : ''}`}
      aria-label={`${value}% compatibility`}
    >
      {payoff === 'confetti' && (
        <span className="compatibility-confetti" aria-hidden="true">
          {confettiPieces}
        </span>
      )}
      <span className="compatibility-score-number">{displayValue}%</span>
      <span className="compatibility-score-label">COMPATIBILITY</span>
    </div>
  );
}

export function Result({ session, room, onPlayAgain, onGoHome }: ResultProps) {
  const [toast, setToast] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRestarting, setIsRestarting] = useState(false);
  const [isCheckingRematch, setIsCheckingRematch] = useState(false);
  const [isWatchingForRematch, setIsWatchingForRematch] = useState(true);
  const [revealStep, setRevealStep] = useState<number>(1); // 1 to 5

  useEffect(() => {
    setIsWatchingForRematch(true);
    const timer = window.setTimeout(() => {
      setIsWatchingForRematch(false);
    }, REMATCH_WATCH_WINDOW_MS);

    return () => window.clearTimeout(timer);
  }, [session.roomCode, session.playerId]);

  // Poll room briefly on Result screen: if opponent restarts, transition both players immediately.
  const pollRoom = useCallback(async () => {
    try {
      const res = await api.pollRoom(session.roomCode, session.playerId, session.sessionId);
      if (res.error) {
        if (res.status === 409) {
          showToast(res.error);
          setIsWatchingForRematch(false);
        }
        return;
      }

      if (res.room && res.room.status === 'PLAYING' && res.room.roundNumber === 1 && !res.room.finalReport) {
        onPlayAgain(res.room);
      }
    } catch {}
  }, [session.roomCode, session.playerId, session.sessionId, onPlayAgain]);

  usePolling(pollRoom, REMATCH_POLL_INTERVAL_MS, isWatchingForRematch && !isRestarting);

  async function handlePlayAgain() {
    if (isRestarting) return;
    setIsRestarting(true);
    try {
      const res = await api.restartRoom(session.roomCode, session.playerId, session.sessionId);
      if (res.room) {
        onPlayAgain(res.room);
        return;
      }
      if (res.error) {
        showToast(res.error);
      }
    } catch (err) {
      console.error(err);
      showToast('Could not restart match. Try again.');
    } finally {
      setIsRestarting(false);
    }
  }

  const report = room.finalReport;
  const isInterrupted = room.status === 'INTERRUPTED' || (report && report.isPartial);

  const hostName = room.hostPlayerName || 'Player 1';
  const guestName = room.guestPlayerName || 'Player 2';

  const matchPct = report
    ? report.matchPercentage
    : room.total > 0
    ? Math.round((room.matches / room.total) * 100)
    : 0;
  const completed = report ? report.completedQuestions : room.total;
  const totalQuestions = report ? report.totalQuestions : room.totalRounds;
  const matches = room.matches;

  // Suspenseful auto-advance reveal timer
  useEffect(() => {
    if (revealStep < 5) {
      const timer = setTimeout(() => {
        setRevealStep((prev) => prev + 1);
      }, 1800);
      return () => clearTimeout(timer);
    }
  }, [revealStep]);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3200);
  }

  async function handleCheckRematch() {
    if (isCheckingRematch || isRestarting) return;

    setIsCheckingRematch(true);
    try {
      const res = await api.pollRoom(session.roomCode, session.playerId, session.sessionId);
      if (res.room && res.room.status === 'PLAYING' && res.room.roundNumber === 1 && !res.room.finalReport) {
        onPlayAgain(res.room);
        return;
      }
      showToast(res.error || 'No rematch yet.');
    } catch (err) {
      console.error(err);
      showToast('Could not check rematch. Try again.');
    } finally {
      setIsCheckingRematch(false);
    }
  }

  async function handleShare() {
    if (!report) return;
    setIsGenerating(true);
    try {
      const shared = await shareResultCard(report, hostName, guestName);
      if (shared) {
        showToast('Shared successfully! ⚡');
      } else {
        handleCopy();
      }
    } catch (err) {
      console.error(err);
      handleCopy();
    } finally {
      setIsGenerating(false);
    }
  }

  function handleCopy() {
    const text = `⚡ THIS ⚡ THAT — Match Result ⚡\n${hostName} × ${guestName}\nScore: ${matchPct}% MATCH RATE (${matches}/${completed} matched)\nHeadline: "${report?.headline || 'Same Brain, Different Chaos'}"\nPlay now: ${window.location.origin}`;
    navigator.clipboard.writeText(text);
    showToast('Result copied to clipboard! 📋');
  }

  async function handleShareApp() {
    const url = window.location.origin;
    const payload = {
      title: 'THIS ⚡ THAT',
      text: 'Play THIS ⚡ THAT with me.',
      url,
    };

    if (navigator.share) {
      try {
        await navigator.share(payload);
        return;
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return;
      }
    }

    await navigator.clipboard.writeText(url);
    showToast('App link copied! 🔗');
  }

  const resultActions = (
    <div className="result-actions result-actions--under-card">
      <button
        className="btn btn--pink"
        onClick={handlePlayAgain}
        disabled={isRestarting}
        id="play-again-btn"
      >
        {isRestarting ? '🔄 RESTARTING MATCH...' : '🔄 PLAY AGAIN (REMATCH)'}
      </button>

      {isWatchingForRematch ? (
        <div className="rematch-watch-status" aria-live="polite">
          AUTO-CHECKING FOR REMATCH
        </div>
      ) : (
        <button
          className="btn btn--secondary"
          onClick={handleCheckRematch}
          disabled={isCheckingRematch || isRestarting}
          id="check-rematch-btn"
        >
          {isCheckingRematch ? 'CHECKING...' : 'CHECK FOR REMATCH'}
        </button>
      )}

      <button
        className="btn btn--primary btn--share"
        onClick={handleShare}
        disabled={isGenerating || !report}
        id="share-result-btn"
      >
        📸 {isGenerating ? 'Generating...' : 'SHARE RESULT CARD'}
      </button>

      <button
        className="btn btn--secondary"
        onClick={onGoHome}
        id="result-home-btn"
      >
        🏠 GO HOME
      </button>
    </div>
  );
  return (
    <div className="app-wrapper">
      <div className="screen result-screen-container">
        {/* --- SUSPENSEFUL REVEAL INTRO SEQUENCE --- */}
        {revealStep < 5 && (
          <div className="reveal-intro-card">
            <div className="reveal-step-indicator">
              ANALYZING YOUR ANSWERS • STEP {revealStep} OF 4
            </div>

            {revealStep === 1 && (
              <div className="reveal-step-content reveal-step-1">
                <div className="reveal-step-emoji">👀</div>
                <div className="reveal-step-title">WE FOUND SOMETHING...</div>
                <div className="reveal-step-sub">Processing all your answer combinations…</div>
              </div>
            )}

            {revealStep === 2 && (
              <div className="reveal-step-content reveal-step-2">
                <div className="reveal-step-emoji">⚡</div>
                <div className="reveal-step-title">{hostName} × {guestName}</div>
                <div className="reveal-step-sub">Calculating mutual telepathy rate…</div>
              </div>
            )}

            {revealStep === 3 && (
              <div className="reveal-step-content reveal-step-3">
                <div className="reveal-step-emoji">🎯</div>
                <div className="reveal-step-title">{matchPct}% MATCH!</div>
                <div className="reveal-step-sub">"{report?.headline || 'SAME BRAIN, DIFFERENT CHAOS'}"</div>
              </div>
            )}

            {revealStep === 4 && (
              <div className="reveal-step-content reveal-step-4">
                <div className="reveal-step-emoji">😂</div>
                <div className="reveal-step-title">BUT HERE'S THE WEIRD PART...</div>
                <div className="reveal-step-sub">
                  {report?.surprisingPatterns?.[0] || report?.funniestDifference || 'Your choices took some wildly unexpected turns!'}
                </div>
              </div>
            )}

            <button
              className="btn btn--ghost reveal-skip-btn"
              onClick={() => setRevealStep(5)}
              id="skip-reveal-btn"
            >
              SKIP INTRO →
            </button>
          </div>
        )}

        {/* --- FULL REPORT VIEW --- */}
        {revealStep === 5 && (
          <>
            {/* Status Badge */}
            <div className={`result-badge ${isInterrupted || room.resultType === 'WIN_BY_DEFAULT' || room.status === 'ABANDONED' ? 'result-badge--interrupted' : 'result-badge--complete'}`}>
              {room.status === 'ABANDONED' || room.completionReason === 'BOTH_DISCONNECTED'
                ? 'MATCH ABANDONED / DRAW ⚠️'
                : room.resultType === 'WIN_BY_DEFAULT' || room.completionReason === 'PLAYER_DISCONNECTED' || room.completionReason === 'PLAYER_LEFT'
                ? (room.winnerPlayerId === session.playerId ? '🏆 YOU WON BY DEFAULT' : 'MATCH CONCLUDED ⚡')
                : isInterrupted
                ? 'GAME ENDED 👋'
                : 'GAME COMPLETE ⚡'}
            </div>

            {/* Default Win / Loss Banner */}
            {(room.resultType === 'WIN_BY_DEFAULT' || room.completionReason === 'PLAYER_DISCONNECTED' || room.completionReason === 'PLAYER_LEFT') && (
              <div className={`interrupted-banner ${room.winnerPlayerId === session.playerId ? 'default-win-banner' : ''}`}>
                <div className="interrupted-title">
                  {room.winnerPlayerId === session.playerId
                    ? `🏆 ${room.loserName || 'Opponent'} ${room.completionReason === 'PLAYER_LEFT' ? 'left the game' : 'disconnected'}. You win by default!`
                    : room.loserPlayerId === session.playerId
                    ? `⚠️ You ${room.completionReason === 'PLAYER_LEFT' ? 'left the match' : 'disconnected'}. ${room.winnerName || 'Opponent'} wins by default.`
                    : `🏆 ${room.winnerName || 'Winner'} wins by default.`}
                </div>
                <div className="interrupted-text">
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, opacity: 0.95, display: 'inline-block', marginTop: 4 }}>
                    Based on the {completed} of {totalQuestions} rounds completed before departure.
                  </span>
                </div>
              </div>
            )}

            {/* Abandoned / Double Disconnect Banner */}
            {(room.status === 'ABANDONED' || room.completionReason === 'BOTH_DISCONNECTED') && (
              <div className="interrupted-banner">
                <div className="interrupted-title">⚠️ MATCH ABANDONED (DRAW)</div>
                <div className="interrupted-text">
                  Both players lost connection before finishing the game.
                  <br />
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, opacity: 0.9, marginTop: 6, display: 'inline-block' }}>
                    Based on {completed} answered questions.
                  </span>
                </div>
              </div>
            )}

            {/* Standard Interrupted notice if not already shown above */}
            {isInterrupted && !room.resultType && room.status !== 'ABANDONED' && (
              <div className="interrupted-banner">
                <div className="interrupted-title">
                  {room.leftBy === 'both'
                    ? 'BOTH PLAYERS LEFT 👋'
                    : room.leftBy === session.role
                    ? 'YOU LEFT THE GAME 👋'
                    : 'YOUR OPPONENT LEFT 👋'}
                </div>
                <div className="interrupted-text">
                  {room.leftBy === 'both'
                    ? 'Both players left the match.'
                    : room.leftBy === session.role
                    ? 'Your current progress was saved.'
                    : "Let's see how similar you two actually were."}
                  <br />
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, opacity: 0.9, marginTop: 6, display: 'inline-block' }}>
                    Based on the {completed} of {totalQuestions} rounds you actually answered.
                  </span>
                </div>
              </div>
            )}

            <div className="result-dashboard">
              {/* Hero Score & Match Rate Card with Tiger Mascot */}
              <div className="result-hero-card result-hero-card--wide">
                <div className="result-hero-visual">
                  <div className="result-mascot-container">
                    <TigerMascot
                      mood={isInterrupted ? 'opponentLeft' : matchPct >= 80 ? 'resultHigh' : matchPct >= 50 ? 'resultMedium' : 'resultLow'}
                      position="result"
                      size="lg"
                      showSpeech={true}
                    />
                  </div>
                  <AnimatedCompatibilityScore value={matchPct} />
                </div>

                <div className="result-hero-summary">
                  <div className="result-matchup-names">
                    {hostName} <span className="result-matchup-cross">⚡</span> {guestName}
                  </div>
                  <div className="result-headline">
                    "{report?.headline || 'SAME BRAIN, DIFFERENT CHAOS'}"
                  </div>
                  <div className="result-vibe-tag">
                    Vibe: {report?.overallVibe || 'Cosmic Sync'}
                  </div>
                  <div className="result-score-sub">
                    <strong>{completed} ROUNDS PLAYED</strong> • <strong>{matches} MATCHES</strong> • <strong>{matchPct}% COMPATIBILITY</strong>
                  </div>
                </div>
              </div>

              <aside className="result-side-panel" aria-label="Result actions and quick facts">
                {resultActions}
                <div className="result-quick-facts">
                  <div className="result-quick-fact">
                    <span>Rounds</span>
                    <strong>{completed}/{totalQuestions}</strong>
                  </div>
                  <div className="result-quick-fact">
                    <span>Matches</span>
                    <strong>{matches}</strong>
                  </div>
                  <div className="result-quick-fact">
                    <span>Sync</span>
                    <strong>{matchPct}%</strong>
                  </div>
                </div>
              </aside>
            </div>

            <div className="result-highlight-grid">
              {/* Achievements Grid */}
              {report?.achievements && report.achievements.length > 0 && (
                <div className="result-card result-card--achievements">
                  <div className="result-card-title">🏆 ACHIEVEMENTS UNLOCKED</div>
                  <div className="achievements-grid">
                    {report.achievements.map((ach) => (
                      <div key={ach.id} className="achievement-item">
                        <div className="achievement-icon">{ach.icon}</div>
                        <div className="achievement-info">
                          <div className="achievement-title">{ach.title}</div>
                          <div className="achievement-desc">{ach.description}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Mind Reader Score Card */}
              {report?.predictionScore && (
                <div className="result-card result-card--mindreader">
                  <div className="result-card-title">🧠 MIND READER SCORE</div>
                  <div className="mindreader-score-pill">
                    {report.predictionScore.hostName}: <strong>{report.predictionScore.hostCorrect}/{report.predictionScore.totalPredictions}</strong>
                    <span style={{ margin: '0 8px', opacity: 0.5 }}>|</span>
                    {report.predictionScore.guestName}: <strong>{report.predictionScore.guestCorrect}/{report.predictionScore.totalPredictions}</strong>
                  </div>
                  <div className="mindreader-summary">
                    {report.predictionScore.summary}
                  </div>
                </div>
              )}

              {/* Instinct vs Strategy Comparison Card */}
              {(report?.instinctMatchPercentage !== undefined || report?.strategicMatchPercentage !== undefined) && (
                <div className="result-card result-card--instinct">
                  <div className="result-card-title">⚡ FAST INSTINCT VS 🧠 DEEP STRATEGY</div>
                  <div className="instinct-strategy-grid">
                    <div className="instinct-stat-box">
                      <div className="instinct-stat-label">⚡ 10s Quick Picks</div>
                      <div className="instinct-stat-val">{report?.instinctMatchPercentage ?? matchPct}%</div>
                    </div>
                    <div className="instinct-stat-box instinct-stat-box--strategy">
                      <div className="instinct-stat-label">🧠 16s Situational</div>
                      <div className="instinct-stat-val">{report?.strategicMatchPercentage ?? matchPct}%</div>
                    </div>
                  </div>
                  {report?.instinctVsStrategyInsight && (
                    <div className="instinct-strategy-insight">
                      {report.instinctVsStrategyInsight}
                    </div>
                  )}
                </div>
              )}

              {/* Category Breakdown */}
              {report?.categoryScores && report.categoryScores.length > 0 && (
                <div className="result-card result-card--categories">
                  <div className="result-card-title">📊 CATEGORY BREAKDOWN</div>
                  <div className="result-card-subtitle">How your sync varied by topic:</div>
                  <div className="category-bars-list">
                    {report.categoryScores.map((cat, idx) => (
                      <div key={idx} className="category-bar-item">
                        <div className="category-bar-label-row">
                          <span className="category-bar-name">{cat.category}</span>
                          <span className="category-bar-pct">{cat.matchPercentage}%</span>
                        </div>
                        <div className="category-bar-track">
                          <div
                            className="category-bar-fill"
                            style={{
                              width: `${cat.matchPercentage}%`,
                              backgroundColor:
                                cat.matchPercentage >= 75
                                  ? 'var(--color-match)'
                                  : cat.matchPercentage >= 40
                                  ? 'var(--color-pink)'
                                  : 'var(--color-nomatch)',
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* AI Breakdown Sections */}
            {report && (
              <div className="result-sections">
                {/* Same Brain */}
                {report.strongestMatches && report.strongestMatches.length > 0 && (
                  <div className="result-card result-card--match">
                    <div className="result-card-title">⚡ WHAT YOU AGREED ON</div>
                    <div className="result-card-subtitle">Where you two think 100% alike:</div>
                    <ul className="result-list">
                      {report.strongestMatches.map((m, idx) => (
                        <li key={idx}>• {m}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Opposite Energy */}
                {report.biggestDifferences && report.biggestDifferences.length > 0 && (
                  <div className="result-card result-card--diff">
                    <div className="result-card-title">⚡ WHAT YOU DISAGREED ON</div>
                    <div className="result-card-subtitle">Where your instincts clashed:</div>
                    <ul className="result-list">
                      {report.biggestDifferences.map((d, idx) => (
                        <li key={idx}>• {d}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Surprising Patterns */}
                {report.surprisingPatterns && report.surprisingPatterns.length > 0 && (
                  <div className="result-card result-card--patterns">
                    <div className="result-card-title">🔍 BIGGEST SURPRISE / HIDDEN PATTERNS</div>
                    <ul className="result-list">
                      {report.surprisingPatterns.map((p, idx) => (
                        <li key={idx}>💡 {p}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Contradictions */}
                {report.contradictions && report.contradictions.length > 0 && (
                  <div className="result-card result-card--contradiction">
                    <div className="result-card-title">🎭 PLOT CONTRADICTIONS</div>
                    <ul className="result-list">
                      {report.contradictions.map((c, idx) => (
                        <li key={idx}>😂 {c}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Plot Twist */}
                {report.mostUnexpectedMatch && (
                  <div className="result-card result-card--twist">
                    <div className="result-card-title">🌀 PLOT TWIST</div>
                    <div className="result-card-content">{report.mostUnexpectedMatch}</div>
                  </div>
                )}

                {/* Chaos Award */}
                {report.funniestDifference && (
                  <div className="result-card result-card--chaos">
                    <div className="result-card-title">😂 FUNNIEST DIFFERENCE</div>
                    <div className="result-card-content">"{report.funniestDifference}"</div>
                  </div>
                )}

                {/* Conversation Starters */}
                {report.conversationStarters && report.conversationStarters.length > 0 && (
                  <div className="result-card result-card--talk">
                    <div className="result-card-title">💬 YOU TWO SHOULD TALK ABOUT THIS</div>
                    <ul className="result-list">
                      {report.conversationStarters.map((q, idx) => (
                        <li key={idx}>👉 {q}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Real Nature & Deep Psychology Insight */}
                {report.realNatureInsight && (
                  <div className="result-card result-card--real-nature">
                    <div className="result-card-title">🧠 REAL NATURE & MORAL COMPASS</div>
                    <div className="result-card-content">{report.realNatureInsight}</div>
                  </div>
                )}

                {/* Final Verdict */}
                {report.finalVerdict && (
                  <div className="result-card result-card--verdict">
                    <div className="result-card-title">🔮 THE FINAL VERDICT</div>
                    <div className="result-card-content">{report.finalVerdict}</div>
                    {(report.player1Insight || report.player2Insight || report.player1Profile || report.player2Profile) && (
                      <div className="result-profiles">
                        <p>
                          <strong>
                            {report.player1Gender === 'female' ? '👩' : report.player1Gender === 'male' ? '👨' : '⚡'}{' '}
                            {hostName}:
                          </strong>{' '}
                          {report.player1Insight || report.player1Profile}
                        </p>
                        <p>
                          <strong>
                            {report.player2Gender === 'female' ? '👩' : report.player2Gender === 'male' ? '👨' : '⚡'}{' '}
                            {guestName}:
                          </strong>{' '}
                          {report.player2Insight || report.player2Profile}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="home-footer result-share-footer">
              <button
                className="footer-about-link"
                onClick={handleShareApp}
                id="result-share-app-link"
              >
                🔗 <strong>Share App</strong>
              </button>
            </div>

          </>
        )}

        {/* Toast feedback */}
        {toast && <div className="toast-notification">{toast}</div>}
      </div>
    </div>
  );
}
