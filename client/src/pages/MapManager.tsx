import React, { useState, useEffect } from 'react';
import { Card, Select, Button, Space, Typography, Tag, message, Popconfirm, Divider } from 'antd';
import { GlobalOutlined, FastForwardOutlined, StopOutlined } from '@ant-design/icons';
import * as api from '../api/map';

const { Option } = Select;
const { Text, Title } = Typography;

// Popular Squad Maps/Layers (Simplified list)
const MAP_LAYERS = [
  'Al Basrah AAS v1', 'Al Basrah Invasion v1', 'Al Basrah RAAS v1',
  'Belaya AAS v1', 'Belaya RAAS v1',
  'Chora AAS v1', 'Chora RAAS v1',
  'Fallujah AAS v1', 'Fallujah Invasion v1', 'Fallujah RAAS v1',
  'Gorodok AAS v1', 'Gorodok RAAS v1',
  'Kamdesh AAS v1', 'Kamdesh RAAS v1',
  'Kohat AAS v1', 'Kohat RAAS v1',
  'Logar Valley AAS v1',
  'Mestia AAS v1',
  'Mutaha AAS v1', 'Mutaha RAAS v1',
  'Narva AAS v1', 'Narva RAAS v1',
  'Skorpo AAS v1', 'Skorpo RAAS v1',
  'Sumari AAS v1',
  'Tallil Outskirts AAS v1', 'Tallil Outskirts RAAS v1',
  'Yehorivka AAS v1', 'Yehorivka RAAS v1'
];

interface MapManagerProps {
  serverId: string;
}

const MapManager: React.FC<MapManagerProps> = ({ serverId }) => {
  const [gameState, setGameState] = useState<api.GameState | null>(null);
  const [selectedMap, setSelectedMap] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchGameState();
    const interval = setInterval(fetchGameState, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, [serverId]);

  const fetchGameState = async () => {
    try {
      const res = await api.getGameState(serverId);
      setGameState(res.data);
    } catch (error) {
      console.error('Failed to fetch game state');
    }
  };

  const handleChangeMap = async () => {
    if (!selectedMap) return;
    setLoading(true);
    try {
      await api.changeMap(serverId, selectedMap);
      message.success(`正在切换地图至: ${selectedMap}`);
      fetchGameState();
    } catch (error) {
      message.error('切换地图失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSetNextMap = async () => {
    if (!selectedMap) return;
    setLoading(true);
    try {
      await api.setNextMap(serverId, selectedMap);
      message.success(`下一张地图已设置为: ${selectedMap}`);
      fetchGameState();
    } catch (error) {
      message.error('设置下一张地图失败');
    } finally {
      setLoading(false);
    }
  };

  const handleEndMatch = async () => {
    setLoading(true);
    try {
      await api.endMatch(serverId);
      message.success('已结束当前对局');
      fetchGameState();
    } catch (error) {
      message.error('结束对局失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-sm">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-[#1f1f1f]/50 p-4 rounded-lg border border-[#2d3139]">
            <Text type="secondary" className="text-gray-400">当前地图</Text>
            <Title level={4} style={{ margin: 0 }} className="text-white">
              {gameState?.currentMap || 'Unknown'}
            </Title>
          </div>
          <div className="bg-[#1f1f1f]/50 p-4 rounded-lg border border-[#2d3139]">
            <Text type="secondary" className="text-gray-400">下一张地图</Text>
            <Title level={4} style={{ margin: 0 }} className="text-white">
              {gameState?.nextMap || 'Unknown'}
            </Title>
          </div>
        </div>

        <div className="flex gap-4 items-center mb-4">
          <Tag color="blue" className="text-sm px-3 py-1 mr-0 border-0 bg-[#1f2229]/50">
            Players: {gameState?.playerCount || 0}/{gameState?.maxPlayers || 0}
          </Tag>
          <Tag color="orange" className="text-sm px-3 py-1 mr-0 border-0 bg-[#1f2229]/50">
            Queue: {gameState?.publicQueue || 0} (+{gameState?.reservedQueue || 0})
          </Tag>
        </div>

        <Divider className="border-[#2d3139]" />

        <div className="space-y-4">
          <Select
            showSearch
            className="w-full"
            placeholder="选择地图层级..."
            optionFilterProp="children"
            onChange={setSelectedMap}
            value={selectedMap}
            filterOption={(input, option) =>
              (option?.children as unknown as string).toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
          >
            {MAP_LAYERS.map(map => (
              <Option key={map} value={map}>{map}</Option>
            ))}
          </Select>

          <Space wrap className="w-full justify-between sm:justify-start">
            <Popconfirm
              title="立即切换地图"
              description="这将立即结束当前游戏并加载新地图，确定吗？"
              onConfirm={handleChangeMap}
              okText="是"
              cancelText="否"
            >
              <Button type="primary" danger icon={<GlobalOutlined />} loading={loading} disabled={!selectedMap}>
                立即换图
              </Button>
            </Popconfirm>

            <Button type="primary" icon={<FastForwardOutlined />} onClick={handleSetNextMap} loading={loading} disabled={!selectedMap}>
              设置下一张
            </Button>

            <Popconfirm
              title="结束当前对局"
              description="确定要强制结束当前对局吗？"
              onConfirm={handleEndMatch}
              okText="是"
              cancelText="否"
            >
              <Button danger icon={<StopOutlined />} loading={loading}>
                结束对局
              </Button>
            </Popconfirm>
          </Space>
        </div>
      </Card>
    </div>
  );
};

export default MapManager;
