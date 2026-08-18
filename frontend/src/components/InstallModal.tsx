import { createPortal } from 'react-dom';
import { SynqLogo } from './SynqLogo';

interface InstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  isIOS: boolean;
}

export function InstallModal({ isOpen, onClose, isIOS }: InstallModalProps) {
  if (!isOpen || typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="install-modal-title"
      onClick={onClose}
    >
      <div
        className="modal-card install-modal-card"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="install-modal-header">
          <div className="install-modal-icon">
            <SynqLogo size="sm" showText={false} />
          </div>
          <div>
            <div className="modal-title" id="install-modal-title">
              Install THIS ⚡ THAT
            </div>
            <div className="install-modal-sub">
              Add to your home screen for 1-tap instant play!
            </div>
          </div>
          <button
            className="install-modal-close"
            onClick={onClose}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        <div className="install-modal-steps">
          {isIOS ? (
            <>
              <div className="install-step-row">
                <div className="install-step-badge">1</div>
                <div className="install-step-content">
                  Tap the <strong>Share button</strong> in Safari's bottom toolbar:
                  <div className="install-step-icon-box">📤 (Share icon)</div>
                </div>
              </div>

              <div className="install-step-row">
                <div className="install-step-badge">2</div>
                <div className="install-step-content">
                  Scroll down and tap <strong>"Add to Home Screen"</strong>:
                  <div className="install-step-icon-box">➕ Add to Home Screen</div>
                </div>
              </div>

              <div className="install-step-row">
                <div className="install-step-badge">3</div>
                <div className="install-step-content">
                  Tap <strong>"Add"</strong> in top right. You're ready to play! ⚡
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="install-step-row">
                <div className="install-step-badge">1</div>
                <div className="install-step-content">
                  Open your browser menu (tap <strong>⋮</strong> in Chrome/Edge on Android or PC).
                </div>
              </div>

              <div className="install-step-row">
                <div className="install-step-badge">2</div>
                <div className="install-step-content">
                  Tap <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>:
                  <div className="install-step-icon-box">📲 Install THIS ⚡ THAT</div>
                </div>
              </div>

              <div className="install-step-row">
                <div className="install-step-badge">3</div>
                <div className="install-step-content">
                  Confirm to add app icon directly to your home screen! 🚀
                </div>
              </div>
            </>
          )}
        </div>

        <div className="install-modal-footer">
          <button
            className="btn btn--pink"
            onClick={onClose}
            id="install-modal-done-btn"
          >
            GOT IT! 👍
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

