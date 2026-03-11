import React, { useState, useEffect } from 'react';
import { Input, Button, Table, Card, Select } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';

interface AdminsCfgEditorProps {
  content: string;
  onChange: (newContent: string) => void;
}

interface Group {
  name: string;
  permissions: string[];
}

interface Admin {
  steamId: string;
  group: string;
  comment: string;
}

const ALL_PERMISSIONS = [
  'balance', 'ban', 'camera', 'canseeadminchat', 'changemap', 'cheat', 'config', 'cameraman', 'debug', 'demorec', 'featuretest', 'forceteamchange', 'kick', 'manageserver', 'pause', 'private', 'promote', 'startvote', 'teamchange', 'teleport', 'timer'
];

// 权限中文映射
const PERMISSION_LABELS: Record<string, string> = {
  balance: '平衡队伍 (balance)',
  ban: '封禁玩家 (ban)',
  camera: '自由视角 (camera)',
  canseeadminchat: '查看管理聊天 (canseeadminchat)',
  changemap: '更换地图 (changemap)',
  cheat: '作弊命令 (cheat)',
  config: '配置管理 (config)',
  cameraman: '摄像师模式 (cameraman)',
  debug: '调试模式 (debug)',
  demorec: '录制演示 (demorec)',
  featuretest: '功能测试 (featuretest)',
  forceteamchange: '强制换队 (forceteamchange)',
  kick: '踢出玩家 (kick)',
  manageserver: '管理服务器 (manageserver)',
  pause: '暂停游戏 (pause)',
  private: '私人服务器 (private)',
  promote: '提升玩家 (promote)',
  startvote: '发起投票 (startvote)',
  teamchange: '更换队伍 (teamchange)',
  teleport: '传送玩家 (teleport)',
  timer: '计时器 (timer)'
};

