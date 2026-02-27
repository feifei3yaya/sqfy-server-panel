import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, message, Tag, Space, Divider, Drawer, Tooltip, Grid } from 'antd';
import { ReloadOutlined, PlusOutlined, DeleteOutlined, CodeOutlined, EditOutlined, LineChartOutlined, GlobalOutlined } from '@ant-design/icons';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '../api/client';
import RconTerminal from './RconTerminal';
import MapManager from './MapManager';
import { socket } from '../utils/socket';

interface Server {
  id: string;
  name: string;
  host: string;
  rconPort: number;
  rconStatus: 'connected' | 'disconnected' | 'connecting';
  fileProtocol?: string;
  fileHost?: string;
  filePort?: number;
  fileUser?: string;
  filePath?: string;
}

const { Option } = Select;
const { useBreakpoint } = Grid;

const ServerList: React.FC = () => {
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const [servers, setServers] = useState<Server[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingServer, setEditingServer] = useState<Server | null>(null);
  const [form] = Form.useForm();
  const [selectedServer, setSelectedServer] = useState<Server | null>(null);
  const [isTerminalVisible, setIsTerminalVisible] = useState(false);
  const [isMetricsVisible, setIsMetricsVisible] = useState(false);
  const [isMapManagerVisible, setIsMapManagerVisible] = useState(false);
  const [metrics, setMetrics] = useState<any[]>([]);
  const [metricsRange, setMetricsRange] = useState('24h');

  const fetchServers = async () => {
    try {
      const response = await api.get('/servers');
      setServers(response.data);
    } catch (error) {
      message.error('获取服务器列表失败');
    }
  };

  useEffect(() => {
    fetchServers();

    socket.on('serverStatus', (data: { serverId: string; status: string }) => {
      setServers(prev => prev.map(s => 
        s.id === data.serverId ? { ...s, rconStatus: data.status as any } : s
      ));
    });

    return () => {
      socket.off('serverStatus');
    };
  }, []);

  const handleAddServer = async (values: any) => {
    try {
      if (editingServer) {
        await api.put(`/servers/${editingServer.id}`, values);
        message.success('服务器更新成功');
      } else {
        await api.post('/servers', values);
        message.success('服务器添加成功');
      }
      setIsModalVisible(false);
      form.resetFields();
      setEditingServer(null);
      fetchServers();
    } catch (error) {
      message.error('操作失败');
    }
  };

  const handleDeleteServer = async (id: string) => {
    try {
      await api.delete(`/servers/${id}`);
      message.success('服务器已删除');
      fetchServers();
    } catch (error) {
      message.error('删除服务器失败');
    }
  };

  const openAddModal = () => {
    setEditingServer(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const openEditModal = (server: Server) => {
    setEditingServer(server);
    form.setFieldsValue(server);
    setIsModalVisible(true);
  };

  const fetchMetrics = async (serverId: string, range: string) => {
    try {
      const res = await api.get(`/servers/${serverId}/metrics?range=${range}`);
      const formattedData = res.data.map((item: any) => ({
        ...item,
        time: new Date(item.timestamp).toLocaleTimeString(),
        fullTime: new Date(item.timestamp).toLocaleString()
      }));
      setMetrics(formattedData);
    } catch (error) {
      message.error('获取监控数据失败');
    }
  };

  const openMetrics = (server: Server) => {
    setSelectedServer(server);
    setIsMetricsVisible(true);
    fetchMetrics(server.id, metricsRange);
  };

  const openMapManager = (server: Server) => {
    setSelectedServer(server);
    setIsMapManagerVisible(true);
  };

  const handleMetricsRangeChange = (range: string) => {
    setMetricsRange(range);
    if (selectedServer) {
      fetchMetrics(selectedServer.id, range);
    }
  };

  const columns = [
    {
      title: '状态',
      dataIndex: 'rconStatus',
      key: 'rconStatus',
      width: 100,
      className: 'text-gray-200',
      render: (status: string) => {
        let color = 'red';
        let text = '断开';
        if (status === 'connected') {
          color = 'green';
          text = '在线';
        }
        if (status === 'connecting') {
          color = 'orange';
          text = '连接中';
        }
        return <Tag color={color} className="mr-0 border-0">{text}</Tag>;
      },
    },
    {
      title: '服务器名称',
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
      className: 'text-gray-200 font-medium',
    },
    {
      title: '地址',
      key: 'address',
      width: 200,
      className: 'text-gray-400 font-mono text-sm',
      render: (_: any, record: Server) => `${record.host}:${record.rconPort}`,
    },
    {
      title: '操作',
      key: 'actions',
      width: 250,
      render: (_: any, record: Server) => (
        <Space>
          <Button 
            icon={<LineChartOutlined />} 
            onClick={() => openMetrics(record)}
            className="text-amber-500 hover:text-amber-400 border-amber-900/50 bg-amber-900/10 hover:border-amber-500"
            aria-label={`监控 ${record.name}`}
          >
            监控
          </Button>
          <Tooltip title="地图管理">
            <Button 
              icon={<GlobalOutlined />} 
              onClick={() => openMapManager(record)}
              aria-label={`地图管理 ${record.name}`}
            />
          </Tooltip>
          <Tooltip title="RCON 终端">
            <Button 
              icon={<CodeOutlined />} 
              onClick={() => {
                setSelectedServer(record);
                setIsTerminalVisible(true);
              }}
              aria-label={`RCON 终端 ${record.name}`}
            />
          </Tooltip>
          <Button 
            icon={<EditOutlined />} 
            onClick={() => openEditModal(record)}
            aria-label={`编辑 ${record.name}`}
          />
          <Button 
            danger 
            icon={<DeleteOutlined />} 
            onClick={() => handleDeleteServer(record.id)}
            aria-label={`删除 ${record.name}`}
            className="bg-red-900/10 border-red-900/50 hover:border-red-500"
          />
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-white m-0">服务器管理</h2>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={fetchServers}>刷新</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={openAddModal}>
            添加服务器
          </Button>
        </Space>
      </div>

      <Card className="shadow-sm" bodyStyle={{ padding: 0 }}>
        <Table 
          columns={columns} 
          dataSource={servers} 
          rowKey="id" 
          scroll={{ x: 1000 }}
          className="bg-transparent"
        />
      </Card>

      <Modal
        title={editingServer ? "编辑 Squad 服务器" : "添加 Squad 服务器"}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={600}
        className="dark"
      >
        <Form form={form} layout="vertical" onFinish={handleAddServer} className="mt-4">
          <Form.Item name="name" label="服务器名称" rules={[{ required: true, message: '请输入服务器名称' }]}>
            <Input placeholder="例如: Squad Server #1" />
          </Form.Item>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item name="host" label="主机 IP" rules={[{ required: true, message: '请输入主机 IP' }]}>
              <Input placeholder="127.0.0.1" />
            </Form.Item>
            <Form.Item name="queryPort" label="查询端口">
              <Input type="number" placeholder="27165" />
            </Form.Item>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item name="rconPort" label="RCON 端口" rules={[{ required: true, message: '请输入 RCON 端口' }]}>
              <Input type="number" placeholder="21114" />
            </Form.Item>
            <Form.Item name="rconPassword" label="RCON 密码" rules={[{ required: true, message: '请输入 RCON 密码' }]}>
              <Input.Password placeholder="RCON 密码" />
            </Form.Item>
          </div>

          <Divider className="border-[#2d3139] text-gray-400">文件访问 (可选)</Divider>
          
          <Form.Item name="fileProtocol" label="协议">
            <Select placeholder="选择文件访问协议">
              <Option value="local">本地文件系统</Option>
              <Option value="ftp">FTP</Option>
              <Option value="sftp">SFTP</Option>
            </Select>
          </Form.Item>

          <Form.Item 
            noStyle 
            shouldUpdate={(prev, current) => prev.fileProtocol !== current.fileProtocol}
          >
            {({ getFieldValue }) => {
              const protocol = getFieldValue('fileProtocol');
              return protocol && protocol !== 'local' ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Form.Item name="fileHost" label="文件主机">
                      <Input placeholder="留空则使用服务器主机 IP" />
                    </Form.Item>
                    <Form.Item name="filePort" label="文件端口">
                      <Input type="number" placeholder="21 或 22" />
                    </Form.Item>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Form.Item name="fileUser" label="用户名">
                      <Input />
                    </Form.Item>
                    <Form.Item name="filePassword" label="密码">
                      <Input.Password />
                    </Form.Item>
                  </div>
                </>
              ) : null;
            }}
          </Form.Item>

          <Form.Item name="filePath" label="配置目录路径" help="包含 Admins.cfg 文件的绝对目录路径">
            <Input placeholder="/home/squad/server/SquadGame/ServerConfig" />
          </Form.Item>

          <Form.Item className="mb-0">
            <Button type="primary" htmlType="submit" block>
              {editingServer ? "更新服务器" : "添加服务器"}
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={`地图管理 - ${selectedServer?.name}`}
        open={isMapManagerVisible}
        onCancel={() => setIsMapManagerVisible(false)}
        width={600}
        footer={null}
        destroyOnClose
        className="dark"
      >
        {selectedServer && <MapManager serverId={selectedServer.id} />}
      </Modal>

      <Modal
        title={`RCON 终端 - ${selectedServer?.name}`}
        open={isTerminalVisible}
        onCancel={() => setIsTerminalVisible(false)}
        width={800}
        footer={null}
        destroyOnClose
        className="dark"
      >
        {selectedServer && <RconTerminal serverId={selectedServer.id} />}
      </Modal>

      <Drawer
        title={`服务器监控 - ${selectedServer?.name}`}
        width={isMobile ? '100%' : 800}
        onClose={() => setIsMetricsVisible(false)}
        open={isMetricsVisible}
        className="dark"
      >
        <div className="mb-4">
          <Select value={metricsRange} onChange={handleMetricsRangeChange} className="w-48">
            <Option value="24h">过去 24 小时</Option>
            <Option value="7d">过去 7 天</Option>
          </Select>
        </div>
        
        <div style={{ height: 400 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={metrics}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2d3139" vertical={false} />
              <XAxis dataKey="time" tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} />
              <ChartTooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(31, 34, 41, 0.9)', 
                  borderRadius: '8px', 
                  border: '1px solid rgba(45, 49, 57, 0.6)', 
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)',
                  color: '#e5e7eb',
                  backdropFilter: 'blur(4px)'
                }}
                labelFormatter={(label, payload) => {
                  if (payload && payload.length > 0) {
                    return payload[0].payload.fullTime;
                  }
                  return label;
                }} 
              />
              <Legend />
              <Line type="monotone" dataKey="playerCount" name="在线人数" stroke="#eab308" strokeWidth={2} activeDot={{ r: 8 }} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-8 p-4 bg-[#15171e]/50 rounded-lg border border-[#2d3139]">
          <h3 className="text-lg font-medium mb-2 text-white">当前状态</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-gray-400">最后更新</span>
              <p className="text-lg font-mono text-gray-200">{metrics.length > 0 ? metrics[metrics.length - 1].fullTime : '-'}</p>
            </div>
            <div>
              <span className="text-gray-400">当前人数</span>
              <p className="text-lg font-mono text-gray-200">{metrics.length > 0 ? metrics[metrics.length - 1].playerCount : '-'}</p>
            </div>
          </div>
        </div>
      </Drawer>
    </div>
  );
};

export default ServerList;
