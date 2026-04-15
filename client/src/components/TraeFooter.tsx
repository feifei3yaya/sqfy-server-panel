import React from 'react';
import { MessageCircle, Heart, ExternalLink } from 'lucide-react';

interface TraeFooterProps {
  variant?: 'panel' | 'site';
}

const TraeFooter: React.FC<TraeFooterProps> = ({ variant = 'panel' }) => {
  if (variant === 'site') {
    return (
      <footer
        className="mt-auto w-full select-none relative overflow-hidden"
        style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-amber-900/5 to-black/40" />
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid gap-8 md:grid-cols-3 mb-8">
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="text-2xl">🎮</span>
                【FY】肥鸭服务器
              </h3>
              <p className="text-sm leading-6 text-slate-400">
                保护萌新 · 团结老玩家<br />
                稳定开打的中文 Squad 社区
              </p>
              <div className="flex items-center gap-2 pt-2">
                <a
                  href="https://qm.qq.com/q/s4mZxx1eQ8"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-400/10 border border-amber-400/30 text-amber-300 hover:bg-amber-400/20 transition-all text-sm font-medium"
                >
                  <MessageCircle className="w-4 h-4" />
                  QQ群 147724008
                </a>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider">快速链接</h4>
              <ul className="space-y-2.5">
                <li>
                  <a href="#about" className="text-sm text-slate-400 hover:text-amber-400 transition-colors">
                    关于社区
                  </a>
                </li>
                <li>
                  <a href="#rules" className="text-sm text-slate-400 hover:text-amber-400 transition-colors">
                    服务器规则
                  </a>
                </li>
                <li>
                  <a href="#join" className="text-sm text-slate-400 hover:text-amber-400 transition-colors">
                    加入方式
                  </a>
                </li>
                <li>
                  <a href="/guide" className="text-sm text-slate-400 hover:text-amber-400 transition-colors">
                    新手指南
                  </a>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider">联系我们</h4>
              <ul className="space-y-2.5">
                <li className="flex items-center gap-2 text-sm text-slate-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  sq-fy.cn
                </li>
                <li className="flex items-center gap-2 text-sm text-slate-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  QQ群: 147724008
                </li>
                <li className="flex items-center gap-2 text-sm text-slate-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  腾讯云服务器托管
                </li>
              </ul>
              <div className="pt-2">
                <p className="text-xs text-slate-500 italic flex items-center gap-1">
                  <Heart className="w-3 h-3 text-red-400" />
                  用心打造每一个细节
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-white/6 pt-6">
            <div className="flex flex-col items-center gap-3 text-xs text-slate-500">
              <span>© {new Date().getFullYear()} FY Community. All rights reserved.</span>
              <a
                href="https://www.sq-fy.cn/sitemap.xml"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 hover:text-amber-400 transition-colors"
              >
                Sitemap
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        <div className="relative z-10 h-1 bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" />
      </footer>
    );
  }

  return (
    <footer
      className="flex flex-col items-center justify-center py-6 w-full mt-auto select-none"
      style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
    >
      <div
        className="flex flex-col items-center gap-2 text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300"
        aria-label="Developed by 肥肥3鸭鸭 with TRAE"
      >
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
      </div>
    </footer>
  );
};

export default TraeFooter;
