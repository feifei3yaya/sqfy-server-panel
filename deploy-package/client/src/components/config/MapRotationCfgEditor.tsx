import React, { useState, useEffect } from 'react';
import { Card, List, Button, Input, Space, Typography, Tooltip } from 'antd';
import { PlusOutlined, DeleteOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';

interface MapRotationCfgEditorProps {
  content: string;
  onChange: (newContent: string) => void;
}

// Common Squad Layers (This list should be expanded or fetched from API)
const COMMON_LAYERS = [
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

const MapRotationCfgEditor: React.FC<MapRotationCfgEditorProps> = ({ content, onChange }) => {
  const [layers, setLayers] = useState<string[]>([]);
  const [newLayer, setNewLayer] = useState('');

  useEffect(() => {
    // Parse content: simple line split, remove comments/empty
    const lines = content.split('\n')
      .map(l => l.trim())
      .filter(l => l && !l.startsWith('//') && !l.startsWith('#'));
    setLayers(lines);
  }, [content]);

  const updateContent = (newLayers: string[]) => {
    onChange(newLayers.join('\n'));
  };

  const handleAdd = () => {
    if (!newLayer) return;
    const updated = [...layers, newLayer];
    setLayers(updated);
    updateContent(updated);
    setNewLayer('');
  };

  const handleRemove = (index: number) => {
    const updated = [...layers];
    updated.splice(index, 1);
    setLayers(updated);
    updateContent(updated);
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === layers.length - 1) return;

    const updated = [...layers];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [updated[index], updated[targetIndex]] = [updated[targetIndex], updated[index]];
    
    setLayers(updated);
    updateContent(updated);
  };

  return (
    <Card title="Map Rotation List" size="small" className="bg-[#1f1f1f] border-gray-800">
      <div className="mb-4 flex gap-2">
        <Input 
          placeholder="Enter Layer Name (e.g. Gorodok_RAAS_v1)" 
          value={newLayer}
          onChange={e => setNewLayer(e.target.value)}
          onPressEnter={handleAdd}
          className="bg-black/20 text-white border-gray-700"
          list="layer-suggestions"
        />
        <datalist id="layer-suggestions">
          {COMMON_LAYERS.map(l => <option key={l} value={l.replace(/ /g, '_')} />)}
        </datalist>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>Add</Button>
      </div>

      <div className="max-h-[600px] overflow-y-auto custom-scrollbar border border-gray-800 rounded bg-black/20">
        <List
          dataSource={layers}
          renderItem={(item, index) => (
            <List.Item className="!px-4 !py-2 hover:bg-white/5 transition-colors group">
              <div className="flex items-center justify-between w-full">
                <Space>
                  <Typography.Text className="text-gray-500 font-mono w-6">{index + 1}.</Typography.Text>
                  <Typography.Text className="text-gray-200">{item}</Typography.Text>
                </Space>
                <Space className="opacity-50 group-hover:opacity-100 transition-opacity">
                  <Tooltip title="Move Up">
                    <Button 
                      size="small" 
                      type="text" 
                      icon={<ArrowUpOutlined />} 
                      disabled={index === 0}
                      onClick={() => handleMove(index, 'up')}
                      className="text-gray-400 hover:text-white"
                    />
                  </Tooltip>
                  <Tooltip title="Move Down">
                    <Button 
                      size="small" 
                      type="text" 
                      icon={<ArrowDownOutlined />} 
                      disabled={index === layers.length - 1}
                      onClick={() => handleMove(index, 'down')}
                      className="text-gray-400 hover:text-white"
                    />
                  </Tooltip>
                  <Tooltip title="Remove">
                    <Button 
                      size="small" 
                      type="text" 
                      danger 
                      icon={<DeleteOutlined />} 
                      onClick={() => handleRemove(index)}
                    />
                  </Tooltip>
                </Space>
              </div>
            </List.Item>
          )}
        />
      </div>
    </Card>
  );
};

export default MapRotationCfgEditor;
