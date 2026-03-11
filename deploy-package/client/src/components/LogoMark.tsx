type LogoMarkSize = 'sm' | 'md' | 'lg' | 'xl';

export interface LogoMarkProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeToImgClass: Record<LogoMarkSize, string> = {
  sm: 'h-5 w-5',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
  xl: 'h-20 w-20',
};

const sizeToBgClass: Record<LogoMarkSize, string> = {
  sm: 'h-8 w-8',
  md: 'h-12 w-12',
  lg: 'h-16 w-16',
  xl: 'h-24 w-24',
};

export default function LogoMark({ size = 'md' }: { size?: LogoMarkSize }) {
  return (
    <div className={`inline-flex items-center justify-center rounded-xl bg-gray-100 ${sizeToBgClass[size]}`} style={{ border: '2px solid #ffffff' }}>
      <img
        src="/FYlogo.png"
        alt="Logo"
        className={`${sizeToImgClass[size]} object-contain`}
      />
    </div>
  );
}
