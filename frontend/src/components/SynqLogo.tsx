interface SynqLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
  onClick?: () => void;
}

export function SynqLogo({
  size = 'md',
  showText = true,
  className = '',
  onClick,
}: SynqLogoProps) {
  const dimensions = {
    sm: { iconWidth: 32, iconHeight: 36, textClass: 'synq-text--sm' },
    md: { iconWidth: 42, iconHeight: 48, textClass: 'synq-text--md' },
    lg: { iconWidth: 64, iconHeight: 72, textClass: 'synq-text--lg' },
  }[size];

  return (
    <div
      className={`synq-logo-container synq-logo--${size} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : 'img'}
      aria-label="SYNQ Logo"
    >
      <svg
        width={dimensions.iconWidth}
        height={dimensions.iconHeight}
        viewBox="0 0 160 180"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="synq-logo-svg"
      >
        <defs>
          {/* Orange/Coral gradient */}
          <linearGradient id="synqOrangeGrad" x1="20" y1="60" x2="80" y2="160" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FF7A00" />
            <stop offset="100%" stopColor="#FF4500" />
          </linearGradient>

          {/* Lime/Green gradient */}
          <linearGradient id="synqGreenGrad" x1="80" y1="40" x2="140" y2="160" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#A3E635" />
            <stop offset="100%" stopColor="#65A30D" />
          </linearGradient>

          {/* Gold highlight gradient */}
          <linearGradient id="synqGoldGrad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFD600" />
            <stop offset="100%" stopColor="#FFA000" />
          </linearGradient>
        </defs>

        {/* --- ARC OF SYNC ENERGY DOTS --- */}
        <g className="synq-dots-arc">
          {/* Dot 1: Leftmost Lime */}
          <circle cx="28" cy="62" r="10" fill="#84CC16" className="synq-dot synq-dot-1" />
          {/* Dot 2: Upper Left Orange */}
          <circle cx="42" cy="40" r="7" fill="#FF7A00" className="synq-dot synq-dot-2" />
          {/* Dot 3: High Left Lime */}
          <circle cx="64" cy="24" r="11" fill="#A3E635" className="synq-dot synq-dot-3" />
          {/* Dot 4: Apex Orange Accent */}
          <circle cx="86" cy="16" r="7.5" fill="#FF5722" className="synq-dot synq-dot-4" />
          {/* Dot 5: High Right Lime */}
          <circle cx="108" cy="20" r="11" fill="#84CC16" className="synq-dot synq-dot-5" />
          {/* Dot 6: Upper Right Orange */}
          <circle cx="128" cy="34" r="7" fill="#FF7A00" className="synq-dot synq-dot-6" />
          {/* Dot 7: Rightmost Lime */}
          <circle cx="140" cy="54" r="10" fill="#A3E635" className="synq-dot synq-dot-7" />
        </g>

        {/* --- LEFT FIGURE (Warm Orange / Coral) --- */}
        <g className="synq-figure-left">
          {/* Raised Left Arm */}
          <path
            d="M50 82 C42 86, 26 102, 20 110 C16 115, 23 121, 28 116 C36 108, 48 95, 54 90 Z"
            fill="#FF7A00"
          />

          {/* Left Head with Joyful Smile Curve */}
          <circle cx="62" cy="74" r="21" fill="#FF8C1A" />
          <path
            d="M52 74 C52 82, 68 85, 74 76"
            stroke="#FFFDE7"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
          />

          {/* Left Torso / Body (translucent overlay) */}
          <rect
            x="40"
            y="94"
            width="34"
            height="50"
            rx="17"
            fill="url(#synqOrangeGrad)"
            opacity="0.92"
          />
        </g>

        {/* --- RIGHT FIGURE (Bright Lime Green) --- */}
        <g className="synq-figure-right">
          {/* Raised Right Arm */}
          <path
            d="M106 82 C116 86, 134 98, 142 108 C147 113, 141 120, 135 115 C126 106, 112 94, 104 88 Z"
            fill="#84CC16"
          />

          {/* Right Head with Joyful Smile Curve (Higher & Cheering) */}
          <circle cx="98" cy="58" r="23" fill="#84CC16" />
          <path
            d="M87 58 C87 68, 105 72, 112 60"
            stroke="#FFFDE7"
            strokeWidth="4.5"
            strokeLinecap="round"
            fill="none"
          />

          {/* Right Torso / Body (overlapping blend) */}
          <rect
            x="64"
            y="80"
            width="38"
            height="64"
            rx="19"
            fill="url(#synqGreenGrad)"
            opacity="0.88"
            style={{ mixBlendMode: 'multiply' }}
          />
        </g>

        {/* Middle Sync Heart Spark */}
        <circle cx="68" cy="112" r="3.5" fill="#FFFDE7" opacity="0.9" />
      </svg>

      {showText && (
        <span className={`synq-brand-text ${dimensions.textClass}`}>
          SYNQ
        </span>
      )}
    </div>
  );
}
