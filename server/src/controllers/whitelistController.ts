import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { syncConfig } from './squadAdminController';

const prisma = new PrismaClient();

export const getWhitelist = async (req: Request, res: Response) => {
  const { serverId } = req.query;
  try {
    const where: any = {};
    if (serverId) where.serverId = String(serverId);

    const whitelist = await prisma.whitelist.findMany({
      where,
      include: {
        server: { select: { id: true, name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(whitelist);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch whitelist' });
  }
};

export const addWhitelist = async (req: Request, res: Response) => {
  const { steamId, serverId, expiresAt, comment, name } = req.body; // name is for Player record creation

  if (!steamId || !serverId) {
    return res.status(400).json({ error: 'SteamID and ServerID are required' });
  }

  try {
    // Ensure player exists
    await prisma.player.upsert({
      where: { steamId },
      update: {},
      create: {
        steamId,
        nameHistory: JSON.stringify(name ? [name] : ['Unknown']),
        firstSeen: new Date(),
        lastSeen: new Date()
      }
    });

    const whitelist = await prisma.whitelist.create({
      data: {
        steamId,
        serverId,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        comment
      }
    });

    // Auto-sync config?
    // Let's let the user manually sync or we can trigger it here.
    // For better UX, maybe we should trigger it or let the user know.
    // But sync might be heavy if done on every add.
    // Let's keep it manual sync via UI for now to batch changes.

    res.status(201).json(whitelist);
  } catch (error) {
    console.error('Add whitelist error:', error);
    res.status(500).json({ error: 'Failed to add to whitelist' });
  }
};

export const removeWhitelist = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.whitelist.delete({ where: { id: String(id) } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove from whitelist' });
  }
};
