import { SynqLogo } from '../components/SynqLogo';

interface AboutProps {
  onBack: () => void;
}

export function About({ onBack }: AboutProps) {
  return (
    <div className="app-wrapper">
      <div className="screen about-screen-container">
        {/* Top bar with back button */}
        <div className="about-header-bar">
          <button
            className="btn-back-pill"
            onClick={onBack}
            aria-label="Back to home"
            id="about-back-btn"
          >
            ← BACK
          </button>
          <div className="about-header-tag">ABOUT THIS ⚡ THAT</div>
        </div>

        {/* Hero Section */}
        <div className="about-hero-card">
          <SynqLogo size="lg" showText={true} />
          <h1 className="about-hero-title">
            THIS <span style={{ color: 'var(--color-pink)' }}>⚡</span> THAT
          </h1>
          <p className="about-hero-tagline">
            India's AI-Powered Multiplayer Chemistry & Synchronization Game
          </p>
          <div className="about-quote-box">
            "A game that starts with two simple choices, but by the end makes you say:
            <br />
            <strong>'BRO... HOW DID THIS GAME KNOW THAT?!' 😂</strong>"
          </div>
        </div>

        {/* Feature Grid / Cards */}
        <div className="about-cards-list">
          {/* Card 1: AI Question Engine */}
          <div className="about-feature-card">
            <div className="about-card-badge badge--pink">⚡ NO FIXED QUESTIONS</div>
            <h2 className="about-card-heading">Real-Time Google Gemini AI Engine</h2>
            <p className="about-card-text">
              Unlike ordinary quiz apps with static, repetitive databases, <strong>THIS ⚡ THAT</strong> generates fresh, dynamic, and unpredictable choices on the fly for every single round. You will virtually never see the same game twice.
            </p>
            <div className="about-pill-row">
              <span className="about-sub-pill">Dynamic 4-Tier Curve</span>
              <span className="about-sub-pill">Real-time Prompting</span>
              <span className="about-sub-pill">Zero Repetition</span>
            </div>
          </div>

          {/* Card 2: India-First Culture */}
          <div className="about-feature-card">
            <div className="about-card-badge badge--violet">🇮🇳 INDIA-FIRST & ULTRA RELATABLE</div>
            <h2 className="about-card-heading">Crafted for Metros, Tier-2 & Tier-3 Cities</h2>
            <p className="about-card-text">
              Built from the ground up for diverse Indian lifestyles — exploring everyday relatable quirks without lazy stereotypes:
            </p>
            <ul className="about-bullets">
              <li><strong>Food & Chai:</strong> Tapri chai vs cafe coffee, late-night Maggi vs Swiggy, biryani preferences.</li>
              <li><strong>Social Quirks:</strong> Shaadi dance floor vs food corner, "5 min mein aa raha hoon" mental math.</li>
              <li><strong>Digital Habits:</strong> 3-min voice notes vs "text kar", UPI processing panic, 2 AM reel spirals.</li>
              <li><strong>Life & Ambition:</strong> PG vs home comfort, Goa squad trip vs solo Himachal trek, saving vs luxury travel.</li>
            </ul>
          </div>

          {/* Card 3: Grounded AI Insights */}
          <div className="about-feature-card">
            <div className="about-card-badge badge--mint">🧠 GROUNDED ENTERTAINMENT INSIGHTS</div>
            <h2 className="about-card-heading">Real Behavioral Patterns, Not Horoscopes</h2>
            <p className="about-card-text">
              Our analysis engine evaluates mathematical category sync rates, identifies hilarious contradictions (e.g. <em>preferring to save money but picking 5-star luxury trips</em>), and awards playful titles like the <strong>Chaos Award 😂</strong> and <strong>Same Brain Highlights</strong>.
            </p>
          </div>

          {/* Card 4: Multiplayer & Adrenaline Timer */}
          <div className="about-feature-card">
            <div className="about-card-badge badge--gold">⏱️ 10-SECOND ADRENALINE SYNC</div>
            <h2 className="about-card-heading">Server-Authoritative Realtime Play</h2>
            <p className="about-card-text">
              Both players get a synchronized 10-second timer per round. Backend authoritative evaluation ensures zero lag, instant match reveals, and anti-tamper scoring.
            </p>
          </div>

          {/* Card 5: Disconnect Recovery & Partial Results */}
          <div className="about-feature-card">
            <div className="about-card-badge badge--orange">🛡️ NEVER LOSE YOUR GAME</div>
            <h2 className="about-card-heading">Smart Disconnect & Leave Recovery</h2>
            <p className="about-card-text">
              If an opponent leaves or connection drops midway, our server instantly freezes state and compiles an accurate <strong>Partial Result Report</strong> based on all valid completed rounds.
            </p>
          </div>

          {/* Card 6: 1080x1350 Social Card */}
          <div className="about-feature-card">
            <div className="about-card-badge badge--pink">📸 1080 × 1350 SOCIAL CARDS</div>
            <h2 className="about-card-heading">Share Instantly on WhatsApp & Stories</h2>
            <p className="about-card-text">
              Generate a high-DPI social media card directly on your device with zero server upload. 1-tap WhatsApp sharing, native file sharing, and direct PNG downloads.
            </p>
          </div>
        </div>

        {/* Privacy Note */}
        <div className="about-privacy-note">
          🔒 <strong>Privacy First:</strong> We do not track personal data, store sensitive info, or make clinical psychological claims. This game is built 100% for pure entertainment, friendly debates, and laughter.
        </div>

        {/* CTA Button */}
        <div className="about-cta-container">
          <button
            className="btn btn--pink"
            onClick={onBack}
            id="about-play-cta-btn"
          >
            ⚡ PLAY THIS ⚡ THAT NOW
          </button>
        </div>
      </div>
    </div>
  );
}
