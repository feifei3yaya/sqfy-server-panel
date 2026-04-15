import React from 'react';
import { Button, Row, Col } from 'antd';
import { CloudServerOutlined, SearchOutlined, FileTextOutlined, TeamOutlined } from '@ant-design/icons';
import TacticalCard from './TacticalCard';
import { useNavigate } from 'react-router-dom';
import { panelPath } from '../../routes';

const QuickActionBtn = ({ icon, label, path, navigate }: { 
  icon: React.ReactNode, 
  label: string, 
  path: string, 
  navigate: (path: string) => void 
}) => (
  <Button 
    type="text" 
    className="flex flex-col items-center justify-center h-auto min-h-[5rem] py-3 w-full bg-[var(--bg-card-hover)] border border-[var(--border-color)] hover:border-[var(--text-brand)] hover:bg-[var(--text-brand)]/10 transition-all duration-300 group rounded-none relative overflow-hidden whitespace-normal text-center"
    onClick={() => navigate(path)}
  >
    {/* Corner accent */}
    <div className="absolute top-0 right-0 w-0 h-0 border-t-[6px] border-r-[6px] border-transparent group-hover:border-[var(--text-brand)] transition-all"></div>
    
    <div className="text-xl mb-1 text-[var(--text-secondary)] group-hover:text-[var(--text-brand)] transition-colors">
      {icon}
    </div>
    <span className="text-[var(--text-tertiary)] group-hover:text-[var(--text-primary)] text-[10px] font-mono uppercase tracking-wider">{label}</span>
  </Button>
);

const QuickActions: React.FC = () => {
  const navigate = useNavigate();

  return (
    <TacticalCard title="快捷指令" noPadding>
      <div className="p-4">
        <Row gutter={[8, 8]}>
          <Col span={12}>
            <QuickActionBtn icon={<CloudServerOutlined />} label="服务器列表" path={panelPath('/servers')} navigate={navigate} />
          </Col>
          <Col span={12}>
            <QuickActionBtn icon={<SearchOutlined />} label="玩家查询" path={panelPath('/players')} navigate={navigate} />
          </Col>
          <Col span={12}>
            <QuickActionBtn icon={<FileTextOutlined />} label="日志中心" path={panelPath('/logs')} navigate={navigate} />
          </Col>
          <Col span={12}>
            <QuickActionBtn icon={<TeamOutlined />} label="管理员管理" path={panelPath('/users/squad-admins')} navigate={navigate} />
          </Col>
        </Row>
      </div>
    </TacticalCard>
  );
};

export default QuickActions;
