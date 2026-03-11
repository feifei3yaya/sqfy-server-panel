import React, { useState, useEffect, useCallback } from 'react';
import { Row, Col, Skeleton, Alert, Button } from 'antd';
import * as api from '../api/dashboard';
import { socket } from '../utils/socket';
import { getErrorMessage } from '../utils/httpError';

// New Dashboard Components
import DashboardHeader from '../components/dashboard/DashboardHeader';
import StatGrid from '../components/dashboard/StatGrid';
import ServerMonitorCard from '../components/dashboard/ServerMonitorCard';
import ActivityFeed from '../components/dashboard/ActivityFeed';
import QuickActions from '../components/dashboard/QuickActions';

const Home: React.FC = () => {
  // const { t } = useTranslation();
  const [stats, setStats] = useState<api.DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorText, setErrorText] = useState('');

  const fetchStats = useCallback(async () => {
    try {
      setRefreshing(true);
      const res = await api.getDashboardStats();
      setStats(res.data);
      setErrorText('');
    } catch (error) {
      setErrorText(getErrorMessage(error, '加载面板数据失败，请稍后重试'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 60000);
    
    // Only listen for game-related updates, ignore system stats (cpu/mem)
    socket.on('serverInfoUpdate', (data: any) => {
      setStats(prev => {
        if (!prev || !prev.serverStatuses) return prev;
        const newStatuses = prev.serverStatuses.map(s => 
          s.id === data.serverId ? { 
            ...s, 
            map: data.currentMap,
            playerCount: data.playerCount,
            maxPlayers: data.maxPlayers
          } : s
        );
        
        return { ...prev, serverStatuses: newStatuses };
      });
    });

    return () => {
      clearInterval(interval);
      socket.off('serverInfoUpdate');
    };
  }, [fetchStats]);

  if (loading && !stats) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton active paragraph={{ rows: 2 }} />
        <Row gutter={[16, 16]}>
          {[1, 2, 3, 4].map(i => (
            <Col xs={24} sm={12} md={6} key={i}><Skeleton.Button active block style={{ height: 100 }} /></Col>
          ))}
        </Row>
        <Skeleton active paragraph={{ rows: 10 }} />
      </div>
    );
  }

  const totalMaxPlayers = stats?.summary?.totalServers ? stats.summary.totalServers * 100 : 0;

  return (
    <div className="space-y-6 pb-8 animate-fade-in">
      {/* Header Section */}
      <DashboardHeader 
        onRefresh={fetchStats} 
        refreshing={refreshing} 
      />
      {errorText && (
        <Alert
          type="error"
          showIcon
          message="数据加载异常"
          description={
            <div className="flex items-center justify-between gap-4">
              <span>{errorText}</span>
              <Button size="small" onClick={fetchStats}>
                重新加载
              </Button>
            </div>
          }
        />
      )}

      {/* Key Metrics Grid */}
      <StatGrid 
        stats={stats} 
        totalMaxPlayers={totalMaxPlayers} 
      />

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Main Tactical View - Server Monitor (3/4 width) */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex items-center justify-between border-b border-[var(--text-brand)]/20 pb-2">
             <h3 className="text-lg font-bold font-mono uppercase tracking-wider text-[var(--text-brand)] flex items-center">
               <span className="w-2 h-2 bg-[var(--text-brand)] mr-2 animate-pulse"></span>
               服务器状态 // 实时
             </h3>
          </div>
          <ServerMonitorCard servers={stats?.serverStatuses.map(s => ({
            ...s,
            status: s.status as "connected" | "disconnected" | "unpublished"
          })) || []} />
        </div>

        {/* Side Intel Panel (1/4 width) */}
        <div className="space-y-6 flex flex-col">
          <QuickActions />
          <div className="flex-1 min-h-[400px]">
            <ActivityFeed 
              recentBans={stats?.recentBans || []} 
              activeAdmins={stats?.activeAdmins || []} 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
