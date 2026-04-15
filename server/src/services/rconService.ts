// Dynamic import to avoid ES Module issues with squad-rcon
// Load squad-rcon dynamically to handle ES Module compatibility
let SquadRcon: any = null;
try {
  // Use eval to bypass TypeScript compilation and avoid ES Module detection
  const _require = eval('require');
  const rconModule = _require('squad-rcon');
  SquadRcon = rconModule.default || rconModule;
  console.log('Squad RCON module loaded successfully');
} catch (error) {
  console.warn('Failed to load squad-rcon module, RCON functionality will be disabled:', error);
}

import { PrismaClient } from '@prisma/client';
import { Server as SocketIOServer } from 'socket.io';
import logService from './logService';
import pluginService from './pluginService';

const prisma = new PrismaClient();

interface RconConnection {
  instance: any; // SquadRcon type issue
  status: 'connected' | 'disconnected' | 'connecting';
  queue: Array<{
    command: string;
    resolve: (value: string | PromiseLike<string>) => void;
    reject: (reason?: any) => void;
  }>;
  processing: boolean;
}

class RconService {
  private connections: Map<string, RconConnection> = new Map();
  private io: SocketIOServer | null = null;

  constructor() {
    this.initializeConnections();
  }

  public setIO(io: SocketIOServer) {
    this.io = io;
  }

  private async initializeConnections() {
    const servers = await prisma.server.findMany({
      where: { isPublished: true }
    });
    console.log(`Initializing RCON connections for ${servers.length} published servers...`);
    for (const server of servers) {
      await this.connect(server.id);
    }
  }

  async connect(serverId: string) {
    const server = await prisma.server.findUnique({ where: { id: serverId } });
    if (!server) return;

    if (!server.isPublished) {
      console.log(`Skipping RCON connection for unpublished server: ${server.name} (${server.id})`);
      if (this.connections.has(serverId)) {
        await this.disconnect(serverId);
      }
      return;
    }

    if (this.connections.has(serverId)) {
      const conn = this.connections.get(serverId);
      if (conn?.status === 'connected') return;
    }

    let rcon: any;
    try {
      this.notifyStatus(serverId, 'connecting');
      // @ts-ignore
      rcon = new SquadRcon({
        id: 1,
        host: server.host,
        port: server.rconPort,
        password: server.rconPassword,
        autoReconnect: true // Enable auto reconnect for better stability
      });

      this.connections.set(serverId, { 
        instance: rcon, 
        status: 'connecting',
        queue: [],
        processing: false
      });
      
      await rcon.init();
      
      const conn = this.connections.get(serverId);
      if (conn) {
        conn.status = 'connected';
        this.notifyStatus(serverId, 'connected');
      }
      console.log(`RCON connected to server: ${server.name}`);

      // Handle disconnection events
      rcon.on('DISCONNECT', () => {
        console.log(`RCON disconnected from server: ${server.name}`);
        const conn = this.connections.get(serverId);
        if (conn) {
          conn.status = 'disconnected';
          this.notifyStatus(serverId, 'disconnected');
        }
      });

      // Forward chat messages to frontend
      // @ts-ignore
      rcon.on('CHAT_MESSAGE', (data: any) => {
        const message = `[Chat${data.chat}] [${data.steamId}] ${data.name} : ${data.message}`;
        logService.processLog(serverId, message);
        // Emit to plugin system
        pluginService.emit('CHAT_MESSAGE', { serverId, ...data });
      });
    } catch (error) {
      console.error(`Failed to connect RCON for server ${server.name}:`, error);
      if (rcon) {
        // Try to close connection if it was initialized
        try {
          await rcon.close(); // Stop internal reconnect attempts
        } catch (e) {
          // Ignore close errors
        }
      }
      this.connections.delete(serverId);
      this.notifyStatus(serverId, 'disconnected');
    }
  }

  async disconnect(serverId: string) {
    const conn = this.connections.get(serverId);
    if (conn && conn.instance) {
      await conn.instance.close();
      this.connections.delete(serverId);
      this.notifyStatus(serverId, 'disconnected');
    }
  }

  async execute(serverId: string, command: string): Promise<string> {
    const conn = this.connections.get(serverId);
    
    if (!conn || conn.status !== 'connected') {
      // Try to connect if missing
      await this.connect(serverId);
      // Re-fetch connection
      const newConn = this.connections.get(serverId);
      if (!newConn || newConn.status !== 'connected') {
         throw new Error('RCON not connected');
      }
      return this.enqueueCommand(newConn, command);
    }
    
    return this.enqueueCommand(conn, command);
  }

  private enqueueCommand(conn: RconConnection, command: string): Promise<string> {
    return new Promise((resolve, reject) => {
      conn.queue.push({ command, resolve, reject });
      this.processQueue(conn);
    });
  }

  private async processQueue(conn: RconConnection) {
    if (conn.processing || conn.queue.length === 0) return;

    conn.processing = true;
    const { command, resolve, reject } = conn.queue.shift()!;

    try {
      const response = await conn.instance.execute(command);
      resolve(response);
    } catch (error) {
      console.error(`RCON Command Failed: ${command}`, error);
      reject(error);
    } finally {
      conn.processing = false;
      // Process next item
      if (conn.queue.length > 0) {
        this.processQueue(conn);
      }
    }
  }

