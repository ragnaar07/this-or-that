import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { SynqLogo } from './SynqLogo';
import { GameWordmark } from './GameWordmark';

interface NavBarProps {
  currentScreen?: string;
  onGoHome?: () => void;
  onOpenAbout: () => void;
  onOpenHowToPlay: () => void;
}

export function NavBar({
  currentScreen = 'HOME',
  onGoHome,
  onOpenAbout,
  onOpenHowToPlay,
}: NavBarProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Prevent body scrolling when mobile drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  function handleNavigate(action: () => void) {
    setIsOpen(false);
    action();
  }

  return (
    <>
      <header
        className={`navbar-container navbar-container--${currentScreen.toLowerCase()}`}
        role="navigation"
        aria-label="Main Navigation"
      >
        <div className="navbar-inner">
          {/* Brand Logo on Left */}
          <div
            className={`navbar-brand ${onGoHome && currentScreen !== 'HOME' ? 'navbar-brand--clickable' : ''}`}
            onClick={onGoHome && currentScreen !== 'HOME' ? onGoHome : undefined}
            role={onGoHome && currentScreen !== 'HOME' ? 'button' : undefined}
            tabIndex={onGoHome && currentScreen !== 'HOME' ? 0 : undefined}
            aria-label="THIS THAT / SYNQ Brand"
            id="navbar-brand-logo"
          >
            <SynqLogo size="sm" showText={true} />
          </div>

          <div
            className={`navbar-wordmark ${onGoHome && currentScreen !== 'HOME' ? 'navbar-wordmark--clickable' : ''}`}
            onClick={onGoHome && currentScreen !== 'HOME' ? onGoHome : undefined}
            role={onGoHome && currentScreen !== 'HOME' ? 'button' : undefined}
            tabIndex={onGoHome && currentScreen !== 'HOME' ? 0 : undefined}
            aria-label="THIS THAT home"
          >
            <GameWordmark compact />
          </div>

          {/* Desktop Navigation Links (> 640px) */}
          <nav className="navbar-desktop-links" aria-label="Desktop menu">
            <button
              className={`nav-link-btn ${currentScreen === 'HOW_TO_PLAY' ? 'nav-link-btn--active' : ''}`}
              onClick={onOpenHowToPlay}
              id="nav-howtoplay-btn"
              aria-label="How to play THIS THAT"
            >
              🎮 HOW TO PLAY
            </button>
            <button
              className={`nav-link-btn ${currentScreen === 'ABOUT' ? 'nav-link-btn--active' : ''}`}
              onClick={onOpenAbout}
              id="nav-about-btn"
              aria-label="About THIS THAT and SYNQ"
            >
              💡 ABOUT US
            </button>
          </nav>

          {/* Mobile Hamburger Toggle Button (<= 640px) */}
          <button
            className={`navbar-mobile-toggle ${isOpen ? 'navbar-mobile-toggle--open' : ''}`}
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={isOpen}
            aria-controls="mobile-nav-drawer"
            id="mobile-menu-toggle-btn"
          >
            <span className="hamburger-bar hamburger-bar--1" />
            <span className="hamburger-bar hamburger-bar--2" />
            <span className="hamburger-bar hamburger-bar--3" />
          </button>
        </div>
      </header>

      {/* Mobile Drawer Overlay Portal directly to document.body */}
      {isOpen && typeof document !== 'undefined' && createPortal(
        <div
          className="mobile-drawer-overlay"
          onClick={() => setIsOpen(false)}
          aria-hidden={!isOpen}
        >
          <div
            className="mobile-drawer-card"
            id="mobile-nav-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile Navigation Menu"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mobile-drawer-header">
              <div className="mobile-drawer-title">
                <SynqLogo size="sm" showText={true} />
              </div>
              <button
                className="mobile-drawer-close"
                onClick={() => setIsOpen(false)}
                aria-label="Close menu"
                id="close-mobile-menu-btn"
              >
                ✕
              </button>
            </div>

            <div className="mobile-drawer-links">
              {currentScreen !== 'HOME' && onGoHome && (
                <button
                  className="mobile-nav-item"
                  onClick={() => handleNavigate(onGoHome)}
                  id="mobile-nav-home"
                >
                  <span className="mobile-nav-icon">⚡</span>
                  <div className="mobile-nav-text">
                    <span className="mobile-nav-label">Home</span>
                    <span className="mobile-nav-sub">Play THIS ⚡ THAT</span>
                  </div>
                </button>
              )}

              <button
                className={`mobile-nav-item ${currentScreen === 'HOW_TO_PLAY' ? 'mobile-nav-item--active' : ''}`}
                onClick={() => handleNavigate(onOpenHowToPlay)}
                id="mobile-nav-howtoplay"
              >
                <span className="mobile-nav-icon">🎮</span>
                <div className="mobile-nav-text">
                  <span className="mobile-nav-label">How to Play</span>
                  <span className="mobile-nav-sub">Rules, timers & scoring</span>
                </div>
              </button>

              <button
                className={`mobile-nav-item ${currentScreen === 'ABOUT' ? 'mobile-nav-item--active' : ''}`}
                onClick={() => handleNavigate(onOpenAbout)}
                id="mobile-nav-about"
              >
                <span className="mobile-nav-icon">💡</span>
                <div className="mobile-nav-text">
                  <span className="mobile-nav-label">About Us</span>
                  <span className="mobile-nav-sub">The story behind SYNQ</span>
                </div>
              </button>
            </div>

            <div className="mobile-drawer-footer">
              <span className="mobile-drawer-tagline">THIS ⚡ THAT • SYNC UP</span>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
