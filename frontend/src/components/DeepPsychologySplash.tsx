import { useState, useEffect } from 'react';
import { TigerMascot } from './TigerMascot';

interface DeepPsychologySplashProps {
  roundNumber: number;
  onComplete: () => void;
}

export function DeepPsychologySplash({ roundNumber, onComplete }: DeepPsychologySplashProps) {
  const [countdown, setCountdown] = useState(3);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsExiting(true);
          setTimeout(onComplete, 400);
          return 0;
        }
        return prev - 1;
      });
    }, 850);

    return () => clearInterval(interval);
  }, [onComplete]);

  function handleSkip() {
    setIsExiting(true);
    setTimeout(onComplete, 250);
  }

  return (
    <div
      className={`deep-psychology-splash-overlay ${isExiting ? 'deep-psychology-splash-overlay--exiting' : ''}`}
      onClick={handleSkip}
      role="banner"
      aria-label="Deep Psychology Round starting"
    >
      {/* Background Mystic Aura & Waves */}
      <div className="psycho-aura-bg" />
      <div className="psycho-ring psycho-ring--1" />
      <div className="psycho-ring psycho-ring--2" />
      <div className="psycho-ring psycho-ring--3" />

      {/* Floating psychic symbols */}
      <div className="psycho-particle pp-1">🧠</div>
      <div className="psycho-particle pp-2">⚖️</div>
      <div className="psycho-particle pp-3">👁️</div>
      <div className="psycho-particle pp-4">⚡</div>
      <div className="psycho-particle pp-5">🔍</div>

      <div className="deep-psychology-splash-card">
        {/* Special Round Badge */}
        <div className="deep-psychology-pill">
          ROUND {roundNumber} • UNFILTERED REAL NATURE TEST
        </div>

        {/* Mascot */}
        <div className="psycho-mascot-wrap">
          <div className="psycho-glow-halo" />
          <TigerMascot
            mood="curious"
            position="game"
            size="lg"
            showSpeech={false}
          />
        </div>

        {/* Big Impact Title */}
        <h1 className="psycho-title">
          <span className="psycho-emoji">🧠</span>
          <span className="psycho-gradient-text">DEEP PSYCHOLOGY</span>
          <span className="psycho-subtext-title">ROUND</span>
        </h1>

        {/* Subtitle / Challenge */}
        <p className="psycho-challenge">
          Reveal your <strong>authentic human nature</strong> & true moral compass!
        </p>

        {/* Feature Points */}
        <div className="psycho-features">
          <div className="psycho-feat-item">
            <span>⚖️</span>
            <span>Raw Dilemmas</span>
          </div>
          <div className="psycho-feat-item">
            <span>👁️</span>
            <span>No Filters</span>
          </div>
          <div className="psycho-feat-item">
            <span>🧬</span>
            <span>True Archetype</span>
          </div>
        </div>

        {/* Countdown Box */}
        <div className="psycho-countdown-box">
          <div className="psycho-countdown-num">
            {countdown > 0 ? countdown : '⚡'}
          </div>
          <span className="psycho-countdown-label">
            {countdown > 0 ? 'TRUTH TEST STARTING...' : 'GET READY!'}
          </span>
        </div>

        <button
          className="psycho-skip-btn"
          onClick={(e) => {
            e.stopPropagation();
            handleSkip();
          }}
        >
          TAP ANYWHERE TO SKIP ➔
        </button>
      </div>
    </div>
  );
}
