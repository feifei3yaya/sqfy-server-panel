import React, { useState, useEffect } from 'react';
import { Card, Tag, List, Avatar, Typography, Progress, Button } from 'antd';
import { 
  CloudServerOutlined, 
  UserOutlined, 
  SafetyCertificateOutlined, 
  StopOutlined,
  ReloadOutlined,
  ArrowRightOutlined
} from '@ant-design/icons';
import { XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import * as api from '../api/dashboard';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Link } from 'react-router-dom';

dayjs.extend(relativeTime);

import { useTranslation } from 'react-i18next';

const { Title, Text } = Typography;

const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState<api.DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.getDashboardStats();
      setStats(res.data);
    } catch (error) {
      console.error('Failed to fetch dashboard stats');
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return (
      <div className="flex justify-center items-center h-full bg-[#0b0c10]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500"></div>
        <span className="ml-2 text-gray-400">{t('common.loading')}</span>
      </div>
    );
  }

  // Calculate percentages
  const totalMaxPlayers = stats.summary.totalServers * 100;
  const occupancyRate = totalMaxPlayers > 0 ? Math.round((stats.summary.totalPlayers / totalMaxPlayers) * 100) : 0;

  return (
    <div className="flex flex-col h-full bg-[#0b0c10] overflow-hidden p-2 gap-2">
      {/* 1. Top Section: Metrics & Chart (35% Height) */}
      <div className="h-[35%] flex gap-2 min-h-[200px]">
        {/* Left Column: Key Metrics (25% Width) */}
        <div className="w-1/4 flex flex-col gap-2">
          {/* Main Hero Card */}
          <Card 
            className="flex-1 bg-[#15171e] border-none shadow-sm relative overflow-hidden group !m-0"
            bodyStyle={{ height: '100%', padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
          >
            <div className="absolute right-2 top-2 opacity-10 group-hover:opacity-20 transition-opacity">
              <UserOutlined style={{ fontSize: '80px', color: '#fbbf24' }} />
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">{t('dashboard.onlinePlayers')}</Text>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-white tracking-tighter leading-none">{stats.summary.totalPlayers}</span>
                <span className="text-gray-600 text-xs font-mono">/ {totalMaxPlayers}</span>
              </div>
              <div className="mt-2">
                <Progress 
                  percent={occupancyRate} 
                  strokeColor="#fbbf24" 
                  trailColor="rgba(255,255,255,0.05)" 
                  size="small" 
                  showInfo={false}
                  strokeWidth={3}
                />
              </div>
            </div>
          </Card>

          {/* Sub Metrics Row */}
          <div className="h-1/3 flex gap-2">
            <Card className="flex-1 bg-[#15171e] border-none !m-0 flex items-center justify-center" bodyStyle={{ padding: '12px', width: '100%' }}>
              <div className="flex flex-col items-center">
                <span className="text-gray-500 text-[9px] uppercase font-bold">{t('dashboard.activeAdmins')}</span>
                <div className="text-lg font-bold text-blue-400 flex items-center gap-1">
                  {stats.summary.activeAdmins}
                  <SafetyCertificateOutlined className="text-[10px]" />
                </div>
              </div>
            </Card>
            <Card className="flex-1 bg-[#15171e] border-none !m-0 flex items-center justify-center" bodyStyle={{ padding: '12px', width: '100%' }}>
              <div className="flex flex-col items-center">
                <span className="text-gray-500 text-[9px] uppercase font-bold">{t('dashboard.bansToday')}</span>
                <div className="text-lg font-bold text-red-400 flex items-center gap-1">
                  {stats.recentBans.length}
                  <StopOutlined className="text-[10px]" />
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Right Column: Chart (75% Width) */}
        <div className="w-3/4">
          <Card 
            className="h-full bg-[#15171e] border-none !m-0"
            bodyStyle={{ padding: '12px 16px', height: '100%', display: 'flex', flexDirection: 'column' }}
          >
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                {t('dashboard.trafficTrend')}
              </span>
              <ReloadOutlined onClick={fetchStats} className="text-gray-600 hover:text-white cursor-pointer text-xs" />
            </div>
            <div className="flex-1 w-full min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.chartData}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#fbbf24" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                  <XAxis 
                    dataKey="time" 
                    tickFormatter={(time) => dayjs(time).format('HH:mm')}
                    tick={{ fill: '#525252', fontSize: 9 }}
                    axisLine={false}
                    tickLine={false}
                    minTickGap={30}
                  />
                  <YAxis 
                    tick={{ fill: '#525252', fontSize: 9 }}
                    axisLine={false}
                    tickLine={false}
                    width={25}
                  />
                  <ChartTooltip 
                    contentStyle={{ backgroundColor: '#1f1f1f', border: 'none', color: '#fff', fontSize: '11px', borderRadius: '4px' }}
                    itemStyle={{ color: '#fbbf24' }}
                    labelFormatter={(label) => dayjs(label).format('HH:mm')}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#fbbf24" 
                    strokeWidth={1.5} 
                    fillOpacity={1} 
                    fill="url(#colorCount)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>

      {/* 2. Middle Section: Server Grid (Flexible Height) */}
      <div className="flex-1 min-h-[200px] flex flex-col gap-2">
        <div className="flex justify-between items-center px-1">
          <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
            <CloudServerOutlined className="text-amber-500" />
            {t('dashboard.serverMatrix')}
          </span>
          <Link to="/servers" className="text-[10px] text-gray-600 hover:text-amber-500 font-bold flex items-center gap-1 transition-colors">
            {t('dashboard.viewAll')} <ArrowRightOutlined className="text-[8px]" />
          </Link>
        </div>
        
        <div className="flex-1 bg-[#15171e] rounded-lg p-2 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-800">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
            {stats.serverStatuses.map(server => (
              <Link to={`/?server=${server.id}`} key={server.id} className="block group h-20">
                <div className="h-full relative rounded bg-[#1c1f26] border border-transparent hover:border-amber-500/30 transition-all overflow-hidden flex flex-col">
                  {/* Status Strip */}
                  <div className={`absolute left-0 top-0 bottom-0 w-0.5 ${server.status === 'connected' ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                  
                  {/* Content */}
                  <div className="flex-1 pl-3 pr-3 py-2 flex flex-col justify-between z-10 relative">
                    <div className="flex justify-between items-start w-full">
                      <span className="text-gray-200 font-bold text-xs truncate flex-1 pr-2 group-hover:text-amber-400 transition-colors">
                        {server.name}
                      </span>
                      {server.map && (
                        <span className="text-[9px] text-gray-500 bg-black/20 px-1 rounded font-mono border border-white/5">
                          {server.map}
                        </span>
                      )}
                    </div>

                    <div className="flex items-end justify-between mt-1">
                      <span className={`text-[9px] font-bold ${server.status === 'connected' ? 'text-emerald-500' : 'text-red-500'}`}>
                        {server.status === 'connected' ? t('dashboard.live') : 'OFFLINE'}
                      </span>
                      <div className="text-right">
                        <span className="text-sm font-bold text-white font-mono">{server.playerCount}</span>
                        <span className="text-[9px] text-gray-600 font-mono">/{server.maxPlayers}</span>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar Bottom */}
                  <div className="h-0.5 bg-gray-800 w-full mt-auto">
                    <div 
                      className="h-full bg-amber-500/80 transition-all duration-500" 
                      style={{ width: `${Math.min((server.playerCount / (server.maxPlayers || 100)) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Bottom Section: Compact Lists (25% Height) */}
      <div className="h-[25%] min-h-[160px] grid grid-cols-2 gap-2">
        {/* Recent Bans */}
        <Card 
          className="bg-[#15171e] border-none !m-0 flex flex-col"
          bodyStyle={{ padding: 0, flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
          size="small"
        >
          <div className="px-3 py-2 border-b border-gray-800 flex justify-between items-center bg-[#1c1f26]">
            <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">{t('dashboard.recentBans')}</span>
            <Link to="/players" className="text-[9px] text-gray-600 hover:text-white">{t('dashboard.viewAll')}</Link>
          </div>
          <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-800">
            <List
              dataSource={stats.recentBans}
              size="small"
              split={false}
              renderItem={item => {
                let name = 'Unknown';
                try {
                  const history = JSON.parse(item.player.nameHistory);
                  if (history.length > 0) name = history[history.length - 1];
                } catch (e) {}
                return (
                  <List.Item className="!py-1.5 !px-3 hover:bg-white/5 transition-colors">
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <StopOutlined className="text-red-500 text-xs" />
                        <span className="text-gray-300 text-[11px] truncate max-w-[100px]">{name}</span>
                        <span className="text-[9px] text-red-400 bg-red-900/10 px-1 rounded">{item.reason}</span>
                      </div>
                      <span className="text-[9px] text-gray-600 whitespace-nowrap ml-2">{dayjs(item.createdAt).fromNow(true)}</span>
                    </div>
                  </List.Item>
                );
              }}
            />
          </div>
        </Card>

        {/* Active Admins */}
        <Card 
          className="bg-[#15171e] border-none !m-0 flex flex-col"
          bodyStyle={{ padding: 0, flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
          size="small"
        >
          <div className="px-3 py-2 border-b border-gray-800 flex justify-between items-center bg-[#1c1f26]">
            <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">{t('dashboard.onDuty')}</span>
            <Link to="/attendance" className="text-[9px] text-gray-600 hover:text-white">REPORT</Link>
          </div>
          <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-800">
            <List
              dataSource={stats.activeAdmins}
              size="small"
              split={false}
              locale={{ emptyText: <div className="text-gray-700 text-[10px] py-4 text-center">{t('dashboard.noAdmins')}</div> }}
              renderItem={item => (
                <List.Item className="!py-1.5 !px-3 hover:bg-white/5 transition-colors">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-blue-600 flex items-center justify-center text-[8px] text-white font-bold">
                        {item.admin.username[0].toUpperCase()}
                      </div>
                      <span className="text-gray-300 text-[11px]">{item.admin.username}</span>
                      <span className="text-[9px] text-blue-400 bg-blue-900/10 px-1 rounded truncate max-w-[80px]">{item.server.name}</span>
                    </div>
                    <span className="text-[9px] text-emerald-500 font-mono">
                      {dayjs().diff(dayjs(item.sessionStart), 'minute')}m
                    </span>
                  </div>
                </List.Item>
              )}
            />
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
