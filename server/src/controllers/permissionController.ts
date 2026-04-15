import { Request, Response } from 'express';
import { prisma, toJson } from '../utils/prisma';

export const getUserPermissions = async (req: Request, res: Response) => {
  const userId = req.params.userId as string;
  try {
    const permissions = await prisma.serverPermission.findMany({
      where: { userId },
      include: {
        server: {
          select: {
            id: true,
            name: true,
            host: true
          }
        }
      }
    });
    
    // Use computed field permissionsList from extension
    const formattedPermissions = permissions.map(p => ({
      ...p,
      permissions: p.permissionsList
    }));

    res.json(formattedPermissions);
  } catch (error) {
    console.error('Error fetching permissions:', error);
    res.status(500).json({ message: 'Error fetching permissions' });
  }
};

export const updatePermission = async (req: Request, res: Response) => {
  const { userId, serverId, permissions } = req.body;

  if (!userId || !serverId || !Array.isArray(permissions)) {
    res.status(400).json({ message: 'Invalid input' });
    return;
  }

  try {
    const perm = await prisma.serverPermission.upsert({
      where: {
        userId_serverId: { userId, serverId }
      },
      update: {
        permissions: toJson(permissions)
      },
      create: {
        userId,
        serverId,
        permissions: toJson(permissions)
      }
    });
    
    res.json({
      ...perm,
      permissions: perm.permissionsList
    });
  } catch (error) {
    console.error('Error updating permission:', error);
    res.status(500).json({ message: 'Error updating permission' });
  }
};

export const deletePermission = async (req: Request, res: Response) => {
  const userId = req.params.userId as string;
  const serverId = req.params.serverId as string;

  try {
    await prisma.serverPermission.deleteMany({
      where: {
        userId,
        serverId
      }
    });
    res.json({ message: 'Permission revoked' });
  } catch (error) {
    console.error('Error revoking permission:', error);
    res.status(500).json({ message: 'Error revoking permission' });
  }
};
