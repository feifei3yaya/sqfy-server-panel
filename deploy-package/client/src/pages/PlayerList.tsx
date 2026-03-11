import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, message, Tag, Space, Card, Tooltip, Tabs, Dropdown, Menu } from 'antd';
import { ReloadOutlined, StopOutlined, WarningOutlined, DownOutlined, VideoCameraOutlined, EnvironmentOutlined, EyeOutlined, SwapOutlined, UserDeleteOutlined, ThunderboltOutlined, ClockCircleOutlined, TrophyOutlined, FileTextOutlined, SearchOutlined } from '@ant-design/icons';
import api from '../api/client';
import { Badge, List, Empty } from 'antd';

import FactionPanel from '../components/game/FactionPanel';

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
  totalPlaytimeMinutes?: number;
  steamPlaytimeMinutes?: number;
}

interface PlayerNote {
  id: string;
  content: string;
  authorName: string;
  createdAt: string;
}

interface Server {
  id: string;
  name: string;
}

interface Match {
  id: string;
  serverId: string;
  map: string;
  layer?: string;
  startTime: string;
  endTime?: string;
  winner?: string;
  score?: string;
  server?: {
    name: string;
  };
}

interface ServerStatus {
  serverName: string;
  currentMap: string;
  currentMapName?: string;
  currentMapLayer?: string;
  nextMap?: string;
  nextMapName?: string;
  nextMapLayer?: string;
  factions?: {
    team1: string;
    team2: string;
    raw: string;
  };
  team1Name?: string;
  team2Name?: string;
  playerCount: number;
  maxPlayers: number;
  publicQueue: number;
  reservedQueue: number;
  matchTimeout: number;
}

