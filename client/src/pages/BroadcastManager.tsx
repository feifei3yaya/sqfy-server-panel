import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, message, Space, Card, Tag, Switch, InputNumber } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined, SoundOutlined, ReloadOutlined } from '@ant-design/icons';
import * as api from '../api/broadcast';
import client from '../api/client';

const { Option } = Select;
const { TextArea } = Input;

const BroadcastManager: React.FC = () => {
  const [servers, setServers] = useState<any[]>([]);
  const [selectedServerId, setSelectedServerId] = useState<string>('');
  const [broadcasts, setBroadcasts] = useState<api.Broadcast[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingBroadcast, setEditingBroadcast] = useState<api.Broadcast | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchServers();
  }, []);

  useEffect(() => {
    if (selectedServerId) {
      fetchBroadcasts();
    }
  }, [selectedServerId]);

  const fetchServers = async () => {
    try {
      const res = await client.get('/servers');
      setServers(res.data);
      if (res.data.length > 0) {
        setSelectedServerId(res.data[0].id);
      }
    } catch (error) {
      message.error('获取服务器列表失败');
    }
  };

  const fetchBroadcasts = async () => {
    if (!selectedServerId) return;
    setLoading(true);
    try {
      const res = await api.getBroadcasts(selectedServerId);
      setBroadcasts(res.data);
    } catch (error) {
      message.error('获取广播列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingBroadcast) {
        await api.updateBroadcast(editingBroadcast.id, values);
        message.success('广播已更新');
      } else {
        await api.createBroadcast({ ...values, serverId: selectedServerId });
        message.success('广播已创建');
      }
      setIsModalVisible(false);
      form.resetFields();
      setEditingBroadcast(null);
      fetchBroadcasts();
    } catch (error) {
      message.error('操作失败');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteBroadcast(id);
      message.success('广播已删除');
      fetchBroadcasts();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleToggleEnabled = async (record: api.Broadcast, checked: boolean) => {
    try {
      await api.updateBroadcast(record.id, { enabled: checked });
      message.success(`广播已${checked ? '启用' : '禁用'}`);
      fetchBroadcasts();
    } catch (error) {
      message.error('状态更新失败');
    }
  };

  const columns = [
    {
      title: '内容',
      dataIndex: 'content',
      key: 'content',
      width: '40%',
      className: 'dark:text-gray-200',
      render: (text: string) => <div className="break-all whitespace-pre-wrap">{text}</div>
    },
    {
      title: '间隔 (秒)',
      dataIndex: 'interval',
      key: 'interval',
      render: (val: number) => <Tag color="blue" className="mr-0">{val}s</Tag>
    },
    {
      title: '状态',
      dataIndex: 'enabled',
      key: 'enabled',
      render: (enabled: boolean, record: any) => (
        <Switch 
          checked={enabled} 
          onChange={(checked) => handleToggleEnabled(record, checked)}
          checkedChildren="启用"
          unCheckedChildren="禁用"
        />
      )
    },
    {
      title: '上次运行',
      dataIndex: 'lastRun',
      key: 'lastRun',
      className: 'font-mono text-gray-500 dark:text-gray-400',
      render: (text: string) => text ? new Date(text).toLocaleString() : '-'
    },
    {
      title: '操作',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space>
          <Button 
            icon={<EditOutlined />} 
            onClick={() => {
              setEditingBroadcast(record);
              form.setFieldsValue(record);
              setIsModalVisible(true);
            }} 
            aria-label={`编辑广播 ${record.id}`}
          />
          <Button 
            danger 
            icon={<DeleteOutlined />} 
            onClick={() => handleDelete(record.id)} 
            aria-label={`删除广播 ${record.id}`}
          />
        </Space>
      )
    }
  ];

  return (
    <div className="p-6 space-y-6">
      <Card 
        title={
          <Space className="text-xl font-bold text-white">
            <SoundOutlined />
            <span>自动广播管理</span>
          </Space>
        } 
        className="shadow-sm"
      >
        <div className="mb-6 flex flex-wrap gap-4 items-center bg-[#1f1f1f]/50 border border-[#2d3139] p-4 rounded-lg">
          <Select 
            className="w-48"
            value={selectedServerId} 
            onChange={setSelectedServerId}
            placeholder="选择服务器"
            options={servers.map(s => ({ label: s.name, value: s.id }))}
          />
          <Space>
            <Button icon={<ReloadOutlined />} onClick={fetchBroadcasts}>刷新</Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => {
              setEditingBroadcast(null);
              form.resetFields();
              setIsModalVisible(true);
            }}>添加广播</Button>
          </Space>
        </div>

        <Table 
          columns={columns} 
          dataSource={broadcasts} 
          rowKey="id" 
          loading={loading}
          scroll={{ x: 'max-content' }}
          className="bg-transparent"
        />
      </Card>

      <Modal
        title={editingBroadcast ? "编辑广播" : "添加广播"}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={form.submit}
        className="dark"
      >
        <Form form={form} onFinish={handleSubmit} layout="vertical" initialValues={{ enabled: true, interval: 600 }} className="mt-4">
          <Form.Item name="content" label="广播内容" rules={[{ required: true, message: '请输入广播内容' }]}>
            <TextArea rows={3} placeholder="请输入要在游戏中显示的消息..." />
          </Form.Item>
          <Form.Item name="interval" label="轮播间隔 (秒)" rules={[{ required: true, message: '请输入间隔时间' }]}>
            <InputNumber min={10} className="w-full" placeholder="600" />
          </Form.Item>
          <Form.Item name="enabled" label="状态" valuePropName="checked">
            <Switch checkedChildren="启用" unCheckedChildren="禁用" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default BroadcastManager;
