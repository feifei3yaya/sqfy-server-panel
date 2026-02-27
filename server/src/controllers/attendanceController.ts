import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Start duty session
export const startSession = async (req: Request, res: Response) => {
  const userId = (req as any).user.userId;
  const { serverId } = req.body;

  try {
    // Check if already on duty
    const activeSession = await prisma.adminAttendance.findFirst({
      where: {
        adminId: userId,
        sessionEnd: null
      }
    });

    if (activeSession) {
      return res.status(400).json({ error: 'Already on duty' });
    }

    const session = await prisma.adminAttendance.create({
      data: {
        adminId: userId,
        serverId,
        sessionStart: new Date()
      }
    });

    res.json(session);
  } catch (error) {
    res.status(500).json({ error: 'Failed to start duty' });
  }
};

// End duty session
export const endSession = async (req: Request, res: Response) => {
  const userId = (req as any).user.userId;

  try {
    const activeSession = await prisma.adminAttendance.findFirst({
      where: {
        adminId: userId,
        sessionEnd: null
      }
    });

    if (!activeSession) {
      return res.status(400).json({ error: 'Not on duty' });
    }

    const end = new Date();
    const start = new Date(activeSession.sessionStart);
    const duration = Math.round((end.getTime() - start.getTime()) / 1000 / 60); // minutes

    const session = await prisma.adminAttendance.update({
      where: { id: activeSession.id },
      data: {
        sessionEnd: end,
        duration
      }
    });

    res.json(session);
  } catch (error) {
    res.status(500).json({ error: 'Failed to end duty' });
  }
};

// Get current status
export const getStatus = async (req: Request, res: Response) => {
  const userId = (req as any).user.userId;
  try {
    const activeSession = await prisma.adminAttendance.findFirst({
      where: {
        adminId: userId,
        sessionEnd: null
      },
      include: {
        server: { select: { name: true } }
      }
    });
    res.json({ isOnDuty: !!activeSession, session: activeSession });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get status' });
  }
};

// Get attendance stats (Admin only)
export const getStats = async (req: Request, res: Response) => {
  const { startDate, endDate, adminId } = req.query;

  const where: any = {};
  if (startDate) where.sessionStart = { gte: new Date(startDate as string) };
  if (endDate) where.sessionEnd = { lte: new Date(endDate as string) };
  if (adminId) where.adminId = adminId as string;

  try {
    const sessions = await prisma.adminAttendance.findMany({
      where,
      include: {
        admin: { select: { username: true } },
        server: { select: { name: true } }
      },
      orderBy: { sessionStart: 'desc' }
    });

    // Calculate total duration per admin
    const summary = sessions.reduce((acc: any, curr) => {
      const name = curr.admin.username;
      if (!acc[name]) acc[name] = 0;
      acc[name] += curr.duration || 0;
      return acc;
    }, {});

    res.json({ sessions, summary });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
};
