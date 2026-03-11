import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 扩展 Request 类型以包含 user
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ message: 'Authentication token required' });
    return;
  }

  try {
    const decoded = verifyToken(token);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user) {
      res.status(401).json({ message: 'User not found' });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(403).json({ message: 'Invalid or expired token' });
  }
};

export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ message: 'Insufficient permissions' });
      return;
    }
    next();
  };
};

export const requireServerPermission = (permission: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'Authentication required' });
        return;
      }

      // Superadmin has all permissions
      if (req.user.role === 'superadmin') {
        next();
        return;
      }

      // Try to get serverId from params, body, or query
      const serverId = req.params.id || req.body.serverId || req.query.serverId;

      if (!serverId) {
        res.status(400).json({ message: 'Server ID is required for permission check' });
        return;
      }

      // Check specific permission
      const serverPermission = await prisma.serverPermission.findUnique({
        where: {
          userId_serverId: {
            userId: req.user.id,
            serverId: String(serverId)
          }
        }
      });

      if (!serverPermission) {
        res.status(403).json({ message: 'No permission for this server' });
        return;
      }

      const permissions = JSON.parse(serverPermission.permissions || '[]');
      // 'all' permission grants everything
      if (permissions.includes(permission) || permissions.includes('all')) {
        next();
        return;
      }

      res.status(403).json({ message: `Missing required permission: ${permission}` });
    } catch (error) {
      console.error('Permission check error:', error);
      res.status(500).json({ message: 'Internal server error during permission check' });
    }
  };
};

