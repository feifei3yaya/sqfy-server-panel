import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, DatePicker, Select, message, Tag, Space, Popconfirm, Card } from 'antd';
import { PlusOutlined, DeleteOutlined, SyncOutlined, ReloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import type { Whitelist } from '../api/whitelist';
import { getWhitelist, addWhitelist, removeWhitelist } from '../api/whitelist';
import { getServers } from '../api/server';
import { syncConfig } from '../api/squadAdmin';

const { Option } = Select;

const VIPManager: React.FC = () => {
  const [whitelist, setWhitelist] = useState<Whitelist[]>([]);
  const [servers, setServers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [selectedServerId, setSelectedServerId] = useState<string | undefined>(undefined);

  useEffect(() => {
    fetchData();
  }, [selectedServerId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [whitelistData, serversData] = await Promise.all([
        getWhitelist(selectedServerId),
        getServers()
      ]);
      setWhitelist(whitelistData.data);
      setServers(serversData.data);
    } catch (error) {
      message.error('加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (values: any) => {
    try {
      await addWhitelist({
        ...values,
        expiresAt: values.expiresAt ? values.expiresAt.toISOString() : undefined
      });
      message.success('VIP 添加成功');
      setIsModalVisible(false);
      form.resetFields();
      fetchData();
    } catch (error) {
      message.error('添加失败');
    }
  };

  const handleRemove = async (id: string) => {
    try {
      await removeWhitelist(id);
      message.success('移除成功');
      fetchData();
    } catch (error) {
      message.error('移除失败');
    }
  };

  const handleSync = async () => {
    if (!selectedServerId) {
      message.warning('请先选择一个服务器进行同步');
      return;
    }
    try {
      await syncConfig(selectedServerId);
      message.success('配置已同步到服务器');
    } catch (error) {
      message.error('同步失败');
    }
  };

  const columns = [
    {
      title: 'Steam ID',
      dataIndex: 'steamId',
      key: 'steamId',
      className: 'font-mono text-gray-300',
    },
    {
      title: '服务器',
      dataIndex: ['server', 'name'],
      key: 'server',
      render: (text: string) => text || '未知',
    },
    {
      title: '备注',
      dataIndex: 'comment',
      key: 'comment',
    },
    {
      title: '过期时间',
      dataIndex: 'expiresAt',
      key: 'expiresAt',
      render: (date: string) => {
        if (!date) return <Tag color="green">永久</Tag>;
        const d = dayjs(date);
        const isExpired = d.isBefore(dayjs());
        return <Tag color={isExpired ? 'red' : 'blue'}>{d.format('YYYY-MM-DD')}</Tag>;
      }
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Whitelist) => (
        <Popconfirm title="确定移除该 VIP 吗？" onConfirm={() => handleRemove(record.id)}>
          <Button type="text" danger icon={<DeleteOutlined />} />
        </Popconfirm>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-white m-0">VIP 管理 (白名单)</h1>
          <Select
            placeholder="筛选服务器"
            allowClear
            className="w-48"
            onChange={setSelectedServerId}
            value={selectedServerId}
          >
            {servers.map(s => (
              <Option key={s.id} value={s.id}>{s.name}</Option>
            ))}
          </Select>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={fetchData}>刷新</Button>
          <Button icon={<SyncOutlined />} onClick={handleSync} disabled={!selectedServerId}>
            同步配置
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalVisible(true)}>
            添加 VIP
          </Button>
        </Space>
      </div>

      <Card className="shadow-sm bg-[#1f2229] border-[#2d3139]" styles={{ body: { padding: 0 } }}>
        <Table
          columns={columns}
          dataSource={whitelist}
          rowKey="id"
          loading={loading}
          className="bg-transparent"
        />
      </Card>

      <Modal
        title="添加 VIP"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        className="dark"
      >
        <Form form={form} layout="vertical" onFinish={handleAdd}>
          <Form.Item name="serverId" label="服务器" rules={[{ required: true }]}>
            <Select placeholder="选择服务器">
              {servers.map(s => (
                <Option key={s.id} value={s.id}>{s.name}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="steamId" label="Steam ID" rules={[{ required: true }]}>
            <Input placeholder="7656119xxxxxxxxxx" />
          </Form.Item>
          <Form.Item name="name" label="玩家名称 (可选)">
            <Input placeholder="用于备注" />
          </Form.Item>
          <Form.Item name="expiresAt" label="过期时间 (留空为永久)">
            <DatePicker className="w-full" />
          </Form.Item>
          <Form.Item name="comment" label="备注">
            <Input.TextArea />
          </Form.Item>
          <Button type="primary" htmlType="submit" block>
            添加
          </Button>
        </Form>
      </Modal>
    </div>
  );
};

export default VIPManager;
