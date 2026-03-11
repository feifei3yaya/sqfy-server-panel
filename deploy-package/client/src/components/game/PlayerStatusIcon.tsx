import React from 'react';
import { Tooltip } from 'antd';
import { HeartFilled, FallOutlined } from '@ant-design/icons';

interface PlayerStatusIconProps {
  isAlive: boolean;
  isWounded: boolean;
}

const PlayerStatusIcon: React.FC<PlayerStatusIconProps> = ({ isAlive, isWounded }) => {
  if (isWounded) {
    return (
      <Tooltip title="倒地 (需要救治)">
        <FallOutlined className="text-yellow-500 animate-pulse" />
      </Tooltip>
    );
  }
  
  if (!isAlive) {
    return (
      <Tooltip title="死亡 (等待复活)">
        <span className="text-red-600 font-bold">💀</span>
      </Tooltip>
    );
  }

  return (
    <Tooltip title="存活">
      <HeartFilled className="text-green-500/50" />
    </Tooltip>
  );
};

export default PlayerStatusIcon;
