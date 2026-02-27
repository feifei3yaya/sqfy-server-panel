import React from 'react';

type LogoMarkSize = 'sm' | 'md' | 'lg' | 'xl';

const sizeToImgClass: Record<LogoMarkSize, string> = {
  sm: 'h-8 w-8',
  md: 'h-14 w-14',
  lg: 'h-24 w-24',
  xl: 'h-40 w-40',
};

const sizeToHaloPx: Record<LogoMarkSize, number> = {
  sm: 64,
  md: 104,
  lg: 168,
  xl: 260,
};

const sizeToHaloOpacity: Record<LogoMarkSize, number> = {
  sm: 0.2,
  md: 0.22,
  lg: 0.24,
  xl: 0.28,
};

export default function LogoMark({ size = 'md' }: { size?: LogoMarkSize }) {
  const haloSize = sizeToHaloPx[size];
  return (
    <div className="relative inline-flex items-center justify-center">
      <div
        aria-hidden
        style={{
          width: haloSize,
          height: haloSize,
          opacity: sizeToHaloOpacity[size],
          background:
            'radial-gradient(circle at 50% 45%, rgba(245, 158, 11, 0.65), rgba(245, 158, 11, 0.22) 40%, rgba(0, 0, 0, 0) 68%)',
          filter: 'blur(12px)',
          transform: 'translateZ(0)',
        }}
        className="absolute rounded-full"
      />
      <img
        src="/FYlogo.png"
        alt="Logo"
        className={`relative z-10 ${sizeToImgClass[size]} object-contain`}
        style={{
          filter:
            'drop-shadow(0 14px 28px rgba(0, 0, 0, 0.68)) drop-shadow(0 0 1.1px rgba(255, 255, 255, 0.28)) drop-shadow(0 0 6px rgba(245, 158, 11, 0.12))',
        }}
      />
    </div>
  );
}
