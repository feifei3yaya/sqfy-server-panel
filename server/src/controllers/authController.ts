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

    // First registered user becomes superadmin
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
  const { username, password, code } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (user.twoFASecret) {
      if (!code) {
        return res.status(200).json({ require2FA: true });
      }

      const verified = speakeasy.totp.verify({
        secret: user.twoFASecret,
        encoding: 'base32',
        token: code
      });

      if (!verified) {
        return res.status(401).json({ message: 'Invalid 2FA code' });
      }
    }

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
    
    // Don't save secret to DB yet, wait for verification
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
