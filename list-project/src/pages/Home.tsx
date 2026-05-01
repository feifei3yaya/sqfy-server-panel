import { useEffect, useState } from 'react';
import { fetchServers } from '../utils/squadApi';
import type { ServerData } from '../utils/squadApi';
import ServerCard from '../components/ServerCard';
import { RefreshCw, Search, Activity, Users, MapPin, Globe, Server } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Home() {
  const [servers, setServers] = useState<ServerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'LICENSED'|'CUSTOM'>('LICENSED');
  const [regionFilter, setRegionFilter] = useState<'ALL' | 'CN' | 'OTHER'>('ALL');

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchServers(activeTab, regionFilter);
      setServers(data);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [activeTab, regionFilter]);

  const filtered = servers.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.ip.includes(search);
    const matchRegion =
      regionFilter === 'ALL' ? true : regionFilter === 'CN' ? s.country === 'CN' : s.country !== 'CN';
    return matchSearch && matchRegion;
  });

  const activeTabServersCount = filtered.length;
  const activeTabTotalPlayers = filtered.reduce((acc, curr) => acc + curr.players, 0);

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white flex flex-col">
      <header className="sticky top-0 z-50 bg-[#0f0f0f]/80 backdrop-blur-lg border-b border-slate-800 shadow-xl shadow-black/20">
        <div className="container max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg overflow-hidden bg-white flex items-center justify-center shadow-[0_0_15px_rgba(255,184,0,0.3)] p-1 shrink-0">
              <div className="w-full h-full bg-yellow-500 rounded-sm font-bold text-black flex items-center justify-center text-xs">FY</div>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-wider flex items-center gap-1 sm:gap-2">
              <span className="text-yellow-500 drop-shadow-[0_0_8px_rgba(255,184,0,0.4)]">【FY】</span>
              <span className="text-white hidden sm:inline">肥鸭服务器社区</span>
              <span className="text-white sm:hidden">肥鸭社区</span>
            </h1>
            <span className="text-slate-400 font-mono text-xs sm:text-sm border-l border-slate-700 pl-2 sm:pl-3 ml-1 hidden md:block mt-1">Squad服务器查询列表</span>
          </div>
        </div>
      </header>

      <main className="flex-1 container max-w-6xl mx-auto px-4 py-6 sm:py-8 flex flex-col gap-6 sm:gap-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-[#1a1a1a] border border-slate-800 rounded-xl p-4 sm:p-5 flex flex-col gap-1 sm:gap-2 relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-16 h-16 sm:w-20 sm:h-20 bg-yellow-500/10 rounded-full blur-2xl"></div>
            <span className="text-xs sm:text-sm text-slate-400 font-medium flex items-center gap-1.5 sm:gap-2"><Activity size={14} className="text-yellow-500 sm:w-4 sm:h-4"/> 活跃服务器</span>
            <span className="text-2xl sm:text-3xl font-mono font-bold text-white">{activeTabServersCount}</span>
          </div>
          
          <div className="bg-[#1a1a1a] border border-slate-800 rounded-xl p-4 sm:p-5 flex flex-col gap-1 sm:gap-2 relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-16 h-16 sm:w-20 sm:h-20 bg-orange-500/10 rounded-full blur-2xl"></div>
            <span className="text-xs sm:text-sm text-slate-400 font-medium flex items-center gap-1.5 sm:gap-2"><Users size={14} className="text-orange-500 sm:w-4 sm:h-4"/> 总在线玩家</span>
            <span className="text-2xl sm:text-3xl font-mono font-bold text-white">{activeTabTotalPlayers}</span>
          </div>

          <div className="col-span-2 bg-[#1a1a1a] border border-slate-800 rounded-xl p-4 sm:p-5 flex flex-col justify-center">
            <div className="flex flex-col gap-2 sm:gap-3">
              <div className="flex items-center gap-2 sm:gap-4 text-[10px] sm:text-xs font-mono text-slate-400 flex-wrap">
                <div className="flex items-center gap-1.5 whitespace-nowrap"><div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-500 shadow-[0_0_5px_currentColor]"></div> 空闲 (≤ 90%)</div>
                <div className="flex items-center gap-1.5 whitespace-nowrap"><div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-yellow-500 shadow-[0_0_5px_currentColor]"></div> 拥挤 (&gt; 90%)</div>
                <div className="flex items-center gap-1.5 whitespace-nowrap"><div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-red-500 shadow-[0_0_5px_currentColor]"></div> 爆满 (100%)</div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-1 sm:gap-2 border-b border-slate-800 pb-px overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setActiveTab('LICENSED')}
            className={`flex items-center justify-center flex-1 sm:flex-none gap-1.5 sm:gap-2 px-3 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base font-medium transition-all relative whitespace-nowrap ${activeTab === 'LICENSED' ? 'text-yellow-500' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <Globe size={16} className="sm:w-[18px] sm:h-[18px]" />
            官方认证服
            {activeTab === 'LICENSED' && <motion.div layoutId="activeTabIndicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-yellow-500 shadow-[0_0_8px_rgba(255,184,0,0.5)]" />}
          </button>
          <button
            onClick={() => setActiveTab('CUSTOM')}
            className={`flex items-center justify-center flex-1 sm:flex-none gap-1.5 sm:gap-2 px-3 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base font-medium transition-all relative whitespace-nowrap ${activeTab === 'CUSTOM' ? 'text-yellow-500' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <Server size={16} className="sm:w-[18px] sm:h-[18px]" />
            自定义服务器 (Custom)
            {activeTab === 'CUSTOM' && <motion.div layoutId="activeTabIndicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-yellow-500 shadow-[0_0_8px_rgba(255,184,0,0.5)]" />}
          </button>
        </div>

        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setRegionFilter('ALL')}
            className={`flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg border text-sm font-medium transition-colors whitespace-nowrap ${regionFilter === 'ALL' ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-500' : 'bg-[#1a1a1a] border-slate-700/50 text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}
          >
            <Globe size={16} />
            全部
          </button>
          <button
            onClick={() => setRegionFilter('CN')}
            className={`flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg border text-sm font-medium transition-colors whitespace-nowrap ${regionFilter === 'CN' ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-500' : 'bg-[#1a1a1a] border-slate-700/50 text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}
          >
            <MapPin size={16} />
            国服
          </button>
          <button
            onClick={() => setRegionFilter('OTHER')}
            className={`flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg border text-sm font-medium transition-colors whitespace-nowrap ${regionFilter === 'OTHER' ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-500' : 'bg-[#1a1a1a] border-slate-700/50 text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}
          >
            <Globe size={16} />
            外服
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-center">
          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
            <input 
              type="text" 
              placeholder="搜索服务器名称、IP或地图..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#1a1a1a]/80 border border-slate-700/50 rounded-xl pl-12 pr-4 py-3 sm:py-3.5 text-sm sm:text-base text-white placeholder-slate-500 focus:outline-none focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/50 transition-all"
            />
          </div>
          <button 
            onClick={loadData}
            disabled={loading}
            className="w-full sm:w-auto shrink-0 flex items-center justify-center gap-2 px-6 py-3 sm:py-3.5 bg-[#1a1a1a] hover:bg-slate-800 border border-slate-700/50 rounded-xl text-sm sm:text-base text-white transition-colors"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">刷新数据</span>
            <span className="sm:hidden">刷新</span>
          </button>
        </div>

        <div className="flex flex-col gap-4">
          {filtered.map(s => <ServerCard key={s.id} server={s} />)}
          {!loading && filtered.length === 0 && (
            <div className="py-20 text-center text-slate-500 flex flex-col items-center justify-center gap-3">
              <Server size={48} className="text-slate-700" />
              <p>没有找到相关的服务器</p>
            </div>
          )}
        </div>
      </main>
      
      <footer className="mt-auto py-8 border-t border-slate-800/50 bg-[#0f0f0f]/50 backdrop-blur-sm">
        <div className="container max-w-6xl mx-auto px-4 text-center flex flex-col items-center justify-center gap-3">
          <p className="text-slate-500 text-sm font-medium tracking-wide">
            本列表由 <span className="text-yellow-500 font-bold">肥肥3鸭鸭</span> 联合 <span className="text-white font-bold">TRAE</span> 开发
          </p>
        </div>
      </footer>
    </div>
  );
}
