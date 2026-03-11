
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs-extra';

const prisma = new PrismaClient();

// Helper to get base URL
const getBaseUrl = (req: Request) => {
  return `${req.protocol}://${req.get('host')}`;
};

export const getProfile = async (req: Request, res: Response) => {
  const userId = (req as any).user.userId;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        loginHistory: {
          take: 5,
          orderBy: { timestamp: 'desc' }
        },
        teamMembers: {
          include: {
            team: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { passwordHash, twoFASecret, ...userProfile } = user;
    
    // Add full avatar URL if exists
    if (userProfile.avatarUrl && !userProfile.avatarUrl.startsWith('http')) {
      userProfile.avatarUrl = `${getBaseUrl(req)}${userProfile.avatarUrl}`;
    }

    res.json({
      ...userProfile,
      has2FA: !!twoFASecret
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Error fetching profile' });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  const userId = (req as any).user.userId;
  const { nickname, steamId, gender, birthday, region, phone, wechat, email } = req.body;

  try {
    // Validate email uniqueness if changed
    if (email) {
      const existingUser = await prisma.user.findFirst({
        where: { 
          email, 
          NOT: { id: userId } 
        }
      });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already in use' });
      }
    }

    // Validate SteamID uniqueness if changed
    if (steamId) {
      const existingUser = await prisma.user.findFirst({
        where: { 
          steamId, 
          NOT: { id: userId } 
        }
      });
      if (existingUser) {
        return res.status(400).json({ message: 'Steam ID already linked to another account' });
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        nickname,
        steamId,
        gender,
        birthday: birthday ? new Date(birthday) : undefined,
        region,
        phone,
        wechat,
        email
      }
    });

    const { passwordHash, twoFASecret, ...userProfile } = updatedUser;
    res.json({
      ...userProfile,
      has2FA: !!twoFASecret
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Error updating profile' });
  }
};

export const uploadAvatar = async (req: Request, res: Response) => {
  const userId = (req as any).user.userId;

  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  try {
    // Relative path for DB
    const avatarPath = `/uploads/avatars/${req.file.filename}`;

    const user = await prisma.user.update({
      where: { id: userId },
      data: { avatarUrl: avatarPath }
    });

    const fullUrl = `${getBaseUrl(req)}${avatarPath}`;
    res.json({ avatarUrl: fullUrl });
  } catch (error) {
    console.error('Avatar upload error:', error);
    res.status(500).json({ message: 'Error uploading avatar' });
  }
};

export const getLoginHistory = async (req: Request, res: Response) => {
  const userId = (req as any).user.userId;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  try {
    const [history, total] = await Promise.all([
      prisma.loginHistory.findMany({
        where: { userId },
        orderBy: { timestamp: 'desc' },
        skip,
        take: limit
      }),
      prisma.loginHistory.count({ where: { userId } })
    ]);

    res.json({
      data: history,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get login history error:', error);
    res.status(500).json({ message: 'Error fetching login history' });
  }
};
