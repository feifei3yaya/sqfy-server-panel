import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get all teams
export const getTeams = async (req: Request, res: Response) => {
  try {
    const teams = await prisma.team.findMany({
      include: {
        _count: {
          select: { members: true }
        },
        members: {
          where: { role: 'owner' },
          include: {
            user: {
              select: { username: true }
            }
          }
        }
      }
    });
    res.json(teams);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch teams' });
  }
};

// Get single team details
export const getTeam = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  try {
    const team = await prisma.team.findUnique({
      where: { id },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, username: true, email: true }
            }
          }
        }
      }
    });
    if (!team) return res.status(404).json({ error: 'Team not found' });
    res.json(team);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch team' });
  }
};

// Create a team
export const createTeam = async (req: Request, res: Response) => {
  const { name, tag, description } = req.body;
  const userId = (req as any).user.userId;

  try {
    // Check if user is already in a team (optional rule, but good for simplicity)
    const existingMembership = await prisma.teamMember.findFirst({
      where: { userId }
    });
    if (existingMembership) {
      return res.status(400).json({ error: 'You are already in a team' });
    }

    const team = await prisma.team.create({
      data: {
        name,
        tag,
        description,
        ownerId: userId,
        members: {
          create: {
            userId,
            role: 'owner'
          }
        }
      }
    });
    res.status(201).json(team);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create team. Name or Tag might be taken.' });
  }
};

// Join a team
export const joinTeam = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const userId = (req as any).user.userId;

  try {
    const existingMembership = await prisma.teamMember.findFirst({
      where: { userId }
    });
    if (existingMembership) {
      return res.status(400).json({ error: 'You are already in a team' });
    }

    await prisma.teamMember.create({
      data: {
        teamId: id,
        userId,
        role: 'member'
      }
    });
    res.json({ message: 'Joined team successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to join team' });
  }
};

// Leave a team
export const leaveTeam = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const currentUserId = (req as any).user.userId;

  try {
    const membership = await prisma.teamMember.findUnique({
      where: { teamId_userId: { teamId: id, userId: currentUserId } }
    });

    if (!membership) {
      return res.status(404).json({ error: 'Not a member of this team' });
    }

    if (membership.role === 'owner') {
      return res.status(400).json({ error: 'Owner cannot leave team. Delete team or transfer ownership.' });
    }

    await prisma.teamMember.delete({
      where: { teamId_userId: { teamId: id, userId: currentUserId } }
    });

    res.json({ message: 'Left team successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to leave team' });
  }
};

// Kick member (Owner/Admin only)
export const kickMember = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const userId = req.params.userId as string;
  const currentUserId = (req as any).user.userId;

  try {
    const currentUserRole = await prisma.teamMember.findUnique({
      where: { teamId_userId: { teamId: id, userId: currentUserId } }
    });

    if (!currentUserRole || (currentUserRole.role !== 'owner' && currentUserRole.role !== 'admin')) {
      return res.status(403).json({ error: 'Not authorized to kick members' });
    }

    await prisma.teamMember.delete({
      where: { teamId_userId: { teamId: id, userId } }
    });

    res.json({ message: 'Member kicked successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to kick member' });
  }
};
