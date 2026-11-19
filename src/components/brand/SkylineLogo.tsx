import React from 'react';

interface SkylineLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  inverted?: boolean;
}

export const SkylineLogo: React.FC<SkylineLogoProps> = ({
  className = '',
  size = 'md',
  showTagline = false,
  inverted = false,
}) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-14 h-14',
    xl: 'w-24 h-24',
  };

  const textSizes = {
    sm: 'text-sm tracking-tight',
    md: 'text-lg tracking-tight',
    lg: 'text-2xl tracking-normal',
    xl: 'text-3xl tracking-wide',
  };

  const academySizes = {
    sm: 'text-[9px] tracking-widest',
    md: 'text-[11px] tracking-[0.2em]',
    lg: 'text-sm tracking-[0.25em]',
    xl: 'text-lg tracking-[0.3em]',
  };

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Official Mountain + Sun Emblem */}
      <div className={`relative ${iconSizes[size]} shrink-0 flex items-center justify-center`}>
        <svg viewBox="0 0 100 80" className="w-full h-full" fill="none">
          {/* Golden Sun */}
          <circle cx="58" cy="30" r="22" fill="#FFB703" />
          <circle cx="58" cy="30" r="18" fill="#FFC82C" />

          {/* Back Mountain */}
          <polygon points="40,75 60,32 82,75" fill="#00968F" />
          <polygon points="54,45 60,32 66,45" fill="#FFFFFF" />

          {/* Left Mountain */}
          <polygon points="12,75 32,38 52,75" fill="#00B8B0" />
          <polygon points="26,50 32,38 38,50" fill="#E0F7F6" />

          {/* Main Front Mountain with snow caps */}
          <polygon points="28,75 55,20 88,75" fill="#00A29A" />
          <polygon points="46,38 55,20 64,38 58,35 55,40 50,35" fill="#FFFFFF" />

          {/* Right small peak */}
          <polygon points="65,75 80,48 95,75" fill="#087F7A" />
          <polygon points="76,55 80,48 84,55" fill="#FFFFFF" />

          {/* Dynamic Golden Pencil stroke */}
          <path
            d="M34,48 L56,26 L60,30 L38,52 Z"
            fill="#FF8A00"
            opacity="0.9"
          />
        </svg>
      </div>

      {/* Typography: SKYLINE in Turquoise, ACADEMY in Orange */}
      <div className="flex flex-col leading-none">
        <div
          className={`font-display font-extrabold uppercase ${textSizes[size]} ${
            inverted ? 'text-white' : 'text-[#00B8B0]'
          }`}
        >
          Skyline
        </div>
        <div
          className={`font-display font-bold uppercase ${academySizes[size]} text-[#FF8A00] font-mono`}
        >
          Academy
        </div>

        {showTagline && (
          <div className="text-[11px] font-medium text-white/90 mt-1">
            Learn. Prepare. Achieve.
          </div>
        )}
      </div>
    </div>
  );
};
