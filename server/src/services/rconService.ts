import SquadRcon from 'squad-rcon';
import { PrismaClient } from '@prisma/client';
import { Server as SocketIOServer } from 'socket.io';
import logService from './logService';
import pluginService from './pluginService';

const prisma = new PrismaClient();

interface RconConnection {
  instance: any; // SquadRcon type issue
  status: 'connected' | 'disconnected' | 'connecting';
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
    const servers = await prisma.server.findMany();
    for (const server of servers) {
      await this.connect(server.id);
    }
  }

  async connect(serverId: string) {
    const server = await prisma.server.findUnique({ where: { id: serverId } });
    if (!server) return;

    if (this.connections.has(serverId)) {
      const conn = this.connections.get(serverId);
      if (conn?.status === 'connected') return;
    }

    try {
      this.notifyStatus(serverId, 'connecting');
      // @ts-ignore
      const rcon = new SquadRcon({
        host: server.host,
        port: server.rconPort,
        password: server.rconPassword
      });

      this.connections.set(serverId, { instance: rcon, status: 'connecting' });
      
      await rcon.connect();
      
      this.connections.set(serverId, { instance: rcon, status: 'connected' });
      this.notifyStatus(serverId, 'connected');
      console.log(`RCON connected to server: ${server.name}`);

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
      this.connections.delete(serverId);
      this.notifyStatus(serverId, 'disconnected');
    }
  }

  async disconnect(serverId: string) {
    const conn = this.connections.get(serverId);
    if (conn && conn.instance) {
      await conn.instance.disconnect();
      this.connections.delete(serverId);
      this.notifyStatus(serverId, 'disconnected');
    }
  }

  async execute(serverId: string, command: string): Promise<string> {
    const conn = this.connections.get(serverId);
    
    if (!conn || conn.status !== 'connected') {
      await this.connect(serverId);
      const newConn = this.connections.get(serverId);
      if (!newConn || newConn.status !== 'connected') {
         throw new Error('RCON not connected');
      }
      return await newConn.instance.execute(command);
    }
    
    return await conn.instance.execute(command);
  }

  async getGameState(serverId: string) {
    try {
      // Squad RCON command: ShowServerInfo
      // Returns JSON string with server info
      const response = await this.execute(serverId, 'ShowServerInfo');
      const info = JSON.parse(response);
      return {
        serverName: info.ServerName,
        currentMap: info.CurrentMap,
        nextMap: info.NextMap,
        playerCount: parseInt(info.PlayerCount),
        maxPlayers: parseInt(info.MaxPlayers),
        publicQueue: parseInt(info.PublicQueue),
        reservedQueue: parseInt(info.ReservedQueue),
        matchTimeout: parseFloat(info.MatchTimeout)
      };
    } catch (error) {
      // Fallback or specific error handling
      console.warn(`Failed to get game state for ${serverId}:`, error);
      return null;
    }
  }

  getConnectionStatus(serverId: string) {
    return this.connections.get(serverId)?.status || 'disconnected';
  }

  private notifyStatus(serverId: string, status: string) {
    this.io?.emit('serverStatus', { serverId, status });
  }
}

export default new RconService();
