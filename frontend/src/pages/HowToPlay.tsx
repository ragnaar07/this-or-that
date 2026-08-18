import { SynqLogo } from '../components/SynqLogo';
import { Footer } from '../components/Footer';

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
            2 Friends • 2 Options • Zero Talking • 100% Mind Sync
          </p>
          <div className="about-quote-box" style={{ marginTop: 12 }}>
            <strong>The Objective:</strong> Pick the exact same option as your friend at the same moment. The more choices you match, the higher your sync score!
          </div>
        </div>

        {/* Step-by-Step Cards */}
        <div className="about-cards-list">
          {/* Step 1: Create or Join */}
          <div className="howtoplay-step-card">
            <div className="step-number-badge">STEP 1</div>
            <h2 className="about-card-heading">🏠 Create or Join a Room</h2>
            <div className="howtoplay-subcard-grid">
              <div className="howtoplay-subcard">
                <div className="howtoplay-subcard-title">⚡ Player 1 (Host)</div>
                <p className="about-card-text">
                  Enter your name, pick your gender, and click <strong>CREATE ROOM</strong>. Share the 4-letter code or tap <strong>INVITE ON WHATSAPP</strong>!
                </p>
              </div>
              <div className="howtoplay-subcard">
                <div className="howtoplay-subcard-title">🎮 Player 2 (Guest)</div>
                <p className="about-card-text">
                  Tap <strong>JOIN ROOM</strong>, enter the 4-letter code along with your name & gender, and jump straight into the live match!
                </p>
              </div>
            </div>
          </div>

          {/* Step 2: 10s Instinct Rounds */}
          <div className="howtoplay-step-card">
            <div className="step-number-badge">STEP 2</div>
            <h2 className="about-card-heading">⏱️ Rapid 10s Instinct Rounds</h2>
            <p className="about-card-text">
              Both players get the exact same dilemma on their screen simultaneously. You have <strong>10 seconds</strong> to pick <strong>OPTION A</strong> or <strong>OPTION B</strong>.
            </p>
            <div className="howtoplay-sample-box">
              <div className="sample-q">"Roadside Tapri Chai vs Aesthetic Cafe Coffee?"</div>
              <div className="sample-options">
                <span className="sample-opt sample-opt--a">☕ Option A: Tapri Chai & Bun Maska</span>
                <span className="sample-opt sample-opt--b">🥐 Option B: Cafe Coffee & Croissant</span>
              </div>
            </div>
            <p className="about-card-text" style={{ marginTop: 8 }}>
              💡 <em>Your pick is kept top-secret until both of you lock in or time expires!</em>
            </p>
          </div>

          {/* Step 3: Deep Psychology Round */}
          <div className="howtoplay-step-card" style={{ borderColor: 'rgba(179, 77, 255, 0.5)' }}>
            <div className="step-number-badge" style={{ background: '#b34dff', color: '#fff' }}>
              STEP 3 (HIGH STAKES)
            </div>
            <h2 className="about-card-heading">🧠 Deep Psychology Round (Real Nature Test)</h2>
            <p className="about-card-text">
              When the screen turns purple with the <strong>Deep Psychology Splash</strong>, you enter a high-stakes <strong>18-second moral test</strong>:
            </p>
            <ul className="about-bullets">
              <li><strong>Raw Moral Dilemmas:</strong> Tough choices between friendship vs honesty, money vs ethics, and personal ambition vs loyalty.</li>
              <li><strong>True Nature Reveal:</strong> Tests whether your moral compass aligns with your friend or if you think completely differently!</li>
            </ul>
          </div>

          {/* Step 4: Mind Read Round */}
          <div className="howtoplay-step-card" style={{ borderColor: 'rgba(255, 62, 165, 0.5)' }}>
            <div className="step-number-badge step-number-badge--pred">
              STEP 4 (TELEPATHY)
            </div>
            <h2 className="about-card-heading">🔮 Mind Reader Prediction Rounds</h2>
            <p className="about-card-text">
              On special mind-reading rounds, test how well you actually know each other:
            </p>
            <ul className="about-bullets">
              <li><strong>Part 1 — The Guess:</strong> First, guess what your friend will choose! (<em>"What will Rahul pick?"</em>)</li>
              <li><strong>Part 2 — Your Own Pick:</strong> Then, pick your own answer!</li>
              <li><strong>The Reveal:</strong> If you guessed correctly, you score a bonus <strong>🎯 MIND READER</strong> badge!</li>
            </ul>
          </div>

          {/* Step 5: Streaks & Multipliers */}
          <div className="howtoplay-step-card">
            <div className="step-number-badge step-number-badge--chaos">STEP 5 (SCORING)</div>
            <h2 className="about-card-heading">🔥 Streaks, Multipliers & Live Mascot</h2>
            <ul className="about-bullets">
              <li><strong>⚡ MATCH (+1 Pt):</strong> Both picked the same option! Triggers celebrations & streak combos.</li>
              <li><strong>💀 NO MATCH (0 Pts):</strong> Different answers! Mascot gives funny live commentary on your clash.</li>
              <li><strong>🔥 2X DOUBLE POINTS (R15):</strong> High-stakes round where a match awards <strong>+2 points</strong>!</li>
              <li><strong>⚡ STREAK COMBO:</strong> Hitting 3+ matches in a row unlocks telepathic energy and custom tiger animations.</li>
            </ul>
          </div>

          {/* Step 6: Compatibility Report & Same-Room Rematch */}
          <div className="howtoplay-step-card">
            <div className="step-number-badge">STEP 6</div>
            <h2 className="about-card-heading">📊 Psychological Verdict & Instant Rematch</h2>
            <p className="about-card-text">
              At the end of the game, unlock your personalized chemistry report:
            </p>
            <ul className="about-bullets">
              <li><strong>🔥 Match Sync %:</strong> Exact compatibility score and instinct sync rating.</li>
              <li><strong>🧠 Real Nature Breakdown:</strong> Psychological archetypes and moral alignments.</li>
              <li><strong>🎭 Plot Contradictions:</strong> Hilarious contradictions discovered between your answers.</li>
              <li><strong>📸 1080×1350 Share Card:</strong> Generate & download a high-res story card for Instagram & WhatsApp!</li>
              <li><strong>🔄 Play Again Rematch:</strong> Tap <strong>"PLAY AGAIN"</strong> to restart in the exact same room instantly without re-typing codes!</li>
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

        {/* Global Credible Footer */}
        <Footer onOpenHowToPlay={() => {}} onOpenAbout={onBack} />
      </div>
    </div>
  );
}
