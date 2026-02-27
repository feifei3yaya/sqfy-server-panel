import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Select, DatePicker, message, Space, Card, Tag } from 'antd';
import { SearchOutlined, ReloadOutlined, CommentOutlined } from '@ant-design/icons';
import * as api from '../api/log';
import client from '../api/client';
import dayjs from 'dayjs';

const { Option } = Select;
const { RangePicker } = DatePicker;

const ChatLogViewer: React.FC = () => {
  const [logs, setLogs] = useState<api.Log[]>([]);
  const [servers, setServers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    serverId: '',
    search: '',
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
      const res = await api.getLogs({
        ...filters,
        type: 'chat' // Force chat type
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
      title: '内容',
      dataIndex: 'content',
      key: 'content',
      className: 'dark:text-gray-200',
      render: (text: string) => {
        // Try to highlight player name if formatted like [ChatSquad] [SteamID] Name : Msg
        // Standard format from rconService: [ChatSquad] [SteamID] Name : Msg
        const match = text.match(/^\[(Chat.*?)\] \[(.*?)\] (.*?) : (.*)$/);
        if (match) {
          return (
            <span>
              <Tag color="blue" className="mr-2">{match[1]}</Tag>
              <span className="text-gray-500 dark:text-gray-400 text-xs mr-2 font-mono">[{match[2]}]</span>
              <span className="font-bold text-blue-600 dark:text-blue-400 mr-2">{match[3]}:</span>
              <span className="text-gray-800 dark:text-gray-200">{match[4]}</span>
            </span>
          );
        }
        return <span className="text-gray-800 dark:text-gray-200">{text}</span>;
      }
    }
  ];

  return (
    <div className="p-6 space-y-6">
      <Card 
        title={
          <Space className="text-xl font-bold text-white">
            <CommentOutlined />
            <span>聊天记录查询</span>
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
            placeholder="搜索玩家或消息..."
            className="w-64"
            value={filters.search}
            onChange={e => setFilters(prev => ({ ...prev, search: e.target.value }))}
            onPressEnter={handleSearch}
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

export default ChatLogViewer;
