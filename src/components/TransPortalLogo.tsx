import React from 'react';

interface TransPortalLogoProps {
  className?: string;
  lightBackground?: boolean; // If true, rendering inside a white/light header. If false, inside a dark/colored area.
  size?: 'sm' | 'md' | 'lg';
}

export const TransPortalLogo: React.FC<TransPortalLogoProps> = ({
  className = '',
  lightBackground = true,
  size = 'md',
}) => {
  const iconSizeClass = size === 'sm' ? 'w-8 h-8' : size === 'lg' ? 'w-14 h-14' : 'w-10 h-10';
  const textTitleClass =
    size === 'sm'
      ? 'text-sm'
      : size === 'lg'
      ? 'text-3xl'
      : 'text-xl';
  const textSubtitleClass =
    size === 'sm'
      ? 'text-[8px] tracking-wider'
      : size === 'lg'
      ? 'text-[11px] tracking-widest'
      : 'text-[9px] tracking-widest';

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* TransPortal Stylized Icon */}
      <div className={`${iconSizeClass} shrink-0`}>
        <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Main dark blue rounded box */}
          <rect width="100" height="100" rx="22" fill="#1e3553" />
          
          {/* Stylized windshield/cabin of car/van */}
          <path d="M26 42 L37 24 H63 L74 42 Z" stroke="white" strokeWidth="6" strokeLinejoin="round" fill="white" />
          {/* Windshield gap (dark glass) */}
          <path d="M34 38 L39 27 H61 L66 38 Z" fill="#1e3553" />
          
          {/* Horizontal bumper bar */}
          <rect x="25" y="47" width="50" height="7" rx="3.5" fill="white" />
          
          {/* Green license plate bar in center */}
          <rect x="42" y="49" width="16" height="3" rx="1.5" fill="#10b981" />
          
          {/* Orange round headlights/wheels elements at bottom left/right */}
          <circle cx="28" cy="54" r="11" fill="#f09033" />
          <circle cx="72" cy="54" r="11" fill="#f09033" />
        </svg>
      </div>

      {/* TransPortal Wordmark and Subtitle */}
      <div className="flex flex-col justify-center leading-none">
        <div className={`font-extrabold tracking-tight ${textTitleClass} flex items-baseline leading-none`}>
          <span className={lightBackground ? 'text-[#1e3a5f]' : 'text-white'}>
            Trans
          </span>
          <span className="text-[#f09033]">
            Portal
          </span>
        </div>
        <div
          className={`font-black text-slate-400 mt-1 uppercase text-left leading-none ${textSubtitleClass}`}
          style={{ letterSpacing: '0.12em' }}
        >
          TRANSPORTE ESPECIAL
        </div>
      </div>
    </div>
  );
};
