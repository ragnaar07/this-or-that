import { useState } from 'react';
import type { PlayerSession, RoomState } from '../types/game';
import { Brand } from '../components/Brand';
import { downloadResultCard, shareResultCard } from '../utils/generateResultCard';

interface ResultProps {
  session: PlayerSession;
  room: RoomState;
  onPlayAgain: () => void;
}

export function Result({ room, onPlayAgain }: ResultProps) {
  const [toast, setToast] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const report = room.finalReport;
  const isInterrupted = room.status === 'INTERRUPTED' || (report && report.isPartial);

  const hostName = room.hostPlayerName;
  const guestName = room.guestPlayerName || 'Opponent';

  const matchPct = report ? report.matchPercentage : (room.total > 0 ? Math.round((room.matches / room.total) * 100) : 0);
  const completed = report ? report.completedQuestions : room.total;
  const matches = room.matches;

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
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
        // Fallback: Copy to clipboard if Web Share unsupported
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
    const text = `⚡ *THIS ⚡ THAT MATCH RESULT* ⚡\n\n*${hostName}* & *${guestName}* matched *${matchPct}%*!\nHeadline: "${report?.headline || 'SAME BRAIN, DIFFERENT CHAOS'}"\nScore: ${matches}/${completed} Questions Matched\n\nPlay the game with me: ${window.location.origin}`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  }

  function handleCopy() {
    const text = `⚡ THIS ⚡ THAT — Match Result ⚡\n${hostName} & ${guestName} scored ${matchPct}% MATCH RATE!\n"${report?.headline || 'Same Brain, Different Chaos'}"\nScore: ${matches}/${completed} Matched\nPlay now: ${window.location.origin}`;
    navigator.clipboard.writeText(text);
    showToast('Result copied to clipboard! 📋');
  }

  return (
    <div className="app-wrapper">
      <div className="screen result-screen-container">
        <Brand />

        {/* Status Badge */}
        <div className={`result-badge ${isInterrupted ? 'result-badge--interrupted' : 'result-badge--complete'}`}>
          {isInterrupted ? 'PARTIAL GAME RESULT 🛸' : 'GAME COMPLETE ⚡'}
        </div>

        {/* Interrupted notice */}
        {isInterrupted && (
          <div className="interrupted-banner">
            <div className="interrupted-title">YOUR OPPONENT LEFT 👋</div>
            <div className="interrupted-text">
              Looks like they escaped before we discovered how much you two actually agree! 😂
            </div>
          </div>
        )}

        {/* Score & Match Rate Card */}
        <div className="result-hero-card">
          <div className="result-match-pill">
            {matchPct}% MATCH RATE
          </div>
          <div className="result-headline">
            {report?.headline || 'SAME BRAIN, DIFFERENT CHAOS'}
          </div>
          <div className="result-vibe-tag">
            Vibe: {report?.overallVibe || 'Cosmic Sync'}
          </div>
          <div className="result-score-sub">
            {matches} / {completed} QUESTIONS MATCHED
          </div>
        </div>

        {/* AI Breakdown Sections */}
        {report && (
          <div className="result-sections">
            {/* Same Brain */}
            {report.strongestMatches.length > 0 && (
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
            {report.biggestDifferences.length > 0 && (
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
            {report.conversationStarters.length > 0 && (
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
                <div className="result-card-title">🔮 THE FINAL VIBE</div>
                <div className="result-card-content">{report.finalVerdict}</div>
                <div className="result-profiles">
                  <p><strong>{hostName}:</strong> {report.player1Profile}</p>
                  <p><strong>{guestName}:</strong> {report.player2Profile}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="result-actions">
          <button
            className="btn btn--primary btn--share"
            onClick={handleShare}
            disabled={isGenerating || !report}
          >
            📸 {isGenerating ? 'Generating...' : 'SHARE RESULT'}
          </button>

          <button
            className="btn btn--secondary"
            onClick={handleDownload}
            disabled={isGenerating || !report}
          >
            ⬇ DOWNLOAD RESULT CARD (PNG)
          </button>

          <button
            className="btn btn--whatsapp"
            onClick={handleWhatsApp}
          >
            💬 SHARE ON WHATSAPP
          </button>

          <button
            className="btn btn--ghost"
            onClick={handleCopy}
          >
            🔗 COPY RESULT TEXT
          </button>

          <button
            className="btn btn--secondary"
            onClick={onPlayAgain}
            style={{ marginTop: 12 }}
          >
            🔄 PLAY AGAIN / HOME
          </button>
        </div>

        {/* Toast feedback */}
        {toast && <div className="toast-notification">{toast}</div>}
      </div>
    </div>
  );
}
