import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getGameEvents = async (req: Request, res: Response) => {
  const { serverId, type, startDate, endDate, page = 1, limit = 50 } = req.query;

  const where: any = {};

  if (serverId) {
    where.serverId = serverId as string;
  }

  if (type) {
    where.type = type as string;
  }

  if (startDate || endDate) {
    where.timestamp = {};
    if (startDate) where.timestamp.gte = new Date(startDate as string);
    if (endDate) where.timestamp.lte = new Date(endDate as string);
  }

  try {
    const events = await prisma.gameEvent.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
      include: {
        server: {
          select: { name: true }
        },
        match: {
          select: { map: true }
        }
      }
    });

    const total = await prisma.gameEvent.count({ where });

    // Parse data JSON for frontend convenience
    const parsedEvents = events.map(event => ({
      ...event,
      data: typeof event.data === 'string' ? JSON.parse(event.data) : event.data
    }));

    res.json({
      data: parsedEvents,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Get GameEvents Error:', error);
    res.status(500).json({ error: 'Failed to fetch game events' });
  }
};
