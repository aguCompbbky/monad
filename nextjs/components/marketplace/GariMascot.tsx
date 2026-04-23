"use client";

type GariMascotProps = {
  size?: number;
  className?: string;
};

export const GariMascot = ({ size = 80, className = "" }: GariMascotProps) => {
  return (
    <svg
      width={size}
      height={size * 1.25}
      viewBox="0 0 80 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`animate-float-slow animate-eye-glow ${className}`}
    >
      {/* Glow filter */}
      <defs>
        <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="eye-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <linearGradient id="bodyGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#6d28d9" />
          <stop offset="100%" stopColor="#4c1d95" />
        </linearGradient>
        <linearGradient id="headGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#5b21b6" />
        </linearGradient>
      </defs>

      {/* Antenna */}
      <line x1="40" y1="10" x2="40" y2="2" stroke="#a855f7" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="40" cy="1" r="3.5" fill="#c026d3" filter="url(#glow)" />

      {/* Head */}
      <rect x="16" y="10" width="48" height="36" rx="12" fill="url(#headGrad)" />

      {/* Eyes */}
      <rect x="22" y="20" width="14" height="10" rx="5" fill="#07030f" />
      <rect x="44" y="20" width="14" height="10" rx="5" fill="#07030f" />
      {/* Eye pupils (pink neon) */}
      <circle cx="29" cy="25" r="4" fill="#c026d3" filter="url(#eye-glow)" />
      <circle cx="51" cy="25" r="4" fill="#c026d3" filter="url(#eye-glow)" />
      {/* Eye shine */}
      <circle cx="31" cy="23" r="1.5" fill="white" opacity="0.9" />
      <circle cx="53" cy="23" r="1.5" fill="white" opacity="0.9" />

      {/* Mouth (pixel smile) */}
      <rect x="26" y="36" width="28" height="5" rx="2.5" fill="#3b0764" />
      <rect x="28" y="37" width="5" height="3" rx="1" fill="#836ef9" />
      <rect x="35" y="37" width="5" height="3" rx="1" fill="#836ef9" />
      <rect x="42" y="37" width="5" height="3" rx="1" fill="#836ef9" />
      <rect x="49" y="37" width="5" height="3" rx="1" fill="#836ef9" />

      {/* Neck */}
      <rect x="34" y="46" width="12" height="6" rx="3" fill="#4c1d95" />

      {/* Body */}
      <rect x="14" y="52" width="52" height="34" rx="10" fill="url(#bodyGrad)" />

      {/* Chest "G" badge */}
      <rect x="30" y="61" width="20" height="16" rx="4" fill="rgba(0,0,0,0.35)" />
      <text x="40" y="73" textAnchor="middle" fill="#c026d3" fontSize="11" fontWeight="900" filter="url(#glow)">
        G
      </text>

      {/* Left arm */}
      <rect x="2" y="54" width="12" height="8" rx="4" fill="#5b21b6" />
      <circle cx="2" cy="58" r="4" fill="#4c1d95" />

      {/* Right arm */}
      <rect x="66" y="54" width="12" height="8" rx="4" fill="#5b21b6" />
      <circle cx="78" cy="58" r="4" fill="#4c1d95" />

      {/* Left leg */}
      <rect x="22" y="84" width="14" height="14" rx="5" fill="#5b21b6" />
      {/* Right leg */}
      <rect x="44" y="84" width="14" height="14" rx="5" fill="#5b21b6" />

      {/* Foot neon dots */}
      <circle cx="28" cy="96" r="2" fill="#836ef9" filter="url(#glow)" />
      <circle cx="52" cy="96" r="2" fill="#836ef9" filter="url(#glow)" />
    </svg>
  );
};
