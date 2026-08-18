import { useState, useEffect } from 'react';
import { TigerMascot } from './TigerMascot';

interface MindReadSplashProps {
  opponentName: string;
  roundNumber: number;
  onComplete: () => void;
}

export function MindReadSplash({ opponentName, roundNumber, onComplete }: MindReadSplashProps) {
  const [countdown, setCountdown] = useState(3);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // 3.. 2.. 1.. sequence
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsExiting(true);
          setTimeout(onComplete, 400); // Allow exit animation to finish
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
      className={`mind-read-splash-overlay ${isExiting ? 'mind-read-splash-overlay--exiting' : ''}`}
      onClick={handleSkip}
      role="banner"
      aria-label="Mind Read Round starting"
    >
      {/* Background Ambient Psychic Rings & Glow */}
      <div className="psychic-aura-bg" />
      <div className="psychic-ring psychic-ring--1" />
      <div className="psychic-ring psychic-ring--2" />
      <div className="psychic-ring psychic-ring--3" />

      {/* Floating psychic particles */}
      <div className="psychic-particle p-1">🔮</div>
      <div className="psychic-particle p-2">⚡</div>
      <div className="psychic-particle p-3">🧠</div>
      <div className="psychic-particle p-4">✨</div>
      <div className="psychic-particle p-5">🎯</div>

      <div className="mind-read-splash-card">
        {/* Special Round Badge */}
        <div className="mind-read-pill">
          ROUND {roundNumber} • SPECIAL TELEPATHY EVENT
        </div>

        {/* Mascot in psychic mode */}
        <div className="mind-read-mascot-wrap">
          <div className="psychic-glow-halo" />
          <TigerMascot
            mood="curious"
            position="game"
            size="lg"
            showSpeech={false}
          />
        </div>

        {/* Big Impact Title */}
        <h1 className="mind-read-title">
          <span className="mind-read-emoji">🔮</span>
          <span className="mind-read-gradient-text">MIND READ</span>
          <span className="mind-read-subtext-title">ROUND</span>
        </h1>

        {/* Subtitle / Challenge */}
        <p className="mind-read-challenge">
          Can you read <strong>{opponentName}</strong>'s mind?
        </p>

        {/* 2-Step Guide */}
        <div className="mind-read-steps">
          <div className="mind-read-step-item">
            <span className="step-num">STEP 1</span>
            <span className="step-text">Tap what {opponentName} will pick 🤔</span>
          </div>
          <div className="mind-read-arrow">➔</div>
          <div className="mind-read-step-item">
            <span className="step-num">STEP 2</span>
            <span className="step-text">Tap your own real choice 🎯</span>
          </div>
        </div>

        <div className="mind-read-pro-tip">
          ✨ <em>Guess correctly to earn the <strong>Mind Reader</strong> bonus badge!</em>
        </div>

        {/* Dynamic Countdown Ring */}
        <div className="mind-read-countdown-box">
          <div className="mind-read-countdown-num">
            {countdown > 0 ? countdown : 'SYNC!'}
          </div>
          <div className="mind-read-countdown-label">
            {countdown > 0 ? 'STARTING IN...' : 'GET READY!'}
          </div>
        </div>

        <div className="mind-read-tap-hint">
          TAP ANYWHERE TO JUMP IN ⚡
        </div>
      </div>
    </div>
  );
}
