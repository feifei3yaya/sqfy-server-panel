import React, { useState, useEffect, useRef } from 'react';
import { Input, Button, AutoComplete, Select } from 'antd';
import api from '../api/client';

interface RconTerminalProps {
  serverId?: string;
}

const KNOWN_COMMANDS = [
  { value: 'AdminBroadcast', label: 'AdminBroadcast <Message>' },
  { value: 'AdminKick', label: 'AdminKick <NameOrSteamId> <Reason>' },
  { value: 'AdminBan', label: 'AdminBan <NameOrSteamId> <Duration> <Reason>' },
  { value: 'AdminChangeMap', label: 'AdminChangeMap <MapName>' },
  { value: 'AdminSetNextMap', label: 'AdminSetNextMap <MapName>' },
  { value: 'AdminEndMatch', label: 'AdminEndMatch' },
  { value: 'AdminRestartMatch', label: 'AdminRestartMatch' },
  { value: 'AdminForceTeamChange', label: 'AdminForceTeamChange <NameOrSteamId>' },
  { value: 'AdminDemoteCommander', label: 'AdminDemoteCommander <NameOrSteamId>' },
  { value: 'AdminDisbandSquad', label: 'AdminDisbandSquad <TeamId> <SquadId>' },
  { value: 'AdminRemovePlayerFromSquad', label: 'AdminRemovePlayerFromSquad <NameOrSteamId>' },
  { value: 'AdminWarn', label: 'AdminWarn <NameOrSteamId> <Message>' },
  { value: 'ListPlayers', label: 'ListPlayers' },
  { value: 'ShowServerInfo', label: 'ShowServerInfo' },
  { value: 'ShowNextMap', label: 'ShowNextMap' },
];

const RconTerminal: React.FC<RconTerminalProps> = ({ serverId: propServerId }) => {
  const [serverId, setServerId] = useState<string>(propServerId || '');
  const [servers, setServers] = useState<any[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const [command, setCommand] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Command History
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!propServerId) {
      fetchServers();
    }
  }, [propServerId]);

  const fetchServers = async () => {
    try {
      const res = await api.get('/servers');
      setServers(res.data);
      if (res.data.length > 0 && !serverId) {
        setServerId(res.data[0].id);
      }
    } catch (error) {
      // Ignore
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const executeCommand = async () => {
    if (!command.trim()) return;
    
    setLoading(true);
    const cmd = command;
    setCommand('');
    setLogs(prev => [...prev, `> ${cmd}`]);
    
    // Add to history
    setCmdHistory(prev => [cmd, ...prev]);
    setHistoryIndex(-1);

    try {
      const res = await api.post(`/servers/${serverId}/execute`, { command: cmd });
      setLogs(prev => [...prev, res.data.response]);
    } catch (error: any) {
      setLogs(prev => [...prev, `Error: ${error.response?.data?.message || error.message}`]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIndex < cmdHistory.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setCommand(cmdHistory[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setCommand(cmdHistory[newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setCommand('');
      }
    }
  };

  return (
    <div className="bg-[#0b0c10]/90 text-green-400 p-4 rounded-lg font-mono h-[60vh] min-h-[300px] flex flex-col shadow-inner border border-[#2d3139]">
      {!propServerId && (
        <div className="mb-4">
          <Select 
            className="w-full md:w-64"
            value={serverId} 
            onChange={setServerId}
            placeholder="选择服务器"
            options={servers.map(s => ({ label: s.name, value: s.id }))}
            dropdownStyle={{ backgroundColor: '#1f1f1f', color: 'white' }}
          />
        </div>
      )}
      <div className="flex-1 overflow-y-auto mb-4 whitespace-pre-wrap custom-scrollbar" ref={scrollRef}>
        {logs.map((line, i) => (
          <div key={i} className="break-all hover:bg-[#1f2229]/50 px-1">{line}</div>
        ))}
        {logs.length === 0 && <div className="text-gray-600 italic">输入 /help 获取帮助... (Try 'ListPlayers')</div>}
      </div>
      <div className="flex gap-2">
        <div className="flex-1">
          <AutoComplete
            options={KNOWN_COMMANDS}
            value={command}
            onChange={setCommand}
            filterOption={(inputValue, option) =>
              option!.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
            }
            className="w-full"
          >
            <Input 
              className="bg-[#15171e]/80 text-white border-[#2d3139] hover:border-amber-500 focus:border-amber-500 font-mono"
              onPressEnter={executeCommand}
              onKeyDown={handleKeyDown}
              placeholder="输入 RCON 命令..."
              disabled={loading}
              autoFocus
            />
          </AutoComplete>
        </div>
        <Button 
          type="primary" 
          onClick={executeCommand} 
          loading={loading}
          className="bg-green-600 hover:bg-green-500 border-green-600"
        >
          发送
        </Button>
      </div>
    </div>
  );
};

export default RconTerminal;
