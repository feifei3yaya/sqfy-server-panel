import React from 'react';
import { Badge, Button, Progress, Tooltip, Empty } from 'antd';
import { ArrowRightOutlined, CopyOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import TacticalCard from './TacticalCard';

interface ServerStatus {
  id: string;
  name: string;
  map?: string;
  playerCount: number;
  maxPlayers: number;
  status: 'connected' | 'disconnected' | 'unpublished';
  ip?: string;
  port?: number;
}

interface ServerMonitorCardProps {
  servers: ServerStatus[];
}

const ServerMonitorCard: React.FC<ServerMonitorCardProps> = ({ servers }) => {
  const navigate = useNavigate();

  if (!servers || servers.length === 0) {
    return (
      <TacticalCard title="战场态势" className="h-full min-h-[400px]">
        <div className="flex items-center justify-center h-full">
          <Empty description="无信号连接" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        </div>
      </TacticalCard>
    );
  }

  return (
    <TacticalCard title="战场态势" className="h-full" noPadding>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 p-4">
        {servers.map((server) => {
          const occupancy = (server.playerCount / (server.maxPlayers || 100)) * 100;
          const isFull = occupancy >= 98;
          
          return (
            <div 
              key={server.id} 
              className="group relative overflow-hidden rounded-lg border border-[var(--border-color)] bg-[var(--bg-card-hover)] transition-all hover:border-[var(--text-brand)] hover:shadow-md"
            >
              {/* Map Background Placeholder */}
              <div className="absolute inset-0 z-0 bg-[var(--bg-card)] overflow-hidden">
                {/* 基础网格 */}
                <div 
                  className="absolute inset-0 opacity-20" 
                  style={{ 
                    backgroundImage: `
                      linear-gradient(var(--border-color) 1px, transparent 1px),
                      linear-gradient(90deg, var(--border-color) 1px, transparent 1px)
                    `,
                    backgroundSize: '20px 20px' 
                  }} 
                ></div>
                
                {/* 动态扫描线 */}
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--text-brand)]/5 to-transparent opacity-50"></div>
                
                {/* 中心装饰：地图名称的首字母 */}
                <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none select-none">
                   <span className="text-6xl font-black font-mono tracking-tighter text-[var(--text-primary)]">
                     {server.map ? server.map.substring(0, 2).toUpperCase() : 'NA'}
                   </span>
                </div>
              </div>

              {/* Status Indicator Strip */}
              <div className={`absolute left-0 top-0 bottom-0 w-1 z-10 transition-colors ${
                server.status === 'connected' ? 'bg-[var(--text-success)]' : 
                server.status === 'unpublished' ? 'bg-[var(--text-secondary)]' : 'bg-[var(--text-error)]'
              }`}></div>

              <div className="relative z-10 p-4 flex flex-col h-full justify-between min-h-[140px]">
                {/* Header */}
                <div className="flex justify-between items-start mb-2">
                  <h4 
                    className="font-bold text-[var(--text-primary)] text-sm line-clamp-2 pr-2 cursor-pointer hover:text-[var(--text-brand)] transition-colors"
                    onClick={() => navigate(`/servers?id=${server.id}`)}
                  >
                    {server.name}
                  </h4>
                  <Badge 
                    status={server.status === 'connected' ? 'success' : server.status === 'unpublished' ? 'default' : 'error'} 
                    className="shrink-0"
                  />
                </div>

                {/* Map Info */}
                <div className="mb-4">
                  <span className="inline-block px-2 py-0.5 rounded bg-black/40 border border-white/10 text-xs font-mono text-[var(--text-tertiary)] backdrop-blur-sm">
                    {server.map || '未知地图'}
                  </span>
                </div>

                {/* Footer: Stats & Actions */}
                <div className="space-y-2">
                  <div className="flex justify-between items-end">
                    <div className="text-xs text-[var(--text-secondary)]">在线人数</div>
                    <div className="font-mono">
                      <span className={`text-lg font-bold ${isFull ? 'text-[var(--text-error)]' : 'text-[var(--text-primary)]'}`}>
                        {server.playerCount}
                      </span>
                      <span className="text-[var(--text-tertiary)] text-xs">/{server.maxPlayers}</span>
                    </div>
                  </div>
                  
                  <Progress 
                    percent={occupancy} 
                    showInfo={false} 
                    size="small" 
                    strokeColor={isFull ? 'var(--text-error)' : 'var(--text-brand)'}
                    trailColor="rgba(255,255,255,0.1)"
                    className="!m-0"
                  />

                  {/* Hover Actions Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none group-hover:pointer-events-auto">
                    <div className="absolute inset-0 bg-[var(--bg-card)]/60 backdrop-blur-sm -z-10"></div>
                    <Tooltip title="查看详情">
                      <Button 
                        type="primary" 
                        shape="circle" 
                        icon={<ArrowRightOutlined />} 
                        onClick={() => navigate(`/servers?id=${server.id}`)}
                        className="bg-[var(--text-brand)] border-none shadow-[0_0_15px_rgba(var(--text-brand),0.5)] scale-0 group-hover:scale-100 transition-transform duration-300"
                      />
                    </Tooltip>
                    {server.ip && (
                      <Tooltip title="复制 IP">
                        <Button 
                          shape="circle" 
                          icon={<CopyOutlined />} 
                          onClick={() => {
                            navigator.clipboard.writeText(`${server.ip}:${server.port}`);
                          }}
                          className="bg-[var(--bg-card)] border-[var(--border-color)] text-[var(--text-primary)] hover:border-[var(--text-brand)] hover:text-[var(--text-brand)] shadow-lg scale-0 group-hover:scale-100 transition-transform duration-300 delay-75"
                        />
                      </Tooltip>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </TacticalCard>
  );
};

export default ServerMonitorCard;
