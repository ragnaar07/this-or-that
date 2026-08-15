import { useState, useEffect } from 'react';
import type { PlayerSession, RoomState } from '../types/game';
import { Brand } from '../components/Brand';
import { downloadResultCard, shareResultCard } from '../utils/generateResultCard';

interface ResultProps {
  session: PlayerSession;
  room: RoomState;
  onPlayAgain: (selectedMode?: string) => void;
}

export function Result({ room, onPlayAgain }: ResultProps) {
  const [toast, setToast] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [revealStep, setRevealStep] = useState<number>(1); // 1 to 5
  const [selectedPlayMode, setSelectedPlayMode] = useState<string>('RANDOM');
  const [showModePicker, setShowModePicker] = useState(false);

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

  async function handleDownload() {
    if (!report) return;
    setIsGenerating(true);
    try {
      await downloadResultCard(report, hostName, guestName);
      showToast('Image downloaded! 📸');
    } catch (err) {
      console.error(err);
      showToast('Could not download image.');
    } finally {
      setIsGenerating(false);
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

  function handleWhatsApp() {
    const text = `⚡ *THIS ⚡ THAT — MATCH RESULT* ⚡\n\n*${hostName}* × *${guestName}*\n🔥 *${matchPct}% MATCH RATE*!\n"${report?.headline || 'SAME BRAIN, DIFFERENT CHAOS'}"\n\nScore: ${matches}/${completed} Questions Matched\n\nPlay with me: ${window.location.origin}`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  }

  function handleChallenge() {
    const text = `🎯 *THIS ⚡ THAT CHALLENGE!*\n\n*${hostName}* scored *${matchPct}%* with *${guestName}* on THIS ⚡ THAT!\nThink you know me better?\n\n👉 Test your telepathy with me now: ${window.location.origin}`;
    navigator.clipboard.writeText(text);
    showToast('Challenge copied! Paste on WhatsApp / Stories 🎯');
  }

  function handleCopy() {
    const text = `⚡ THIS ⚡ THAT — Match Result ⚡\n${hostName} × ${guestName}\nScore: ${matchPct}% MATCH RATE (${matches}/${completed} matched)\nHeadline: "${report?.headline || 'Same Brain, Different Chaos'}"\nPlay now: ${window.location.origin}`;
    navigator.clipboard.writeText(text);
    showToast('Result copied to clipboard! 📋');
  }

  const GAME_MODES = [
    { id: 'RANDOM', label: '🎲 RANDOM MIX', desc: 'Surprise mix of everything' },
    { id: 'INDIA', label: '🇮🇳 INDIA FIRST', desc: 'Everyday desi quirks & habits' },
    { id: 'ENTERTAINMENT', label: '🎬 BOLLYWOOD & OTT', desc: 'Cinema, cricket, music & memes' },
    { id: 'FOOD', label: '🍜 FOOD & CHAI', desc: 'Street food, biryani & late-night' },
    { id: 'CHAOS', label: '😂 CHAOS & DEALS', desc: 'Wild dilemmas & superpowers' },
    { id: 'DEEP', label: '🧠 DEEP & VALUES', desc: 'Friendship, money & life choices' },
  ];

  return (
    <div className="app-wrapper">
      <div className="screen result-screen-container">
        <Brand />

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
            <div className={`result-badge ${isInterrupted ? 'result-badge--interrupted' : 'result-badge--complete'}`}>
              {isInterrupted ? 'PARTIAL GAME RESULT 🛸' : 'GAME COMPLETE ⚡'}
            </div>

            {/* Interrupted notice */}
            {isInterrupted && (
              <div className="interrupted-banner">
                <div className="interrupted-title">OPPONENT LEFT THE ROOM 👋</div>
                <div className="interrupted-text">
                  {room.interruptedReason || `Looks like someone escaped before the final verdict! 😂`}
                  <br />
                  <span style={{ fontSize: '0.78rem', opacity: 0.85, marginTop: 4, display: 'inline-block' }}>
                    Based on the {completed} of {totalQuestions} questions you both answered.
                  </span>
                </div>
              </div>
            )}

            {/* Hero Score & Match Rate Card */}
            <div className="result-hero-card">
              <div className="result-matchup-names">
                {hostName} <span className="result-matchup-cross">×</span> {guestName}
              </div>
              <div className="result-match-pill">
                {matchPct}% MATCH
              </div>
              <div className="result-headline">
                "{report?.headline || 'SAME BRAIN, DIFFERENT CHAOS'}"
              </div>
              <div className="result-vibe-tag">
                Vibe: {report?.overallVibe || 'Cosmic Sync'}
              </div>
              <div className="result-score-sub">
                {matches} / {completed} QUESTIONS MATCHED {isInterrupted ? `(${completed}/${totalQuestions} COMPLETED)` : ''}
              </div>
            </div>

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

            {/* AI Breakdown Sections */}
            {report && (
              <div className="result-sections">
                {/* Same Brain */}
                {report.strongestMatches && report.strongestMatches.length > 0 && (
                  <div className="result-card result-card--match">
                    <div className="result-card-title">⚡ SAME BRAIN</div>
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
                    <div className="result-card-title">⚡ OPPOSITE ENERGY</div>
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
                    <div className="result-card-title">🔍 YOUR HIDDEN PATTERNS</div>
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
                    <div className="result-card-title">😂 CHAOS AWARD</div>
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

                {/* Final Verdict */}
                {report.finalVerdict && (
                  <div className="result-card result-card--verdict">
                    <div className="result-card-title">🔮 THE FINAL VERDICT</div>
                    <div className="result-card-content">{report.finalVerdict}</div>
                    {(report.player1Insight || report.player2Insight || report.player1Profile || report.player2Profile) && (
                      <div className="result-profiles">
                        <p><strong>{hostName}:</strong> {report.player1Insight || report.player1Profile}</p>
                        <p><strong>{guestName}:</strong> {report.player2Insight || report.player2Profile}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons & Challenge */}
            <div className="result-actions">
              <button
                className="btn btn--primary btn--share"
                onClick={handleShare}
                disabled={isGenerating || !report}
                id="share-result-btn"
              >
                📸 {isGenerating ? 'Generating...' : 'SHARE RESULT CARD'}
              </button>

              <button
                className="btn btn--challenge"
                onClick={handleChallenge}
                id="challenge-friend-btn"
              >
                🎯 CHALLENGE A FRIEND
              </button>

              <button
                className="btn btn--secondary"
                onClick={handleDownload}
                disabled={isGenerating || !report}
                id="download-result-btn"
              >
                ⬇ DOWNLOAD RESULT (PNG)
              </button>

              <button
                className="btn btn--whatsapp"
                onClick={handleWhatsApp}
                id="whatsapp-share-btn"
              >
                💬 SHARE ON WHATSAPP
              </button>

              <button
                className="btn btn--ghost"
                onClick={handleCopy}
                id="copy-result-btn"
              >
                🔗 COPY RESULT TEXT
              </button>

              {/* Play Again with Mode Selector */}
              <div className="play-again-box">
                <button
                  className="btn btn--pink"
                  onClick={() => setShowModePicker(!showModePicker)}
                  id="play-again-mode-toggle"
                >
                  🔄 PLAY AGAIN {showModePicker ? '▲' : '▼'}
                </button>

                {showModePicker && (
                  <div className="mode-picker-modal">
                    <div className="mode-picker-title">CHOOSE NEXT GAME THEME:</div>
                    <div className="mode-chips-grid">
                      {GAME_MODES.map((m) => (
                        <button
                          key={m.id}
                          className={`mode-chip ${selectedPlayMode === m.id ? 'mode-chip--active' : ''}`}
                          onClick={() => {
                            setSelectedPlayMode(m.id);
                            onPlayAgain(m.id);
                          }}
                        >
                          <div className="mode-chip-name">{m.label}</div>
                          <div className="mode-chip-desc">{m.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Toast feedback */}
        {toast && <div className="toast-notification">{toast}</div>}
      </div>
    </div>
  );
}
