import React, { useState, useEffect } from 'react';
import { Button, Modal, Form, Input, message, Card, Space, Tag, List } from 'antd';
import { TeamOutlined, PlusOutlined, UserOutlined, LoginOutlined } from '@ant-design/icons';
import * as api from '../api/team';

const TeamList: React.FC = () => {
  const [teams, setTeams] = useState<api.Team[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    setLoading(true);
    try {
      const res = await api.getTeams();
      setTeams(res.data);
    } catch (error) {
      message.error('获取战队列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (values: any) => {
    try {
      await api.createTeam(values);
      message.success('战队创建成功');
      setIsModalVisible(false);
      form.resetFields();
      fetchTeams();
    } catch (error: any) {
      message.error(error.response?.data?.error || '创建失败');
    }
  };

  const handleJoin = async (id: string) => {
    try {
      await api.joinTeam(id);
      message.success('已申请加入战队');
      fetchTeams();
    } catch (error: any) {
      message.error(error.response?.data?.error || '加入失败');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold dark:text-white m-0">
          <Space>
            <TeamOutlined />
            <span>战队系统</span>
          </Space>
        </h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalVisible(true)}>
          创建战队
        </Button>
      </div>

      <List
        grid={{ gutter: 16, xs: 1, sm: 1, md: 2, lg: 3, xl: 3, xxl: 4 }}
        dataSource={teams}
        loading={loading}
        renderItem={team => (
          <List.Item>
            <Card 
              className="shadow-sm hover:shadow-md transition-shadow"
              title={
                <Space className="text-gray-200">
                  <Tag color="gold" className="mr-0 border-0 bg-[#1f2229]/50">[{team.tag}]</Tag>
                  <span className="font-bold">{team.name}</span>
                </Space>
              } 
              actions={[
                <Button 
                  type="text" 
                  icon={<LoginOutlined />} 
                  className="text-amber-500 hover:text-amber-400"
                  onClick={() => handleJoin(team.id)}
                  aria-label={`加入 ${team.name}`}
                >
                  加入
                </Button>
              ]}
            >
              <p className="text-gray-400 min-h-[48px] line-clamp-2">
                {team.description || '暂无简介'}
              </p>
              <div className="mt-4 pt-4 border-t border-[#2d3139]/50">
                <Space className="w-full justify-between">
                  <Space className="text-gray-400">
                    <UserOutlined />
                    <span>成员: {team._count?.members || 0}</span>
                  </Space>
                  <Tag color="blue" className="mr-0 border-0 bg-[#1f2229]/50">
                    队长: {team.members?.find(m => m.role === 'owner')?.user.username}
                  </Tag>
                </Space>
              </div>
            </Card>
          </List.Item>
        )}
      />

      <Modal
        title="创建战队"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        className="dark"
      >
        <Form form={form} layout="vertical" onFinish={handleCreate} className="mt-4">
          <Form.Item name="name" label="战队名称" rules={[{ required: true }]}>
            <Input placeholder="请输入战队名称" />
          </Form.Item>
          <Form.Item name="tag" label="战队标签 (Tag)" rules={[{ required: true, max: 4 }]}>
            <Input placeholder="例如: 81" />
          </Form.Item>
          <Form.Item name="description" label="简介">
            <Input.TextArea placeholder="请输入战队简介" rows={4} />
          </Form.Item>
          <Form.Item className="mb-0">
            <Button type="primary" htmlType="submit" block>
              创建
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TeamList;