  async getGameState(serverId: string) {
    try {
      // Squad RCON command: ShowServerInfo
      // Returns JSON string with server info
      console.log(`[RCON] 正在获取服务器 ${serverId} 的游戏状态...`);
      
      const [serverInfoRaw, currentMapRaw, nextMapRaw] = await Promise.all([
        this.execute(serverId, 'ShowServerInfo'),
        this.execute(serverId, 'ShowCurrentMap'),
        this.execute(serverId, 'ShowNextMap')
      ]);
      
      console.log(`[RCON] ShowServerInfo 原始响应:`, serverInfoRaw);
      console.log(`[RCON] ShowCurrentMap 原始响应:`, currentMapRaw);
      console.log(`[RCON] ShowNextMap 原始响应:`, nextMapRaw);
      
      // Parse JSON response
      let info: any = {};
      try {
        info = JSON.parse(serverInfoRaw);
        console.log(`[RCON] ShowServerInfo 解析后:`, info);
      } catch (e) {
        console.error(`[RCON] ShowServerInfo JSON解析失败:`, e);
        // 尝试从非JSON格式提取信息
        info = this.parseServerInfoFromText(serverInfoRaw);
      }
      
      // 解析地图信息
      const mapInfo = this.parseMapInfo(currentMapRaw);
      const nextMapInfo = this.parseMapInfo(nextMapRaw);
      
      // 解析阵营信息
      const factions = this.parseFactions(mapInfo.factions);
      
      // 获取玩家数量 - 尝试多种可能的字段名（Squad RCON 使用 _I 后缀表示整数）
      const playerCount = this.extractNumber(info, ['PlayerCount_I', 'PlayerCount', 'playerCount', 'Players', 'players']);
      const maxPlayers = this.extractNumber(info, ['MaxPlayers', 'maxPlayers', 'MaxPlayerCount', 'maxPlayerCount']);
      
      console.log(`[RCON] 解析结果 - 玩家数: ${playerCount}, 最大玩家数: ${maxPlayers}`);
      
      // 从RCON响应中获取地图名称 - 优先使用MapName_s字段，然后回退到解析的地图信息
      const currentMapFromRcon = info.MapName_s || info.CurrentMap || info.currentMap;
      const nextMapFromRcon = info.NextLayer_s || info.NextMap || info.nextMap;
      
      return {
        serverName: info.ServerName_s || info.ServerName || info.serverName || info.Name || info.name || 'Unknown',
        currentMap: currentMapFromRcon || mapInfo.layerName || mapInfo.mapName,
        currentMapLayer: mapInfo.layerName,
        currentMapName: mapInfo.mapName,
        factions: factions,
        team1Name: info.TeamOne_s || factions.team1 || 'Team 1',
        team2Name: info.TeamTwo_s || factions.team2 || 'Team 2',
        nextMap: nextMapFromRcon || nextMapInfo.layerName || nextMapInfo.mapName,
        nextMapLayer: nextMapInfo.layerName,
        nextMapName: nextMapInfo.mapName,
        playerCount: playerCount,
        maxPlayers: maxPlayers,
        publicQueue: this.extractNumber(info, ['PublicQueue_I', 'PublicQueue', 'publicQueue', 'Queue']),
        reservedQueue: this.extractNumber(info, ['ReservedQueue_I', 'ReservedQueue', 'reservedQueue']),
        matchTimeout: parseFloat(info.MatchTimeout || info.matchTimeout || info.MatchTimeout_d || '0')
      };
    } catch (error: any) {
      // Fallback or specific error handling
      console.warn(`[RCON] 获取游戏状态失败 ${serverId}:`, error);
      return null;
    }
  }

  // 从文本格式解析服务器信息（备用方法）
  private parseServerInfoFromText(raw: string): any {
    const result: any = {};
    // 尝试匹配常见的键值对格式
    const lines = raw.split('\n');
    for (const line of lines) {
      const match = line.match(/^(.+?)\s*:\s*(.+)$/);
      if (match) {
        result[match[1].trim()] = match[2].trim();
      }
    }
    console.log(`[RCON] 从文本解析的服务器信息:`, result);
    return result;
  }

  // 从对象中提取数字，尝试多个字段名
  private extractNumber(obj: any, fieldNames: string[]): number {
    for (const name of fieldNames) {
      const value = obj[name];
      if (value !== undefined && value !== null) {
        const num = parseInt(String(value), 10);
        if (!isNaN(num)) {
          return num;
        }
      }
    }
    return 0;
  }

  private parseMapInfo(raw: string) {
    // 格式：Current level is Jensen's Range, layer is JensensRange_USA-PLA, factions USA PLA
    const mapMatch = raw.match(/level is (.+?),/);
    const layerMatch = raw.match(/layer is (.+?),/);
    const factionsMatch = raw.match(/factions (.+)/);
    
    return {
      mapName: mapMatch ? mapMatch[1].trim() : 'N/A',
      layerName: layerMatch ? layerMatch[1].trim() : 'N/A',
      factions: factionsMatch ? factionsMatch[1].trim() : ''
    };
  }

  private parseFactions(factionsStr: string) {
    // 格式：USA PLA 或 RUS INS 等
    const parts = factionsStr.split(/\s+/);
    return {
      team1: parts[0] || '',
      team2: parts[1] || '',
      raw: factionsStr
    };
  }

  getConnectionStatus(serverId: string) {
    return this.connections.get(serverId)?.status || 'disconnected';
  }

  public broadcastGameState(serverId: string, state: any) {
    this.io?.emit('serverInfoUpdate', { serverId, ...state });
  }

  private notifyStatus(serverId: string, status: string) {
    this.io?.emit('serverStatus', { serverId, status });
  }
}

export default new RconService();
