import React, { useState, useEffect, useRef } from 'react';
import { Input, Button } from 'antd';
import api from '../api/client';

interface RconTerminalProps {
  serverId: string;
}

const RconTerminal: React.FC<RconTerminalProps> = ({ serverId }) => {
  const [history, setHistory] = useState<string[]>([]);
  const [command, setCommand] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  const executeCommand = async () => {
    if (!command.trim()) return;
    
    setLoading(true);
    const cmd = command;
    setCommand('');
    setHistory(prev => [...prev, `> ${cmd}`]);

    try {
      const res = await api.post(`/servers/${serverId}/execute`, { command: cmd });
      setHistory(prev => [...prev, res.data.response]);
    } catch (error: any) {
      setHistory(prev => [...prev, `Error: ${error.response?.data?.message || error.message}`]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#0b0c10]/90 text-green-400 p-4 rounded-lg font-mono h-[60vh] min-h-[300px] flex flex-col shadow-inner border border-[#2d3139]">
      <div className="flex-1 overflow-y-auto mb-4 whitespace-pre-wrap custom-scrollbar" ref={scrollRef}>
        {history.map((line, i) => (
          <div key={i} className="break-all hover:bg-[#1f2229]/50 px-1">{line}</div>
        ))}
        {history.length === 0 && <div className="text-gray-600 italic">输入 /help 获取帮助...</div>}
      </div>
      <div className="flex gap-2">
        <Input 
          className="bg-[#15171e]/80 text-white border-[#2d3139] hover:border-amber-500 focus:border-amber-500 font-mono"
          value={command}
          onChange={e => setCommand(e.target.value)}
          onPressEnter={executeCommand}
          placeholder="输入 RCON 命令..."
          disabled={loading}
          autoFocus
        />
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