const PlayerList: React.FC = () => {
  const [servers, setServers] = useState<Server[]>([]);
  const [selectedServerId, setSelectedServerId] = useState<string>('');
  const [players, setPlayers] = useState<Player[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [serverStatus, setServerStatus] = useState<ServerStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [isBanModalVisible, setIsBanModalVisible] = useState(false);
  const [isWarnModalVisible, setIsWarnModalVisible] = useState(false);
  const [warnMessage, setWarnMessage] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState<string>('squad');
  
  // Notes
  const [isNoteModalVisible, setIsNoteModalVisible] = useState(false);
  const [playerNotes, setPlayerNotes] = useState<PlayerNote[]>([]);
  const [noteContent, setNoteContent] = useState('');
  const [noteCounts, setNoteCounts] = useState<Record<string, number>>({});

  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    fetchServers();
  }, []);

  // Smart Polling Logic
  useEffect(() => {
    if (!selectedServerId) return;

    let timeoutId: any;

    const poll = async () => {
      // If page is hidden, slow down polling
      if (document.hidden) {
        timeoutId = setTimeout(poll, 10000); // 10s when hidden
        return;
      }

      await fetchPlayers(true); // silent fetch
      // await fetchMatches(); // Maybe not every time
      await fetchServerStatus();
      
      timeoutId = setTimeout(poll, 5000); // 5s normal interval
    };

    poll();

    return () => clearTimeout(timeoutId);
  }, [selectedServerId]);

  useEffect(() => {
    if (players.length > 0) {
      fetchNoteCounts();
    }
  }, [players]);

  useEffect(() => {
    if (selectedServerId && activeTab === 'matches') {
      fetchMatches();
    }
  }, [selectedServerId, activeTab]);

  const fetchNoteCounts = async () => {
    try {
      const steamIds = players.map(p => p.steamId);
      const response = await api.post('/player-notes/batch-count', { steamIds });
      if (response.data.status === 'success') {
        setNoteCounts(response.data.data);
      }
    } catch (error) {
      console.error('获取笔记数量失败', error);
    }
  };

  const fetchPlayerNotes = async (steamId: string) => {
    try {
      const response = await api.get(`/player-notes/${steamId}/notes`);
      if (response.data.status === 'success') {
        setPlayerNotes(response.data.data);
      }
    } catch (error) {
      message.error('获取笔记失败');
    }
  };

  const handleAddNote = async () => {
    if (!selectedPlayer || !noteContent.trim()) return;
    try {
      await api.post(`/player-notes/${selectedPlayer.steamId}/notes`, {
        content: noteContent
      });
      message.success('笔记添加成功');
      setIsNoteModalVisible(false);
      setNoteContent('');
      await fetchPlayerNotes(selectedPlayer.steamId);
      await fetchNoteCounts();
    } catch (error) {
      message.error('添加笔记失败');
    }
  };

  const fetchServerStatus = async () => {
    if (!selectedServerId) return;
    try {
      const response = await api.get(`/servers/${selectedServerId}/status`);
      setServerStatus(response.data);
    } catch (error) {
      console.error('获取服务器状态失败', error);
      setServerStatus(null);
    }
  };

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

  const fetchPlayers = async (silent = false) => {
    if (!selectedServerId) return;
    if (!silent) setLoading(true);
    try {
      const response = await api.get(`/players/${selectedServerId}`);
      setPlayers(response.data);
    } catch (error) {
      if (!silent) message.error('获取玩家列表失败');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const fetchMatches = async () => {
    if (!selectedServerId) return;
    try {
      const response = await api.get('/matches', {
        params: { serverId: selectedServerId, pageSize: 5 }
      });
      setMatches(response?.data?.data?.items || []);
    } catch (error) {
      console.error('获取对局列表失败', error);
      setMatches([]);
    }
  };

  const handleWarnSubmit = async () => {
        if (!selectedPlayer || !warnMessage) return;
        await handleWarn(selectedPlayer.steamId, warnMessage);
        setIsWarnModalVisible(false);
        setWarnMessage('');
    };

    const getActionItems = (player: Player): React.ComponentProps<typeof Menu>['items'] => [
    {
      key: 'camera',
      label: <span className="text-purple-400"><VideoCameraOutlined /> 摄像头跟随</span>,
      onClick: () => message.info('摄像头跟随'),
    },
    {
      key: 'marker',
      label: <span className="text-red-500"><EnvironmentOutlined /> 标记</span>,
      onClick: () => message.info('标记'),
    },
    {
      key: 'look',
      label: <span className="text-green-500"><EyeOutlined /> 查看资料</span>,
      onClick: () => message.info('查看资料'),
    },
    {
      key: 'changeteam',
      label: <span className="text-blue-400"><SwapOutlined /> 跳边</span>,
      onClick: () => message.info('跳边'),
    },
    {
      type: 'divider',
    },
    {
      key: 'remove',
      label: <span className="text-pink-400"><UserDeleteOutlined /> 踢出队伍</span>,
      onClick: () => message.info('踢出队伍'),
    },
    {
      key: 'kick',
      label: <span className="text-amber-500"><StopOutlined /> 踢出服务器</span>,
      onClick: () => handleKick(player.steamId),
    },
    {
      key: 'ban',
      label: <span className="text-red-500"><ThunderboltOutlined /> 封禁</span>,
      onClick: () => {
        setSelectedPlayer(player);
        setIsBanModalVisible(true);
      },
    },
    {
      type: 'divider',
    },
    {
      key: 'war',
      label: <span className="text-orange-400"><WarningOutlined /> 警告</span>,
      onClick: () => {
        setSelectedPlayer(player);
        setIsWarnModalVisible(true);
      },
    },
    {
      key: 'sethour',
      label: <span className="text-green-500"><ClockCircleOutlined /> 设置时长</span>,
      onClick: () => message.info('设置时长'),
    },
  ];

  const handleKick = async (steamId: string) => {
    try {
      await api.post(`/players/${selectedServerId}/kick/${steamId}`, { reason: '被管理员踢出' });
      message.success('玩家已踢出');
      fetchPlayers();
    } catch (error) {
      message.error('踢出玩家失败');
    }
  };

  const handleBan = async (duration: number, reason: string) => {
    if (!selectedPlayer) return;
    try {
      await api.post(`/players/${selectedServerId}/ban/${selectedPlayer.steamId}`, {
        duration,
        reason
      });
      message.success(`玩家已封禁 ${duration}分钟`);
      setIsBanModalVisible(false);
      fetchPlayers();
    } catch (error) {
      message.error('封禁玩家失败');
    }
  };

  const handleWarn = async (steamId: string, messageText: string) => {
    try {
      await api.post(`/players/${selectedServerId}/warn/${steamId}`, {
        message: messageText
      });
      message.success('警告已发送');
    } catch (error) {
      message.error('发送警告失败');
    }
  };

  const getTeamName = (teamId: string) => {
    // 使用服务器状态中的真实阵营名称
    if (serverStatus) {
      if (teamId === '1') {
        return serverStatus.team1Name || 'Team 1';
      } else {
        return serverStatus.team2Name || 'Team 2';
      }
    }
    // 默认通用名称
    return teamId === '1' ? "Team 1" : "Team 2"; 
  };

  const getTeamColor = (teamId: string) => {
    // Team 1: Amber (Theme Primary)
    // Team 2: Orange (Complementary but distinct)
    return teamId === '1' ? '#f59e0b' : '#d97706'; 
  };

  const renderSquadView = () => {
    const teams = ['1', '2'];
    const currentServer = servers.find(s => s.id === selectedServerId);
    
    // Filter by search
    const filteredPlayers = players.filter(p => 
      p.name.toLowerCase().includes(searchText.toLowerCase()) || 
      p.steamId.includes(searchText)
    );

    return (
      <div className="space-y-6">
        <Card className="panel-shell">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <EnvironmentOutlined className="text-blue-400" />
              <div>
                <div className="text-sm panel-muted">服务器</div>
                <div className="text-xl font-bold panel-title">
                  {serverStatus?.serverName || currentServer?.name || 'Squad Server'}
                </div>
                {serverStatus && (
                  <div className="text-sm mt-1 panel-muted">
                    当前地图：<span className="text-blue-300">{serverStatus.currentMapName || serverStatus.currentMap}</span>
                    {serverStatus.nextMap && ` | 下一张：${serverStatus.nextMapName || serverStatus.nextMap}`}
                    {serverStatus.factions?.raw && ` | ${serverStatus.factions.raw}`}
                  </div>
                )}
              </div>
            </div>
            
            {serverStatus && (serverStatus.publicQueue > 0 || serverStatus.reservedQueue > 0) && (
              <div className="text-center">
                <div className="text-sm panel-muted">排队中</div>
                <div className="flex items-center gap-4 mt-1">
                  <div>
                    <span className="text-lg font-bold text-yellow-400">{serverStatus.publicQueue}</span>
                    <span className="text-sm ml-1 panel-muted">公</span>
                  </div>
                  <div>
                    <span className="text-lg font-bold text-purple-400">{serverStatus.reservedQueue}</span>
                    <span className="text-sm ml-1 panel-muted">保</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {teams.map(teamId => {
            const teamPlayers = filteredPlayers.filter(p => p.teamId === teamId);
            
            return (
              <FactionPanel
                key={teamId}
                teamId={teamId}
                teamName={getTeamName(teamId)}
                teamColor={getTeamColor(teamId)}
                players={teamPlayers}
                onDisbandSquad={handleDisbandSquad}
                getActionItems={getActionItems}
              />
            );
          })}
        </div>
      </div>
    );
  };

  const renderMatchesView = () => {
    return (
      <div className="space-y-4">
        {matches.length === 0 ? (
          <Empty description="暂无对局记录" />
        ) : (
          matches.map((match) => (
            <Card key={match.id} className="panel-shell">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm panel-muted">地图</div>
                  <div className="panel-title">{match.map}</div>
                  {match.layer && <div className="text-xs panel-subtle">{match.layer}</div>}
                </div>
                {match.winner && (
                  <div>
                    <div className="text-sm panel-muted">获胜方</div>
                    <div className="panel-title">{match.winner === 'Team1' ? '第 58 摩托化旅' : '皇家骠骑兵'}</div>
                  </div>
                )}
                {match.score && (
                  <div>
                    <div className="text-sm panel-muted">比分</div>
                    <div className="panel-title">{match.score}</div>
                  </div>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
    );
  };

  const handleDisbandSquad = async (teamId: string, squadId: string) => {
    try {
      await api.post(`/servers/${selectedServerId}/disband-squad`, {
        teamId,
        squadId
      });
      message.success('小队已解散');
      fetchPlayers();
    } catch (error) {
      message.error('解散小队失败');
    }
  };

  const columns = [
    {
      title: '状态',
      dataIndex: 'isAlive',
      key: 'status',
      width: 80,
      render: (isAlive: boolean, player: Player) => (
        <Tooltip title={player.isWounded ? '受伤' : isAlive ? '存活' : '阵亡'}>
          <Badge 
            status={player.isWounded ? 'warning' : isAlive ? 'success' : 'error'} 
          />
        </Tooltip>
      ),
    },
    {
      title: '兵种',
      dataIndex: 'role',
      key: 'role',
      width: 80,
      render: (role: string, player: Player) => (
        <Tooltip title={role}>
          <span className="text-xs">{role?.split('_')[1] || role}</span>
        </Tooltip>
      ),
    },
    {
      title: '昵称',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, player: Player) => (
        <div>
          <div className="font-medium panel-title">{name}</div>
          <div className="text-xs panel-muted">Steam: {player.steamId}</div>
        </div>
      ),
    },
    {
      title: '队伍',
      dataIndex: 'teamId',
      key: 'teamId',
      width: 100,
      render: (teamId: string) => (
        <Tag color={getTeamColor(teamId)} className="border-0">
          {getTeamName(teamId)}
        </Tag>
      ),
    },
    {
      title: '小队',
      dataIndex: 'squadId',
      key: 'squadId',
      width: 100,
      render: (squadId: string, player: Player) => squadId || <span className="panel-muted">无</span>,
    },
    {
      title: '战绩',
      key: 'kd',
      width: 100,
      render: (_: any, player: Player) => (
        <span className="font-medium">
          <span className="text-green-500">{player.kills ?? 0}</span>
          <span className="text-gray-500 mx-1">/</span>
          <span className="text-red-500">{player.deaths ?? 0}</span>
        </span>
      ),
    },
    {
      title: '时长',
      key: 'playTime',
      width: 100,
      render: (_: any, player: Player) => {
        const minutes = player.totalPlaytimeMinutes || player.steamPlaytimeMinutes || 0;
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return (
          <span className="font-medium">
            {hours > 0 ? `${hours}h` : ''}{mins}m
          </span>
        );
      },
    },
    {
      title: '笔记',
      key: 'notes',
      width: 80,
      render: (_: any, player: Player) => (
        <Button 
          type="link" 
          size="small" 
          icon={<FileTextOutlined />}
          onClick={() => handleViewNotes(player)}
        >
          {noteCounts[player.steamId] || 0}
        </Button>
      ),
    },
    {
      title: '操作',
      key: 'actions',
      width: 100,
      render: (_: any, player: Player) => (
        <Dropdown menu={{ items: getActionItems(player) }}>
          <Button type="link" size="small">
            操作 <DownOutlined />
          </Button>
        </Dropdown>
      ),
    },
  ];

  const handleViewNotes = async (player: Player) => {
    setSelectedPlayer(player);
    await fetchPlayerNotes(player.steamId);
    setIsNoteModalVisible(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold m-0">玩家管理</h2>
        <Space>
          <Input
            placeholder="搜索玩家..."
            prefix={<SearchOutlined />}
            onChange={e => setSearchText(e.target.value)}
            className="w-full md:w-64"
            allowClear
          />
          <Select 
            className="w-full md:w-48"
            value={selectedServerId} 
            onChange={setSelectedServerId}
            placeholder="选择服务器"
            options={servers.map(server => ({ label: server.name, value: server.id }))}
          />
          <Button icon={<ReloadOutlined />} onClick={() => fetchPlayers()} loading={loading}>
            刷新
          </Button>
        </Space>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: 'list',
            label: '玩家列表',
            children: (
              <Card className="panel-shell" styles={{ body: { padding: 0 } }}>
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
            label: '阵营列表',
            children: renderSquadView()
          },
          {
            key: 'matches',
            label: '对局记录',
            children: renderMatchesView()
          }
        ]}
      />

      <Modal
        title="封禁玩家"
        open={isBanModalVisible}
        onCancel={() => setIsBanModalVisible(false)}
        footer={null}
      >
        <Form
          layout="vertical"
          onFinish={(values) => {
            handleBan(values.duration, values.reason);
          }}
        >
          <Form.Item
            name="duration"
            label="封禁时长 (分钟)"
            rules={[{ required: true, message: '请输入封禁时长' }]}
            initialValue={60}
          >
            <Input type="number" min="1" />
          </Form.Item>
          <Form.Item
            name="reason"
            label="封禁原因"
            rules={[{ required: true, message: '请输入封禁原因' }]}
            initialValue="违反服务器规则"
          >
            <Input />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              确认封禁
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="警告玩家"
        open={isWarnModalVisible}
        onCancel={() => setIsWarnModalVisible(false)}
        footer={null}
      >
        <Form
          layout="vertical"
          onFinish={handleWarnSubmit}
        >
          <Form.Item
            name="message"
            label="警告内容"
            rules={[{ required: true, message: '请输入警告内容' }]}
            initialValue="请遵守服务器规则"
          >
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              发送警告
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="玩家笔记"
        open={isNoteModalVisible}
        onCancel={() => {
          setIsNoteModalVisible(false);
          setNoteContent('');
        }}
        footer={null}
        width={600}
      >
        <div className="mb-4">
          <div className="font-medium mb-2">
            玩家：{selectedPlayer?.name} ({selectedPlayer?.steamId})
          </div>
          <List
            dataSource={playerNotes}
            renderItem={(note) => (
              <List.Item>
                <List.Item.Meta
                  title={
                    <div className="flex justify-between items-center">
                      <span>{note.authorName}</span>
                      <span className="text-xs text-gray-500">
                        {new Date(note.createdAt).toLocaleString('zh-CN')}
                      </span>
                    </div>
                  }
                  description={note.content}
                />
              </List.Item>
            )}
            locale={{ emptyText: '暂无笔记' }}
          />
        </div>
        <Form
          layout="vertical"
          onFinish={handleAddNote}
        >
          <Form.Item
            name="note"
            label="添加新笔记"
            rules={[{ required: true, message: '请输入笔记内容' }]}
          >
            <Input.TextArea
              rows={3}
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              placeholder="输入笔记内容..."
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              添加笔记
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default PlayerList;
