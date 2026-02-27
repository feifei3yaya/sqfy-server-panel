import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, message, Tag, Space, Typography } from 'antd';
import { ReloadOutlined, PlusOutlined, GiftOutlined } from '@ant-design/icons';
import api from '../api/client';

const { Option } = Select;
const { Text } = Typography;

interface CDK {
  code: string;
  type: string;
  value: number;
  isUsed: boolean;
  usedBy: string | null;
  createdAt: string;
}

const CDKManager: React.FC = () => {
  const [cdks, setCdks] = useState<CDK[]>([]);
  const [loading, setLoading] = useState(false);
  const [isGenerateModalVisible, setIsGenerateModalVisible] = useState(false);
  const [isRedeemModalVisible, setIsRedeemModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [redeemForm] = Form.useForm();

  useEffect(() => {
    fetchCDKs();
  }, []);

  const fetchCDKs = async () => {
    setLoading(true);
    try {
      const response = await api.get('/cdk');
      setCdks(response.data);
    } catch (error) {
      message.error('获取 CDK 列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (values: any) => {
    try {
      await api.post('/cdk/generate', values);
      message.success('CDK 生成成功');
      setIsGenerateModalVisible(false);
      form.resetFields();
      fetchCDKs();
    } catch (error: any) {
      message.error(error.response?.data?.message || '生成 CDK 失败');
    }
  };

  const handleRedeem = async (values: any) => {
    try {
      const response = await api.post('/cdk/redeem', values);
      message.success(`兑换成功: ${response.data.value} ${response.data.type}`);
      setIsRedeemModalVisible(false);
      redeemForm.resetFields();
      fetchCDKs();
    } catch (error: any) {
      message.error(error.response?.data?.message || '兑换失败');
    }
  };

  const columns = [
    {
      title: 'CDK 代码',
      dataIndex: 'code',
      key: 'code',
      className: 'font-mono dark:text-gray-200',
      render: (text: string) => <Text copyable className="dark:text-gray-200">{text}</Text>,
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => <Tag color="blue" className="mr-0">{type.toUpperCase()}</Tag>,
    },
    {
      title: '数值',
      dataIndex: 'value',
      key: 'value',
      className: 'dark:text-gray-200',
    },
    {
      title: '状态',
      key: 'status',
      render: (_: any, record: any) => (
        <Tag color={record.isUsed ? 'red' : 'green'} className="mr-0">
          {record.isUsed ? '已使用' : '未使用'}
        </Tag>
      ),
    },
    {
      title: '使用者',
      dataIndex: 'usedBy',
      key: 'usedBy',
      className: 'dark:text-gray-200',
      render: (text: string) => text || '-',
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      className: 'font-mono text-gray-500 dark:text-gray-400',
      render: (text: string) => new Date(text).toLocaleString(),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-white m-0">CDK 管理</h2>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={fetchCDKs} loading={loading}>
            刷新
          </Button>
          <Button icon={<GiftOutlined />} onClick={() => setIsRedeemModalVisible(true)}>
            测试兑换
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsGenerateModalVisible(true)}>
            生成 CDK
          </Button>
        </Space>
      </div>

      <Card className="shadow-sm" bodyStyle={{ padding: 0 }}>
        <Table 
          columns={columns} 
          dataSource={cdks} 
          rowKey="code" 
          loading={loading}
          scroll={{ x: 'max-content' }}
          className="bg-transparent"
        />
      </Card>

      <Modal
        title="生成 CDK"
        open={isGenerateModalVisible}
        onCancel={() => setIsGenerateModalVisible(false)}
        footer={null}
        className="dark"
      >
        <Form form={form} layout="vertical" onFinish={handleGenerate} className="mt-4">
          <Form.Item name="type" label="类型" initialValue="points">
            <Select>
              <Option value="points">积分</Option>
              <Option value="vip">VIP</Option>
            </Select>
          </Form.Item>
          <Form.Item name="value" label="数值" rules={[{ required: true, message: '请输入数值' }]}>
            <Input type="number" placeholder="100" />
          </Form.Item>
          <Form.Item name="amount" label="数量" initialValue={1}>
            <Input type="number" min={1} max={100} placeholder="1" />
          </Form.Item>
          <Form.Item className="mb-0">
            <Button type="primary" htmlType="submit" block>
              生成
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="兑换 CDK (测试)"
        open={isRedeemModalVisible}
        onCancel={() => setIsRedeemModalVisible(false)}
        footer={null}
        className="dark"
      >
        <Form form={redeemForm} layout="vertical" onFinish={handleRedeem} className="mt-4">
          <Form.Item name="code" label="CDK 代码" rules={[{ required: true, message: '请输入 CDK 代码' }]}>
            <Input placeholder="输入 16 位代码" />
          </Form.Item>
          <Form.Item name="steamId" label="Steam ID (模拟玩家)" rules={[{ required: true, message: '请输入 Steam ID' }]}>
            <Input placeholder="7656119..." />
          </Form.Item>
          <Form.Item className="mb-0">
            <Button type="primary" htmlType="submit" block>
              兑换
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CDKManager;
