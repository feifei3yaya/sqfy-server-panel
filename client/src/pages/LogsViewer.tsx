import React, { useEffect, useState, useRef } from 'react';
import { Select, Button, Input, Space } from 'antd';
import { PauseCircleOutlined, PlayCircleOutlined, ClearOutlined } from '@ant-design/icons';
import api from '../api/client';
import { socket } from '../utils/socket';

const { Option } = Select;

interface Log {
  id: string;
  serverId: string;
  type: string;
  content: string;
  timestamp: string;
}

interface Server {
  id: string;
  name: string;
}

const LogsViewer: React.FC = () => {
  const [servers, setServers] = useState<Server[]>([]);
  const [selectedServerId, setSelectedServerId] = useState<string>('');
  const [logs, setLogs] = useState<Log[]>([]);
  const [paused, setPaused] = useState(false);
  const [filter, setFilter] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchServers();
  }, []);

  useEffect(() => {
    if (selectedServerId) {
      // Join server room
      socket.emit('joinServer', selectedServerId);

      // Listen for logs
      socket.on('log', (log: Log) => {
        if (!paused) {
          setLogs(prev => [...prev, log].slice(-500)); // Keep last 500 logs
        }
      });

      return () => {
        socket.emit('leaveServer', selectedServerId);
        socket.off('log');
        setLogs([]);
      };
    }
  }, [selectedServerId, paused]);

  useEffect(() => {
    if (!paused && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, paused]);

  const fetchServers = async () => {
    try {
      const response = await api.get('/servers');
      setServers(response.data);
      if (response.data.length > 0) {
        setSelectedServerId(response.data[0].id);
      }
    } catch (error) {
      console.error('获取服务器列表失败');
    }
  };

  const getLogColor = (type: string) => {
    switch (type) {
      case 'error': return 'text-red-500';
      case 'warning': return 'text-orange-500';
      case 'chat': return 'text-blue-400';
      case 'kill': return 'text-red-400';
      case 'join': return 'text-green-500';
      case 'leave': return 'text-gray-400';
      default: return 'text-gray-300';
    }
  };

  const filteredLogs = logs.filter(log => 
    log.content.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="p-6 h-[calc(100vh-64px)] flex flex-col space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#1f1f1f]/50 p-4 rounded-lg shadow-sm border border-[#2d3139]">
        <h2 className="text-2xl font-bold text-white m-0">实时日志</h2>
        <Space wrap>
          <Select 
            className="w-48"
            value={selectedServerId} 
            onChange={setSelectedServerId}
            placeholder="选择服务器"
            options={servers.map(server => ({ label: server.name, value: server.id }))}
          />
          <Input 
            placeholder="过滤日志..." 
            value={filter} 
            onChange={e => setFilter(e.target.value)} 
            className="w-48"
            prefix={<Space className="text-gray-400" />}
          />
          <Button 
            icon={paused ? <PlayCircleOutlined /> : <PauseCircleOutlined />} 
            onClick={() => setPaused(!paused)}
            className={paused ? "bg-green-50 text-green-600 border-green-200" : "bg-yellow-50 text-yellow-600 border-yellow-200"}
          >
            {paused ? '继续' : '暂停'}
          </Button>
          <Button icon={<ClearOutlined />} onClick={() => setLogs([])}>
            清空
          </Button>
        </Space>
      </div>

      <div className="flex-1 bg-[#1e1e1e] rounded-lg p-4 overflow-hidden flex flex-col font-mono text-sm shadow-inner border border-gray-800">
        <div className="flex-1 overflow-y-auto custom-scrollbar" ref={scrollRef}>
          {filteredLogs.map((log, index) => (
            <div key={log.id || index} className="mb-1 hover:bg-[#2d2d2d] px-2 py-0.5 rounded transition-colors">
              <span className="text-gray-500 mr-3 select-none">
                [{new Date(log.timestamp).toLocaleTimeString()}]
              </span>
              <span className={`mr-3 font-bold uppercase w-16 inline-block text-center rounded px-1 text-xs ${getLogColor(log.type)} bg-opacity-10 bg-current`}>
                {log.type}
              </span>
              <span className="text-gray-300 break-words whitespace-pre-wrap">
                {log.content}
              </span>
            </div>
          ))}
          {filteredLogs.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-gray-600">
              <div className="text-4xl mb-4">_</div>
              <div>暂无日志数据</div>
              {selectedServerId && <div className="text-xs mt-2">正在监听服务器...</div>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LogsViewer;
