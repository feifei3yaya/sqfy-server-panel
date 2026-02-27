import React, { useState, useEffect } from 'react';
import { Card, Select, Button, Input, message, Spin, Space } from 'antd';
import { SaveOutlined, FileTextOutlined } from '@ant-design/icons';
import * as api from '../api/config';
import * as serverApi from '../api/client';
import { useSearchParams } from 'react-router-dom';

const { Option } = Select;
const { TextArea } = Input;

const CONFIG_FILES = [
  'Server.cfg',
  'Admins.cfg',
  'Bans.cfg',
  'License.cfg',
  'Rcon.cfg',
  'ExcludedFactions.cfg',
  'ExcludedLayer.cfg',
  'MapRotation.cfg'
];

const ConfigEditor: React.FC = () => {
  const [servers, setServers] = useState<any[]>([]);
  const [selectedServer, setSelectedServer] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<string>('Server.cfg');
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    fetchServers();
  }, []);

  useEffect(() => {
    const serverId = searchParams.get('server');
    if (serverId && servers.find(s => s.id === serverId)) {
      setSelectedServer(serverId);
    } else if (servers.length > 0 && !selectedServer) {
      setSelectedServer(servers[0].id);
    }
  }, [servers, searchParams]);

  useEffect(() => {
    if (selectedServer && selectedFile) {
      fetchConfig();
    }
  }, [selectedServer, selectedFile]);

  const fetchServers = async () => {
    try {
      const res = await serverApi.default.get('/servers');
      setServers(res.data);
    } catch (error) {
      message.error('Failed to fetch servers');
    }
  };

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const res = await api.getConfig(selectedServer, selectedFile);
      setContent(res.data.content);
    } catch (error: any) {
      setContent('');
      if (error.response?.status === 400 && error.response?.data?.error?.includes('not configured')) {
         message.warning('该服务器未配置文件访问权限');
      } else {
         message.error('读取配置文件失败');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.updateConfig(selectedServer, selectedFile, content);
      message.success('配置文件保存成功');
    } catch (error) {
      message.error('保存失败');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 h-[calc(100vh-64px)] flex flex-col space-y-4">
      <Card 
        title={
          <Space className="text-xl font-bold text-white">
            <FileTextOutlined />
            <span>配置文件编辑器</span>
          </Space>
        }
        className="flex-1 flex flex-col shadow-sm"
        bodyStyle={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '12px', height: '100%' }}
      >
        <div className="mb-4 flex flex-wrap gap-4 items-center">
          <Select 
            className="w-48"
            value={selectedServer} 
            onChange={setSelectedServer}
            placeholder="选择服务器"
            options={servers.map(s => ({ label: s.name, value: s.id }))}
          />
          <Select 
            className="w-48"
            value={selectedFile} 
            onChange={setSelectedFile}
            options={CONFIG_FILES.map(f => ({ label: f, value: f }))}
          />
          <Button 
            type="primary" 
            icon={<SaveOutlined />} 
            onClick={handleSave}
            loading={saving}
            disabled={!content}
          >
            保存
          </Button>
        </div>

        <div className="flex-1 relative">
          <Spin spinning={loading} wrapperClassName="h-full">
            <TextArea
              value={content}
              onChange={e => setContent(e.target.value)}
              className="font-mono text-sm h-full resize-none bg-[#0b0c10]/50 text-gray-300 border-[#2d3139] rounded-md p-4"
              style={{ height: '100%' }}
              spellCheck={false}
            />
          </Spin>
        </div>
      </Card>
    </div>
  );
};

export default ConfigEditor;
