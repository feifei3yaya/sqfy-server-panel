import { PrismaClient } from '@prisma/client';
import rconService from './rconService';
import ruleService from './ruleService';
import gameStateService from './gameStateService';

const prisma = new PrismaClient();

class StatsService {
  private interval: NodeJS.Timeout | null = null;
  private fastInterval: NodeJS.Timeout | null = null;
  private unassignedTracker: Map<string, number> = new Map(); // SteamID -> Minutes unassigned

  startTracking() {
    if (this.interval) return;
    // 每分钟运行一次 (详细统计)
    this.interval = setInterval(() => {
      this.trackPlaytime();
      this.trackServerMetrics();
    }, 60 * 1000);

    // 每 10 秒运行一次 (实时状态广播)
    this.fastInterval = setInterval(() => {
      this.trackLiveStates();
    }, 10 * 1000);

    console.log('Stats tracking started');
  }

  stopTracking() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    if (this.fastInterval) {
      clearInterval(this.fastInterval);
      this.fastInterval = null;
    }
  }

  private async trackLiveStates() {
    const servers = await prisma.server.findMany({ where: { isPublished: true } });
    for (const server of servers) {
      try {
        const status = rconService.getConnectionStatus(server.id);
        if (status !== 'connected') continue;

        const state = await rconService.getGameState(server.id);
        if (state) {
          rconService.broadcastGameState(server.id, state);
        }
      } catch (error) {
        // Silent fail for high freq updates to avoid log spam
      }
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
        const response = await rconService.execute(server.id, 'ListPlayers');
        const players = this.parsePlayers(response);

        // Update Game State Service (Source of Truth)
        gameStateService.updateFromRcon(server.id, players);

        // Update RuleService Cache
        ruleService.updatePlayerCache(server.id, players);

        // Check Rules (Unassigned Kick)
        await this.checkRules(server, players);

        // Track Admin Attendance
        await this.trackAdminAttendance(server, players);

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

  // Track Admin Attendance
  private async trackAdminAttendance(server: any, players: any[]) {
    try {
      // 1. Get all users with SteamIDs who are admins/superadmins
      // Note: We might want to track 'observer' too if they are staff
      const adminUsers = await prisma.user.findMany({
        where: {
          steamId: { not: null },
          // role: { in: ['admin', 'superadmin'] } // Optional: restrict to roles
        },
        select: { id: true, steamId: true }
      });

      const adminSteamIds = new Map(adminUsers.map(u => [u.steamId!, u.id]));
      const currentOnlineAdmins = new Set<string>();

      // 2. Identify online admins
      for (const player of players) {
        if (adminSteamIds.has(player.steamId)) {
          const userId = adminSteamIds.get(player.steamId)!;
          currentOnlineAdmins.add(userId);

          // Check if session exists
          const openSession = await prisma.adminAttendance.findFirst({
            where: {
              adminId: userId,
              serverId: server.id,
              sessionEnd: null
            }
          });

          if (!openSession) {
            // Start new session
            console.log(`Admin ${player.name} (${player.steamId}) started session on ${server.name}`);
            await prisma.adminAttendance.create({
              data: {
                adminId: userId,
                serverId: server.id,
                sessionStart: new Date()
              }
            });
          } else {
            // Update duration (optional, or just do it on close)
            const duration = Math.floor((new Date().getTime() - openSession.sessionStart.getTime()) / 60000);
            await prisma.adminAttendance.update({
              where: { id: openSession.id },
              data: { duration }
            });
          }
        }
      }

      // 3. Close sessions for admins who left
      // Find all open sessions for this server where adminId is NOT in currentOnlineAdmins
      const staleSessions = await prisma.adminAttendance.findMany({
        where: {
          serverId: server.id,
          sessionEnd: null,
          adminId: { notIn: Array.from(currentOnlineAdmins) }
        }
      });

      for (const session of staleSessions) {
        const duration = Math.floor((new Date().getTime() - session.sessionStart.getTime()) / 60000);
        console.log(`Admin session ended for ${session.adminId} on ${server.name}. Duration: ${duration}m`);
        await prisma.adminAttendance.update({
          where: { id: session.id },
          data: {
            sessionEnd: new Date(),
            duration
          }
        });
      }

    } catch (error) {
      console.error('Error tracking admin attendance:', error);
    }
  }

  // Check rules: Kick unassigned players
  private async checkRules(server: any, players: any[]) {
    const currentSteamIds = new Set(players.map(p => p.steamId));
    
    // Cleanup tracker for disconnected players
    for (const steamId of this.unassignedTracker.keys()) {
      if (!currentSteamIds.has(steamId)) {
        this.unassignedTracker.delete(steamId);
      }
    }

    for (const player of players) {
      // Squad ID "N/A" means unassigned to a squad.
      // Usually we only kick if they are on a team (Team ID != 0?)
      // Team 0 is usually Unassigned (Pick Team screen). Team 1/2 are factions.
      // If they are on Team 1 or 2 but Squad N/A, they are "Lone Wolf".
      
      const isUnassigned = player.squadId === 'N/A' && player.teamId !== '0';
      
      if (isUnassigned) {
        const minutes = (this.unassignedTracker.get(player.steamId) || 0) + 1;
        this.unassignedTracker.set(player.steamId, minutes);

        // Kick after 10 minutes (configurable?)
        if (minutes >= 10) {
          console.log(`Kicking unassigned player ${player.name} (${player.steamId}) from server ${server.name}`);
          try {
            await rconService.execute(server.id, `AdminKick "${player.steamId}" AFK/Unassigned for 10m`);
            this.unassignedTracker.delete(player.steamId);
            
            // Log it
            await prisma.gameEvent.create({
              data: {
                serverId: server.id,
                type: 'AUTO_KICK',
                data: JSON.stringify({ player: player.name, reason: 'Unassigned' }),
                timestamp: new Date()
              }
            });
          } catch (e) {
            console.error('Failed to auto-kick:', e);
          }
        }
      } else {
        // Reset if they joined a squad
        if (this.unassignedTracker.has(player.steamId)) {
          this.unassignedTracker.delete(player.steamId);
        }
      }
    }
  }

  // Reuse logic from playerController or extract to util
  private parsePlayers(rconOutput: string) {
    const lines = rconOutput.split('\n');
    const players = [];
    
    for (const line of lines) {
      // 兼容新版 Squad RCON 格式 (含 EOS ID)
      const matchNew = line.match(/ID: (\d+) \| Online IDs: EOS: [\w\d]+ steam: (\d+) \| Name: (.+) \| Team ID: (\d+) \| Squad ID: (\d+|N\/A)/);
      
      if (matchNew) {
        players.push({
          id: matchNew[1],
          steamId: matchNew[2],
          name: matchNew[3].trim(),
          teamId: matchNew[4],
          squadId: matchNew[5]
        });
        continue;
      }

      // 兼容旧版格式
      const matchOld = line.match(/ID: (\d+) \| SteamID: (\d+) \| Name: (.+) \| Team ID: (\d+) \| Squad ID: (\d+|N\/A)/);
      if (matchOld) {
        players.push({
          id: matchOld[1],
          steamId: matchOld[2],
          name: matchOld[3].trim(),
          teamId: matchOld[4],
          squadId: matchOld[5]
        });
      }
    }
    return players;
  }
}

export default new StatsService();
