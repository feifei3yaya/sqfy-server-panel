import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, Select, Button, Input, message, Spin, Space, Modal, Tag, Tooltip } from 'antd';
import { SaveOutlined, FileTextOutlined, ReloadOutlined, HistoryOutlined, UndoOutlined } from '@ant-design/icons';
import * as api from '../api/config';
import * as serverApi from '../api/client';
import { useSearchParams } from 'react-router-dom';
import AdminsCfgEditor from '../components/config/AdminsCfgEditor';
import MapRotationCfgEditor from '../components/config/MapRotationCfgEditor';

const { TextArea } = Input;

const CONFIG_FILES = [
  { label: '服务器配置 (Server.cfg)', value: 'Server.cfg' },
  { label: '管理员列表 (Admins.cfg)', value: 'Admins.cfg' },
  { label: '封禁列表 (Bans.cfg)', value: 'Bans.cfg' },
  { label: '许可证配置 (License.cfg)', value: 'License.cfg' },
  { label: 'RCON 配置 (Rcon.cfg)', value: 'Rcon.cfg' },
  { label: '排除阵营 (ExcludedFactions.cfg)', value: 'ExcludedFactions.cfg' },
  { label: '排除图层 (ExcludedLayer.cfg)', value: 'ExcludedLayer.cfg' },
  { label: '地图循环 (MapRotation.cfg)', value: 'MapRotation.cfg' },
  { label: '远程管理员列表 (RemoteAdminListHosts.cfg)', value: 'RemoteAdminListHosts.cfg' },
  { label: '服务器消息 (ServerMessages.cfg)', value: 'ServerMessages.cfg' },
  { label: '每日消息 (Motd.cfg)', value: 'Motd.cfg' }
];

