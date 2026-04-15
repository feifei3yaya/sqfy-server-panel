import React from 'react';
import { Alert, Typography } from 'antd';
import { BookOutlined, WarningOutlined } from '@ant-design/icons';
import TacticalCard from './TacticalCard';

const { Title, Paragraph, Text } = Typography;

const ReadmePanel: React.FC = () => {
  return (
    <TacticalCard title={<><BookOutlined /> README</>}>
      {/* 重要声明 - 顶部醒目显示 */}
      <Alert
        type="warning"
        showIcon
        icon={<WarningOutlined />}
        message="重要声明"
        description="本面板仅限内部小范围使用，请勿外传或用于商业用途。"
        className="mb-6 border-amber-500/50 bg-amber-500/10"
      />

      <div className="space-y-4 text-[var(--text-secondary)]">
        <Title level={4} className="!text-[var(--text-primary)] !mb-2">
          Squad 战术小队服务器管理面板
        </Title>

        <Paragraph>
          基于 React 19 + TypeScript + Node.js + Prisma 的现代化 Squad 游戏服务器管理系统，为您提供高效、可视化的运维体验。
        </Paragraph>

        <Title level={5} className="!text-[var(--text-brand)] !mt-4">核心特性</Title>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li><Text strong className="text-[var(--text-primary)]">服务器管理</Text> - 通过 RCON 轻松管理多个 Squad 游戏服务器</li>
          <li><Text strong className="text-[var(--text-primary)]">实时仪表盘</Text> - 可视化展示在线玩家、服务器负载等关键数据</li>
          <li><Text strong className="text-[var(--text-primary)]">玩家管理</Text> - 查看玩家列表、踢出/封禁玩家、查询历史记录</li>
          <li><Text strong className="text-[var(--text-primary)]">RCON 终端</Text> - 内置网页版终端，直接执行原生 RCON 指令</li>
          <li><Text strong className="text-[var(--text-primary)]">配置编辑器</Text> - 在线编辑 Server.cfg、Admins.cfg 等配置文件</li>
          <li><Text strong className="text-[var(--text-primary)]">日志分析</Text> - 强大的日志搜索与过滤功能</li>
          <li><Text strong className="text-[var(--text-primary)]">权限控制</Text> - 细粒度的角色权限管理</li>
        </ul>

        <Title level={5} className="!text-[var(--text-brand)] !mt-4">快速开始</Title>
        <Paragraph>
          使用左侧导航栏访问各个功能模块。首页仪表盘展示服务器实时状态，快捷指令卡片提供常用功能入口。
        </Paragraph>

        <div className="mt-4 pt-4 border-t border-[var(--border-color)]">
          <Text type="secondary" className="text-xs">
            更多信息请查看项目文档或联系管理员
          </Text>
        </div>
      </div>
    </TacticalCard>
  );
};

export default ReadmePanel;
