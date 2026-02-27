import { PrismaClient } from '@prisma/client';
import rconService from './rconService';

const prisma = new PrismaClient();

class StatsService {
  private interval: NodeJS.Timeout | null = null;

  startTracking() {
    if (this.interval) return;
    // 每分钟运行一次
    this.interval = setInterval(() => {
      this.trackPlaytime();
      this.trackServerMetrics();
    }, 60 * 1000);
    console.log('Stats tracking started');
  }

  stopTracking() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  private async trackServerMetrics() {
    const servers = await prisma.server.findMany();
    for (const server of servers) {
      try {
        const status = rconService.getConnectionStatus(server.id);
        if (status !== 'connected') continue;

        const response = await rconService.execute(server.id, 'ListPlayers');
        const players = this.parsePlayers(response);
        
        await prisma.serverMetric.create({
          data: {
            serverId: server.id,
            playerCount: players.length,
            // 假设最大人数为 100，后续可以从 ShowServerInfo 获取
            maxPlayers: 100, 
            timestamp: new Date()
          }
        });
      } catch (error) {
        console.error(`Error tracking metrics for server ${server.name}:`, error);
      }
    }
  }

  private async trackPlaytime() {
    const servers = await prisma.server.findMany();

    for (const server of servers) {
      try {
        const status = rconService.getConnectionStatus(server.id);
        if (status !== 'connected') continue;

        // 获取在线玩家
        // 注意：这里我们需要解析 RCON 的 ListPlayers 命令
        // 为了简化，我们假设 rconService.execute 返回原始字符串，我们需要解析它
        // 或者我们可以给 rconService 添加一个专门的方法来获取解析后的玩家列表
        const response = await rconService.execute(server.id, 'ListPlayers');
        const players = this.parsePlayers(response);

        for (const playerInfo of players) {
          if (!playerInfo.steamId) continue;

          // 更新或创建玩家记录
          const player = await prisma.player.upsert({
            where: { steamId: playerInfo.steamId },
            update: {
              lastSeen: new Date(),
              totalPlaytime: { increment: 1 }, // 增加 1 分钟
              points: { increment: 1 }, // 每分钟 1 积分 (可配置)
              // 这里暂时不做复杂处理，仅保留当前名字
              nameHistory: JSON.stringify([playerInfo.name])
            },
            create: {
              steamId: playerInfo.steamId,
              nameHistory: JSON.stringify([playerInfo.name]),
              firstSeen: new Date(),
              lastSeen: new Date(),
              totalPlaytime: 1,
              points: 1
            }
          });
        }
      } catch (error) {
        console.error(`Error tracking playtime for server ${server.name}:`, error);
      }
    }
  }

  // Check for AFK/Unassigned players and kick them
  private async checkAFK(server: any, players: any[]) {
    // Basic AFK logic could be added here
  }

  // Reuse logic from playerController or extract to util
  private parsePlayers(rconOutput: string) {
    const lines = rconOutput.split('\n');
    const players = [];
    
    for (const line of lines) {
      // 兼容两种常见的 Squad RCON 格式
      // 格式 1: ID: 0 | SteamID: 76561198000000000 | Name: PlayerName | Team ID: 1 | Squad ID: 1
      // 格式 2 (某些插件): ID: 0 | Online IDs: EOS: 0002... steam: 7656... | Name: ...
      // 目前主要针对标准格式
      const match = line.match(/ID: (\d+) \| SteamID: (\d+) \| Name: (.+) \| Team ID: (\d+) \| Squad ID: (\d+|N\/A)/);
      if (match) {
        players.push({
          id: match[1],
          steamId: match[2],
          name: match[3],
          teamId: match[4],
          squadId: match[5]
        });
      }
    }
    return players;
  }
}

export default new StatsService();
