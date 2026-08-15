import { SynqLogo } from './SynqLogo';

interface TopBrandBadgeProps {
  onClick?: () => void;
  variant?: 'floating' | 'inline';
}

export function TopBrandBadge({ onClick, variant = 'floating' }: TopBrandBadgeProps) {
  return (
    <div
      className={`top-brand-badge top-brand-badge--${variant}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label="SYNQ Brand"
    >
      <SynqLogo size="sm" showText={true} />
    </div>
  );
}
