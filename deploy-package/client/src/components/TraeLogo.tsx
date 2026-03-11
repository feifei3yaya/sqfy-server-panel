import React from 'react';

type TraeLogoSize = 'sm' | 'md' | 'lg' | 'xl';

const sizeConfig: Record<TraeLogoSize, { container: string; text: string }> = {
  sm: { container: 'w-6 h-6', text: 'text-xs' },
  md: { container: 'w-12 h-12', text: 'text-base' }, // 48px icon + 16px text
  lg: { container: 'w-14 h-14', text: 'text-xl' },
  xl: { container: 'w-20 h-20', text: 'text-3xl' },
};

interface TraeLogoProps {
  size?: TraeLogoSize;
  showText?: boolean;
  className?: string;
}

const TraeLogo: React.FC<TraeLogoProps> = ({
  size = 'md',
  showText = true,
  className = '',
}) => {
  const config = sizeConfig[size];

  return (
    <div
      className={`flex items-center gap-1 ${className}`}
      role="img"
      aria-label="TRAE"
    >
      {/* Logo Image */}
      <img
        src="/TRAElogo.png"
        alt="TRAE Logo"
        className={`${config.container} object-contain rounded-md transition-transform duration-300 hover:scale-110 drop-shadow-md`}
      />

      {/* Brand Text */}
      {showText && (
        <span
          className={`font-bold tracking-wider text-white ${config.text} select-none`}
          style={{
            fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
          }}
        >
          TRAE
        </span>
      )}
    </div>
  );
};

export default TraeLogo;