const ConfigEditor: React.FC = () => {
  const [servers, setServers] = useState<any[]>([]);
  const [selectedServer, setSelectedServer] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<string>('Server.cfg');
  const [content, setContent] = useState<string>('');
  const [originalContent, setOriginalContent] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [backupModalVisible, setBackupModalVisible] = useState(false);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [backups, setBackups] = useState<{ time: string; content: string }[]>([]);
  const [searchParams] = useSearchParams();
  const isDirty = useRef(false);

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

  const markDirty = useCallback(() => {
    isDirty.current = content !== originalContent;
  }, [content, originalContent]);

  useEffect(() => {
    markDirty();
  }, [content, markDirty]);

  const handleBeforeUnload = useCallback((e: BeforeUnloadEvent) => {
    if (isDirty.current) {
      e.preventDefault();
      e.returnValue = '您有未保存的更改，确定要离开吗？';
      return e.returnValue;
    }
  }, []);

  useEffect(() => {
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [handleBeforeUnload]);

  const fetchServers = async () => {
    try {
      const res = await serverApi.default.get('/servers');
      setServers(res.data);
    } catch (error) {
      message.error('获取服务器列表失败');
    }
  };

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const res = await api.getConfig(selectedServer, selectedFile);
      setContent(res.data.content);
      setOriginalContent(res.data.content);
      isDirty.current = false;
    } catch (error: any) {
      setContent('');
      setOriginalContent('');
      isDirty.current = false;
      const errorMessage = error?.response?.data?.error || error?.response?.data?.message || error?.message;
      if (typeof errorMessage === 'string' && errorMessage.includes('not configured')) {
        message.open({ type: 'warning', content: '该服务器未配置文件访问权限', key: 'config-read-error' });
      } else if (typeof errorMessage === 'string' && errorMessage.trim().length > 0) {
        message.open({ type: 'error', content: `读取配置文件失败：${errorMessage}`, key: 'config-read-error' });
      } else {
        message.open({ type: 'error', content: '读取配置文件失败', key: 'config-read-error' });
      }
    } finally {
      setLoading(false);
    }
  };

  const createBackup = useCallback(() => {
    if (!content) return;
    const backup = {
      time: new Date().toLocaleString('zh-CN'),
      content: content
    };
    const newBackups = [backup, ...backups].slice(0, 10);
    setBackups(newBackups);
    message.success('备份已创建');
  }, [content, backups]);

  const restoreBackup = useCallback((backupContent: string) => {
    Modal.confirm({
      title: '确认恢复备份',
      content: '恢复备份将覆盖当前内容，确定要继续吗？',
      okText: '确认恢复',
      cancelText: '取消',
      onOk: () => {
        setContent(backupContent);
        setBackupModalVisible(false);
        message.success('备份已恢复');
      }
    });
  }, []);

  const handleSaveWithBackup = async () => {
    createBackup();
    await handleSave();
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.updateConfig(selectedServer, selectedFile, content);
      setOriginalContent(content);
      isDirty.current = false;
      message.success('配置文件保存成功');
    } catch (error) {
      message.error('保存失败');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveClick = () => {
    if (isDirty.current) {
      setConfirmModalVisible(true);
    } else {
      handleSave();
    }
  };

  const handleFileChange = (newFile: string) => {
    if (isDirty.current) {
      Modal.confirm({
        title: '未保存的更改',
        content: '您有未保存的更改，切换文件将丢失这些更改。确定要继续吗？',
        okText: '继续',
        cancelText: '取消',
        onOk: () => {
          setSelectedFile(newFile);
        }
      });
    } else {
      setSelectedFile(newFile);
    }
  };

  const handleServerChange = (newServer: string) => {
    if (isDirty.current) {
      Modal.confirm({
        title: '未保存的更改',
        content: '您有未保存的更改，切换服务器将丢失这些更改。确定要继续吗？',
        okText: '继续',
        cancelText: '取消',
        onOk: () => {
          setSelectedServer(newServer);
        }
      });
    } else {
      setSelectedServer(newServer);
    }
  };

  return (
    <div className="p-6 h-[calc(100vh-64px)] flex flex-col space-y-4">
      <Card 
        title={
          <Space className="text-xl font-bold text-[var(--text-primary)]">
            <FileTextOutlined className="text-[var(--text-brand)]" />
            <span>配置文件编辑器</span>
            {isDirty.current && (
              <Tag color="orange" className="ml-2 border-0 bg-[var(--text-warning)]/10 text-[var(--text-warning)]">
                有未保存的更改
              </Tag>
            )}
          </Space>
        }
        className="flex-1 flex flex-col shadow-sm bg-[var(--bg-card)] border-[var(--border-color)]"
        styles={{ 
          body: { flex: 1, display: 'flex', flexDirection: 'column', padding: '12px', height: '100%' },
          header: { borderBottom: '1px solid var(--border-color)' }
        }}
      >
        <div className="mb-4 flex flex-wrap gap-4 items-center">
          <Select 
            className="w-48"
            value={selectedServer} 
            onChange={handleServerChange}
            placeholder="选择服务器"
            options={servers.map(s => ({ label: s.name, value: s.id }))}
          />
          <Select 
            className="w-80"
            value={selectedFile} 
            onChange={handleFileChange}
            options={CONFIG_FILES}
            placeholder="选择配置文件"
          />
          <Space>
            <Tooltip title="重新加载">
              <Button 
                icon={<ReloadOutlined />} 
                onClick={fetchConfig}
                loading={loading}
                className="border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-brand)] hover:border-[var(--text-brand)]"
              />
            </Tooltip>
            <Tooltip title="备份当前内容">
              <Button 
                icon={<HistoryOutlined />} 
                onClick={() => setBackupModalVisible(true)}
                className="border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-info)] hover:border-[var(--text-info)]"
                disabled={!content}
              />
            </Tooltip>
            <Tooltip title="撤销更改">
              <Button 
                icon={<UndoOutlined />} 
                onClick={() => {
                  if (isDirty.current) {
                    Modal.confirm({
                      title: '确认撤销',
                      content: '确定要撤销所有更改吗？',
                      okText: '确认撤销',
                      cancelText: '取消',
                      onOk: () => {
                        setContent(originalContent);
                        message.success('已撤销更改');
                      }
                    });
                  }
                }}
                className="border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--text-tertiary)]"
                disabled={!isDirty.current}
              />
            </Tooltip>
            <Button 
              type="primary" 
              icon={<SaveOutlined />} 
              onClick={handleSaveClick}
              loading={saving}
              disabled={!content}
              className="bg-[var(--text-brand)] hover:bg-[var(--text-brand)]/90 border-none"
            >
              保存
            </Button>
          </Space>
        </div>

        <div className="flex-1 relative">
          <Spin spinning={loading} wrapperClassName="h-full">
            {selectedFile === 'Admins.cfg' ? (
              <AdminsCfgEditor content={content} onChange={setContent} />
            ) : selectedFile === 'MapRotation.cfg' ? (
              <MapRotationCfgEditor content={content} onChange={setContent} />
            ) : (
              <TextArea
                value={content}
                onChange={e => setContent(e.target.value)}
                className="font-mono text-sm resize bg-[var(--bg-card-hover)] text-[var(--text-primary)] border-[var(--border-color)] rounded-md p-4 focus:border-[var(--text-brand)] focus:shadow-[0_0_0_2px_rgba(var(--text-brand),0.2)] hover:border-[var(--text-brand)] transition-colors"
                style={{ height: 'calc(100vh - 280px)', minHeight: '600px', width: '100%' }}
                spellCheck={false}
              />
            )}
          </Spin>
        </div>
      </Card>

      <Modal
        title="保存确认"
        open={confirmModalVisible}
        onOk={() => {
          setConfirmModalVisible(false);
          handleSaveWithBackup();
        }}
        onCancel={() => setConfirmModalVisible(false)}
        okText="保存并备份"
        cancelText="取消"
      >
        <p>确定要保存配置文件吗？</p>
        <p className="text-gray-500 text-sm">保存前会自动创建备份。</p>
      </Modal>

      <Modal
        title="备份管理"
        open={backupModalVisible}
        onCancel={() => setBackupModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setBackupModalVisible(false)}>
            关闭
          </Button>
        ]}
        width={600}
      >
        {backups.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <HistoryOutlined className="text-4xl mb-2" />
            <p>暂无备份</p>
            <p className="text-sm">保存文件时会自动创建备份</p>
          </div>
        ) : (
          <div className="space-y-2">
            {backups.map((backup, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                <div>
                  <div className="text-white font-medium">{backup.time}</div>
                  <div className="text-gray-500 text-xs font-mono">
                    {backup.content.length} 字符
                  </div>
                </div>
                <Button 
                  type="primary" 
                  size="small"
                  onClick={() => restoreBackup(backup.content)}
                >
                  恢复
                </Button>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ConfigEditor;
