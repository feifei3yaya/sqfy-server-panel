import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, message, Space, Card, Tag, Tooltip, Form, Input, Select } from 'antd';
import { DeleteOutlined, ReloadOutlined, PlusOutlined, ThunderboltOutlined } from '@ant-design/icons';
import api from '../api/client';
import dayjs from 'dayjs';

interface Ban {
  id: string;
  steamId: string;
  reason: string;
  adminId: string;
  expiresAt: string | null;
  createdAt: string;
  player?: {
    nameHistory: string;
  };
}

const BanList: React.FC = () => {
  const [bans, setBans] = useState<Ban[]>([]);
  const [servers, setServers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchBans();
    fetchServers();
  }, []);

  const fetchBans = async () => {
    setLoading(true);
    try {
      const response = await api.get('/players/bans');
      setBans(response.data);
    } catch (error) {
      message.error('获取封禁列表失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchServers = async () => {
    try {
      const res = await api.get('/servers');
      setServers(res.data);
    } catch (error) {
      message.error('获取服务器列表失败');
    }
  };

  const handleAddBan = async (values: any) => {
    const { serverId, steamId, reason, duration } = values;
    try {
      await api.post(`/players/${serverId}/ban/${steamId}`, { reason, duration });
      message.success('封禁已添加');
      setIsModalVisible(false);
      form.resetFields();
      fetchBans();
    } catch (error: any) {
      message.error(error.response?.data?.message || '添加封禁失败');
    }
  };

  const handleUnban = async (banId: string) => {
    try {
      // Future improvement: Allow selecting server to unban from RCON as well
      await api.delete(`/players/bans/${banId}`);
      message.success('封禁已移除');
      fetchBans();
    } catch (error) {
      message.error('移除封禁失败');
    }
  };

  const columns = [
    {
      title: 'Steam ID',
      dataIndex: 'steamId',
      key: 'steamId',
      className: 'font-mono text-gray-400',
    },
    {
      title: '理由',
      dataIndex: 'reason',
      key: 'reason',
      className: 'text-gray-200',
    },
    {
      title: '过期时间',
      dataIndex: 'expiresAt',
      key: 'expiresAt',
      className: 'text-gray-200',
      render: (date: string) => date ? dayjs(date).format('YYYY-MM-DD HH:mm') : <Tag color="red">永久</Tag>,
    },
    {
      title: '封禁时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      className: 'text-gray-500',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '操作',
      key: 'actions',
      render: (_: any, record: Ban) => (
        <Space>
          <Tooltip title="移除封禁">
            <Button 
              danger 
              type="text"
              icon={<DeleteOutlined />} 
              onClick={() => {
                Modal.confirm({
                  title: '移除封禁',
                  content: `确定要移除对 ${record.steamId} 的封禁吗?`,
                  onOk: () => handleUnban(record.id),
                });
              }}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white m-0">封禁管理</h2>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={fetchBans} loading={loading}>
            刷新
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalVisible(true)}>
            新增封禁
          </Button>
        </Space>
      </div>

      <Card className="shadow-sm" styles={{ body: { padding: 0 } }}>
        <Table 
          columns={columns} 
          dataSource={bans} 
          rowKey="id" 
          loading={loading}
          scroll={{ x: 'max-content' }}
          pagination={{ pageSize: 20 }}
          className="bg-transparent"
        />
      </Card>

      <Modal
        title="新增封禁"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        className="dark"
      >
        <Form form={form} layout="vertical" onFinish={handleAddBan} className="mt-4">
          <Form.Item name="serverId" label="目标服务器" rules={[{ required: true, message: '请选择服务器' }]}>
            <Select
              placeholder="选择要执行封禁的服务器"
              options={servers.map((s) => ({ value: s.id, label: s.name }))}
            />
          </Form.Item>
          <Form.Item name="steamId" label="Steam ID" rules={[{ required: true, message: '请输入 Steam ID' }]}>
            <Input placeholder="7656119..." />
          </Form.Item>
          <Form.Item name="reason" label="封禁理由" rules={[{ required: true, message: '请输入理由' }]}>
            <Input placeholder="例如: 恶意TK" />
          </Form.Item>
          <Form.Item name="duration" label="时长 (分钟)" initialValue={0} help="0 表示永久封禁">
            <Input type="number" />
          </Form.Item>
          <Form.Item className="mb-0">
            <Button type="primary" htmlType="submit" block danger icon={<ThunderboltOutlined />}>
              执行封禁
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default BanList;
