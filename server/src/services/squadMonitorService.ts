/**
 * Squad 游戏服务器状态监控服务
 * 实时监控 Squad 游戏服务器的各类状态信息
 */

import { PrismaClient } from '@prisma/client';
import { Rcon as SquadRcon } from 'squad-rcon';
import rconService from './rconService';

const prisma = new PrismaClient();

// 数据结构定义
export interface SquadServerStats {
  // 服务器基本信息
  serverId: string;
  serverName: string;
  host: string;
  rconPort: number;
  
  // 游戏状态
  gameState: GameState;
  
  // 玩家信息
  players: PlayerInfo[];
  playerCount: number;
  maxPlayers: number;
  publicQueue: number;
  reservedQueue: number;
  
  // 地图信息
  currentMap: MapInfo;
  nextMap?: MapInfo;
  
  // 队伍信息
  teams: TeamInfo[];
  
  // 服务器性能
  performance: ServerPerformance;
  
  // RCON 状态
  rconStatus: 'connected' | 'disconnected' | 'connecting';
  
  // 时间戳
  timestamp: Date;
}

export interface GameState {
  matchStarted: boolean;
  matchEnded: boolean;
  winner?: string;
  ticketCount?: {
    team1: number;
    team2: number;
  };
  gamePhase?: string;
}

export interface PlayerInfo {
  id: string;
  steamId: string;
  eosId?: string;
  name: string;
  teamId?: string;
  squadId?: string;
  isLeader: boolean;
  role: string;
  isAlive: boolean;
  isWounded: boolean;
  kills: number;
  deaths: number;
  ping?: number;
  playTime: number;
}

export interface MapInfo {
  name: string;           // 地图名称 (e.g., "Jensen's Range")
  layer: string;          // 图层名称 (e.g., "JensensRange_USA-PLA")
  factions: string[];     // 阵营 (e.g., ["USA", "PLA"])
  mode?: string;          // 游戏模式 (e.g., "RAAS", "AAS")
}

export interface TeamInfo {
  id: string;
  name: string;
  faction: string;
  tickets: number;
  ticketsLost: number;
  ticketsCurrent: number;
  score: number;
  playerCount: number;
  squads: SquadInfo[];
}

export interface SquadInfo {
  id: string;
  name: string;
  leaderName?: string;
  playerCount: number;
  maxPlayers: number;
}

export interface ServerPerformance {
  fps?: number;           // 服务器帧率
  avgPing?: number;       // 平均延迟
  tickRate?: number;      // 刷新率
  memoryUsage?: number;   // 内存使用 (MB)
  cpuUsage?: number;      // CPU 使用率
}

// 缓存配置
const CACHE_TTL = 1000; // 1 秒缓存
const cache = new Map<string, { data: any; timestamp: number }>();

