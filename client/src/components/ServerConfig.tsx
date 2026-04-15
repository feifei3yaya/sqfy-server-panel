import React, { useEffect, useState } from 'react';
import { Spin } from 'antd';
import {
  Server,
  Users,
  Clock,
  Ticket,
  MapPin,
  Package,
  ListChecks,
  Wifi,
} from 'lucide-react';

interface ServerConfig {
  serverName: string;
  maxPlayers: number;
  roundDuration: number;
  ticketCount: number;
  mods: string[];
  region: string;
  customRules: string[];
}

const ServerConfigDisplay: React.FC = () => {
  const [config, setConfig] = useState<ServerConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/servers/config')
      .then((res) => res.json())
      .then((data) => setConfig(data))
      .catch((err) => setError(err instanceof Error ? err.message : '获取配置失败'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spin size="large" className="flex justify-center py-8" />;
  if (error || !config) {
    return (
      <div className="panel-shell rounded-[28px] border px-6 py-7">
        <p className="text-slate-400">服务器配置暂时无法获取</p>
      </div>
    );
  }

  return (
    <div className="panel-shell rounded-[28px] border px-6 py-7 sm:px-8">
      <div className="flex items-center gap-3 text-sm uppercase tracking-[0.3em] text-amber-400">
        <Server />
        <span>服务器配置</span>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* 服务器名称 */}
        <div className="rounded-2xl border border-amber-400/10 bg-black/20 px-4 py-4">
          <div className="flex items-center gap-2 text-slate-500 text-xs">
            <Server className="w-4 h-4" /> 服务器名称
          </div>
          <div className="mt-2 text-lg font-semibold text-white">{config.serverName}</div>
        </div>

        {/* 最大人数 */}
        <div className="rounded-2xl border border-amber-400/10 bg-black/20 px-4 py-4">
          <div className="flex items-center gap-2 text-slate-500 text-xs">
            <Users className="w-4 h-4" /> 人数上限
          </div>
          <div className="mt-2 text-lg font-semibold text-white">{config.maxPlayers} 人</div>
        </div>

        {/* 回合时长 */}
        <div className="rounded-2xl border border-amber-400/10 bg-black/20 px-4 py-4">
          <div className="flex items-center gap-2 text-slate-500 text-xs">
            <Clock className="w-4 h-4" /> 回合时长
          </div>
          <div className="mt-2 text-lg font-semibold text-white">{config.roundDuration} 分钟</div>
        </div>

        {/* 票数 */}
        <div className="rounded-2xl border border-amber-400/10 bg-black/20 px-4 py-4">
          <div className="flex items-center gap-2 text-slate-500 text-xs">
            <Ticket className="w-4 h-4" /> 票数设置
          </div>
          <div className="mt-2 text-lg font-semibold text-white">{config.ticketCount}</div>
        </div>

        {/* 服务器地区 */}
        <div className="rounded-2xl border border-amber-400/10 bg-black/20 px-4 py-4">
          <div className="flex items-center gap-2 text-slate-500 text-xs">
            <MapPin className="w-4 h-4" /> 服务器地区
          </div>
          <div className="mt-2 text-lg font-semibold text-white">{config.region}</div>
        </div>

        {/* Mod 数量 */}
        <div className="rounded-2xl border border-amber-400/10 bg-black/20 px-4 py-4">
          <div className="flex items-center gap-2 text-slate-500 text-xs">
            <Package className="w-4 h-4" /> 已安装 Mod
          </div>
          <div className="mt-2 text-lg font-semibold text-white">{config.mods?.length || 0} 个</div>
        </div>
      </div>

      {/* Mod 列表 */}
      {config.mods && config.mods.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center gap-2 text-sm font-semibold text-amber-300 mb-3">
            <Package className="w-4 h-4" />
            Mod / 插件列表
          </div>
          <div className="flex flex-wrap gap-2">
            {config.mods.map((mod, index) => (
              <span
                key={index}
                className="rounded-full border border-amber-400/20 bg-black/30 px-3 py-1 text-sm text-slate-200"
              >
                {mod}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 自定义规则 */}
      {config.customRules && config.customRules.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center gap-2 text-sm font-semibold text-amber-300 mb-3">
            <ListChecks className="w-4 h-4" />
            自定义规则
          </div>
          <div className="space-y-2">
            {config.customRules.map((rule, index) => (
              <div
                key={index}
                className="flex items-start gap-2 rounded-xl border border-white/6 bg-black/20 px-4 py-3"
              >
                <Wifi className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-slate-300">{rule}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ServerConfigDisplay;
