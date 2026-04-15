import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, Tabs, message, Space, Card, Tag } from 'antd';
import { CopyOutlined, DeleteOutlined, EditOutlined, PlusOutlined, UserAddOutlined, TeamOutlined, CloudSyncOutlined } from '@ant-design/icons';
import * as api from '../api/squadAdmin';
import client from '../api/client';

const { TextArea } = Input;

const SquadAdminManager: React.FC = () => {
  const [groups, setGroups] = useState<api.SquadGroup[]>([]);
  const [admins, setAdmins] = useState<api.SquadAdmin[]>([]);
  const [config, setConfig] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [servers, setServers] = useState<any[]>([]);
  const [syncServerId, setSyncServerId] = useState<string | null>(null);
  
  // Modals
  const [isGroupModalVisible, setIsGroupModalVisible] = useState(false);
  const [isAdminModalVisible, setIsAdminModalVisible] = useState(false);
  const [editingGroup, setEditingGroup] = useState<api.SquadGroup | null>(null);
  
  const [groupForm] = Form.useForm();
  const [adminForm] = Form.useForm();

  // Load Data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [groupsRes, adminsRes] = await Promise.all([
        api.getGroups(),
        api.getAdmins()
      ]);
      setGroups(groupsRes.data);
      setAdmins(adminsRes.data);
    } catch (error) {
      message.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const fetchConfig = async () => {
    try {
      const res = await api.generateConfig();
      setConfig(res.data.config);
    } catch (error) {
      message.error('Failed to generate config');
    }
  };

  const fetchServers = async () => {
    try {
      const res = await client.get('/servers');
      setServers(res.data);
    } catch (error) {
      console.error('Failed to fetch servers');
    }
  };

  useEffect(() => {
    fetchData();
    fetchServers();
  }, []);

  const handleSync = async () => {
    if (!syncServerId) {
      message.error('Please select a server');
      return;
    }
    setLoading(true);
    try {
      await api.syncConfig(syncServerId);
      message.success('Config synced successfully!');
    } catch (error: any) {
      message.error('Sync failed: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  // Group Handlers
  const handleGroupSubmit = async (values: any) => {
    try {
      if (editingGroup) {
        await api.updateGroup(editingGroup.id, values);
        message.success('权限组已更新');
      } else {
        await api.createGroup(values);
        message.success('权限组已创建');
      }
      setIsGroupModalVisible(false);
      groupForm.resetFields();
      setEditingGroup(null);
      fetchData();
    } catch (error) {
      message.error('操作失败');
    }
  };

  const handleDeleteGroup = async (id: string) => {
    try {
      await api.deleteGroup(id);
      message.success('权限组已删除');
      fetchData();
    } catch (error) {
      message.error('删除权限组失败');
    }
  };

  // Admin Handlers
  const handleAdminSubmit = async (values: any) => {
    try {
      await api.addAdmin(values);
      message.success('管理员已添加');
      setIsAdminModalVisible(false);
      adminForm.resetFields();
      fetchData();
    } catch (error) {
      message.error('添加管理员失败');
    }
  };

  const handleDeleteAdmin = async (id: string) => {
    try {
      await api.deleteAdmin(id);
      message.success('管理员已删除');
      fetchData();
    } catch (error) {
      message.error('删除管理员失败');
    }
  };

  // Columns
  const groupColumns = [
    { title: '组名称', dataIndex: 'name', key: 'name', className: 'dark:text-gray-200 font-medium' },
    { 
      title: '权限', 
      dataIndex: 'permissions', 
      key: 'permissions',
      render: (perms: string) => (
        <Space wrap>
          {perms.split(',').map(p => (
            <Tag key={p} color="blue" className="mr-0">{p.trim()}</Tag>
          ))}
        </Space>
      )
    },
    { 
      title: '成员数', 
      dataIndex: '_count', 
      key: 'count',
      className: 'dark:text-gray-200',
      render: (count: any) => count?.admins || 0 
    },
    {
      title: '操作',
      key: 'actions',
      render: (_: any, record: api.SquadGroup) => (
        <Space>
          <Button 
            icon={<EditOutlined />} 
            onClick={() => {
              setEditingGroup(record);
              groupForm.setFieldsValue(record);
              setIsGroupModalVisible(true);
            }} 
            aria-label={`编辑 ${record.name}`}
          />
          <Button 
            danger 
            icon={<DeleteOutlined />} 
            onClick={() => handleDeleteGroup(record.id)} 
            aria-label={`删除 ${record.name}`}
          />
        </Space>
      )
    }
  ];

  const adminColumns = [
    { title: 'Steam ID', dataIndex: 'steamId', key: 'steamId', className: 'font-mono dark:text-gray-400' },
    { title: '名称', dataIndex: 'name', key: 'name', className: 'dark:text-gray-200' },
    { 
      title: '所属组', 
      dataIndex: 'group', 
      key: 'group',
      render: (group: any) => <Tag color="green">{group?.name}</Tag>
    },
    {
      title: '操作',
      key: 'actions',
      render: (_: any, record: api.SquadAdmin) => (
        <Button 
          danger 
          icon={<DeleteOutlined />} 
          onClick={() => handleDeleteAdmin(record.id)} 
          aria-label={`删除管理员 ${record.name}`}
        />
      )
    }
  ];

  const items = [
    {
      key: '1',
      label: <span className="flex items-center space-x-2"><UserAddOutlined /><span>管理员列表</span></span>,
      children: (
        <div className="space-y-4">
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={() => setIsAdminModalVisible(true)}
          >
            添加管理员
          </Button>
          <Table 
            columns={adminColumns} 
            dataSource={admins} 
            rowKey="id" 
            loading={loading} 
            scroll={{ x: 'max-content' }}
            className="dark:bg-transparent"
            pagination={{ pageSize: 10 }}
          />
        </div>
      )
    },
    {
      key: '2',
      label: <span className="flex items-center space-x-2"><TeamOutlined /><span>权限组</span></span>,
      children: (
        <div className="space-y-4">
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={() => {
              setEditingGroup(null);
              groupForm.resetFields();
              setIsGroupModalVisible(true);
            }}
          >
            添加权限组
          </Button>
          <Table 
            columns={groupColumns} 
            dataSource={groups} 
            rowKey="id" 
            loading={loading} 
            scroll={{ x: 'max-content' }}
            className="dark:bg-transparent"
            pagination={{ pageSize: 10 }}
          />
        </div>
      )
    },
    {
      key: '3',
      label: <span className="flex items-center space-x-2"><CopyOutlined /><span>配置预览</span></span>,
      children: (
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-4 bg-[#1f1f1f]/50 border border-[#2d3139] rounded-lg">
            <span className="text-gray-300">复制下方内容或直接同步到服务器。</span>
            <Space wrap>
              <Select 
                style={{ width: 200 }} 
                placeholder="选择要同步的服务器"
                onChange={setSyncServerId}
                value={syncServerId}
                options={servers.map(s => ({ label: s.name, value: s.id }))}
              />
              <Button 
                type="primary" 
                icon={<CloudSyncOutlined />} 
                onClick={handleSync}
                loading={loading}
                disabled={!syncServerId}
              >
                同步到服务器
              </Button>
              <Button icon={<CopyOutlined />} onClick={() => {
                navigator.clipboard.writeText(config);
                message.success('已复制到剪贴板');
              }}>复制配置</Button>
            </Space>
          </div>
          <TextArea 
            rows={12} 
            value={config} 
            readOnly 
            className="font-mono bg-[#0b0c10]/50 text-gray-300 border-[#2d3139] resize-y" 
            style={{ minHeight: '300px' }}
          />
        </div>
      )
    }
  ];

  return (
    <div className="p-6 space-y-6">
      <Card 
        title={<span className="text-xl font-bold text-white">Squad 权限管理</span>} 
        extra={<Button onClick={fetchData} icon={<CloudSyncOutlined />}>刷新</Button>}
        className="shadow-sm"
      >
        <Tabs 
          defaultActiveKey="1" 
          onChange={(key) => {
            if (key === '3') fetchConfig();
          }} 
          items={items} 
          className="text-gray-200"
        />
      </Card>

      {/* Group Modal */}
      <Modal
        title={editingGroup ? "编辑权限组" : "创建权限组"}
        open={isGroupModalVisible}
        onCancel={() => setIsGroupModalVisible(false)}
        onOk={groupForm.submit}
        className="dark"
      >
        <Form form={groupForm} onFinish={handleGroupSubmit} layout="vertical" className="mt-4">
          <Form.Item name="name" label="组名称" rules={[{ required: true, message: '请输入组名称' }]}>
            <Input placeholder="例如: SuperAdmin" />
          </Form.Item>
          <Form.Item name="permissions" label="权限 (逗号分隔)" rules={[{ required: true, message: '请输入权限' }]}>
            <TextArea placeholder="kick,ban,changemap,cheat" rows={4} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Admin Modal */}
      <Modal
        title="添加管理员"
        open={isAdminModalVisible}
        onCancel={() => setIsAdminModalVisible(false)}
        onOk={adminForm.submit}
        className="dark"
      >
        <Form form={adminForm} onFinish={handleAdminSubmit} layout="vertical" className="mt-4">
          <Form.Item name="steamId" label="Steam ID" rules={[{ required: true, message: '请输入 Steam ID' }]}>
            <Input placeholder="76561198..." />
          </Form.Item>
          <Form.Item name="name" label="名称 (可选)">
            <Input placeholder="管理员名称" />
          </Form.Item>
          <Form.Item name="groupId" label="权限组" rules={[{ required: true, message: '请选择权限组' }]}>
            <Select
              placeholder="选择权限组"
              options={groups.map((g) => ({ value: g.id, label: g.name }))}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SquadAdminManager;