class SquadMonitorService {
  /**
   * 获取 Squad 服务器完整状态信息
   */
  async getSquadServerStats(serverId: string): Promise<SquadServerStats | null> {
    const cacheKey = `squad_server_${serverId}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return cached as SquadServerStats;
    }

    try {
      // 获取服务器配置
      const server = await prisma.server.findUnique({
        where: { id: serverId }
      });

      if (!server) {
        return null;
      }

      // 检查 RCON 连接状态
      const rconStatus = rconService.getConnectionStatus(serverId);
      
      if (rconStatus !== 'connected') {
        // RCON 未连接，返回基本信息
        const basicStats = this.getBasicServerStats(server);
        this.setToCache(cacheKey, basicStats);
        return basicStats;
      }

      // 并行获取所有实时数据
      const [
        serverInfoRaw,
        currentMapRaw,
        nextMapRaw,
        playersRaw
      ] = await Promise.all([
        rconService.execute(serverId, 'ShowServerInfo'),
        rconService.execute(serverId, 'ShowCurrentMap'),
        rconService.execute(serverId, 'ShowNextMap'),
        rconService.execute(serverId, 'ListPlayers')
      ]);

      // 解析服务器信息
      const serverInfo = JSON.parse(serverInfoRaw);
      
      // 解析地图信息
      const currentMap = this.parseMapInfo(currentMapRaw);
      const nextMap = this.parseMapInfo(nextMapRaw);
      
      // 解析玩家列表
      const players = this.parsePlayers(playersRaw);
      
      // 解析队伍信息
      const teams = this.parseTeams(players, serverInfo);
      
      // 计算性能指标
      const performance = this.calculatePerformance(players, serverInfo);

      const stats: SquadServerStats = {
        serverId: server.id,
        serverName: server.name,
        host: server.host,
        rconPort: server.rconPort,
        
        gameState: {
          matchStarted: true,
          matchEnded: false,
          ticketCount: {
            team1: 500, // 默认值，实际需要从日志获取
            team2: 500
          }
        },
        
        players,
        playerCount: parseInt(serverInfo.PlayerCount) || 0,
        maxPlayers: parseInt(serverInfo.MaxPlayers) || 100,
        publicQueue: parseInt(serverInfo.PublicQueue) || 0,
        reservedQueue: parseInt(serverInfo.ReservedQueue) || 0,
        
        currentMap,
        nextMap,
        
        teams,
        
        performance,
        
        rconStatus,
        
        timestamp: new Date()
      };

      this.setToCache(cacheKey, stats);
      return stats;
      
    } catch (error: any) {
      console.error(`获取 Squad 服务器 ${serverId} 状态失败:`, error);
      
      // 返回基本信息
      const server = await prisma.server.findUnique({
        where: { id: serverId }
      });
      
      if (server) {
        return this.getBasicServerStats(server);
      }
      
      return null;
    }
  }

  /**
   * 获取所有 Squad 服务器的状态
   */
  async getAllSquadServersStats(): Promise<SquadServerStats[]> {
    const servers = await prisma.server.findMany({
      where: { isPublished: true }
    });

    const statsPromises = servers.map(server => 
      this.getSquadServerStats(server.id)
    );

    const results = await Promise.all(statsPromises);
    return results.filter((stats): stats is SquadServerStats => stats !== null);
  }

  /**
   * 获取玩家详情
   */
  async getPlayerStats(serverId: string, steamId: string): Promise<PlayerInfo | null> {
    const serverStats = await this.getSquadServerStats(serverId);
    if (!serverStats) {
      return null;
    }

    return serverStats.players.find(p => p.steamId === steamId) || null;
  }

  /**
   * 获取队伍详情
   */
  async getTeamStats(serverId: string, teamId: string): Promise<TeamInfo | null> {
    const serverStats = await this.getSquadServerStats(serverId);
    if (!serverStats) {
      return null;
    }

    return serverStats.teams.find(t => t.id === teamId) || null;
  }

  /**
   * 获取小队详情
   */
  async getSquadStats(serverId: string, teamId: string, squadId: string): Promise<SquadInfo | null> {
    const teamStats = await this.getTeamStats(serverId, teamId);
    if (!teamStats) {
      return null;
    }

    return teamStats.squads.find(s => s.id === squadId) || null;
  }

  // ========== 辅助方法 ==========

  private parseMapInfo(raw: string): MapInfo {
    // 格式：Current level is Jensen's Range, layer is JensensRange_USA-PLA, factions USA PLA
    const mapMatch = raw.match(/level is (.+?),/);
    const layerMatch = raw.match(/layer is (.+?),/);
    const factionsMatch = raw.match(/factions (.+)/);
    
    const layerName = layerMatch ? layerMatch[1].trim() : '';
    const factions = factionsMatch ? factionsMatch[1].trim().split(/\s+/) : [];
    
    // 从图层名称推断模式
    let mode: string | undefined;
    if (layerName.includes('RAAS')) mode = 'RAAS';
    else if (layerName.includes('AAS')) mode = 'AAS';
    else if (layerName.includes('Invasion')) mode = 'Invasion';
    else if (layerName.includes('Skirmish')) mode = 'Skirmish';
    else if (layerName.includes('TC')) mode = 'TC';

    return {
      name: mapMatch ? mapMatch[1].trim() : 'Unknown',
      layer: layerName,
      factions,
      mode
    };
  }

  private parsePlayers(raw: string): PlayerInfo[] {
    const lines = raw.split('\n');
    const players: PlayerInfo[] = [];

    for (const line of lines) {
      // 新格式：ID: 0 | Online IDs: EOS: ... steam: 7656... | Name: ... | Team ID: 2 | Squad ID: N/A | Is Leader: False | Role: ...
      const match = line.match(/ID: (\d+) \| Online IDs: EOS: ([\w\d]+) steam: (\d+) \| Name: (.+?) \| Team ID: (\d+) \| Squad ID: ([\w\d/]+|N\/A) \| Is Leader: (True|False) \| Role: ([\w_]+)/);
      
      if (match) {
        players.push({
          id: match[1],
          steamId: match[3],
          eosId: match[2],
          name: match[4].trim(),
          teamId: match[5],
          squadId: match[6] === 'N/A' ? undefined : match[6],
          isLeader: match[7] === 'True',
          role: match[8],
          isAlive: true,
          isWounded: false,
          kills: 0,
          deaths: 0,
          playTime: 0
        });
      }
    }

    return players;
  }

  private parseTeams(players: PlayerInfo[], serverInfo: any): TeamInfo[] {
    const teams: TeamInfo[] = [];
    
    // 按队伍分组玩家
    const teamMap = new Map<string, PlayerInfo[]>();
    for (const player of players) {
      if (player.teamId) {
        const teamPlayers = teamMap.get(player.teamId) || [];
        teamPlayers.push(player);
        teamMap.set(player.teamId, teamPlayers);
      }
    }

    // 创建队伍信息
    for (const [teamId, teamPlayers] of teamMap.entries()) {
      const faction = this.getFactionFromTeamId(teamId);
      
      teams.push({
        id: teamId,
        name: `Team ${teamId}`,
        faction,
        tickets: 500, // 默认值
        ticketsLost: 0,
        ticketsCurrent: 500,
        score: 0,
        playerCount: teamPlayers.length,
        squads: this.parseSquads(teamPlayers)
      });
    }

    return teams;
  }

  private parseSquads(players: PlayerInfo[]): SquadInfo[] {
    const squadMap = new Map<string, PlayerInfo[]>();
    
    for (const player of players) {
      if (player.squadId) {
        const squadPlayers = squadMap.get(player.squadId) || [];
        squadPlayers.push(player);
        squadMap.set(player.squadId, squadPlayers);
      }
    }

    const squads: SquadInfo[] = [];
    for (const [squadId, squadPlayers] of squadMap.entries()) {
      const leader = squadPlayers.find(p => p.isLeader);
      
      squads.push({
        id: squadId,
        name: `Squad ${squadId}`,
        leaderName: leader?.name,
        playerCount: squadPlayers.length,
        maxPlayers: 9 // Squad 默认小队最大人数
      });
    }

    return squads;
  }

  private getFactionFromTeamId(teamId: string): string {
    // 根据队伍 ID 推断阵营（需要从地图信息中获取准确信息）
    // 这里返回默认值
    return teamId === '1' ? 'USA' : 'PLA';
  }

  private calculatePerformance(players: PlayerInfo[], serverInfo: any): ServerPerformance {
    // 计算平均延迟（如果有的话）
    const avgPing = players.length > 0 
      ? Math.round(players.reduce((sum, p) => sum + (p.ping || 0), 0) / players.length)
      : 0;

    return {
      avgPing: avgPing || undefined
    };
  }

  private getBasicServerStats(server: any): SquadServerStats {
    return {
      serverId: server.id,
      serverName: server.name,
      host: server.host,
      rconPort: server.rconPort,
      
      gameState: {
        matchStarted: false,
        matchEnded: false
      },
      
      players: [],
      playerCount: 0,
      maxPlayers: 100,
      publicQueue: 0,
      reservedQueue: 0,
      
      currentMap: {
        name: 'Unknown',
        layer: 'Unknown',
        factions: []
      },
      
      teams: [],
      
      performance: {},
      
      rconStatus: rconService.getConnectionStatus(server.id),
      
      timestamp: new Date()
    };
  }

  // ========== 缓存方法 ==========

  private getFromCache(key: string): any {
    const cached = cache.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }
    cache.delete(key);
    return null;
  }

  private setToCache(key: string, data: any): void {
    cache.set(key, { data, timestamp: Date.now() });
  }
}

export default new SquadMonitorService();
