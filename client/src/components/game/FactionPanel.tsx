import React from 'react';
import { Card, Space, Button, Dropdown } from 'antd';
import { TeamOutlined, DownOutlined } from '@ant-design/icons';
import SquadCard from './SquadCard';
import SquadRoleIcon from './SquadRoleIcon';
import PlayerStatusIcon from './PlayerStatusIcon';

// Define Player interface locally or import from types
interface Player {
  id: string;
  steamId: string;
  name: string;
  teamId: string;
  squadId: string;
  isLeader?: boolean;
  isAlive?: boolean;
  isWounded?: boolean;
  role?: string;
  kills?: number;
  deaths?: number;
  playTime?: string;
}

interface FactionPanelProps {
  teamId: string;
  teamName: string;
  teamColor: string;
  players: Player[];
  onDisbandSquad: (teamId: string, squadId: string) => void;
  getActionItems: (player: Player) => any;
}

const FactionPanel: React.FC<FactionPanelProps> = ({ 
  teamId, 
  teamName, 
  teamColor, 
  players, 
  onDisbandSquad, 
  getActionItems 
}) => {
  const squads: Record<string, Player[]> = {};
  const unassigned: Player[] = [];
  
  players.forEach(p => {
    const sid = p.squadId;
    if (sid && sid !== 'N/A') {
      if (!squads[sid]) squads[sid] = [];
      squads[sid].push(p);
    } else {
      unassigned.push(p);
    }
  });
  
  const squadIds = Object.keys(squads).sort((a, b) => Number(a) - Number(b));

  return (
    <Card 
      className="h-full panel-shell"
      style={{ 
        borderTop: `3px solid ${teamColor}`,
      }}
      styles={{ body: { padding: '16px' } }}
    >
      <div className="flex items-center justify-between mb-4 pb-4 border-b panel-subtle-divider">
        <Space>
          <div className="p-2 rounded" style={{ backgroundColor: `${teamColor}20` }}>
            <TeamOutlined style={{ color: teamColor, fontSize: '20px' }} />
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider panel-muted">阵营</div>
            <div className="font-bold text-lg leading-none panel-title">{teamName}</div>
          </div>
        </Space>
        <div className="text-right">
          <div className="text-2xl font-bold leading-none panel-title">{players.length}</div>
          <div className="text-xs panel-muted">总人数</div>
        </div>
      </div>

      {squadIds.length === 0 && unassigned.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg panel-muted panel-subtle-divider">
          <TeamOutlined className="text-3xl mb-2 opacity-50" />
          <div>暂无活跃玩家</div>
        </div>
      ) : (
        <div className="space-y-4">
          {squadIds.map(squadId => (
            <SquadCard 
              key={squadId}
              squadId={squadId}
              teamId={teamId}
              players={squads[squadId]}
              onDisband={onDisbandSquad}
              getActionItems={getActionItems}
              getTeamColor={() => teamColor}
            />
          ))}

          {unassigned.length > 0 && (
            <Card 
              className="shadow-none border panel-subtle-divider bg-transparent"
              size="small"
              title={<span className="text-xs font-bold uppercase panel-muted">未入队人员 ({unassigned.length})</span>}
              styles={{ header: { borderBottom: '1px solid var(--table-divider)', minHeight: '36px' }, body: { padding: 0 } }}
            >
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <tbody>
                    {unassigned.map((player) => (
                      <tr key={player.steamId} className="border-b transition-colors group panel-subtle-divider panel-table-row">
                        <td className="py-2 px-3 w-10">
                          <PlayerStatusIcon isAlive={player.isAlive !== false} isWounded={player.isWounded || false} />
                        </td>
                        <td className="py-2 px-3 w-10">
                          <SquadRoleIcon role={player.role} />
                        </td>
                        <td className="py-2 px-3">
                          <div className="font-medium panel-title">{player.name}</div>
                          <div className="text-[10px] font-mono mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity panel-muted">
                            {player.steamId}
                          </div>
                        </td>
                        <td className="py-2 px-3 font-mono text-xs">
                          <span className="text-emerald-500/70">{player.kills || 0}</span>
                          <span className="mx-1 panel-muted">/</span>
                          <span className="text-red-500/70">{player.deaths || 0}</span>
                        </td>
                        <td className="py-2 px-3 text-right w-10">
                          <Dropdown menu={{ items: getActionItems(player) }} placement="bottomRight" trigger={['click']}>
                            <Button 
                              size="small"
                              type="text"
                              className="h-6 w-6 p-0 panel-muted"
                            >
                              <DownOutlined style={{ fontSize: '10px' }} />
                            </Button>
                          </Dropdown>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      )}
    </Card>
  );
};

export default FactionPanel;
