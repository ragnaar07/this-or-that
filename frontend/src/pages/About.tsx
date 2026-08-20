import { SynqLogo } from '../components/SynqLogo';
import { Footer } from '../components/Footer';

interface AboutProps {
  onBack: () => void;
  onOpenHowToPlay?: () => void;
}

export function About({ onBack, onOpenHowToPlay }: AboutProps) {
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
          <div className="about-header-tag">ABOUT US 💡</div>
        </div>

        {/* Hero Section */}
        <div className="about-hero-card">
          <SynqLogo size="lg" showText={true} />
          <h1 className="about-hero-title">
            THIS <span style={{ color: 'var(--color-pink)' }}>⚡</span> THAT
          </h1>
          <p className="about-hero-tagline">
            The Live 2-Player Mind Matching & Instinct Chemistry Game
          </p>
          <div className="about-quote-box">
            "A game that starts with two simple choices, but by round 10 makes you say:
            <br />
            <strong>'BRO... ARE WE THE SAME PERSON?!' 😂⚡</strong>"
          </div>
        </div>

        {/* Story Section */}
        <div className="about-feature-card" style={{ borderColor: 'rgba(255, 62, 165, 0.4)' }}>
          <div className="about-card-badge badge--pink">🔥 WHY WE BUILT THIS</div>
          <h2 className="about-card-heading">Kill Small Talk. Find Real Chemistry.</h2>
          <p className="about-card-text">
            Boring trivia quizzes ask trivia facts. <strong>THIS ⚡ THAT</strong> is built around <em>human psychology, raw instincts, and daily life choices</em>.
          </p>
          <p className="about-card-text" style={{ marginTop: 8 }}>
            Whether you're playing with your best friend, partner, crush, sibling, or roommate, it puts your real thoughts on the table in under 3 minutes of high-speed fun.
          </p>
        </div>

        {/* Feature Grid / Cards */}
        <div className="about-cards-list">
          {/* Card 1: Question Dataset */}
          <div className="about-feature-card">
            <div className="about-card-badge badge--violet">⚡ 1,300+ FRESH DILEMMAS</div>
            <h2 className="about-card-heading">Zero Repetition, Pure Relatability</h2>
            <p className="about-card-text">
              From late-night Maggi vs Swiggy cravings, to ₹10 Crore dilemmas, Goa trip chaos, and career decisions — our curated database of 1,300+ questions keeps every match feeling fresh.
            </p>
            <div className="about-pill-row">
              <span className="about-sub-pill">Food & Lifestyle</span>
              <span className="about-sub-pill">Cinema & Culture</span>
              <span className="about-sub-pill">Chaos & Superpowers</span>
            </div>
          </div>

          {/* Card 2: Deep Psychology */}
          <div className="about-feature-card">
            <div className="about-card-badge badge--mint">🧠 DEEP PSYCHOLOGY MODE</div>
            <h2 className="about-card-heading">Uncover Real Human Nature</h2>
            <p className="about-card-text">
              Enable the Deep Psychology toggle to test your moral compass. High-stakes dilemmas test where loyalty meets truth, career ambitions clash with friendships, and gut ethics get revealed.
            </p>
          </div>

          {/* Card 3: Multiplayer */}
          <div className="about-feature-card">
            <div className="about-card-badge badge--gold">⏱️ REALTIME 10S ADRENALINE</div>
            <h2 className="about-card-heading">Instant Synchronization, Zero Delay</h2>
            <p className="about-card-text">
              Both players lock in choices on synchronized timers with live reactions, animated mascot expressions, and instant match reveals.
            </p>
          </div>

          {/* Card 4: Installable App */}
          <div className="about-feature-card">
            <div className="about-card-badge badge--orange">📲 PLAY EVERYWHERE (PWA APP)</div>
            <h2 className="about-card-heading">Install on Android, iOS & Desktop</h2>
            <p className="about-card-text">
              Tap the <strong>"📲 INSTALL APP"</strong> button at the top to add THIS ⚡ THAT straight to your home screen! Works like a native mobile app with instant launch and zero app store downloads required.
            </p>
          </div>

          {/* Card 5: Social Card */}
          <div className="about-feature-card">
            <div className="about-card-badge badge--pink">📸 VIRAL RESULT CARDS</div>
            <h2 className="about-card-heading">Share Instantly on WhatsApp & Stories</h2>
            <p className="about-card-text">
              Generate a high-res 1080×1350 story card highlighting your match percentage, funny plot contradictions, and psychological archetypes with 1-tap WhatsApp sharing!
            </p>
          </div>
        </div>

        {/* Privacy Note */}
        <div className="about-privacy-note">
          🔒 <strong>100% Free & Privacy First:</strong> No login, no password, no email required. Jump straight into the room and start matching minds!
        </div>

        {/* CTA Buttons */}
        <div className="about-cta-container">
          {onOpenHowToPlay && (
            <button
              className="btn btn--secondary"
              onClick={onOpenHowToPlay}
              style={{ marginBottom: 10 }}
              id="about-howtoplay-btn"
            >
              🎮 VIEW HOW TO PLAY GUIDE
            </button>
          )}
          <button
            className="btn btn--pink"
            onClick={onBack}
            id="about-play-cta-btn"
          >
            ⚡ PLAY THIS ⚡ THAT NOW
          </button>
        </div>

        {/* Global Credible Footer */}
        <Footer onOpenHowToPlay={onOpenHowToPlay} onOpenAbout={() => {}} />
      </div>
    </div>
  );
}
