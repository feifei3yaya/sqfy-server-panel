import React from 'react';
import { Tooltip } from 'antd';
import { MedicineBoxOutlined, AimOutlined, RocketOutlined, ToolOutlined, BugOutlined, SafetyCertificateOutlined } from '@ant-design/icons';

// Map specific Squad role strings to icons/names
// This is a simplified mapping. Real Squad role strings are like "BP_Soldier_US_Medic_C"
const getRoleInfo = (roleString?: string) => {
  if (!roleString) return { icon: <SafetyCertificateOutlined />, label: '步兵', color: 'text-gray-400' };
  
  const lower = roleString.toLowerCase();
  
  if (lower.includes('medic')) return { icon: <MedicineBoxOutlined />, label: '医疗兵', color: 'text-red-400' };
  if (lower.includes('commander')) return { icon: <SafetyCertificateOutlined />, label: '指挥官', color: 'text-yellow-500' };
  if (lower.includes('marksman') || lower.includes('sniper')) return { icon: <AimOutlined />, label: '精确射手', color: 'text-purple-400' };
  if (lower.includes('lat') || lower.includes('hat') || lower.includes('antitank')) return { icon: <RocketOutlined />, label: '反坦克', color: 'text-orange-400' };
  if (lower.includes('engineer') || lower.includes('sapper')) return { icon: <ToolOutlined />, label: '工兵', color: 'text-yellow-400' };
  if (lower.includes('crewman') || lower.includes('pilot')) return { icon: <BugOutlined />, label: '载具组员', color: 'text-blue-400' };
  if (lower.includes('sl') || lower.includes('leader')) return { icon: <SafetyCertificateOutlined />, label: '队长', color: 'text-green-400' };
  
  return { icon: <SafetyCertificateOutlined />, label: '步兵', color: 'text-gray-400' };
};

interface SquadRoleIconProps {
  role?: string;
  isLeader?: boolean;
}

const SquadRoleIcon: React.FC<SquadRoleIconProps> = ({ role, isLeader }) => {
  const info = getRoleInfo(role);
  
  // Override for leader if role doesn't specify (though usually it does)
  if (isLeader && !role?.toLowerCase().includes('leader')) {
      // Keep role icon but maybe add leader indicator? 
      // For now just use role icon
  }

  return (
    <Tooltip title={info.label + (role ? ` (${role})` : '')}>
      <span className={`text-lg ${info.color}`}>
        {info.icon}
      </span>
    </Tooltip>
  );
};

export default SquadRoleIcon;
