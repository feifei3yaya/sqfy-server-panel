import React from 'react';
import { List, Avatar, Empty, Tabs, Typography } from 'antd';
import { StopOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import TacticalCard from './TacticalCard';
import { useNavigate } from 'react-router-dom';

const { Text } = Typography;

interface ActivityFeedProps {
  recentBans: any[];
  activeAdmins: any[];
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({ recentBans, activeAdmins }) => {
  const navigate = useNavigate();

  const renderBans = () => (
    <div className="h-[400px] overflow-y-auto custom-scrollbar p-2">
      <List
        dataSource={recentBans}
        renderItem={(item) => {
          let name = 'Unknown';
          try {
            const history = JSON.parse(item.player.nameHistory);
            if (history.length > 0) name = history[history.length - 1];
          } catch (e) {}
          return (
            <div className="mb-3 p-3 bg-[var(--bg-card-hover)] border border-[var(--border-color)] rounded hover:border-[var(--text-error)]/50 transition-colors group">
              <div className="flex justify-between items-start mb-1">
                <span className="font-bold text-[var(--text-primary)] font-mono text-sm truncate max-w-[120px]" title={name}>{name}</span>
                <span className="text-[10px] text-[var(--text-tertiary)] font-mono">{dayjs(item.createdAt).format('HH:mm:ss')}</span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-[var(--text-error)] bg-[var(--text-error)]/10 px-1.5 py-0.5 rounded border border-[var(--text-error)]/20 truncate max-w-[100px]" title={item.reason}>
                  {item.reason}
                </span>
                <Text 
                  className="text-[10px] text-[var(--text-brand)] cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => navigate(`/players?search=${name}`)}
                >
                  详情 &gt;&gt;
                </Text>
              </div>
            </div>
          );
        }}
      />
      {recentBans.length === 0 && <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无动态" className="mt-8 opacity-50" />}
    </div>
  );

  const renderAdmins = () => (
    <div className="h-[400px] overflow-y-auto custom-scrollbar p-2">
      <List
        dataSource={activeAdmins}
        renderItem={(item) => (
          <div className="mb-3 p-3 bg-[var(--bg-card-hover)] border border-[var(--border-color)] rounded hover:border-[var(--text-success)]/50 transition-colors">
            <div className="flex items-center gap-3">
              <Avatar shape="square" size="small" className="bg-[var(--text-success)]/80 text-black font-bold">
                {item.admin.username[0].toUpperCase()}
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-[var(--text-primary)] font-mono text-sm truncate">{item.admin.username}</div>
                <div className="text-[10px] text-[var(--text-secondary)] truncate">{item.server.name}</div>
              </div>
              <div className="text-[10px] font-mono text-[var(--text-success)] bg-[var(--text-success)]/10 px-1 rounded">
                {dayjs().diff(dayjs(item.sessionStart), 'minute')}m
              </div>
            </div>
          </div>
        )}
      />
      {activeAdmins.length === 0 && <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无值班人员" className="mt-8 opacity-50" />}
    </div>
  );

  return (
    <TacticalCard title="情报动态" className="h-full" noPadding>
      <Tabs
        defaultActiveKey="bans"
        type="card"
        size="small"
        className="tactical-tabs"
        items={[
          {
            key: 'bans',
            label: <span className="px-2 font-mono"><StopOutlined /> 封禁记录</span>,
            children: renderBans()
          },
          {
            key: 'admins',
            label: <span className="px-2 font-mono"><SafetyCertificateOutlined /> 值班记录</span>,
            children: renderAdmins()
          }
        ]}
      />
    </TacticalCard>
  );
};

export default ActivityFeed;
