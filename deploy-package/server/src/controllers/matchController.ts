import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { success, fail, pageSuccess } from '../utils/response';

const prisma = new PrismaClient();

export const getMatches = async (req: Request, res: Response) => {
  const { page = 1, pageSize = 20, serverId, map, winner } = req.query;
  const skip = (Number(page) - 1) * Number(pageSize);
  const take = Number(pageSize);

  const where: any = {};
  if (serverId) where.serverId = String(serverId);
  if (map) where.map = { contains: String(map) };
  if (winner) where.winner = String(winner);

  try {
    const [matches, total] = await Promise.all([
      prisma.match.findMany({
        where,
        skip,
        take,
        orderBy: { startTime: 'desc' },
        include: {
          server: { select: { name: true } },
          _count: { select: { events: true } }
        }
      }),
      prisma.match.count({ where })
    ]);

    res.json(pageSuccess(matches, total, Number(page), Number(pageSize)));
  } catch (error) {
    res.status(500).json(fail('Failed to fetch matches', 5000, error));
  }
};

export const getMatchDetail = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const match = await prisma.match.findUnique({
      where: { id: String(id) },
      include: {
        server: { select: { name: true } },
        events: {
          orderBy: { timestamp: 'asc' }
        }
      }
    });

    if (!match) {
      return res.status(404).json(fail('Match not found', 4040));
    }

    res.json(success(match));
  } catch (error) {
    res.status(500).json(fail('Failed to fetch match detail', 5000, error));
  }
};