const AdminsCfgEditor: React.FC<AdminsCfgEditorProps> = ({ content, onChange }) => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [admins, setAdmins] = useState<Admin[]>([]);

  // Parse content on init
  useEffect(() => {
    const lines = content.split('\n');
    const parsedGroups: Group[] = [];
    const parsedAdmins: Admin[] = [];

    lines.forEach(line => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('//') && !trimmed.includes('Admin=')) return;

      if (trimmed.startsWith('Group=')) {
        // Group=Name:perm1,perm2
        const parts = trimmed.replace('Group=', '').split(':');
        if (parts.length === 2) {
          parsedGroups.push({
            name: parts[0],
            permissions: parts[1].split(',').map(p => p.trim())
          });
        }
      } else if (trimmed.startsWith('Admin=')) {
        // Admin=SteamID:Group // Comment
        const parts = trimmed.replace('Admin=', '').split(':');
        if (parts.length >= 2) {
          const steamId = parts[0];
          const rest = parts[1];
          const commentParts = rest.split('//');
          const group = commentParts[0].trim();
          const comment = commentParts.length > 1 ? commentParts[1].trim() : '';
          
          parsedAdmins.push({ steamId, group, comment });
        }
      }
    });

    setGroups(parsedGroups);
    setAdmins(parsedAdmins);
  }, [content]);

  // Re-generate content string
  const generateContent = (newGroups: Group[], newAdmins: Admin[]) => {
    let output = '';
    
    output += '// Groups\n';
    newGroups.forEach(g => {
      output += `Group=${g.name}:${g.permissions.join(',')}\n`;
    });

    output += '\n// Admins\n';
    newAdmins.forEach(a => {
      output += `Admin=${a.steamId}:${a.group}`;
      if (a.comment) output += ` // ${a.comment}`;
      output += '\n';
    });

    onChange(output);
  };

  // Group Handlers
  const handleAddGroup = () => {
    const newGroups = [...groups, { name: 'NewGroup', permissions: [] }];
    setGroups(newGroups);
    generateContent(newGroups, admins);
  };

  const handleRemoveGroup = (index: number) => {
    const newGroups = [...groups];
    newGroups.splice(index, 1);
    setGroups(newGroups);
    generateContent(newGroups, admins);
  };

  const handleUpdateGroup = (index: number, field: keyof Group, value: any) => {
    const newGroups = [...groups];
    newGroups[index] = { ...newGroups[index], [field]: value };
    setGroups(newGroups);
    generateContent(newGroups, admins);
  };

  // Admin Handlers
  const handleAddAdmin = () => {
    const newAdmins = [...admins, { steamId: '', group: groups[0]?.name || '', comment: '' }];
    setAdmins(newAdmins);
    generateContent(groups, newAdmins);
  };

  const handleRemoveAdmin = (index: number) => {
    const newAdmins = [...admins];
    newAdmins.splice(index, 1);
    setAdmins(newAdmins);
    generateContent(groups, newAdmins);
  };

  const handleUpdateAdmin = (index: number, field: keyof Admin, value: string) => {
    const newAdmins = [...admins];
    newAdmins[index] = { ...newAdmins[index], [field]: value };
    setAdmins(newAdmins);
    generateContent(groups, newAdmins);
  };

  const groupColumns = [
    {
      title: '组名称',
      dataIndex: 'name',
      render: (text: string, _record: any, index: number) => (
        <Input 
          value={text} 
          onChange={e => handleUpdateGroup(index, 'name', e.target.value)}
          className="bg-black/20 text-white border-gray-700"
        />
      )
    },
    {
      title: '权限',
      dataIndex: 'permissions',
      render: (perms: string[], _record: any, index: number) => (
        <Select
          mode="multiple"
          style={{ width: '100%' }}
          placeholder="选择权限"
          value={perms}
          onChange={val => handleUpdateGroup(index, 'permissions', val)}
          options={ALL_PERMISSIONS.map(p => ({ label: PERMISSION_LABELS[p] || p, value: p }))}
          className="bg-transparent"
          maxTagCount="responsive"
        />
      )
    },
    {
      title: '操作',
      width: 80,
      render: (_: any, __: any, index: number) => (
        <Button danger icon={<DeleteOutlined />} onClick={() => handleRemoveGroup(index)} />
      )
    }
  ];

  const adminColumns = [
    {
      title: 'Steam ID',
      dataIndex: 'steamId',
      render: (text: string, _record: any, index: number) => (
        <Input 
          value={text} 
          onChange={e => handleUpdateAdmin(index, 'steamId', e.target.value)}
          className="bg-black/20 text-white border-gray-700 font-mono"
          placeholder="7656119..."
        />
      )
    },
    {
      title: '权限组',
      dataIndex: 'group',
      render: (text: string, _record: any, index: number) => (
        <Select
          style={{ width: '100%' }}
          value={text}
          onChange={val => handleUpdateAdmin(index, 'group', val)}
          options={groups.map(g => ({ label: g.name, value: g.name }))}
        />
      )
    },
    {
      title: '备注',
      dataIndex: 'comment',
      render: (text: string, _record: any, index: number) => (
        <Input 
          value={text} 
          onChange={e => handleUpdateAdmin(index, 'comment', e.target.value)}
          className="bg-black/20 text-white border-gray-700"
          placeholder="管理员名称"
        />
      )
    },
    {
      title: '操作',
      width: 80,
      render: (_: any, __: any, index: number) => (
        <Button danger icon={<DeleteOutlined />} onClick={() => handleRemoveAdmin(index)} />
      )
    }
  ];

  return (
    <div className="space-y-6">
      <Card title="权限组" size="small" className="bg-[#1f1f1f] border-gray-800">
        <Table 
          dataSource={groups} 
          columns={groupColumns} 
          pagination={false} 
          rowKey={(r) => r.name + Math.random()} // Simple key
          size="small"
          locale={{ emptyText: '暂无数据' }}
        />
        <Button type="dashed" block icon={<PlusOutlined />} onClick={handleAddGroup} className="mt-2 border-gray-700 text-gray-400">
          添加组
        </Button>
      </Card>

      <Card title="管理员" size="small" className="bg-[#1f1f1f] border-gray-800">
        <Table 
          dataSource={admins} 
          columns={adminColumns} 
          pagination={{ pageSize: 10 }} 
          rowKey={(r) => r.steamId + Math.random()}
          size="small"
          locale={{ emptyText: '暂无数据' }}
        />
        <Button type="dashed" block icon={<PlusOutlined />} onClick={handleAddAdmin} className="mt-2 border-gray-700 text-gray-400">
          添加管理员
        </Button>
      </Card>
    </div>
  );
};

export default AdminsCfgEditor;
