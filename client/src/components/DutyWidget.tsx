import React, { useState, useEffect } from 'react';
import { Button, Modal, Select, message, Tag, Space, Popconfirm } from 'antd';
import { ClockCircleOutlined, CheckCircleOutlined, StopOutlined } from '@ant-design/icons';
import * as api from '../api/attendance';
import client from '../api/client';

const { Option } = Select;

const DutyWidget: React.FC = () => {
  const [isOnDuty, setIsOnDuty] = useState(false);
  const [session, setSession] = useState<api.AttendanceSession | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [servers, setServers] = useState<any[]>([]);
  const [selectedServer, setSelectedServer] = useState('');
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState<string>('00:00:00');

  useEffect(() => {
    checkStatus();
    // Update timer every second if on duty
    const interval = setInterval(() => {
      if (isOnDuty && session?.sessionStart) {
        const start = new Date(session.sessionStart).getTime();
        const now = new Date().getTime();
        const diff = now - start;
        
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        setTimer(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [isOnDuty, session]);

  const checkStatus = async () => {
    try {
      const res = await api.getDutyStatus();
      setIsOnDuty(res.data.isOnDuty);
      setSession(res.data.session);
    } catch (error) {
      console.error('Failed to check duty status');
    }
  };

  const fetchServers = async () => {
    try {
      const res = await client.get('/servers');
      setServers(res.data);
      if (res.data.length > 0) setSelectedServer(res.data[0].id);
    } catch (error) {
      message.error('获取服务器列表失败');
    }
  };

  const handleStartDuty = async () => {
    if (!selectedServer) return;
    setLoading(true);
    try {
      await api.startDuty(selectedServer);
      message.success('已开始值班');
      setIsModalVisible(false);
      checkStatus();
    } catch (error) {
      message.error('开始值班失败');
    } finally {
      setLoading(false);
    }
  };

  const handleEndDuty = async () => {
    setLoading(true);
    try {
      await api.endDuty();
      message.success('已结束值班');
      setIsOnDuty(false);
      setSession(null);
    } catch (error) {
      message.error('结束值班失败');
    } finally {
      setLoading(false);
    }
  };

  if (isOnDuty) {
    return (
      <div className="flex items-center bg-[#1f2229] px-3 py-1 rounded-full border border-green-900/50 shadow-sm shadow-green-900/20">
        <Space>
          <div className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </div>
          <span className="text-green-400 font-medium text-sm">值班中</span>
          <span className="text-gray-300 font-mono text-sm">{timer}</span>
          <Popconfirm title="确定结束值班吗？" onConfirm={handleEndDuty} okText="是" cancelText="否">
            <Button type="link" size="small" danger icon={<StopOutlined />} className="text-red-400 hover:text-red-300">下班</Button>
          </Popconfirm>
        </Space>
      </div>
    );
  }

  return (
    <>
      <Button 
        type="primary" 
        ghost 
        icon={<ClockCircleOutlined />} 
        onClick={() => {
          fetchServers();
          setIsModalVisible(true);
        }}
        className="border-[#2d3139] text-gray-300 hover:text-amber-500 hover:border-amber-500 bg-[#15171e]"
      >
        开始值班
      </Button>

      <Modal
        title="选择值班服务器"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={handleStartDuty}
        confirmLoading={loading}
        className="dark"
      >
        <p className="text-gray-300 mb-4">请选择您要进行管理的服务器：</p>
        <Select 
          style={{ width: '100%' }} 
          value={selectedServer} 
          onChange={setSelectedServer}
          options={servers.map(s => ({ label: s.name, value: s.id }))}
          className="w-full"
        />
      </Modal>
    </>
  );
};

export default DutyWidget;
