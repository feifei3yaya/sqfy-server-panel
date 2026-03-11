import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Select, DatePicker, message, Space, Card } from 'antd';
import { SearchOutlined, ReloadOutlined, AimOutlined } from '@ant-design/icons';
import * as api from '../api/gameEvent';
import client from '../api/client';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

const KillLogViewer: React.FC = () => {
  const [logs, setLogs] = useState<api.GameEvent[]>([]);
  const [servers, setServers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
 const [filters, setFilters] = useState({
    serverId: '',
    startDate: '',
    endDate: '',
    page: 1,
    limit: 20
  });
  const [pagination, setPagination] = useState({
    total: 0,
    current: 1,
    pageSize: 20
  });

  useEffect(() => {
    fetchServers();
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [filters]);

  const fetchServers = async () => {
    try {
      const res = await client.get('/servers');
      setServers(res.data);
    } catch (error) {
      message.error('获取服务器列表失败');
    }
  };

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.getGameEvents({
        ...filters,
        type: 'KILL' // GameEvent type is KILL
      });
      setLogs(res.data.data);
      setPagination({
        total: res.data.pagination.total,
        current: res.data.pagination.page,
        pageSize: res.data.pagination.limit
      });
    } catch (error) {
      message.error('获取日志失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setFilters(prev => ({ ...prev, page: 1 }));
  };

  const columns = [
    {
      title: '时间',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 180,
      className: 'font-mono text-gray-500 dark:text-gray-400',
      render: (text: string) => dayjs(text).format('YYYY-MM-DD HH:mm:ss')
    },
    {
      title: '服务器',
      dataIndex: ['server', 'name'],
      key: 'server',
      width: 150,
      className: 'dark:text-gray-200',
    },
    {
      title: '地图',
      dataIndex: ['match', 'map'],
      key: 'map',
      width: 120,
      className: 'dark:text-gray-200',
      render: (text: string) => text || '-',
    },
    {
      title: '攻击者',
      dataIndex: ['data', 'attackerName'],
      key: 'attacker',
      className: 'dark:text-gray-200 font-bold text-red-400',
      render: (text: string) => text || 'Unknown'
    },
    {
      title: '受害者',
      dataIndex: ['data', 'victimName'],
      key: 'victim',
      className: 'dark:text-gray-200 font-bold text-blue-400',
      render: (text: string) => text || 'Unknown'
    },
    {
      title: '武器',
      dataIndex: ['data', 'weapon'],
      key: 'weapon',
      className: 'dark:text-gray-400 font-mono',
      render: (text: string) => text || 'Unknown'
    }
  ];

  return (
    <div className="p-6 space-y-6">
      <Card 
        title={
          <Space className="text-xl font-bold text-white">
            <AimOutlined />
            <span>击杀/击倒记录</span>
          </Space>
        }
        className="shadow-sm"
      >
        <div className="mb-6 flex flex-wrap gap-4 items-center bg-[#1f1f1f]/50 border border-[#2d3139] p-4 rounded-lg">
          <Select
            placeholder="选择服务器"
            className="w-48"
            allowClear
            onChange={val => setFilters(prev => ({ ...prev, serverId: val, page: 1 }))}
            options={servers.map(s => ({ label: s.name, value: s.id }))}
          />
          
          <Input
            placeholder="搜索玩家 (暂不支持)"
            className="w-64"
            disabled
            prefix={<SearchOutlined className="text-gray-400" />}
          />

          <RangePicker 
            showTime 
            onChange={(dates) => {
              setFilters(prev => ({
                ...prev,
                startDate: dates ? dates[0]?.toISOString() || '' : '',
                endDate: dates ? dates[1]?.toISOString() || '' : '',
                page: 1
              }));
            }}
          />

          <div className="flex-grow"></div>

          <Space>
            <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>搜索</Button>
            <Button icon={<ReloadOutlined />} onClick={fetchLogs}>刷新</Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={logs}
          rowKey="id"
          loading={loading}
          pagination={{
            ...pagination,
            onChange: (page, pageSize) => {
              setFilters(prev => ({ ...prev, page, limit: pageSize }));
            },
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条`
          }}
          scroll={{ x: 'max-content' }}
          className="bg-transparent"
        />
      </Card>
    </div>
  );
};

export default KillLogViewer;
