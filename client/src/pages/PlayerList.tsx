import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, message, Tag, Space, Card, Tooltip, Tabs, Collapse, List, Popconfirm, Avatar, Grid } from 'antd';
import { ReloadOutlined, StopOutlined, WarningOutlined, DeleteOutlined, UserOutlined, TeamOutlined } from '@ant-design/icons';
import api from '../api/client';

const { Option } = Select;
const { Panel } = Collapse;
const { useBreakpoint } = Grid;

interface Player {
  id: string;
  steamId: string;
  name: string;
  teamId: string;
  squadId: string;
}

interface Server {
  id: string;
  name: string;
}

const PlayerList: React.FC = () => {
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const [servers, setServers] = useState<Server[]>([]);
  const [selectedServerId, setSelectedServerId] = useState<string>('');
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(false);
  const [isBanModalVisible, setIsBanModalVisible] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchServers();
  }, []);

  useEffect(() => {
    if (selectedServerId) {
      fetchPlayers();
    }
  }, [selectedServerId]);

  const fetchServers = async () => {
    try {
      const response = await api.get('/servers');
      setServers(response.data);
      if (response.data.length > 0) {
        setSelectedServerId(response.data[0].id);
      }
    } catch (error) {
      message.error('获取服务器列表失败');
    }
  };

  const fetchPlayers = async () => {
    if (!selectedServerId) return;
    setLoading(true);
    try {
      const response = await api.get(`/players/${selectedServerId}`);
      setPlayers(response.data);
    } catch (error) {
      message.error('获取玩家列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleKick = async (steamId: string) => {
    try {
      await api.post(`/players/${selectedServerId}/kick/${steamId}`, { reason: 'Kicked by admin' });
      message.success('玩家已踢出');
      fetchPlayers();
    } catch (error) {
      message.error('踢出玩家失败');
    }
  };

  const handleBan = async (values: any) => {
    if (!selectedPlayer) return;
    try {
      await api.post(`/players/${selectedServerId}/ban/${selectedPlayer.steamId}`, values);
      message.success('玩家已封禁');
      setIsBanModalVisible(false);
      form.resetFields();
      fetchPlayers();
    } catch (error) {
      message.error('封禁玩家失败');
    }
  };

  const handleDisbandSquad = async (teamId: string, squadId: string) => {
    try {
      await api.post(`/servers/${selectedServerId}/execute`, { 
        command: `AdminDisbandSquad ${teamId} ${squadId}` 
      });
      message.success(`小队 ${squadId} 已解散`);
      fetchPlayers();
    } catch (error) {
      message.error('解散小队失败');
    }
  };

  const renderSquadView = () => {
    const teams = ['1', '2'];
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {teams.map(teamId => {
          const teamPlayers = players.filter(p => p.teamId === teamId);
          const squads: Record<string, Player[]> = {};
          
          teamPlayers.forEach(p => {
            const sid = p.squadId;
            if (sid !== 'N/A') {
              if (!squads[sid]) squads[sid] = [];
              squads[sid].push(p);
            }
          });
          
          const squadIds = Object.keys(squads).sort((a, b) => Number(a) - Number(b));
          
          return (
            <Card 
              title={<Space className="text-gray-200"><TeamOutlined /> 队伍 {teamId}</Space>} 
              key={teamId} 
              className="h-full shadow-sm"
            >
              {squadIds.length === 0 ? (
                <div className="text-center text-gray-500 py-4">暂无活跃小队</div>
              ) : (
                <Collapse defaultActiveKey={squadIds} className="bg-transparent border-[#2d3139]/50">
                  {squadIds.map(squadId => (
                    <Panel 
                      key={squadId} 
                      className="border-[#2d3139]/50"
                      header={
                        <div className="flex justify-between items-center w-full pr-4 text-gray-200">
                          <span>小队 {squadId} <Tag className="ml-2 border-0 bg-[#1f2229]/50 text-gray-300">{squads[squadId].length}</Tag></span>
                          <Popconfirm
                            title="解散小队"
                            description={`确定要解散小队 ${squadId} 吗？`}
                            onConfirm={(e) => {
                              e?.stopPropagation();
                              handleDisbandSquad(teamId, squadId);
                            }}
                            onCancel={(e) => e?.stopPropagation()}
                          >
                            <Button 
                              type="text" 
                              danger 
                              size="small"
                              icon={<DeleteOutlined />} 
                              onClick={(e) => e.stopPropagation()}
                              aria-label={`解散小队 ${squadId}`}
                              className="text-red-400 hover:text-red-300 hover:bg-red-900/10"
                            >
                              解散
                            </Button>
                          </Popconfirm>
                        </div>
                      }
                    >
                      <List
                        size="small"
                        dataSource={squads[squadId]}
                        renderItem={item => (
                          <List.Item
                            className="border-[#2d3139]"
                            actions={[
                              <Tooltip title="踢出">
                                <Button 
                                  type="text" 
                                  size="small" 
                                  icon={<WarningOutlined />} 
                                  className="text-amber-500 hover:text-amber-400"
                                  onClick={() => {
                                    Modal.confirm({
                                      title: '踢出玩家',
                                      content: `踢出 ${item.name}?`,
                                      onOk: () => handleKick(item.steamId),
                                    });
                                  }}
                                  aria-label={`踢出 ${item.name}`}
                                />
                              </Tooltip>
                            ]}
                          >
                            <List.Item.Meta
                              avatar={<Avatar size="small" icon={<UserOutlined />} className="bg-blue-600" />}
                              title={<span className="text-gray-200">{item.name}</span>}
                              description={<span className="text-xs text-gray-500">{item.steamId}</span>}
                            />
                          </List.Item>
                        )}
                      />
                    </Panel>
                  ))}
                </Collapse>
              )}
            </Card>
          );
        })}
      </div>
    );
  };

  const columns = [
    {
      title: '玩家名称',
      dataIndex: 'name',
      key: 'name',
      className: 'text-gray-200'
    },
    {
      title: 'Steam ID',
      dataIndex: 'steamId',
      key: 'steamId',
      className: 'font-mono text-gray-500'
    },
    {
      title: '队伍',
      dataIndex: 'teamId',
      key: 'teamId',
      render: (teamId: string) => <Tag color={teamId === '1' ? 'blue' : 'red'} className="border-0">队伍 {teamId}</Tag>,
    },
    {
      title: '小队',
      dataIndex: 'squadId',
      key: 'squadId',
      className: 'text-gray-200'
    },
    {
      title: '操作',
      key: 'actions',
      render: (_: any, record: Player) => (
        <Space>
          <Tooltip title="踢出玩家">
            <Button 
              icon={<WarningOutlined />} 
              className="text-amber-500 hover:text-amber-400 border-amber-900/50 bg-amber-900/10 hover:border-amber-500"
              onClick={() => {
                Modal.confirm({
                  title: '踢出玩家',
                  content: `确定要踢出 ${record.name} 吗?`,
                  onOk: () => handleKick(record.steamId),
                });
              }}
              aria-label={`踢出 ${record.name}`}
            />
          </Tooltip>
          <Tooltip title="封禁玩家">
            <Button 
              danger 
              icon={<StopOutlined />} 
              onClick={() => {
                setSelectedPlayer(record);
                setIsBanModalVisible(true);
              }}
              aria-label={`封禁 ${record.name}`}
              className="bg-red-900/10 border-red-900/50 hover:border-red-500"
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold text-white m-0">玩家管理</h2>
        <Space className="w-full md:w-auto justify-between md:justify-end">
          <Select 
            className="w-full md:w-48"
            value={selectedServerId} 
            onChange={setSelectedServerId}
            placeholder="选择服务器"
            options={servers.map(server => ({ label: server.name, value: server.id }))}
          />
          <Button icon={<ReloadOutlined />} onClick={fetchPlayers} loading={loading}>
            刷新
          </Button>
        </Space>
      </div>

      <Tabs
        defaultActiveKey="list"
        className="text-gray-200"
        items={[
          {
            key: 'list',
            label: '玩家列表',
            children: (
              <Card className="shadow-sm" bodyStyle={{ padding: 0 }}>
                <Table 
                  columns={columns} 
                  dataSource={players} 
                  rowKey="steamId" 
                  loading={loading}
                  scroll={{ x: 'max-content' }}
                  pagination={{ pageSize: 20 }}
                  className="bg-transparent"
                />
              </Card>
            )
          },
          {
            key: 'squad',
            label: '小队管理',
            children: renderSquadView()
          }
        ]}
      />

      <Modal
        title={`封禁玩家 - ${selectedPlayer?.name}`}
        open={isBanModalVisible}
        onCancel={() => setIsBanModalVisible(false)}
        footer={null}
        width={520}
        className="dark"
      >
        <Form form={form} layout="vertical" onFinish={handleBan} className="mt-4">
          <Form.Item name="reason" label="理由" rules={[{ required: true, message: '请输入理由' }]}>
            <Input placeholder="请输入封禁理由" />
          </Form.Item>
          <Form.Item name="duration" label="时长 (分钟)" initialValue={0} help="0 表示永久封禁">
            <Input type="number" />
          </Form.Item>
          <Form.Item className="mb-0">
            <Button type="primary" htmlType="submit" block danger>
              封禁玩家
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default PlayerList;
