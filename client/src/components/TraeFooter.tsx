import React from 'react';

const TraeFooter: React.FC = () => {
  return (
    <footer
      className="flex flex-col items-center justify-center py-6 w-full mt-auto select-none"
      style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
    >
      {/* Brand Visuals removed */}

      {/* Declaration Text */}
      <div 
        className="flex flex-col items-center gap-2 text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300"
        aria-label="Developed by 肥肥3鸭鸭 with TRAE, version FY-v1.0.0.0"
      >
        {/* 内部使用声明 */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-red-500/10 border border-red-500/30">
          <span className="text-red-400 font-bold text-xs tracking-wider">⚠️ 仅限内部使用，请勿外传</span>
        </div>
        
        <div className="flex items-center gap-1.5 font-medium">
          <span>本面板由</span>
          <span className="font-bold text-amber-500 hover:text-amber-400 transition-colors cursor-default drop-shadow-sm">肥肥3鸭鸭</span>
          <span>使用</span>
          <a 
            href="https://www.trae.ai/" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex items-center gap-1 hover:opacity-80 transition-opacity"
            title="Visit TRAE Website"
          >
            <img src="/TRAElogo.png" alt="TRAE Logo" className="w-5 h-5 object-contain hover:scale-110 transition-transform duration-300" />
            <span className="font-bold text-emerald-500 hover:text-emerald-400 transition-colors drop-shadow-sm">TRAE</span>
          </a>
          <span>开发</span>
        </div>
        
        <div className="px-2.5 py-0.5 rounded-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-[10px] font-mono tracking-wider text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
          FY-v1.0.0.0
        </div>
      </div>
    </footer>
  );
};

export default TraeFooter;
