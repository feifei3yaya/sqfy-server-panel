import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

export const generateCDK = async (req: Request, res: Response) => {
  const { type, value, amount } = req.body;
  
  try {
    const cdks = [];
    for (let i = 0; i < amount; i++) {
      const code = uuidv4().replace(/-/g, '').substring(0, 16).toUpperCase();
      cdks.push({
        code,
        type,
        value,
        isUsed: false
      });
    }

    await prisma.cDK.createMany({
      data: cdks
    });

    res.status(201).json(cdks);
  } catch (error) {
    res.status(500).json({ message: 'Error generating CDKs', error });
  }
};

export const redeemCDK = async (req: Request, res: Response) => {
  const { code, steamId } = req.body;

  try {
    const cdk = await prisma.cDK.findUnique({ where: { code } });

    if (!cdk) {
      return res.status(404).json({ message: 'Invalid CDK' });
    }

    if (cdk.isUsed) {
      return res.status(400).json({ message: 'CDK already used' });
    }

    // Update CDK status
    await prisma.cDK.update({
      where: { code },
      data: {
        isUsed: true,
        usedBy: steamId
      }
    });

    // Apply effect based on type
    if (cdk.type === 'points') {
      await prisma.player.upsert({
        where: { steamId },
        update: { points: { increment: cdk.value } },
        create: {
          steamId,
          points: cdk.value,
          nameHistory: '[]'
        }
      });
    }
    // Handle other types (vip, item, etc.) here

    res.json({ message: 'CDK redeemed successfully', type: cdk.type, value: cdk.value });
  } catch (error) {
    res.status(500).json({ message: 'Error redeeming CDK', error });
  }
};

export const getCDKs = async (req: Request, res: Response) => {
  try {
    const cdks = await prisma.cDK.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(cdks);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching CDKs', error });
  }
};
