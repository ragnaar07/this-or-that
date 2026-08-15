import { SynqLogo } from '../components/SynqLogo';

interface HowToPlayProps {
  onBack: () => void;
}

export function HowToPlay({ onBack }: HowToPlayProps) {
  return (
    <div className="app-wrapper">
      <div className="screen howtoplay-screen-container">
        {/* Top bar with back button */}
        <div className="about-header-bar">
          <button
            className="btn-back-pill"
            onClick={onBack}
            aria-label="Back to home"
            id="howtoplay-back-btn"
          >
            ← BACK
          </button>
          <div className="about-header-tag">HOW TO PLAY 🎮</div>
        </div>

        {/* Hero Card */}
        <div className="about-hero-card">
          <SynqLogo size="md" showText={true} />
          <h1 className="about-hero-title">
            HOW TO PLAY <span style={{ color: 'var(--color-pink)' }}>⚡</span>
          </h1>
          <p className="about-hero-tagline">
            2 Players • 2 Choices • 10 Seconds • Pure Mind Sync
          </p>
        </div>

        {/* Step-by-Step Cards */}
        <div className="about-cards-list">
          {/* Step 1: Create or Join Room */}
          <div className="howtoplay-step-card">
            <div className="step-number-badge">STEP 1</div>
            <h2 className="about-card-heading">🏠 Create or Join a Room</h2>
            <p className="about-card-text">
              <strong>Player 1 (Host):</strong> Enter your name or nickname and click <strong>⚡ CREATE A ROOM</strong>. You will receive a unique 4-character Room Code (e.g. <code>XY9Z</code>). Share this code with your friend.
            </p>
            <p className="about-card-text" style={{ marginTop: 6 }}>
              <strong>Player 2 (Guest):</strong> Enter your name, type the 4-letter Room Code, and click <strong>JOIN ROOM</strong>. The game starts immediately in sync!
            </p>
          </div>

          {/* Step 2: 10-Second Choice */}
          <div className="howtoplay-step-card">
            <div className="step-number-badge">STEP 2</div>
            <h2 className="about-card-heading">⏱️ 10-Second Adrenaline Timer</h2>
            <p className="about-card-text">
              Both players see the exact same question simultaneously on their phones. You have <strong>10 seconds</strong> to pick <strong>OPTION A</strong> or <strong>OPTION B</strong>.
            </p>
            <div className="howtoplay-sample-box">
              <div className="sample-q">"Tapri Chai vs Cafe Coffee?"</div>
              <div className="sample-options">
                <span className="sample-opt sample-opt--a">Option A: Roadside Tapri Chai</span>
                <span className="sample-opt sample-opt--b">Option B: Aesthetic Cafe Coffee</span>
              </div>
            </div>
            <p className="about-card-text" style={{ marginTop: 8 }}>
              Your choice stays secret until your friend also picks or time runs out!
            </p>
          </div>

          {/* Step 3: Prediction Rounds */}
          <div className="howtoplay-step-card">
            <div className="step-number-badge step-number-badge--pred">STEP 3 (SPECIAL)</div>
            <h2 className="about-card-heading">🧠 Mind Reader Prediction Rounds</h2>
            <p className="about-card-text">
              In special prediction rounds (Rounds 10 & 19):
            </p>
            <ul className="about-bullets">
              <li><strong>Step 1:</strong> First, guess what your friend will choose! (<em>"What will Rahul pick?"</em>)</li>
              <li><strong>Step 2:</strong> Then, pick your own answer!</li>
            </ul>
            <p className="about-card-text" style={{ marginTop: 6 }}>
              At the reveal, see if you scored <strong>🎯 MIND READER</strong> or <strong>❌ YOU THOUGHT YOU KNEW THEM 😂</strong>!
            </p>
          </div>

          {/* Step 4: Instant Match Reveal */}
          <div className="howtoplay-step-card">
            <div className="step-number-badge">STEP 4</div>
            <h2 className="about-card-heading">⚡ Match / No Match Live Reveal</h2>
            <p className="about-card-text">
              Once both players lock in:
            </p>
            <ul className="about-bullets">
              <li><strong>⚡ MATCH (SAME BRAIN!):</strong> If you both pick the exact same option, your score increases!</li>
              <li><strong>💀 NO MATCH (OPPOSITE ENERGY):</strong> If choices differ, discover where your tastes clash!</li>
              <li>Streaks unlock dynamic live commentary and reaction phrases on screen.</li>
            </ul>
          </div>

          {/* Step 5: Special Chaos & Double Points */}
          <div className="howtoplay-step-card">
            <div className="step-number-badge step-number-badge--chaos">STEP 5 (TWISTS)</div>
            <h2 className="about-card-heading">⚠️ Chaos & 🔥 Double Points Rounds</h2>
            <ul className="about-bullets">
              <li><strong>Round 9 (⚠️ CHAOS ROUND):</strong> Absurd superpower & wild life dilemmas (e.g. ₹10 crore no internet for 1 year).</li>
              <li><strong>Round 15 (🔥 DOUBLE POINTS):</strong> Matching on this high-stakes round awards <strong>+2 points</strong> to your score!</li>
            </ul>
          </div>

          {/* Step 6: AI Report & Social Sharing */}
          <div className="howtoplay-step-card">
            <div className="step-number-badge">STEP 6</div>
            <h2 className="about-card-heading">🔮 AI Breakdown & Social Share Cards</h2>
            <p className="about-card-text">
              At the end of 20 rounds (or if interrupted midway):
            </p>
            <ul className="about-bullets">
              <li><strong>📊 Category Match Rates:</strong> See how you synced on Food, Cinema, Travel, and Life.</li>
              <li><strong>🏆 Achievements Unlocked:</strong> Earn badges like <em>🍜 Food Soulmates</em>, <em>🎬 Cinema Twins</em>, or <em>😂 Chaos Partners</em>.</li>
              <li><strong>🎭 Plot Contradictions:</strong> Laugh at funny contradictory answer patterns detected by the AI.</li>
              <li><strong>📸 1080×1350 PNG Card:</strong> Download or share directly on WhatsApp & Instagram Stories to challenge other friends!</li>
            </ul>
          </div>
        </div>

        {/* CTA Button */}
        <div className="about-cta-container">
          <button
            className="btn btn--pink"
            onClick={onBack}
            id="howtoplay-play-cta-btn"
          >
            ⚡ START PLAYING NOW
          </button>
        </div>
      </div>
    </div>
  );
}
