/* ============================================================
   TigerSVG — Premium 3D Cartoon Tiger Character
   Pure SVG with dynamic expression/pose props.
   No state, no side effects — just rendering.
   ============================================================ */

interface TigerSVGProps {
  eyeState?: 'open' | 'wide' | 'squint' | 'closed' | 'happy' | 'blink';
  mouthState?: 'smile' | 'open' | 'laugh' | 'surprise' | 'sad' | 'smirk' | 'teeth';
  eyebrowState?: 'neutral' | 'raised' | 'furrowed' | 'asymmetric';
  pawPose?: 'rest' | 'up' | 'wave' | 'chin' | 'point';
  tailState?: 'idle' | 'wag' | 'excited' | 'droop' | 'alert';
  lookX?: number;  // -1 to 1
  lookY?: number;  // -1 to 1
  squashX?: number;
  squashY?: number;
  blush?: boolean;
  facingLeft?: boolean;
}

export function TigerSVG({
  eyeState = 'open',
  mouthState = 'smile',
  eyebrowState = 'neutral',
  pawPose = 'rest',
  tailState = 'idle',
  lookX = 0,
  lookY = 0,
  squashX = 1,
  squashY = 1,
  blush = false,
  facingLeft = false,
}: TigerSVGProps) {
  // Pupil offset from look direction
  const pupilDx = lookX * 2.8;
  const pupilDy = lookY * 2;

  // Tail animation class
  const tailClass = tailState === 'excited' ? 'tiger-tail--excited'
    : tailState === 'wag' ? 'tiger-tail--wag'
    : tailState === 'droop' ? 'tiger-tail--droop'
    : tailState === 'alert' ? 'tiger-tail--alert'
    : 'tiger-tail--idle';

  // Eyebrow transforms
  const lBrowDy = eyebrowState === 'raised' ? -3 : eyebrowState === 'furrowed' ? 2 : eyebrowState === 'asymmetric' ? -2 : 0;
  const rBrowDy = eyebrowState === 'raised' ? -3 : eyebrowState === 'furrowed' ? 2 : eyebrowState === 'asymmetric' ? 1 : 0;
  const lBrowRot = eyebrowState === 'furrowed' ? 6 : eyebrowState === 'asymmetric' ? -4 : 0;
  const rBrowRot = eyebrowState === 'furrowed' ? -6 : eyebrowState === 'asymmetric' ? 3 : 0;

  return (
    <svg
      className="tiger-svg"
      viewBox="0 0 160 180"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        transform: `scaleX(${facingLeft ? -squashX : squashX}) scaleY(${squashY})`,
        transformOrigin: 'center bottom',
      }}
    >
      <defs>
        {/* Premium 3D Body Gradient — offset highlight for spherical look */}
        <radialGradient id="tgBodyG" cx="40%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#FFB74D" />
          <stop offset="35%" stopColor="#FF9800" />
          <stop offset="70%" stopColor="#F57C00" />
          <stop offset="100%" stopColor="#E65100" />
        </radialGradient>

        {/* Head — brighter, more pronounced highlight */}
        <radialGradient id="tgHeadG" cx="38%" cy="28%" r="65%">
          <stop offset="0%" stopColor="#FFCC80" />
          <stop offset="30%" stopColor="#FFB74D" />
          <stop offset="65%" stopColor="#FF9800" />
          <stop offset="100%" stopColor="#E65100" />
        </radialGradient>

        {/* Inner ear pink */}
        <linearGradient id="tgEarInG" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFB0C8" />
          <stop offset="100%" stopColor="#FF6090" />
        </linearGradient>

        {/* Cream snout/belly */}
        <radialGradient id="tgCreamG" cx="50%" cy="35%" r="60%">
          <stop offset="0%" stopColor="#FFFDE7" />
          <stop offset="100%" stopColor="#FFE0B2" />
        </radialGradient>

        {/* Eye pupil — deep with subtle purple tint */}
        <radialGradient id="tgPupilG" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#4A148C" />
          <stop offset="60%" stopColor="#1A0030" />
          <stop offset="100%" stopColor="#0D0015" />
        </radialGradient>

        {/* Lightning bolt glow */}
        <linearGradient id="tgBoltG" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFF59D" />
          <stop offset="50%" stopColor="#FFD600" />
          <stop offset="100%" stopColor="#FF9100" />
        </linearGradient>

        {/* Ground shadow */}
        <radialGradient id="tgShadG" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(26,0,48,0.28)" />
          <stop offset="100%" stopColor="rgba(26,0,48,0)" />
        </radialGradient>

        {/* Specular highlight for head */}
        <radialGradient id="tgSpecG" cx="40%" cy="25%" r="45%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.35)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </radialGradient>

        {/* Body specular */}
        <radialGradient id="tgBodySpecG" cx="42%" cy="20%" r="50%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.2)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </radialGradient>

        {/* Bolt glow filter */}
        <filter id="tgBoltGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Nose glossy highlight */}
        <radialGradient id="tgNoseG" cx="35%" cy="30%" r="60%">
          <stop offset="0%" stopColor="#FF7597" />
          <stop offset="60%" stopColor="#FF4772" />
          <stop offset="100%" stopColor="#E91E63" />
        </radialGradient>
      </defs>

      {/* ── Ground Shadow ── */}
      <ellipse cx="80" cy="172" rx="48" ry="8" fill="url(#tgShadG)" />

      {/* ── Tail ── */}
      <g className={`tiger-tail ${tailClass}`} style={{ transformOrigin: '42px 148px' }}>
        <path
          d="M 42 145 C 22 138, 8 118, 18 98 C 22 90, 32 93, 29 102 C 25 112, 32 130, 46 140 Z"
          fill="url(#tgBodyG)"
          stroke="#2E1500"
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
        {/* Tail stripes */}
        <path d="M 21 102 Q 26 106 29 110" stroke="#3E1F00" strokeWidth="2.8" strokeLinecap="round" />
        <path d="M 24 118 Q 30 122 34 126" stroke="#3E1F00" strokeWidth="2.8" strokeLinecap="round" />
        {/* White tip */}
        <path d="M 18 98 C 21 92, 30 93, 28 100 C 25 100, 21 99, 18 98 Z" fill="#FFFDE7" />
      </g>

      {/* ── Body / Torso ── */}
      <g className="tiger-body">
        {/* Main body shape */}
        <path
          d="M 52 118 C 46 130, 44 155, 48 164 C 54 168, 106 168, 112 164 C 116 155, 114 130, 108 118 Z"
          fill="url(#tgBodyG)"
          stroke="#2E1500"
          strokeWidth="2.2"
        />

        {/* White belly */}
        <ellipse cx="80" cy="145" rx="22" ry="16" fill="url(#tgCreamG)" />

        {/* Body specular highlight */}
        <ellipse cx="72" cy="128" rx="18" ry="12" fill="url(#tgBodySpecG)" />

        {/* Body stripes */}
        <path d="M 52 132 Q 60 135 65 133" stroke="#3E1F00" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M 108 132 Q 100 135 95 133" stroke="#3E1F00" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M 50 144 Q 58 146 63 143" stroke="#3E1F00" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M 110 144 Q 102 146 97 143" stroke="#3E1F00" strokeWidth="2.5" strokeLinecap="round" />

        {/* Back paws */}
        <ellipse cx="48" cy="164" rx="12" ry="7" fill="url(#tgBodyG)" stroke="#2E1500" strokeWidth="2" />
        <ellipse cx="112" cy="164" rx="12" ry="7" fill="url(#tgBodyG)" stroke="#2E1500" strokeWidth="2" />
        {/* Paw pads */}
        <ellipse cx="48" cy="164" rx="5.5" ry="3.2" fill="#FFB0C8" />
        <ellipse cx="112" cy="164" rx="5.5" ry="3.2" fill="#FFB0C8" />
        {/* Toe beans */}
        <circle cx="44" cy="161" r="1.5" fill="#FF8FAB" />
        <circle cx="48" cy="160" r="1.5" fill="#FF8FAB" />
        <circle cx="52" cy="161" r="1.5" fill="#FF8FAB" />
        <circle cx="108" cy="161" r="1.5" fill="#FF8FAB" />
        <circle cx="112" cy="160" r="1.5" fill="#FF8FAB" />
        <circle cx="116" cy="161" r="1.5" fill="#FF8FAB" />
      </g>

      {/* ── Left Ear ── */}
      <g className="tiger-ear-l" style={{ transformOrigin: '48px 42px' }}>
        <ellipse cx="48" cy="38" rx="15" ry="18" transform="rotate(-18 48 38)" fill="url(#tgBodyG)" stroke="#2E1500" strokeWidth="2.2" />
        <ellipse cx="48" cy="38" rx="9" ry="11" transform="rotate(-18 48 38)" fill="url(#tgEarInG)" />
        <path d="M 38 28 Q 45 26 50 24" stroke="#3E1F00" strokeWidth="2.8" strokeLinecap="round" />
      </g>

      {/* ── Right Ear ── */}
      <g className="tiger-ear-r" style={{ transformOrigin: '112px 42px' }}>
        <ellipse cx="112" cy="38" rx="15" ry="18" transform="rotate(18 112 38)" fill="url(#tgBodyG)" stroke="#2E1500" strokeWidth="2.2" />
        <ellipse cx="112" cy="38" rx="9" ry="11" transform="rotate(18 112 38)" fill="url(#tgEarInG)" />
        <path d="M 122 28 Q 115 26 110 24" stroke="#3E1F00" strokeWidth="2.8" strokeLinecap="round" />
      </g>

      {/* ── Head ── */}
      <g className="tiger-head">
        {/* Main head sphere */}
        <ellipse cx="80" cy="78" rx="42" ry="38" fill="url(#tgHeadG)" stroke="#2E1500" strokeWidth="2.2" />

        {/* Specular highlight on head — creates 3D sphere feel */}
        <ellipse cx="70" cy="62" rx="22" ry="16" fill="url(#tgSpecG)" />

        {/* Forehead stripes */}
        <path d="M 58 52 Q 63 57 66 60" stroke="#3E1F00" strokeWidth="2.8" strokeLinecap="round" />
        <path d="M 102 52 Q 97 57 94 60" stroke="#3E1F00" strokeWidth="2.8" strokeLinecap="round" />
        <path d="M 50 62 Q 57 66 60 68" stroke="#3E1F00" strokeWidth="2.8" strokeLinecap="round" />
        <path d="M 110 62 Q 103 66 100 68" stroke="#3E1F00" strokeWidth="2.8" strokeLinecap="round" />

        {/* Cheek stripes */}
        <path d="M 40 80 Q 49 82 52 80" stroke="#3E1F00" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M 120 80 Q 111 82 108 80" stroke="#3E1F00" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M 42 88 Q 50 89 54 87" stroke="#3E1F00" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M 118 88 Q 110 89 106 87" stroke="#3E1F00" strokeWidth="2.5" strokeLinecap="round" />

        {/* ⚡ Lightning Bolt Forehead Mark */}
        <g filter="url(#tgBoltGlow)">
          <path
            d="M 83 38 L 74 54 L 82 54 L 76 68 L 89 52 L 81 52 Z"
            fill="url(#tgBoltG)"
            stroke="#2E1500"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </g>

        {/* Cream muzzle — two bumps */}
        <ellipse cx="70" cy="90" rx="13" ry="10" fill="url(#tgCreamG)" stroke="#2E1500" strokeWidth="1.3" />
        <ellipse cx="90" cy="90" rx="13" ry="10" fill="url(#tgCreamG)" stroke="#2E1500" strokeWidth="1.3" />

        {/* Cheek blush */}
        {blush && (
          <>
            <ellipse cx="54" cy="86" rx="6" ry="4" fill="rgba(255,120,160,0.3)" />
            <ellipse cx="106" cy="86" rx="6" ry="4" fill="rgba(255,120,160,0.3)" />
          </>
        )}

        {/* Whiskers */}
        <path d="M 48 88 Q 56 91 62 90" stroke="#2E1500" strokeWidth="1.1" strokeLinecap="round" />
        <path d="M 46 94 Q 55 95 62 93" stroke="#2E1500" strokeWidth="1.1" strokeLinecap="round" />
        <path d="M 112 88 Q 104 91 98 90" stroke="#2E1500" strokeWidth="1.1" strokeLinecap="round" />
        <path d="M 114 94 Q 105 95 98 93" stroke="#2E1500" strokeWidth="1.1" strokeLinecap="round" />

        {/* ── Nose ── */}
        <path
          d="M 75 82 C 75 79, 85 79, 85 82 C 85 86, 81 89, 80 89 C 79 89, 75 86, 75 82 Z"
          fill="url(#tgNoseG)"
          stroke="#2E1500"
          strokeWidth="1.5"
        />
        {/* Nose glossy dot */}
        <ellipse cx="78" cy="81" rx="2" ry="1.5" fill="rgba(255,255,255,0.5)" />

        {/* ── Mouth ── */}
        {mouthState === 'laugh' ? (
          <g>
            <path d="M 72 94 Q 80 108 88 94 Z" fill="#6D0020" stroke="#2E1500" strokeWidth="1.6" />
            <path d="M 76 100 Q 80 105 84 100 Z" fill="#FF8FAB" />
          </g>
        ) : mouthState === 'open' || mouthState === 'surprise' ? (
          <ellipse cx="80" cy="96" rx="4.5" ry="5.5" fill="#6D0020" stroke="#2E1500" strokeWidth="1.6" />
        ) : mouthState === 'sad' ? (
          <path d="M 74 96 Q 80 92 86 96" stroke="#2E1500" strokeWidth="2" strokeLinecap="round" fill="none" />
        ) : mouthState === 'smirk' ? (
          <g>
            <path d="M 80 88 L 80 92" stroke="#2E1500" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M 73 92 Q 77 95 80 92 Q 85 96 90 93" stroke="#2E1500" strokeWidth="1.8" strokeLinecap="round" fill="none" />
          </g>
        ) : mouthState === 'teeth' ? (
          <g>
            <path d="M 72 94 Q 80 104 88 94 Z" fill="#6D0020" stroke="#2E1500" strokeWidth="1.6" />
            <path d="M 74 94 L 76 97 L 78 94 L 80 97 L 82 94 L 84 97 L 86 94" fill="#FFFFFF" stroke="none" />
          </g>
        ) : (
          /* Default :3 cat smile */
          <g>
            <path d="M 80 88 L 80 92" stroke="#2E1500" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M 72 92 Q 76 96 80 92 Q 84 96 88 92" stroke="#2E1500" strokeWidth="1.8" strokeLinecap="round" fill="none" />
          </g>
        )}

        {/* ── Eyes ── */}
        <g className="tiger-eyes">
          {eyeState === 'happy' || eyeState === 'closed' ? (
            /* Happy closed arcs ^ ^ */
            <g>
              <path d="M 60 75 Q 66 67 72 75" stroke="#2E1500" strokeWidth="3" strokeLinecap="round" fill="none" />
              <path d="M 88 75 Q 94 67 100 75" stroke="#2E1500" strokeWidth="3" strokeLinecap="round" fill="none" />
            </g>
          ) : eyeState === 'squint' ? (
            /* Suspicious squint */
            <g>
              <path d="M 58 75 Q 66 71 74 76" stroke="#2E1500" strokeWidth="2.8" strokeLinecap="round" fill="none" />
              <path d="M 86 76 Q 94 71 102 75" stroke="#2E1500" strokeWidth="2.8" strokeLinecap="round" fill="none" />
            </g>
          ) : eyeState === 'blink' ? (
            /* Blink — thin lines */
            <g>
              <path d="M 59 74 L 73 74" stroke="#2E1500" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M 87 74 L 101 74" stroke="#2E1500" strokeWidth="2.5" strokeLinecap="round" />
            </g>
          ) : (
            /* Open eyes — size varies for 'wide' */
            <g>
              {/* Left eye */}
              <ellipse cx="66" cy="74" rx={eyeState === 'wide' ? 9 : 7.5} ry={eyeState === 'wide' ? 10 : 8.5} fill="#FFFFFF" stroke="#2E1500" strokeWidth="2" />
              <ellipse cx={66 + pupilDx} cy={74 + pupilDy} rx={eyeState === 'wide' ? 6 : 5} ry={eyeState === 'wide' ? 7 : 6} fill="url(#tgPupilG)" />
              {/* Large specular */}
              <circle cx={64 + pupilDx * 0.3} cy={71 + pupilDy * 0.3} r="2.5" fill="#FFFFFF" />
              {/* Small specular */}
              <circle cx={68 + pupilDx * 0.3} cy={76 + pupilDy * 0.3} r="1.2" fill="#FFFFFF" />

              {/* Right eye */}
              <ellipse cx="94" cy="74" rx={eyeState === 'wide' ? 9 : 7.5} ry={eyeState === 'wide' ? 10 : 8.5} fill="#FFFFFF" stroke="#2E1500" strokeWidth="2" />
              <ellipse cx={94 + pupilDx} cy={74 + pupilDy} rx={eyeState === 'wide' ? 6 : 5} ry={eyeState === 'wide' ? 7 : 6} fill="url(#tgPupilG)" />
              <circle cx={92 + pupilDx * 0.3} cy={71 + pupilDy * 0.3} r="2.5" fill="#FFFFFF" />
              <circle cx={96 + pupilDx * 0.3} cy={76 + pupilDy * 0.3} r="1.2" fill="#FFFFFF" />
            </g>
          )}
        </g>

        {/* ── Eyebrows ── */}
        <path
          d={`M 57 ${63 + lBrowDy} Q 66 ${59 + lBrowDy} 73 ${63 + lBrowDy}`}
          stroke="#2E1500"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
          style={{ transform: `rotate(${lBrowRot}deg)`, transformOrigin: '65px 62px' }}
        />
        <path
          d={`M 87 ${63 + rBrowDy} Q 94 ${59 + rBrowDy} 103 ${63 + rBrowDy}`}
          stroke="#2E1500"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
          style={{ transform: `rotate(${rBrowRot}deg)`, transformOrigin: '95px 62px' }}
        />
      </g>

      {/* ── Front Paws ── */}
      {pawPose === 'up' ? (
        <g>
          <path d="M 52 126 Q 36 110 32 92" stroke="url(#tgBodyG)" strokeWidth="14" strokeLinecap="round" />
          <path d="M 52 126 Q 36 110 32 92" stroke="#2E1500" strokeWidth="2.2" strokeLinecap="round" fill="none" />
          <ellipse cx="30" cy="89" rx="7.5" ry="7.5" fill="url(#tgBodyG)" stroke="#2E1500" strokeWidth="2" />
          <circle cx="30" cy="89" r="3.8" fill="#FFB0C8" />
          <circle cx="27" cy="86" r="1.4" fill="#FF8FAB" />
          <circle cx="30" cy="85" r="1.4" fill="#FF8FAB" />
          <circle cx="33" cy="86" r="1.4" fill="#FF8FAB" />

          <path d="M 108 126 Q 124 110 128 92" stroke="url(#tgBodyG)" strokeWidth="14" strokeLinecap="round" />
          <path d="M 108 126 Q 124 110 128 92" stroke="#2E1500" strokeWidth="2.2" strokeLinecap="round" fill="none" />
          <ellipse cx="130" cy="89" rx="7.5" ry="7.5" fill="url(#tgBodyG)" stroke="#2E1500" strokeWidth="2" />
          <circle cx="130" cy="89" r="3.8" fill="#FFB0C8" />
          <circle cx="127" cy="86" r="1.4" fill="#FF8FAB" />
          <circle cx="130" cy="85" r="1.4" fill="#FF8FAB" />
          <circle cx="133" cy="86" r="1.4" fill="#FF8FAB" />
        </g>
      ) : pawPose === 'wave' ? (
        <g>
          {/* Left paw resting */}
          <ellipse cx="62" cy="148" rx="9" ry="6.5" fill="url(#tgBodyG)" stroke="#2E1500" strokeWidth="2" />
          <ellipse cx="62" cy="148" rx="4.5" ry="3" fill="#FFB0C8" />
          <circle cx="58" cy="145.5" r="1.3" fill="#FF8FAB" />
          <circle cx="62" cy="145" r="1.3" fill="#FF8FAB" />
          <circle cx="66" cy="145.5" r="1.3" fill="#FF8FAB" />

          {/* Right paw waving */}
          <path d="M 108 130 Q 128 108 126 90" stroke="url(#tgBodyG)" strokeWidth="13" strokeLinecap="round" />
          <path d="M 108 130 Q 128 108 126 90" stroke="#2E1500" strokeWidth="2.2" strokeLinecap="round" fill="none" />
          <ellipse cx="127" cy="87" rx="7" ry="7" fill="url(#tgBodyG)" stroke="#2E1500" strokeWidth="2" className="tiger-paw-wave" />
          <circle cx="127" cy="87" r="3.5" fill="#FFB0C8" />
        </g>
      ) : pawPose === 'chin' ? (
        <g>
          {/* Left resting */}
          <ellipse cx="62" cy="148" rx="9" ry="6.5" fill="url(#tgBodyG)" stroke="#2E1500" strokeWidth="2" />
          <ellipse cx="62" cy="148" rx="4.5" ry="3" fill="#FFB0C8" />

          {/* Right paw on chin */}
          <path d="M 104 140 Q 100 116 88 100" stroke="url(#tgBodyG)" strokeWidth="12" strokeLinecap="round" />
          <path d="M 104 140 Q 100 116 88 100" stroke="#2E1500" strokeWidth="2" strokeLinecap="round" fill="none" />
          <ellipse cx="86" cy="97" rx="6.5" ry="6.5" fill="url(#tgBodyG)" stroke="#2E1500" strokeWidth="2" />
          <circle cx="86" cy="97" r="3" fill="#FFB0C8" />
        </g>
      ) : pawPose === 'point' ? (
        <g>
          {/* Left resting */}
          <ellipse cx="62" cy="148" rx="9" ry="6.5" fill="url(#tgBodyG)" stroke="#2E1500" strokeWidth="2" />
          <ellipse cx="62" cy="148" rx="4.5" ry="3" fill="#FFB0C8" />

          {/* Right paw pointing right */}
          <path d="M 108 130 Q 130 118 142 110" stroke="url(#tgBodyG)" strokeWidth="13" strokeLinecap="round" />
          <path d="M 108 130 Q 130 118 142 110" stroke="#2E1500" strokeWidth="2.2" strokeLinecap="round" fill="none" />
          <ellipse cx="144" cy="108" rx="7" ry="6" fill="url(#tgBodyG)" stroke="#2E1500" strokeWidth="2" />
          <circle cx="144" cy="108" r="3" fill="#FFB0C8" />
        </g>
      ) : (
        /* Default resting paws */
        <g>
          <ellipse cx="62" cy="148" rx="9" ry="6.5" fill="url(#tgBodyG)" stroke="#2E1500" strokeWidth="2" />
          <ellipse cx="62" cy="148" rx="4.5" ry="3" fill="#FFB0C8" />
          <circle cx="58" cy="145.5" r="1.3" fill="#FF8FAB" />
          <circle cx="62" cy="145" r="1.3" fill="#FF8FAB" />
          <circle cx="66" cy="145.5" r="1.3" fill="#FF8FAB" />

          <ellipse cx="98" cy="148" rx="9" ry="6.5" fill="url(#tgBodyG)" stroke="#2E1500" strokeWidth="2" />
          <ellipse cx="98" cy="148" rx="4.5" ry="3" fill="#FFB0C8" />
          <circle cx="94" cy="145.5" r="1.3" fill="#FF8FAB" />
          <circle cx="98" cy="145" r="1.3" fill="#FF8FAB" />
          <circle cx="102" cy="145.5" r="1.3" fill="#FF8FAB" />
        </g>
      )}
    </svg>
  );
}
