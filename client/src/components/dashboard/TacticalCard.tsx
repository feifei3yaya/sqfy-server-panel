import React from 'react';
import { Card } from 'antd';

interface TacticalCardProps {
  title?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  extra?: React.ReactNode;
  noPadding?: boolean;
}

const TacticalCard: React.FC<TacticalCardProps> = ({ 
  title, 
  children, 
  className = '', 
  extra,
  noPadding = false 
}) => {
  return (
    <div className={`relative group ${className}`}>
      {/* Corner Brackets - HUD Style */}
      <div className="absolute top-0 left-0 w-2 h-2 border-l-2 border-t-2 border-[var(--text-brand)]/50 rounded-tl-sm transition-all duration-300 group-hover:w-4 group-hover:h-4 group-hover:border-[var(--text-brand)]"></div>
      <div className="absolute top-0 right-0 w-2 h-2 border-r-2 border-t-2 border-[var(--text-brand)]/50 rounded-tr-sm transition-all duration-300 group-hover:w-4 group-hover:h-4 group-hover:border-[var(--text-brand)]"></div>
      <div className="absolute bottom-0 left-0 w-2 h-2 border-l-2 border-b-2 border-[var(--text-brand)]/50 rounded-bl-sm transition-all duration-300 group-hover:w-4 group-hover:h-4 group-hover:border-[var(--text-brand)]"></div>
      <div className="absolute bottom-0 right-0 w-2 h-2 border-r-2 border-b-2 border-[var(--text-brand)]/50 rounded-br-sm transition-all duration-300 group-hover:w-4 group-hover:h-4 group-hover:border-[var(--text-brand)]"></div>

      {/* Main Content */}
      <Card
        className="h-full bg-[var(--bg-card)]/90 border border-[var(--border-color)] backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
        variant="borderless"
        styles={{ 
          body: { 
            padding: noPadding ? 0 : 24, 
            height: '100%',
            display: 'flex',
            flexDirection: 'column'
          },
          header: {
            borderBottom: '1px solid var(--border-color)',
            minHeight: '48px',
            padding: '0 24px'
          }
        }}
        title={title ? (
          <span className="font-mono uppercase tracking-widest text-[var(--text-primary)] text-sm flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-[var(--text-brand)] rounded-full animate-pulse"></span>
            {title}
          </span>
        ) : undefined}
        extra={extra}
      >
        {children}
      </Card>
    </div>
  );
};

export default TacticalCard;
