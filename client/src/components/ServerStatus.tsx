import React, { useEffect, useState } from 'react';
import { Tag, Spin } from 'antd';
import {
  WifiOff,
  Users,
  Map,
  Clock,
  Activity,
  Server,
} from 'lucide-react';

interface ServerInfo {
  name: string;
  online: boolean;
  currentPlayers: number;
  maxPlayers: number;
  currentMap: string;
  currentLayer: string;
  queue: number;
  nextMap: string;
  uptime: number;
}

const ServerStatus: React.FC = () => {
  const [server, setServer] = useState<ServerInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchServer = async () => {
      try {
        const res = await fetch('/api/servers');
        if (!res.ok) throw new Error('获取服务器状态失败');
        const data = await res.json();
        setServer(Array.isArray(data) ? data[0] : data);
      } catch (err) {
        setError(err instanceof Error ? err.message : '未知错误');
      } finally {
        setLoading(false);
      }
    };
    fetchServer();
    const interval = setInterval(fetchServer, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <Spin size="large" className="flex justify-center py-8" />;
  if (error || !server) {
    return (
      <div className="panel-shell rounded-[28px] border px-6 py-7">
        <p className="text-slate-400">服务器状态暂时无法获取</p>
      </div>
    );
  }

  const playerPercent = (server.currentPlayers / server.maxPlayers) * 100;

  return (
    <div className="panel-shell rounded-[28px] border px-6 py-7 sm:px-8">
      <div className="flex items-center gap-3 text-sm uppercase tracking-[0.3em] text-amber-400">
        <Server />
        <span>服务器状态</span>
        {server.online ? (
          <Tag color="green">在线</Tag>
        ) : (
          <Tag color="red">离线</Tag>
        )}
      </div>

      {server.online && (
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* 在线人数 */}
          <div className="rounded-2xl border border-amber-400/10 bg-black/20 px-4 py-4">
            <div className="flex items-center gap-2 text-slate-500 text-xs">
              <Users className="w-4 h-4" /> 在线人数
            </div>
            <div className="mt-2 text-3xl font-bold text-white">
              {server.currentPlayers}
              <span className="text-lg text-slate-500">/{server.maxPlayers}</span>
            </div>
            {/* 人数进度条 */}
            <div className="mt-2 h-2 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${playerPercent}%`,
                  backgroundColor:
                    playerPercent > 80
                      ? '#ef4444'
                      : playerPercent > 50
                        ? '#f59e0b'
                        : '#22c55e',
                }}
              />
            </div>
          </div>

          {/* 当前地图 */}
          <div className="rounded-2xl border border-amber-400/10 bg-black/20 px-4 py-4">
            <div className="flex items-center gap-2 text-slate-500 text-xs">
              <Map className="w-4 h-4" /> 当前地图
            </div>
            <div className="mt-2 text-lg font-semibold text-white">{server.currentMap}</div>
            <div className="mt-1 text-xs text-slate-400">{server.currentLayer}</div>
          </div>

          {/* 排队人数 */}
          <div className="rounded-2xl border border-amber-400/10 bg-black/20 px-4 py-4">
            <div className="flex items-center gap-2 text-slate-500 text-xs">
              <Clock className="w-4 h-4" /> 等待队列
            </div>
            <div className="mt-2 text-3xl font-bold text-white">{server.queue}</div>
          </div>

          {/* 运行时间 */}
          <div className="rounded-2xl border border-amber-400/10 bg-black/20 px-4 py-4">
            <div className="flex items-center gap-2 text-slate-500 text-xs">
              <Activity className="w-4 h-4" /> 运行时间
            </div>
            <div className="mt-2 text-lg font-semibold text-white">
              {Math.floor(server.uptime / 3600)}h {Math.floor((server.uptime % 3600) / 60)}m
            </div>
          </div>
        </div>
      )}

      {!server.online && (
        <div className="mt-5 text-center py-8">
          <WifiOff className="w-12 h-12 mx-auto text-red-400 mb-3" />
          <p className="text-slate-400">服务器当前离线，请稍后再查看</p>
        </div>
      )}
    </div>
  );
};

export default ServerStatus;
