import { useState } from 'react';
import { formatPlayTime } from '../utils/squadApi';
import type { ServerData } from '../utils/squadApi';
import { Users, Map, Server, Clock, ChevronDown, MonitorPlay, BadgeCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ServerCard({ server }: { server: ServerData }) {
  const [expanded, setExpanded] = useState(false);
  
  let statusBg = 'bg-green-500';
  let statusText = 'text-green-500';
  let statusColor = 'border-green-500/30';
  
  if (server.players >= server.maxPlayers) {
    statusBg = 'bg-red-500';
    statusText = 'text-red-500';
    statusColor = 'border-red-500/30';
  } else if (server.players > server.maxPlayers * 0.8) {
    statusBg = 'bg-yellow-500';
    statusText = 'text-yellow-500';
    statusColor = 'border-yellow-500/30';
  }

  const getCountryEmoji = (code: string) => {
    if (!code || code === 'UNKNOWN') return '🌐';
    const codePoints = code.toUpperCase().split('').map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  };

  return (
    <motion.div 
      layout
      className={`group bg-[#1a1a1a] border ${statusColor} rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-yellow-500/5 hover:-translate-y-0.5 mb-4`}
    >
      <div className="p-3 sm:p-5 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1 min-w-0">
            <div className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full mt-1.5 sm:mt-0 shrink-0 shadow-[0_0_8px_currentColor] ${statusBg}`} />
            <div className="flex-1 min-w-0">
              <h3 className="text-base sm:text-lg font-bold text-slate-100 truncate group-hover:text-yellow-500 transition-colors" title={server.name}>
                {server.name}
              </h3>
              {server.isModServer && (
                <span className="inline-flex items-center px-2 py-0.5 mt-1 sm:mt-1.5 rounded text-[10px] sm:text-xs font-medium bg-slate-800 text-slate-400 border border-slate-700">
                  Mod 服
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6 shrink-0 w-full sm:w-auto border-t sm:border-0 border-slate-800/50 pt-3 sm:pt-0 mt-1 sm:mt-0">
            <div className="flex flex-col items-start sm:items-end">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Users size={14} className={statusText} />
                <span className={`font-mono font-bold text-sm sm:text-base ${statusText}`}>
                  {server.players} <span className="text-slate-500 font-normal">/ {server.maxPlayers}</span>
                </span>
              </div>
              {server.queue > 0 && (
                <span className="text-[10px] sm:text-xs text-yellow-500 font-medium mt-0.5">
                  排队: {server.queue} 人
                </span>
              )}
            </div>
            
            <div className="p-1.5 sm:p-2 rounded-lg bg-slate-800/50 text-slate-400 group-hover:bg-yellow-500/10 group-hover:text-yellow-500 transition-colors">
              <ChevronDown size={18} className={`transform transition-transform duration-300 sm:w-5 sm:h-5 ${expanded ? 'rotate-180' : ''}`} />
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="px-3 sm:px-5 pb-4 sm:pb-5 pt-2 sm:pt-4 border-t border-slate-800/50 bg-[#151515]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6">
                <div className="space-y-2.5 sm:space-y-3">
                  <div className="flex items-center justify-between p-2 sm:p-3 rounded-lg bg-[#0f0f0f] border border-slate-800/50">
                    <div className="flex items-center gap-2 sm:gap-3 text-slate-400">
                      <Server size={14} className="sm:w-4 sm:h-4 text-yellow-500" />
                      <span className="text-xs sm:text-sm">服务器 IP</span>
                    </div>
                    <span className="font-mono text-xs sm:text-sm text-slate-200 select-all">{server.ip}:{server.port}</span>
                  </div>
                  <div className="flex items-center justify-between p-2 sm:p-3 rounded-lg bg-[#0f0f0f] border border-slate-800/50">
                    <div className="flex items-center gap-2 sm:gap-3 text-slate-400">
                      <Map size={14} className="sm:w-4 sm:h-4 text-emerald-400" />
                      <span className="text-xs sm:text-sm">当前地图</span>
                    </div>
                    <span className="font-medium text-xs sm:text-sm text-slate-200 truncate ml-2 text-right">{server.map}</span>
                  </div>
                </div>

                <div className="space-y-2.5 sm:space-y-3">
                  <div className="flex items-center justify-between p-2 sm:p-3 rounded-lg bg-[#0f0f0f] border border-slate-800/50">
                    <div className="flex items-center gap-2 sm:gap-3 text-slate-400">
                      <MonitorPlay size={14} className="sm:w-4 sm:h-4 text-orange-500" />
                      <span className="text-xs sm:text-sm">游戏模式</span>
                    </div>
                    <span className="font-medium text-xs sm:text-sm text-slate-200">{server.gameMode}</span>
                  </div>
                  <div className="flex items-center justify-between p-2 sm:p-3 rounded-lg bg-[#0f0f0f] border border-slate-800/50">
                    <div className="flex items-center gap-2 sm:gap-3 text-slate-400">
                      <Clock size={14} className="sm:w-4 sm:h-4 text-blue-400" />
                      <span className="text-xs sm:text-sm">已进行时间</span>
                    </div>
                    <span className="font-mono text-xs sm:text-sm text-slate-200">{formatPlayTime(server.playTime)}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-y-2 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-slate-800/50">
                <div className="flex flex-wrap items-center gap-x-4 sm:gap-x-6 gap-y-2 text-[10px] sm:text-sm text-slate-400">
                  <div className="flex items-center gap-1 sm:gap-1.5" title="服务器所属国家/地区">
                    <span className="text-sm sm:text-base">{getCountryEmoji(server.country || 'UNKNOWN')}</span>
                    <span className="sm:hidden">{server.country}</span>
                  </div>
                  {server.licenseId && (
                    <div className="flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded bg-yellow-500/10 text-yellow-500 text-[10px] sm:text-xs font-medium border border-yellow-500/20">
                      <BadgeCheck size={10} className="sm:w-3 sm:h-3" />
                      认证服 #{server.licenseId}
                    </div>
                  )}
                  <div className="flex items-center gap-1 sm:gap-1.5 hidden xs:flex">
                    <Map size={12} className="sm:w-3.5 sm:h-3.5 text-slate-500" />
                    <span>下一图: <span className="text-slate-300">{server.nextMap}</span></span>
                  </div>
                </div>
                <div className="text-[10px] sm:text-xs text-slate-500">版本: {server.version}</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
