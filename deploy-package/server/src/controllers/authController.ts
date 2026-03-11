import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const register = async (req: Request, res: Response) => {
  const { username, password, email } = req.body;

  try {
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username },
          { email }
        ]
      }
    });

    if (existingUser) {
      return res.status(400).json({ message: 'Username or email already exists' });
    }

    // 第一个注册的用户将成为超级管理员
    const userCount = await prisma.user.count();
    const role = userCount === 0 ? 'superadmin' : 'user';

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        username,
        passwordHash: hashedPassword,
        email,
        role
      }
    });

    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
    res.status(201).json({ token, user: { id: user.id, username: user.username, role: user.role } });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const login = async (req: Request, res: Response) => {
  const rawUsername = typeof req.body?.username === 'string' ? req.body.username : '';
  const password = typeof req.body?.password === 'string' ? req.body.password : '';
  const code = typeof req.body?.code === 'string' ? req.body.code : '';
  const identifier = rawUsername.trim();
  const normalizedEmail = identifier.toLowerCase();

  if (!identifier || !password) {
    return res.status(400).json({ message: '请输入用户名和密码' });
  }

  try {
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { username: identifier },
          { email: normalizedEmail }
        ]
      }
    });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      await prisma.loginHistory.create({
        data: {
          userId: user.id,
          ip: req.ip || req.socket.remoteAddress || 'unknown',
          userAgent: req.get('user-agent'),
          status: 'failed'
        }
      });
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (user.twoFASecret) {
      if (!code.trim()) {
        return res.status(200).json({ require2FA: true });
      }

      const verified = speakeasy.totp.verify({
        secret: user.twoFASecret,
        encoding: 'base32',
        token: code.trim(),
        window: 1
      });

      if (!verified) {
        await prisma.loginHistory.create({
          data: {
            userId: user.id,
            ip: req.ip || req.socket.remoteAddress || 'unknown',
            userAgent: req.get('user-agent'),
            status: 'failed_2fa'
          }
        });
        return res.status(401).json({ message: 'Invalid 2FA code' });
      }
    }

    // 记录登录成功
    await prisma.loginHistory.create({
      data: {
        userId: user.id,
        ip: req.ip || req.socket.remoteAddress || 'unknown',
        userAgent: req.get('user-agent'),
        status: 'success'
      }
    });

    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const generate2FA = async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) return res.status(401).json({ message: 'Unauthorized' });

  const secret = speakeasy.generateSecret({ name: `SquadManager (${user.username})` });
  
  QRCode.toDataURL(secret.otpauth_url!, async (err, data_url) => {
    if (err) return res.status(500).json({ message: 'Error generating QR code' });
    
    // 尚未将密钥保存到数据库，等待验证
    res.json({ secret: secret.base32, qrCode: data_url });
  });
};

export const verify2FA = async (req: Request, res: Response) => {
  const { token, secret } = req.body;
  const user = req.user;
  
  if (!user) return res.status(401).json({ message: 'Unauthorized' });

  const verified = speakeasy.totp.verify({
    secret: secret,
    encoding: 'base32',
    token: token
  });

  if (verified) {
    await prisma.user.update({
      where: { id: user.id },
      data: { twoFASecret: secret }
    });
    res.json({ message: '2FA enabled successfully' });
  } else {
    res.status(400).json({ message: 'Invalid token' });
  }
};

export const getMe = async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const fullUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        username: true,
        role: true,
        nickname: true,
        avatarUrl: true
      }
    });
    
    if (!fullUser) return res.status(404).json({ message: 'User not found' });
    
    res.json(fullUser);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
