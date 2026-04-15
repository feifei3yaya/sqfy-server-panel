import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, message, Tag, Space, Checkbox, Card } from 'antd';
import { EditOutlined, DeleteOutlined, KeyOutlined, ReloadOutlined } from '@ant-design/icons';
import api from '../api/client';
import type { User } from '../api/user';
import type { ServerPermission } from '../api/permission';

const PERMISSION_OPTIONS = [
  { label: '服务器控制 (启动/停止)', value: 'control' },
  { label: 'RCON/控制台', value: 'console' },
  { label: '文件管理', value: 'files' },
  { label: '管理员管理', value: 'admins' },
];

const UserList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [servers, setServers] = useState<any[]>([]);
  
  // Edit User Modal
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editForm] = Form.useForm();

  // Permission Modal
  const [isPermissionModalVisible, setIsPermissionModalVisible] = useState(false);
  const [permissionUser, setPermissionUser] = useState<User | null>(null);
  const [userPermissions, setUserPermissions] = useState<ServerPermission[]>([]);
  const [selectedServerId, setSelectedServerId] = useState<string | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [permLoading, setPermLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/users');
      setUsers(res.data);
    } catch (error) {
      message.error('获取用户列表失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchServers = async () => {
    try {
      const res = await api.get('/servers');
      setServers(res.data);
    } catch (error) {
      console.error('Failed to fetch servers', error);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchServers();
  }, []);

  // --- User Management ---

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    editForm.setFieldsValue({
      role: user.role,
      password: '' // Don't fill password
    });
    setIsEditModalVisible(true);
  };

  const handleDeleteUser = async (id: string) => {
    try {
      await api.delete(`/users/${id}`);
      message.success('用户已删除');
      fetchUsers();
    } catch (error: any) {
      message.error(error.response?.data?.message || '删除失败');
    }
  };

  const handleUpdateUser = async (values: any) => {
    if (!editingUser) return;
    try {
      await api.put(`/users/${editingUser.id}`, values);
      message.success('用户更新成功');
      setIsEditModalVisible(false);
      fetchUsers();
    } catch (error) {
      message.error('更新失败');
    }
  };

  // --- Permission Management ---

  const handleOpenPermissions = async (user: User) => {
    setPermissionUser(user);
    setPermLoading(true);
    setIsPermissionModalVisible(true);
    setSelectedServerId(null);
    setSelectedPermissions([]);
    
    try {
      const res = await api.get(`/permissions/${user.id}`);
      setUserPermissions(res.data);
    } catch (error) {
      message.error('获取权限失败');
    } finally {
      setPermLoading(false);
    }
  };

  const handleServerSelect = (serverId: string) => {
    setSelectedServerId(serverId);
    const existingPerm = userPermissions.find(p => p.serverId === serverId);
    if (existingPerm) {
      setSelectedPermissions(existingPerm.permissions);
    } else {
      setSelectedPermissions([]);
    }
  };

  const handleSavePermission = async () => {
    if (!permissionUser || !selectedServerId) return;
    
    try {
      if (selectedPermissions.length === 0) {
        // If no permissions selected, maybe delete?
        // But backend upsert handles empty array as no permissions essentially.
        // Let's call delete if empty? Or just save empty array.
        // Let's save empty array.
      }
      
      const res = await api.post('/permissions', {
        userId: permissionUser.id,
        serverId: selectedServerId,
        permissions: selectedPermissions
      });

      message.success('权限已保存');
      
      // Refresh local permissions
      const updatedPerms = userPermissions.filter(p => p.serverId !== selectedServerId);
      updatedPerms.push(res.data);
      setUserPermissions(updatedPerms);
      
    } catch (error) {
      message.error('保存权限失败');
    }
  };

  const handleRevokePermission = async () => {
    if (!permissionUser || !selectedServerId) return;
    try {
      await api.delete(`/permissions/${permissionUser.id}/${selectedServerId}`);
      message.success('权限已撤销');
      setUserPermissions(prev => prev.filter(p => p.serverId !== selectedServerId));
      setSelectedPermissions([]);
    } catch (error) {
      message.error('撤销失败');
    }
  };

  const columns = [
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
      className: 'text-gray-200 font-medium',
    },
    {
      title: '角色 (面板权限)',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => {
        const color = role === 'superadmin' ? 'gold' : 'blue';
        return <Tag color={color}>{role.toUpperCase()}</Tag>;
      }
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
      className: 'text-gray-400',
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      className: 'text-gray-400',
      render: (text: string) => new Date(text).toLocaleDateString()
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: User) => (
        <Space>
          <Button 
            icon={<EditOutlined />} 
            onClick={() => handleEditUser(record)}
            size="small"
          >
            编辑
          </Button>
          <Button 
            icon={<KeyOutlined />} 
            onClick={() => handleOpenPermissions(record)}
            disabled={record.role === 'superadmin'} // Superadmin has all permissions
            size="small"
            className="text-amber-500 border-amber-500/50 hover:border-amber-500 hover:text-amber-400"
          >
            服务器权限
          </Button>
          <Button 
            danger 
            icon={<DeleteOutlined />} 
            onClick={() => handleDeleteUser(record.id)}
            size="small"
          >
            删除
          </Button>
        </Space>
      )
    }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-white m-0">用户管理</h2>
        <Button icon={<ReloadOutlined />} onClick={fetchUsers}>刷新</Button>
      </div>

      <Card className="shadow-sm border-[#2d3139] bg-[#1f2229]" styles={{ body: { padding: 0 } }}>
        <Table 
          columns={columns} 
          dataSource={users} 
          rowKey="id" 
          loading={loading}
          className="bg-transparent"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* Edit User Modal */}
      <Modal
        title={`编辑用户: ${editingUser?.username}`}
        open={isEditModalVisible}
        onCancel={() => setIsEditModalVisible(false)}
        footer={null}
        className="dark"
      >
        <Form form={editForm} layout="vertical" onFinish={handleUpdateUser}>
          <Form.Item name="role" label="面板角色" rules={[{ required: true }]}>
            <Select
              options={[
                { value: 'user', label: 'User (普通用户)' },
                { value: 'superadmin', label: 'Superadmin (超级管理员)' },
              ]}
            />
          </Form.Item>
          <Form.Item name="password" label="重置密码 (留空不修改)">
            <Input.Password placeholder="新密码" />
          </Form.Item>
          <Button type="primary" htmlType="submit" block>保存更改</Button>
        </Form>
      </Modal>

      {/* Permissions Modal */}
      <Modal
        title={`服务器权限管理: ${permissionUser?.username}`}
        open={isPermissionModalVisible}
        onCancel={() => setIsPermissionModalVisible(false)}
        footer={null}
        width={700}
        className="dark"
        confirmLoading={permLoading}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[400px]">
          {/* Server List */}
          <div className="col-span-1 border-r border-[#2d3139] pr-4 overflow-y-auto">
            <h4 className="text-gray-300 mb-3">选择服务器</h4>
            <div className="space-y-2">
              {servers.map(server => {
                const hasPerm = userPermissions.some(p => p.serverId === server.id);
                return (
                  <div 
                    key={server.id}
                    onClick={() => handleServerSelect(server.id)}
                    className={`p-2 rounded cursor-pointer flex justify-between items-center ${
                      selectedServerId === server.id 
                        ? 'bg-blue-600 text-white' 
                        : 'hover:bg-[#2d3139] text-gray-300'
                    }`}
                  >
                    <span className="truncate">{server.name}</span>
                    {hasPerm && <Tag color="green" className="mr-0 scale-75">已授权</Tag>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Permissions Checkbox */}
          <div className="col-span-2 pl-2">
            {selectedServerId ? (
              <>
                <h4 className="text-gray-300 mb-4">分配权限</h4>
                <Checkbox.Group 
                  options={PERMISSION_OPTIONS} 
                  value={selectedPermissions} 
                  onChange={(vals) => setSelectedPermissions(vals as string[])}
                  className="flex flex-col gap-3"
                />
                
                <div className="mt-8 flex gap-3">
                  <Button type="primary" onClick={handleSavePermission}>
                    保存当前服务器权限
                  </Button>
                  <Button danger onClick={handleRevokePermission}>
                    撤销所有权限
                  </Button>
                </div>
              </>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                请选择左侧服务器以配置权限
              </div>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default UserList;
