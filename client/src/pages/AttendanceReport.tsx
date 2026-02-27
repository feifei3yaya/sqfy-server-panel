import React, { useState, useEffect } from 'react';
import { Table, DatePicker, Button, Card, Space, Tag, Statistic, Row, Col } from 'antd';
import { SearchOutlined, ReloadOutlined, UserOutlined } from '@ant-design/icons';
import * as api from '../api/attendance';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

const AttendanceReport: React.FC = () => {
  const [sessions, setSessions] = useState<api.AttendanceSession[]>([]);
  const [summary, setSummary] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);

  useEffect(() => {
    fetchStats();
  }, [dateRange]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (dateRange) {
        params.startDate = dateRange[0].toISOString();
        params.endDate = dateRange[1].toISOString();
      }
      const res = await api.getDutyStats(params);
      setSessions(res.data.sessions);
      setSummary(res.data.summary);
    } catch (error) {
      console.error('Failed to fetch attendance stats');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: '管理员',
      dataIndex: ['admin', 'username'],
      key: 'admin',
      className: 'dark:text-gray-200',
      render: (text: string) => <Tag icon={<UserOutlined />} color="blue" className="mr-0">{text}</Tag>
    },
    {
      title: '服务器',
      dataIndex: ['server', 'name'],
      key: 'server',
      className: 'dark:text-gray-200',
    },
    {
      title: '开始时间',
      dataIndex: 'sessionStart',
      key: 'sessionStart',
      className: 'font-mono text-gray-500 dark:text-gray-400',
      render: (text: string) => dayjs(text).format('YYYY-MM-DD HH:mm:ss')
    },
    {
      title: '结束时间',
      dataIndex: 'sessionEnd',
      key: 'sessionEnd',
      className: 'font-mono text-gray-500 dark:text-gray-400',
      render: (text: string) => text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : <Tag color="green" className="mr-0">进行中</Tag>
    },
    {
      title: '时长 (分钟)',
      dataIndex: 'duration',
      key: 'duration',
      render: (text: number) => text ? <Tag color="cyan" className="mr-0">{text} min</Tag> : '-'
    }
  ];

  return (
    <div className="p-6 space-y-6">
      <Card 
        title={<span className="text-xl font-bold text-white">管理员考勤报表</span>}
        className="shadow-sm"
      >
        <div className="mb-6 flex flex-wrap gap-4 items-center bg-[#1f1f1f]/50 border border-[#2d3139] p-4 rounded-lg">
          <RangePicker 
            showTime 
            onChange={(dates) => setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs])} 
            className="w-full md:w-auto"
          />
          <Space>
            <Button type="primary" icon={<SearchOutlined />} onClick={fetchStats}>查询</Button>
            <Button icon={<ReloadOutlined />} onClick={fetchStats}>刷新</Button>
          </Space>
        </div>

        {Object.keys(summary).length > 0 && (
          <Row gutter={[16, 16]} className="mb-6">
            {Object.entries(summary).map(([name, duration]) => (
              <Col xs={24} sm={12} md={8} lg={6} key={name}>
                <Card className="shadow-sm border border-[#2d3139] bg-[#1f1f1f]/30">
                  <Statistic
                    title={<span className="text-gray-400">{name}</span>}
                    value={duration}
                    suffix={<span className="text-sm text-gray-500">分钟</span>}
                    valueStyle={{ color: '#eab308', fontWeight: 600 }}
                    prefix={<UserOutlined className="text-blue-500" />}
                  />
                </Card>
              </Col>
            ))}
          </Row>
        )}

        <Table 
          columns={columns} 
          dataSource={sessions} 
          rowKey="id" 
          loading={loading}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 'max-content' }}
          className="bg-transparent"
        />
      </Card>
    </div>
  );
};

export default AttendanceReport;
