import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import systemLogWatcherService, { LogSourceConfig } from '../services/systemLogWatcher';

const prisma = new PrismaClient();

// Get logs with filters
export const getSystemLogs = async (req: Request, res: Response) => {
  try {
    const { 
      page = 1, 
      limit = 50, 
      level, 
      category, 
      source, 
      search, 
      startTime, 
      endTime 
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const where: any = {};

    if (level) where.level = level;
    if (category) where.category = category;
    if (source) where.source = source;
    
    if (search) {
      where.OR = [
        { message: { contains: String(search) } },
        { metadata: { contains: String(search) } }
      ];
    }

    if (startTime || endTime) {
      where.timestamp = {};
      if (startTime) where.timestamp.gte = new Date(String(startTime));
      if (endTime) where.timestamp.lte = new Date(String(endTime));
    }

    const [logs, total] = await Promise.all([
      prisma.systemLog.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        skip,
        take,
      }),
      prisma.systemLog.count({ where })
    ]);

    res.json({
      data: logs,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Get system logs error:', error);
    res.status(500).json({ error: 'Failed to fetch system logs' });
  }
};

// Get log stats for charts
export const getSystemLogStats = async (req: Request, res: Response) => {
  try {
    const { startTime, endTime } = req.query;
    
    const start = startTime ? new Date(String(startTime)) : new Date(Date.now() - 24 * 60 * 60 * 1000); // Default last 24h
    const end = endTime ? new Date(String(endTime)) : new Date();

    const where = {
      timestamp: {
        gte: start,
        lte: end
      }
    };

    // Group by level
    const byLevel = await prisma.systemLog.groupBy({
      by: ['level'],
      where,
      _count: {
        _all: true
      }
    });

    // Group by category
    const byCategory = await prisma.systemLog.groupBy({
      by: ['category'],
      where,
      _count: {
        _all: true
      }
    });

    // Trend (by hour) - Prisma doesn't support date truncation easily in SQLite
    // We fetch counts and process in JS or use raw query
    // Using raw query for SQLite date truncation
    // Prisma stores DateTime as ISO 8601 strings in SQLite
    const trend = await prisma.$queryRaw`
      SELECT 
        strftime('%Y-%m-%d %H:00:00', timestamp) as time,
        level,
        COUNT(*) as count
      FROM SystemLog
      WHERE timestamp >= ${start.toISOString()} AND timestamp <= ${end.toISOString()}
      GROUP BY time, level
      ORDER BY time ASC
    `;

    res.json({
      byLevel,
      byCategory,
      trend
    });
  } catch (error) {
    console.error('Get system log stats error:', error);
    // Fallback if raw query fails (e.g. diff DB provider)
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
};

// Get current configuration
export const getLogConfig = async (req: Request, res: Response) => {
  try {
    const configs = systemLogWatcherService.getConfigs();
    res.json(configs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch config' });
  }
};

// Update configuration
export const updateLogConfig = async (req: Request, res: Response) => {
  try {
    const configs: LogSourceConfig[] = req.body;
    // Validate?
    await systemLogWatcherService.saveConfig(configs);
    res.json({ message: 'Configuration saved' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save config' });
  }
};
