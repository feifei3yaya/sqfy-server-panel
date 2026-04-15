import React, { useMemo } from 'react';
import { Button, Tooltip, Typography, Avatar } from 'antd';
import { ReloadOutlined, SettingOutlined, UserOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '../../store/hooks';
import { useNavigate } from 'react-router-dom';
import { panelPath } from '../../routes';

const { Title, Text } = Typography;

interface DashboardHeaderProps {
  onRefresh: () => void;
  refreshing: boolean;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ onRefresh, refreshing }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 6) return '凌晨好'; // Early morning
    if (hour < 9) return '早上好'; // Morning
    if (hour < 12) return '上午好'; // Late morning
    if (hour < 14) return '中午好'; // Noon
    if (hour < 18) return '下午好'; // Afternoon
    if (hour < 22) return '晚上好'; // Evening
    return '夜深了'; // Night
  }, []);

  return (
    <div className="relative overflow-hidden rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] p-6 shadow-sm">
      {/* Tactical Background Texture - CSS Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(var(--text-brand) 1px, transparent 1px), linear-gradient(90deg, var(--text-brand) 1px, transparent 1px)`,
          backgroundSize: '20px 20px'
        }}
      ></div>
      
      {/* Decorative Stripe */}
      <div className="absolute top-0 left-0 w-1 h-full bg-[var(--text-brand)]"></div>

      <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <Avatar 
            size={64} 
            src={user?.avatarUrl} 
            icon={<UserOutlined />} 
            className="border-2 border-[var(--text-brand)] bg-[var(--bg-card-hover)]"
          />
          <div>
            <Title level={2} className="!mb-0 !text-[var(--text-primary)] font-bold tracking-tight">
              {greeting}, <span className="text-[var(--text-brand)] font-mono">{user?.nickname || user?.username || 'Commander'}</span>
            </Title>
            <div className="flex items-center gap-2 mt-1">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--text-success)] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--text-success)]"></span>
              </span>
              <Text className="text-[var(--text-secondary)] text-xs font-mono uppercase tracking-wider">
                系统在线 // 等待指令
              </Text>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Tooltip title={t('common.refresh')}>
            <Button 
              icon={<ReloadOutlined spin={refreshing} />} 
              onClick={onRefresh}
              className="h-10 w-10 border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-brand)] hover:border-[var(--text-brand)] bg-transparent"
            />
          </Tooltip>
          <Button 
            type="primary" 
            icon={<SettingOutlined />} 
            onClick={() => navigate(panelPath('/servers/config'))}
            className="h-10 bg-[var(--text-brand)] hover:bg-[var(--text-brand)]/90 border-none text-black font-bold tracking-wider"
          >
            {t('menu.configs')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
