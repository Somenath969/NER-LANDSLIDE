import React from 'react';

interface DisasterManagementLogoProps {
  className?: string;
  size?: number | string;
  showText?: boolean;
  theme?: 'dark' | 'light' | 'auto';
}

export const DisasterManagementLogo: React.FC<DisasterManagementLogoProps> = ({
  className = '',
  size = 40,
  showText = false,
  theme = 'auto',
}) => {
  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`} style={{ height: size }}>
      {/* Globe & Hand Emblem SVG */}
      <svg
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 drop-shadow-sm"
        style={{ width: size, height: size }}
      >
        {/* Globe Base */}
        <defs>
          <radialGradient id="globeGrad" cx="45%" cy="40%" r="55%">
            <stop offset="0%" stopColor="#9de6f5" />
            <stop offset="70%" stopColor="#6dc6dc" />
            <stop offset="100%" stopColor="#55b0c9" />
          </radialGradient>
          <linearGradient id="handGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1e3352" />
            <stop offset="100%" stopColor="#132238" />
          </linearGradient>
          <clipPath id="globeClip">
            <circle cx="106" cy="94" r="78" />
          </clipPath>
        </defs>

        {/* Globe Sphere */}
        <circle cx="106" cy="94" r="78" fill="url(#globeGrad)" />

        {/* Continents (Clipped to Globe Sphere) */}
        <g clipPath="url(#globeClip)" fill="#d8f4fa" opacity="0.95">
          {/* North America / Arctic */}
          <path d="M 68 46 C 75 32, 98 28, 115 32 C 122 35, 128 48, 120 54 C 112 60, 95 55, 88 64 C 80 72, 70 70, 68 58 Z" />
          {/* North & Central America */}
          <path d="M 52 68 C 62 58, 82 62, 92 74 C 98 82, 85 96, 76 98 C 68 100, 58 88, 52 78 Z" />
          <path d="M 66 96 C 74 98, 80 110, 72 120 C 68 126, 62 118, 64 108 Z" />
          {/* South America */}
          <path d="M 72 118 C 88 116, 106 128, 102 148 C 98 165, 82 176, 75 168 C 68 160, 68 138, 72 118 Z" />
          {/* Greenland / Iceland */}
          <path d="M 124 28 C 132 25, 142 30, 138 38 C 132 42, 122 36, 124 28 Z" />
          {/* Europe / Eurasia */}
          <path d="M 132 46 C 145 42, 168 50, 172 62 C 166 70, 150 68, 142 62 C 136 58, 130 52, 132 46 Z" />
          {/* Africa */}
          <path d="M 136 78 C 152 74, 170 88, 168 112 C 165 130, 152 142, 140 138 C 132 132, 130 110, 134 94 Z" />
        </g>

        {/* Protective Hand Cupping the Globe */}
        <path
          d="M 28 108 
             C 24 125, 34 148, 52 166 
             C 68 182, 88 192, 108 192 
             C 92 192, 74 182, 60 168 
             C 48 155, 42 140, 42 124 
             C 42 108, 48 92, 54 78 
             C 58 70, 60 62, 54 62 
             C 48 62, 44 72, 38 88 
             C 32 100, 29 104, 28 108 Z"
          fill="url(#handGrad)"
        />
        {/* Palm & Fingers Wrap */}
        <path
          d="M 52 166 
             C 66 180, 84 190, 106 190 
             C 120 190, 136 182, 148 170 
             C 134 178, 116 182, 98 178 
             C 80 174, 66 162, 56 148 
             C 50 140, 46 128, 46 116 
             C 42 128, 44 146, 52 166 Z"
          fill="url(#handGrad)"
        />
        <path
          d="M 54 66 
             C 58 60, 66 62, 64 74 
             C 60 92, 50 114, 48 132 
             C 44 120, 48 90, 54 66 Z"
          fill="url(#handGrad)"
        />
      </svg>

      {/* Optional Typography from logo */}
      {showText && (
        <div className="flex flex-col leading-none select-none">
          <span
            className={`font-black uppercase tracking-tight text-base font-sans ${
              theme === 'dark'
                ? 'text-white'
                : theme === 'light'
                ? 'text-slate-900'
                : 'text-slate-900 dark:text-white'
            }`}
            style={{ fontFamily: "'Impact', 'Arial Black', 'Trebuchet MS', sans-serif", letterSpacing: '-0.02em' }}
          >
            Disaster
          </span>
          <span
            className={`font-black uppercase tracking-tight text-base font-sans ${
              theme === 'dark'
                ? 'text-cyan-300'
                : theme === 'light'
                ? 'text-slate-800'
                : 'text-slate-800 dark:text-cyan-300'
            }`}
            style={{ fontFamily: "'Impact', 'Arial Black', 'Trebuchet MS', sans-serif", letterSpacing: '-0.02em' }}
          >
            Management
          </span>
        </div>
      )}
    </div>
  );
};
