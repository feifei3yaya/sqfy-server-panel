import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getMatches = async (req: Request, res: Response) => {
  try {
    const matches = await prisma.scrimMatch.findMany({
      include: {
        teamA: true,
        teamB: true,
        server: true
      },
      orderBy: { startTime: 'asc' }
    });
    res.json(matches);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching matches', error });
  }
};

export const createMatch = async (req: Request, res: Response) => {
  try {
    const { title, description, startTime, endTime, serverId, teamAId, teamBId } = req.body;
    
    const match = await prisma.scrimMatch.create({
      data: {
        title,
        description,
        startTime: new Date(startTime),
        endTime: endTime ? new Date(endTime) : undefined,
        serverId,
        teamAId,
        teamBId
      }
    });
    res.json(match);
  } catch (error) {
    res.status(500).json({ message: 'Error creating match', error });
  }
};

export const updateMatch = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, startTime, endTime, serverId, teamAId, teamBId } = req.body;
    
    const match = await prisma.scrimMatch.update({
      where: { id: String(id) },
      data: {
        title,
        description,
        startTime: startTime ? new Date(startTime) : undefined,
        endTime: endTime ? new Date(endTime) : undefined,
        serverId,
        teamAId,
        teamBId
      }
    });
    res.json(match);
  } catch (error) {
    res.status(500).json({ message: 'Error updating match', error });
  }
};

export const deleteMatch = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.scrimMatch.delete({ where: { id: String(id) } });
    res.json({ message: 'Match deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting match', error });
  }
};
