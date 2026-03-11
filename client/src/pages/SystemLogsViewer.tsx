import React, { useEffect, useState } from 'react';
import { 
  Table, Card, Statistic, Row, Col, Button, Input, Select, 
  DatePicker, Tag, Tabs, Modal, Form, Switch, Space, message
} from 'antd';
import { 
  SearchOutlined, ReloadOutlined, 
  DownloadOutlined, PauseCircleOutlined, PlayCircleOutlined,
  DeleteOutlined, PlusOutlined, EditOutlined
} from '@ant-design/icons';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import dayjs from 'dayjs';
import { socket } from '../utils/socket';
import { 
  getSystemLogs, getSystemLogStats, getLogConfig, updateLogConfig 
} from '../api/systemLogs';
import type { SystemLog, LogSourceConfig } from '../api/systemLogs';

const { RangePicker } = DatePicker;
const { Option } = Select;

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const SystemLogsViewer: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [filters, setFilters] = useState<any>({});
  const [stats, setStats] = useState<any>(null);
  const [configs, setConfigs] = useState<LogSourceConfig[]>([]);
  const [isConfigModalVisible, setIsConfigModalVisible] = useState(false);
  const [editingConfig, setEditingConfig] = useState<LogSourceConfig | null>(null);
  const [realtime, setRealtime] = useState(false);
  const [form] = Form.useForm();

  // Load initial data
  useEffect(() => {
    if (activeTab === 'dashboard') {
      fetchStats();
    } else if (activeTab === 'logs') {
      fetchLogs();
    } else if (activeTab === 'config') {
      fetchConfigs();
    }
  }, [activeTab]);

  // Real-time updates
  useEffect(() => {
    if (realtime && activeTab === 'logs') {
      const handleLog = (log: any) => {
        // Only append if matches current simple filters (optional)
        setLogs(prev => [log, ...prev].slice(0, 500));
      };
      socket.on('systemLog', handleLog);
      return () => {
        socket.off('systemLog', handleLog);
      };
    }
  }, [realtime, activeTab]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await getSystemLogs({ 
        page, 
        limit: pageSize, 
        ...filters,
        startTime: filters.dateRange?.[0]?.toISOString(),
        endTime: filters.dateRange?.[1]?.toISOString()
      });
      setLogs(res.data.data);
      setTotal(res.data.meta.total);
    } catch (err) {
      message.error('获取日志失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await getSystemLogStats({});
      setStats(res.data);
    } catch (err) {
      message.error('获取统计失败');
    }
  };

  const fetchConfigs = async () => {
    try {
      const res = await getLogConfig();
      setConfigs(res.data);
    } catch (err) {
      message.error('获取配置失败');
    }
  };

  const handleSaveConfig = async (values: any) => {
    try {
      let newConfigs = [...configs];
      if (editingConfig) {
        newConfigs = newConfigs.map(c => c.id === editingConfig.id ? { ...values, id: c.id } : c);
      } else {
        newConfigs.push({ ...values, id: Date.now().toString() });
      }
      await updateLogConfig(newConfigs);
      message.success('配置已保存');
      setIsConfigModalVisible(false);
      fetchConfigs();
    } catch (err) {
      message.error('保存失败');
    }
  };

  const handleDeleteConfig = async (id: string) => {
    try {
      const newConfigs = configs.filter(c => c.id !== id);
      await updateLogConfig(newConfigs);
      message.success('配置已删除');
      fetchConfigs();
    } catch (err) {
      message.error('删除失败');
    }
  };

  const columns = [
    {
      title: '时间',
      dataIndex: 'timestamp',
      width: 180,
      render: (text: string) => dayjs(text).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: '级别',
      dataIndex: 'level',
      width: 100,
      render: (level: string) => {
        const colors: any = { info: 'blue', warn: 'orange', error: 'red', debug: 'gray' };
        return <Tag color={colors[level] || 'default'}>{level.toUpperCase()}</Tag>;
      }
    },
    {
      title: '分类',
      dataIndex: 'category',
      width: 120,
    },
    {
      title: '来源',
      dataIndex: 'source',
      width: 150,
      ellipsis: true,
    },
    {
      title: '消息',
      dataIndex: 'message',
      ellipsis: true,
    },
  ];

  const renderDashboard = () => (
    <div className="space-y-6">
      <Row gutter={16}>
        <Col span={8}>
          <Card>
            <Statistic title="今日日志总数" value={stats?.trend?.reduce((a: any, b: any) => a + b.count, 0) || 0} />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic title="错误数量" value={stats?.byLevel?.find((l: any) => l.level === 'error')?._count._all || 0} valueStyle={{ color: '#cf1322' }} />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic title="警告数量" value={stats?.byLevel?.find((l: any) => l.level === 'warn')?._count._all || 0} valueStyle={{ color: '#faad14' }} />
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={16}>
          <Card title="日志趋势 (最近24小时)">
            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats?.trend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" tickFormatter={(t) => dayjs(t).format('HH:mm')} />
                  <YAxis />
                  <RechartsTooltip labelFormatter={(t) => dayjs(t).format('YYYY-MM-DD HH:mm')} />
                  <Legend />
                  <Line type="monotone" dataKey="count" stroke="#8884d8" name="日志量" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
        <Col span={8}>
          <Card title="级别分布">
            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats?.byLevel}
                    dataKey="_count._all"
                    nameKey="level"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {stats?.byLevel?.map((_: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );

  const renderLogs = () => (
    <Card 
      title="日志查询" 
      extra={
        <Space>
          <Button 
            type={realtime ? 'primary' : 'default'}
            danger={realtime}
            icon={realtime ? <PauseCircleOutlined /> : <PlayCircleOutlined />} 
            onClick={() => setRealtime(!realtime)}
          >
            {realtime ? '暂停实时' : '实时监控'}
          </Button>
          <Button icon={<ReloadOutlined />} onClick={fetchLogs}>刷新</Button>
          <Button icon={<DownloadOutlined />}>导出</Button>
        </Space>
      }
    >
      <Form layout="inline" className="mb-4">
        <Form.Item name="search">
          <Input 
            prefix={<SearchOutlined />} 
            placeholder="搜索关键字..." 
            onPressEnter={(e: any) => {
              setFilters({ ...filters, search: e.target.value });
              setPage(1);
            }} 
          />
        </Form.Item>
        <Form.Item name="level">
          <Select 
            placeholder="级别" 
            allowClear 
            style={{ width: 100 }}
            onChange={(v) => {
              setFilters({ ...filters, level: v });
              setPage(1);
            }}
          >
            <Option value="info">INFO</Option>
            <Option value="warn">WARN</Option>
            <Option value="error">ERROR</Option>
            <Option value="debug">DEBUG</Option>
          </Select>
        </Form.Item>
        <Form.Item name="dateRange">
          <RangePicker 
            showTime 
            onChange={(dates) => {
              setFilters({ ...filters, dateRange: dates });
              setPage(1);
            }} 
          />
        </Form.Item>
        <Form.Item>
          <Button type="primary" onClick={fetchLogs}>查询</Button>
        </Form.Item>
      </Form>
      
      <Table 
        columns={columns} 
        dataSource={logs} 
        rowKey="id"
        loading={loading}
        pagination={{
          current: page,
          pageSize,
          total,
          onChange: (p, s) => {
            setPage(p);
            setPageSize(s);
          }
        }}
        expandable={{
          expandedRowRender: (record) => (
            <pre className="bg-gray-800 p-2 rounded text-xs text-gray-300 overflow-x-auto">
              {JSON.stringify(JSON.parse(record.metadata || '{}'), null, 2)}
            </pre>
          )
        }}
      />
    </Card>
  );

  const renderConfig = () => (
    <Card 
      title="日志源配置" 
      extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => {
        setEditingConfig(null);
        form.resetFields();
        setIsConfigModalVisible(true);
      }}>添加日志源</Button>}
    >
      <Table 
        dataSource={configs} 
        rowKey="id"
        columns={[
          { title: '路径', dataIndex: 'path' },
          { title: '类型', dataIndex: 'parserType' },
          { title: '分类', dataIndex: 'category' },
          { 
            title: '状态', 
            dataIndex: 'enabled',
            render: (enabled) => <Tag color={enabled ? 'green' : 'red'}>{enabled ? '启用' : '禁用'}</Tag>
          },
          {
            title: '操作',
            render: (_, record) => (
              <Space>
                <Button icon={<EditOutlined />} onClick={() => {
                  setEditingConfig(record);
                  form.setFieldsValue(record);
                  setIsConfigModalVisible(true);
                }} />
                <Button danger icon={<DeleteOutlined />} onClick={() => handleDeleteConfig(record.id)} />
              </Space>
            )
          }
        ]} 
      />

      <Modal
        title={editingConfig ? '编辑配置' : '添加配置'}
        open={isConfigModalVisible}
        onCancel={() => setIsConfigModalVisible(false)}
        onOk={form.submit}
      >
        <Form form={form} layout="vertical" onFinish={handleSaveConfig}>
          <Form.Item name="path" label="日志文件路径" rules={[{ required: true }]}>
            <Input placeholder="D:\logs\app.log" />
          </Form.Item>
          <Form.Item name="parserType" label="解析器类型" rules={[{ required: true }]}>
            <Select onChange={() => form.setFieldsValue({ parserConfig: {} })}>
              <Option value="json">JSON</Option>
              <Option value="common">Nginx/Apache Common</Option>
              <Option value="syslog">Syslog</Option>
              <Option value="regex">Regex (自定义)</Option>
            </Select>
          </Form.Item>
          <Form.Item
            noStyle
            shouldUpdate={(prev, current) => prev.parserType !== current.parserType}
          >
            {({ getFieldValue }) => 
              getFieldValue('parserType') === 'regex' ? (
                <Form.Item 
                  name={['parserConfig', 'regex']} 
                  label="正则表达式" 
                  rules={[{ required: true, message: '请输入正则表达式' }]}
                  help="请使用命名捕获组，如 (?<message>.*)"
                >
                  <Input placeholder="(?<timestamp>...)..." />
                </Form.Item>
              ) : null
            }
          </Form.Item>
          <Form.Item name="category" label="分类" rules={[{ required: true }]}>
            <Input placeholder="application" />
          </Form.Item>
          <Form.Item name="enabled" label="启用" valuePropName="checked" initialValue={true}>
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );

  return (
    <div className="p-6">
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          { key: 'dashboard', label: '仪表盘', children: renderDashboard() },
          { key: 'logs', label: '日志查询', children: renderLogs() },
          { key: 'config', label: '配置管理', children: renderConfig() },
        ]}
      />
    </div>
  );
};

export default SystemLogsViewer;
