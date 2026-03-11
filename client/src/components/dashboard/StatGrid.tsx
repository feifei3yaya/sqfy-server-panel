import React from 'react';
import { Row, Col } from 'antd';
import { UserOutlined, CloudServerOutlined, SafetyCertificateOutlined, StopOutlined } from '@ant-design/icons';
import TacticalCard from './TacticalCard';
import { useTranslation } from 'react-i18next';

interface StatGridProps {
  stats: any;
  totalMaxPlayers: number;
}

const StatItem = ({ title, value, suffix, icon, colorClass }: { 
  title: string, 
  value: number | string, 
  suffix?: React.ReactNode, 
  icon: React.ReactNode,
  colorClass: string 
}) => (
  <TacticalCard noPadding className="h-28">
    <div className="flex items-center h-full px-6">
      <div className={`flex items-center justify-center w-12 h-12 rounded-lg bg-[var(--bg-card-hover)] border border-[var(--border-color)] text-2xl ${colorClass}`}>
        {icon}
      </div>
      <div className="ml-4 flex-1">
        <div className="text-[var(--text-secondary)] text-xs font-mono uppercase tracking-wider mb-1">{title}</div>
        <div className="flex items-baseline">
          <span className={`text-3xl font-bold font-mono ${colorClass} tracking-tight`}>
            {value}
          </span>
          {suffix && <span className="ml-2 text-[var(--text-tertiary)] text-sm font-mono">{suffix}</span>}
        </div>
      </div>
    </div>
  </TacticalCard>
);

const StatGrid: React.FC<StatGridProps> = ({ stats, totalMaxPlayers }) => {
  const { t } = useTranslation();

  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} sm={12} lg={6}>
        <StatItem 
          title={t('dashboard.onlinePlayers')}
          value={stats?.summary?.totalPlayers || 0}
          suffix={`/ ${totalMaxPlayers}`}
          icon={<UserOutlined />}
          colorClass="text-[var(--text-brand)]"
        />
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <StatItem 
          title={t('dashboard.activeAdmins')}
          value={stats?.summary?.activeAdmins || 0}
          icon={<SafetyCertificateOutlined />}
          colorClass="text-[var(--text-success)]"
        />
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <StatItem 
          title="活跃服务器"
          value={stats?.summary?.onlineServers || 0}
          suffix={`/ ${stats?.summary?.totalServers || 0}`}
          icon={<CloudServerOutlined />}
          colorClass="text-[var(--text-info)]"
        />
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <StatItem 
          title={t('dashboard.bansToday')}
          value={stats?.recentBans?.length || 0}
          icon={<StopOutlined />}
          colorClass="text-[var(--text-error)]"
        />
      </Col>
    </Row>
  );
};

export default StatGrid;
