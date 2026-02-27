import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import rconService from '../services/rconService';

const prisma = new PrismaClient();

// Helper function to parse RCON output
const parsePlayers = (rconOutput: string) => {
  // Implement parsing logic based on Squad's ListPlayers output
  // Example: ID: 0 | SteamID: 76561198000000000 | Name: PlayerName | Team ID: 1 | Squad ID: 2
  const lines = rconOutput.split('\n');
  const players = [];
  
  for (const line of lines) {
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
};

// Get online players from RCON
export const getOnlinePlayers = async (req: Request, res: Response) => {
  const serverId = req.params.serverId as string;

  try {
    const response = await rconService.execute(serverId, 'ListPlayers');
    const players = parsePlayers(response); 
    res.json(players);
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

