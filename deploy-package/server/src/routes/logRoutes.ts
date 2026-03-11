import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middlewares/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Get logs with filtering
router.get('/', authenticateToken, async (req, res) => {
  const { serverId, type, search, startDate, endDate, page = 1, limit = 50 } = req.query;

  const where: any = {};

  if (serverId) {
    where.serverId = serverId as string;
  }

  if (type) {
    where.type = type as string;
  }

  if (search) {
    where.content = {
      contains: search as string
    };
  }

  if (startDate || endDate) {
    where.timestamp = {};
    if (startDate) where.timestamp.gte = new Date(startDate as string);
    if (endDate) where.timestamp.lte = new Date(endDate as string);
  }

  try {
    const logs = await prisma.log.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
      include: {
        server: {
          select: { name: true }
        }
      }
    });

    const total = await prisma.log.count({ where });

    res.json({
      data: logs,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
});

// Create a log entry (for ingestion from game server scripts)
router.post('/', authenticateToken, async (req, res) => {
  const { serverId, type, content, timestamp } = req.body;
  
  if (!serverId || !type || !content) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const log = await prisma.log.create({
      data: {
        serverId,
        type,
        content,
        timestamp: timestamp ? new Date(timestamp) : new Date()
      }
    });
    res.status(201).json(log);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create log' });
  }
});

export default router;
