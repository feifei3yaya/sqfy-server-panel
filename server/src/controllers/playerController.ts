import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import rconService from '../services/rconService';
import steamService from '../services/steamService';
import gameStateService from '../services/gameStateService';

// Helper function to parse RCON output
const parsePlayers = (rconOutput: string) => {
  // Implement parsing logic based on Squad's ListPlayers output
  // Example: ID: 0 | SteamID: 76561198000000000 | Name: PlayerName | Team ID: 1 | Squad ID: 2
  const lines = rconOutput.split('\n');
  const players = [];
  
  for (const line of lines) {
    // 兼容新版 Squad RCON 格式 (含 EOS ID)
    // ID: 3 | Online IDs: EOS: ... steam: 7656... | Name: ... | Team ID: 2 | Squad ID: N/A | Is Leader: False | Role: ...
    const matchNew = line.match(/ID: (\d+) \| Online IDs: EOS: [\w\d]+ steam: (\d+) \| Name: (.+) \| Team ID: (\d+) \| Squad ID: (\d+|N\/A)/);
    
    if (matchNew) {
      // 尝试提取更多信息 (Role, Is Leader)
      const roleMatch = line.match(/Role: ([\w_]+)/);
      const leaderMatch = line.match(/Is Leader: (True|False)/);
      
      players.push({
        id: matchNew[1],
        steamId: matchNew[2],
        name: matchNew[3].trim(),
        teamId: matchNew[4],
        squadId: matchNew[5],
        role: roleMatch ? roleMatch[1] : undefined,
        isLeader: leaderMatch ? leaderMatch[1] === 'True' : false
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
};

// Get online players from RCON
export const getOnlinePlayers = async (req: Request, res: Response) => {
  const serverId = req.params.serverId as string;

  try {
    const response = await rconService.execute(serverId, 'ListPlayers');
    const players = parsePlayers(response); 
    
    // Update GameStateService with latest RCON data
    gameStateService.updateFromRcon(serverId, players);
    
    // Get enriched state
    const playerStates = gameStateService.getPlayerStates(serverId);
    const stateMap = new Map(playerStates.map(p => [p.steamId, p]));

    // 异步触发 Steam 时长同步 (不阻塞请求)
    const steamIds = players.map(p => p.steamId);
    steamService.syncPlaytime(steamIds).catch(err => console.error('Steam Sync Error:', err));

    // 获取数据库中的玩家信息 (本服时长 & Steam 缓存时长)
    const dbPlayers = await prisma.player.findMany({
      where: { steamId: { in: steamIds } },
      select: { steamId: true, totalPlaytime: true, steamPlaytime: true }
    });

    const dbPlayerMap = new Map(dbPlayers.map(p => [p.steamId, p]));

    // 合并数据
    const result = players.map(p => {
      const dbP = dbPlayerMap.get(p.steamId);
      const state = stateMap.get(p.steamId);
      
      return {
        ...p,
        // Merge real-time log state
        isAlive: state ? state.isAlive : true,
        isWounded: state ? state.isWounded : false,
        role: state?.role || p.role, // Use state role if available (might be updated by log)
        kills: state?.kills || 0,
        deaths: state?.deaths || 0,
        
        playTime: dbP ? `${Math.floor(dbP.totalPlaytime / 60)}h` : '0h', // 保持原有格式兼容
        totalPlaytimeMinutes: dbP?.totalPlaytime || 0,
        steamPlaytimeMinutes: dbP?.steamPlaytime || 0
      };
    });

    res.json(result);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching players', error: error.message });
  }
};

// Kick player
export const kickPlayer = async (req: Request, res: Response) => {
  const serverId = req.params.serverId as string;
  const steamId = req.params.steamId as string;
  const { reason } = req.body;

  try {
    await rconService.execute(serverId, `AdminKick "${steamId}" ${reason}`);
    res.json({ message: `Player ${steamId} kicked` });
  } catch (error: any) {
    res.status(500).json({ message: 'Error kicking player', error: error.message });
  }
};

// Ban player
export const banPlayer = async (req: Request, res: Response) => {
  const serverId = req.params.serverId as string;
  const steamId = req.params.steamId as string;
  const { reason, duration } = req.body; // duration in minutes, 0 for perm

  try {
    // Execute RCON ban
    await rconService.execute(serverId, `AdminBan "${steamId}" "${duration}" ${reason}`);
    
    // Save to DB
    // First ensure player exists
    let player = await prisma.player.findUnique({ where: { steamId } });
    if (!player) {
      player = await prisma.player.create({
        data: {
          steamId,
          nameHistory: '[]'
        }
      });
    }

    await prisma.ban.create({
      data: {
        steamId,
        reason,
        adminId: req.user?.id,
        expiresAt: duration && duration > 0 ? new Date(Date.now() + duration * 60000) : null,
      }
    });

    res.json({ message: `Player ${steamId} banned` });
  } catch (error: any) {
    res.status(500).json({ message: 'Error banning player', error: error.message });
  }
};

export const getBans = async (req: Request, res: Response) => {
  try {
    const bans = await prisma.ban.findMany({
      include: {
        player: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    res.json(bans);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching bans', error: error.message });
  }
};

export const unbanPlayer = async (req: Request, res: Response) => {
  const banId = req.params.banId as string;
  const serverId = req.query.serverId as string;

  try {
    const ban = await prisma.ban.findUnique({
      where: { id: banId }
    });

    if (!ban) {
      return res.status(404).json({ message: 'Ban not found' });
    }

    // If serverId provided, execute unban on that server
    if (serverId) {
        try {
            await rconService.execute(serverId, `AdminUnban "${ban.steamId}"`);
        } catch (e) {
            console.error(`RCON Unban failed for server ${serverId}`, e);
        }
    } else {
        // Try to unban on all connected servers? 
        // For now, let's just delete from DB if no server specified, 
        // or maybe the frontend should always provide a server if possible.
        // But bans are stored in DB, so removing from DB is the primary action.
        
        // Optional: Loop through all servers and try to unban?
        // const servers = await prisma.server.findMany();
        // for (const server of servers) { ... }
    }

    await prisma.ban.delete({
      where: { id: banId }
    });

    res.json({ message: 'Ban removed' });
  } catch (error: any) {
    res.status(500).json({ message: 'Error removing ban', error: error.message });
  }
};

