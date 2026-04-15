import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, message, Tag, Space, Divider, Tooltip, Card, Switch } from 'antd';
import { ReloadOutlined, PlusOutlined, DeleteOutlined, EditOutlined, SoundOutlined, RocketOutlined } from '@ant-design/icons';
import * as api from '../api/server';
import { socket } from '../utils/socket';
import { useAppSelector } from '../store/hooks';
import { getErrorMessage } from '../utils/httpError';

const ServerList: React.FC = () => {
  const user = useAppSelector((state) => state.auth.user);

  const [servers, setServers] = useState<api.Server[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingServer, setEditingServer] = useState<api.Server | null>(null);
  const [form] = Form.useForm();
  
  // Bulk Actions
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [isBulkModalVisible, setIsBulkModalVisible] = useState(false);
  const [bulkActionType, setBulkActionType] = useState<'broadcast' | 'command'>('broadcast');
  const [bulkForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [testingFileConnection, setTestingFileConnection] = useState(false);
  const [testingRconConnection, setTestingRconConnection] = useState<string | null>(null);
  const [deletingServerId, setDeletingServerId] = useState<string | null>(null);

  const fetchServers = async () => {
    try {
      const response = await api.getServers();
      if (Array.isArray(response.data)) {
        setServers(response.data);
      } else {
        console.error('Invalid servers data:', response.data);
        setServers([]);
      }
    } catch (error) {
      message.error(getErrorMessage(error, '获取服务器列表失败'));
    }
  };

  useEffect(() => {
    fetchServers();

    socket.on('serverStatus', (data: { serverId: string; status: string }) => {
      setServers(prev => {
        if (!Array.isArray(prev)) return [];
        return prev.map(s => 
          s.id === data.serverId ? { ...s, rconStatus: data.status as any } : s
        );
      });
    });

    socket.on('serverInfoUpdate', (data: any) => {
      setServers(prev => {
        if (!Array.isArray(prev)) return [];
        return prev.map(s => 
          s.id === data.serverId ? { 
            ...s, 
            currentMap: data.currentMap,
            playerCount: data.playerCount,
            maxPlayers: data.maxPlayers
          } : s
        );
      });
    });

    return () => {
      socket.off('serverStatus');
      socket.off('serverInfoUpdate');
    };
  }, []);

  const handleAddServer = async (values: any) => {
    setLoading(true);
    try {
      if (editingServer) {
        await api.updateServer(editingServer.id, values);
        message.success('服务器更新成功');
      } else {
        await api.createServer(values);
        message.success('服务器添加成功');
      }
      setIsModalVisible(false);
      form.resetFields();
      setEditingServer(null);
      fetchServers();
    } catch (error) {
      message.error(getErrorMessage(error, '操作失败'));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteServer = async (id: string) => {
    if (deletingServerId === id) {
      return;
    }
    setDeletingServerId(id);
    try {
      await api.deleteServer(id);
      message.open({ type: 'success', content: '服务器已删除', key: 'server-delete-status' });
      fetchServers();
    } catch (error) {
      message.open({ type: 'error', content: getErrorMessage(error, '删除服务器失败'), key: 'server-delete-status' });
    } finally {
      setDeletingServerId(null);
    }
  };

  const handleTestFileConnection = async () => {
    const values = form.getFieldsValue(true);
    if (!values.fileProtocol || values.fileProtocol === 'none') {
      message.warning('请先选择文件访问协议');
      return;
    }
    setTestingFileConnection(true);
    try {
      const response = await api.testFileConnection(values);
      message.success(response.data?.message || '文件连接测试成功');
    } catch (error) {
      message.error(getErrorMessage(error, '文件连接测试失败'));
    } finally {
      setTestingFileConnection(false);
    }
  };

  const handleTestRconConnection = async (serverId: string) => {
    setTestingRconConnection(serverId);
    try {
      const response = await api.testRconConnection(serverId);
      const data = response.data;
      
      if (data.status === 'connected') {
        message.success(`RCON 连接成功！延迟: ${data.latency}ms`);
      } else if (data.status === 'connecting') {
        message.warning('RCON 正在连接中...');
      } else {
        message.error(`RCON 连接失败: ${data.message}`);
      }
    } catch (error) {
      message.error(getErrorMessage(error, 'RCON 连接测试失败'));
    } finally {
      setTestingRconConnection(null);
    }
  };

  const openAddModal = () => {
    setEditingServer(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const openEditModal = (server: api.Server) => {
    setEditingServer(server);
    form.setFieldsValue(server);
    setIsModalVisible(true);
  };



  const handleBulkAction = async (values: any) => {
    try {
      await api.bulkServerAction(selectedRowKeys as string[], bulkActionType, values.payload);
      message.success('批量操作已执行');
      setIsBulkModalVisible(false);
      setSelectedRowKeys([]);
      bulkForm.resetFields();
    } catch (error) {
      message.error(getErrorMessage(error, '批量操作失败'));
    }
  };

  const openBulkModal = (type: 'broadcast' | 'command') => {
    setBulkActionType(type);
    setIsBulkModalVisible(true);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: React.Key[]) => setSelectedRowKeys(keys),
  };

  const columns = [
    {
      title: '状态',
      dataIndex: 'rconStatus',
      key: 'rconStatus',
      width: 100,
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
        if (status === 'unpublished') {
          color = 'default';
          text = '未上架';
        }
        return <Tag color={color} className="mr-0 border-0">{text}</Tag>;
      },
    },
    {
      title: '服务器名称',
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
    },
    {
      title: '地址',
      key: 'address',
      width: 200,
      render: (_: any, record: api.Server) => `${record.host}:${record.rconPort}`,
    },
    {
      title: '地图',
      dataIndex: 'currentMap',
      key: 'currentMap',
      width: 180,
      render: (map: string, record: any) => {
        // 优先使用 currentMap，如果没有则使用 currentMapName
        const displayMap = map || record.currentMapName;
        if (!displayMap || displayMap === 'N/A') {
          return <span className="text-gray-400">-</span>;
        }
        return <span className="font-medium">{displayMap}</span>;
      },
    },
    {
      title: '人数',
      key: 'players',
      width: 100,
      render: (_: any, record: any) => {
        const count = record.playerCount ?? 0;
        const max = record.maxPlayers ?? 100;
        return (
          <span>
            <span className="font-bold text-blue-500">{count}</span>
            <span className="text-gray-500">/{max}</span>
          </span>
        );
      },
    },
    {
      title: '操作',
      key: 'actions',
      width: 200,
      render: (_: any, record: api.Server) => (
        <Space>
          <Tooltip title="测试 RCON 连接">
            <Button 
              icon={<RocketOutlined />}
              onClick={() => handleTestRconConnection(record.id)}
              loading={testingRconConnection === record.id}
              aria-label={`测试 RCON ${record.name}`}
            />
          </Tooltip>
          {user?.role === 'superadmin' && (
            <>
              <Button 
                icon={<EditOutlined />} 
                onClick={() => openEditModal(record)}
                aria-label={`编辑 ${record.name}`}
              />
              <Button 
                danger 
                icon={<DeleteOutlined />} 
                onClick={() => handleDeleteServer(record.id)}
                loading={deletingServerId === record.id}
                disabled={deletingServerId !== null && deletingServerId !== record.id}
                aria-label={`删除 ${record.name}`}
              />
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold m-0">服务器管理</h2>
        <Space>
          {selectedRowKeys.length > 0 && (
            <>
              <span className="mr-2">已选择 {selectedRowKeys.length} 个服务器</span>
              <Button icon={<SoundOutlined />} onClick={() => openBulkModal('broadcast')}>批量广播</Button>
              <Button icon={<RocketOutlined />} onClick={() => openBulkModal('command')}>批量指令</Button>
              <Divider type="vertical" />
            </>
          )}
          <Button icon={<ReloadOutlined />} onClick={fetchServers}>刷新</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={openAddModal}>
            添加服务器
          </Button>
        </Space>
      </div>

      <Card className="shadow-sm" styles={{ body: { padding: 0 } }}>
        <Table 
          rowSelection={rowSelection}
          columns={columns} 
          dataSource={servers} 
          rowKey="id" 
          scroll={{ x: 1000 }}
          className="bg-transparent"
        />
      </Card>

      <Modal
        title={bulkActionType === 'broadcast' ? '批量广播' : '批量 RCON 指令'}
        open={isBulkModalVisible}
        onCancel={() => setIsBulkModalVisible(false)}
        footer={null}
      >
        <Form form={bulkForm} layout="vertical" onFinish={handleBulkAction}>
          <Form.Item 
            name="payload" 
            label={bulkActionType === 'broadcast' ? '广播内容' : 'RCON 指令'}
            rules={[{ required: true, message: '请输入内容' }]}
          >
            <Input.TextArea rows={3} />
          </Form.Item>
          <div className="mb-4 text-sm">
            即将对 {selectedRowKeys.length} 个服务器执行操作。
          </div>
          <Button type="primary" htmlType="submit" block>
            执行
          </Button>
        </Form>
      </Modal>

      <Modal
        title={editingServer ? "编辑 Squad 服务器" : "添加 Squad 服务器"}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleAddServer} className="mt-4">
          <Form.Item name="name" label="服务器名称" rules={[{ required: true, message: '请输入服务器名称' }]}>
            <Input placeholder="例如: Squad Server #1" />
          </Form.Item>

          <Form.Item name="isPublished" label="是否上架" valuePropName="checked" initialValue={true}>
            <Switch checkedChildren="上架" unCheckedChildren="下架" />
          </Form.Item>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item name="host" label="主机 IP" rules={[{ required: true, message: '请输入主机 IP' }]} initialValue="127.0.0.1">
              <Input placeholder="127.0.0.1" />
            </Form.Item>
            <Form.Item name="queryPort" label="查询端口" initialValue={27165}>
              <Input type="number" placeholder="27165" />
            </Form.Item>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item name="rconPort" label="RCON 端口" rules={[{ required: true, message: '请输入 RCON 端口' }]} initialValue={21114}>
              <Input type="number" placeholder="21114" />
            </Form.Item>
            <Form.Item name="rconPassword" label="RCON 密码" rules={[{ required: true, message: '请输入 RCON 密码' }]}>
              <Input.Password placeholder="RCON 密码" />
            </Form.Item>
          </div>

          <Divider>文件访问 (可选)</Divider>
          
          <Form.Item name="fileProtocol" label="协议" initialValue="none">
            <Select
              placeholder="选择文件访问协议"
              options={[
                { value: 'none', label: '无 (仅 RCON 管理)' },
                { value: 'local', label: '本地文件系统' },
                { value: 'ftp', label: 'FTP' },
                { value: 'sftp', label: 'SFTP' },
              ]}
            />
          </Form.Item>

          <Form.Item 
            noStyle 
            shouldUpdate={(prev, current) => prev.fileProtocol !== current.fileProtocol}
          >
            {({ getFieldValue }) => {
              const protocol = getFieldValue('fileProtocol');
              
              if (protocol === 'none' || !protocol) {
                return <div className="mb-4 p-3 rounded border text-sm">
                  选择"无"时，面板将仅作为 RCON 管理工具。您可以使用踢人、封禁、广播等功能，但无法在线修改配置文件。
                </div>;
              }

              return (
                <>
                  {protocol !== 'local' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Form.Item name="fileHost" label="文件主机">
                        <Input placeholder="留空则使用服务器主机 IP" />
                      </Form.Item>
                      <Form.Item name="filePort" label="文件端口">
                        <Input type="number" placeholder={protocol === 'sftp' ? "22" : "21"} />
                      </Form.Item>
                    </div>
                  )}
                  
                  {protocol !== 'local' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Form.Item name="fileUser" label="用户名">
                        <Input />
                      </Form.Item>
                      <Form.Item name="filePassword" label="密码">
                        <Input.Password />
                      </Form.Item>
                    </div>
                  )}

                  <Form.Item name="filePath" label="配置目录路径" help="包含 Admins.cfg 文件的绝对目录路径">
                    <Input placeholder="/home/squad/server/SquadGame/ServerConfig" />
                  </Form.Item>

                  <Form.Item className="mb-2">
                    <Button onClick={handleTestFileConnection} loading={testingFileConnection}>
                      测试文件连接
                    </Button>
                  </Form.Item>
                </>
              );
            }}
          </Form.Item>

          <Form.Item className="mb-0">
            <Button type="primary" htmlType="submit" block loading={loading}>
              {editingServer ? "更新服务器" : "添加服务器"}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ServerList;
