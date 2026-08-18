import { usePwaInstall } from '../hooks/usePwaInstall';
import { InstallModal } from './InstallModal';

interface InstallAppButtonProps {
  className?: string;
  variant?: 'nav' | 'drawer' | 'home';
}

export function InstallAppButton({ className = '', variant = 'nav' }: InstallAppButtonProps) {
  const { isInstalled, isIOS, showIOSModal, setShowIOSModal, triggerInstall } = usePwaInstall();

  if (variant === 'drawer') {
    return (
      <>
        <button
          className={`mobile-nav-item ${className}`}
          onClick={triggerInstall}
          id="mobile-nav-install-btn"
          aria-label="Install App"
        >
          <span className="mobile-nav-icon">{isInstalled ? '✅' : '📲'}</span>
          <div className="mobile-nav-text">
            <span className="mobile-nav-label">
              {isInstalled ? 'App Installed' : 'Install App'}
            </span>
            <span className="mobile-nav-sub">
              {isInstalled ? 'Running on device' : 'Add to home screen icon'}
            </span>
          </div>
        </button>

        <InstallModal
          isOpen={showIOSModal}
          onClose={() => setShowIOSModal(false)}
          isIOS={isIOS}
        />
      </>
    );
  }

  return (
    <>
      <button
        className={`nav-link-btn nav-install-btn ${className}`}
        onClick={triggerInstall}
        id="nav-install-app-btn"
        aria-label="Install Web App"
        title="Install THIS ⚡ THAT to your device"
      >
        {isInstalled ? '✓ APP INSTALLED' : '📲 INSTALL APP'}
      </button>

      <InstallModal
        isOpen={showIOSModal}
        onClose={() => setShowIOSModal(false)}
        isIOS={isIOS}
      />
    </>
  );
}
