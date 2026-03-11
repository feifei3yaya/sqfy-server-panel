import React, { useState } from 'react';
import { Card, Space, Tag, Button, Dropdown, Modal, Input, message } from 'antd';
import { LockOutlined, DownOutlined, TeamOutlined, WarningOutlined, EditOutlined } from '@ant-design/icons';
import SquadRoleIcon from './SquadRoleIcon';
import PlayerStatusIcon from './PlayerStatusIcon';

// Define Player interface locally or import from types
interface Player {
  id: string;
  steamId: string;
  name: string;
  teamId: string;
  squadId: string;
  isLeader?: boolean;
  isAlive?: boolean;
  isWounded?: boolean;
  role?: string;
  kills?: number;
  deaths?: number;
  playTime?: string;
}

interface SquadCardProps {
  squadId: string;
  teamId: string;
  players: Player[];
  onDisband: (teamId: string, squadId: string) => void;
  getActionItems: (player: Player) => any;
  getTeamColor: (teamId: string) => string;
  onWarnSquad?: (teamId: string, squadId: string, message: string) => void;
  onRenameSquad?: (teamId: string, squadId: string, newName: string) => void;
}

const SquadCard: React.FC<SquadCardProps> = ({ 
  squadId, 
  teamId, 
  players, 
  onDisband, 
  getActionItems, 
  getTeamColor,
  onWarnSquad,
  onRenameSquad 
}) => {
  const leader = players.find(p => p.isLeader);
  const [isWarnModalVisible, setIsWarnModalVisible] = useState(false);
  const [isRenameModalVisible, setIsRenameModalVisible] = useState(false);
  const [warnMessage, setWarnMessage] = useState('');
  const [newSquadName, setNewSquadName] = useState('');

  const handleWarnSquad = () => {
    if (!warnMessage.trim()) {
      message.warning('请输入警告内容');
      return;
    }
    onWarnSquad?.(teamId, squadId, warnMessage);
    setIsWarnModalVisible(false);
    setWarnMessage('');
  };

  const handleRenameSquad = () => {
    if (!newSquadName.trim()) {
      message.warning('请输入新队名');
      return;
    }
    onRenameSquad?.(teamId, squadId, newSquadName);
    setIsRenameModalVisible(false);
    setNewSquadName('');
  };

  const dropdownItems = [
    { 
      key: 'warn', 
      label: (
        <span className="text-orange-400">
          <WarningOutlined /> 全队警告
        </span>
      ), 
      onClick: () => setIsWarnModalVisible(true) 
    },
    { 
      key: 'rename', 
      label: (
        <span className="text-blue-400">
          <EditOutlined /> 修改队名
        </span>
      ), 
      onClick: () => setIsRenameModalVisible(true) 
    },
    { type: 'divider' },
    { 
      key: 'disband', 
      label: '解散小队', 
      danger: true, 
      onClick: () => onDisband(teamId, squadId) 
    }
  ];

  return (
    <>
      <Card 
        className="mb-3 panel-shell"
        size="small"
        title={
          <div className="flex items-center justify-between w-full">
            <Space>
              <span className="font-medium panel-title">小队 {squadId}</span>
              {leader && <span className="text-xs panel-muted">队长: {leader.name}</span>}
              <Tag className="border-0" style={{ background: 'var(--panel-header)', color: 'var(--text-secondary)' }}>{players.length}人</Tag>
            </Space>
            <Space>
              <Button 
                size="small" 
                icon={<LockOutlined />}
                className="bg-transparent panel-muted"
              >
                锁队
              </Button>
              <Dropdown menu={{ items: dropdownItems }}>
                <Button 
                  size="small" 
                  className="bg-transparent panel-muted"
                >
                  操作 <DownOutlined />
                </Button>
              </Dropdown>
            </Space>
          </div>
        }
        styles={{ header: { borderBottom: '1px solid var(--table-divider)', minHeight: '40px', padding: '0 12px' }, body: { padding: 0 } }}
      >
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-xs panel-subtle-divider">
              <th className="text-left py-2 px-3 font-normal w-10 panel-muted">状态</th>
              <th className="text-left py-2 px-3 font-normal w-10 panel-muted">兵种</th>
              <th className="text-left py-2 px-3 font-normal panel-muted">昵称</th>
              <th className="text-left py-2 px-3 font-normal panel-muted">战绩</th>
              <th className="text-right py-2 px-3 font-normal w-10 panel-muted"></th>
            </tr>
          </thead>
          <tbody>
            {players.map((player) => (
              <tr key={player.steamId} className="border-b transition-colors group panel-subtle-divider panel-table-row">
                <td className="py-2 px-3">
                  <PlayerStatusIcon isAlive={player.isAlive !== false} isWounded={player.isWounded || false} />
                </td>
                <td className="py-2 px-3">
                  <SquadRoleIcon role={player.role} isLeader={player.isLeader} />
                </td>
                <td className="py-2 px-3">
                  <div className="flex items-center gap-2">
                    {player.isLeader && <TeamOutlined style={{ color: getTeamColor(teamId) }} className="text-xs" />}
                    <span className={`font-medium ${player.isLeader ? 'panel-title' : 'panel-muted'}`}>
                      {player.name}
                    </span>
                  </div>
                  <div className="text-[10px] font-mono leading-none mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity panel-muted">
                    {player.steamId}
                  </div>
                </td>
                <td className="py-2 px-3 font-mono text-xs">
                  <span className="text-emerald-500/80">{player.kills || 0}</span>
                  <span className="mx-1 panel-muted">/</span>
                  <span className="text-red-500/80">{player.deaths || 0}</span>
                </td>
                <td className="py-2 px-3 text-right">
                  <Dropdown menu={{ items: getActionItems(player) }} placement="bottomRight" trigger={['click']}>
                    <Button 
                      size="small"
                      type="text"
                      className="h-6 w-6 p-0 panel-muted"
                    >
                      <DownOutlined style={{ fontSize: '10px' }} />
                    </Button>
                  </Dropdown>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      </Card>

      {/* 全队警告弹窗 */}
      <Modal
        title="全队警告"
        open={isWarnModalVisible}
        onOk={handleWarnSquad}
        onCancel={() => {
          setIsWarnModalVisible(false);
          setWarnMessage('');
        }}
        okText="发送警告"
        cancelText="取消"
      >
        <div className="mb-4">
          <p className="text-gray-500 mb-2">向小队 {squadId} 的所有成员发送警告消息</p>
          <Input.TextArea
            value={warnMessage}
            onChange={(e) => setWarnMessage(e.target.value)}
            placeholder="请输入警告内容..."
            rows={3}
          />
        </div>
      </Modal>

      {/* 修改队名弹窗 */}
      <Modal
        title="修改队名"
        open={isRenameModalVisible}
        onOk={handleRenameSquad}
        onCancel={() => {
          setIsRenameModalVisible(false);
          setNewSquadName('');
        }}
        okText="确认修改"
        cancelText="取消"
      >
        <div className="mb-4">
          <p className="text-gray-500 mb-2">修改小队 {squadId} 的名称</p>
          <Input
            value={newSquadName}
            onChange={(e) => setNewSquadName(e.target.value)}
            placeholder="请输入新队名..."
            maxLength={20}
          />
        </div>
      </Modal>
    </>
  );
};

export default SquadCard;
