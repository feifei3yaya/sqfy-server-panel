import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import rconService from '../services/rconService';

const prisma = new PrismaClient();

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    // 1. Get Servers and their current RCON status
    const servers = await prisma.server.findMany();
    let onlineServers = 0;
    let totalPlayers = 0;
    const serverStatuses = await Promise.all(servers.map(async (server) => {
      const status = rconService.getConnectionStatus(server.id);
      let playerCount = 0;
      let maxPlayers = 100;
      let map = 'Unknown';
      
      if (status === 'connected') {
        onlineServers++;
        try {
          const state = await rconService.getGameState(server.id);
          if (state) {
            playerCount = state.playerCount;
            maxPlayers = state.maxPlayers;
            map = state.currentMap;
          }
        } catch (e) {
          // Fallback to DB metric
          const lastMetric = await prisma.serverMetric.findFirst({
            where: { serverId: server.id },
            orderBy: { timestamp: 'desc' }
          });
          if (lastMetric) {
            playerCount = lastMetric.playerCount;
          }
        }
      }
      totalPlayers += playerCount;
      return {
        id: server.id,
        name: server.name,
        status,
        playerCount,
        maxPlayers,
        map
      };
    }));

    // 2. Recent Bans
    const recentBans = await prisma.ban.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { player: { select: { nameHistory: true } } }
    });

    // 3. Active Admins
    const activeAdmins = await prisma.adminAttendance.findMany({
      where: { sessionEnd: null },
      include: {
        admin: { select: { username: true } },
        server: { select: { name: true } }
      }
    });

    // 4. Chart Data (Last 24h aggregated)
    // We want a single line showing total players across all servers
    const oneDayAgo = new Date();
    oneDayAgo.setHours(oneDayAgo.getHours() - 24);
    
    const metrics = await prisma.serverMetric.findMany({
      where: { timestamp: { gte: oneDayAgo } },
      orderBy: { timestamp: 'asc' }
    });

    // Group metrics by timestamp (bucketed by 10 minutes to reduce points)
    const timeMap = new Map<string, number>();
    metrics.forEach(m => {
      // Round to nearest 10 minutes
      const time = new Date(m.timestamp);
      time.setSeconds(0);
      time.setMilliseconds(0);
      const minutes = time.getMinutes();
      const remainder = minutes % 10;
      time.setMinutes(minutes - remainder);
      const key = time.toISOString();
      
      timeMap.set(key, (timeMap.get(key) || 0) + m.playerCount);
    });

    const chartData = Array.from(timeMap.entries())
      .map(([time, count]) => ({ time, count }))
      .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

    res.json({
      summary: {
        totalServers: servers.length,
        onlineServers,
        totalPlayers,
        activeAdmins: activeAdmins.length
      },
      serverStatuses,
      recentBans,
      activeAdmins,
      chartData
    });

  } catch (error) {
    console.error('Dashboard Error:', error);
    res.status(500).json({ error: 'Failed to load dashboard data' });
  }
};
