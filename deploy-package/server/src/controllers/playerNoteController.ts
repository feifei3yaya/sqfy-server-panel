
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get notes for a player
export const getPlayerNotes = async (req: Request, res: Response) => {
  const { steamId } = req.params;
  
  try {
    const notes = await prisma.playerNote.findMany({
      where: { steamId: steamId as string },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json({ status: 'success', data: notes });
  } catch (error) {
    res.status(500).json({ status: 'error', message: '获取玩家笔记失败' });
  }
};

// Add a note
export const addPlayerNote = async (req: Request, res: Response) => {
  const { steamId } = req.params;
  const { content } = req.body;
  const userId = (req as any).user?.id;
  const username = (req as any).user?.username;

  if (!content) {
    return res.status(400).json({ status: 'error', message: '笔记内容不能为空' });
  }

  try {
    // Ensure player exists
    let player = await prisma.player.findUnique({ where: { steamId: steamId as string } });
    if (!player) {
      // Create basic player record if not exists
      player = await prisma.player.create({
        data: {
          steamId: steamId as string,
          nameHistory: '[]',
        }
      });
    }

    const note = await prisma.playerNote.create({
      data: {
        steamId: steamId as string,
        content,
        authorId: userId,
        authorName: username
      }
    });
    
    res.json({ status: 'success', data: note });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', message: '添加玩家笔记失败' });
  }
};

// Delete a note
export const deletePlayerNote = async (req: Request, res: Response) => {
  const { id } = req.params;
  
  try {
    await prisma.playerNote.delete({
      where: { id: id as string }
    });
    
    res.json({ status: 'success', message: '笔记已删除' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: '删除玩家笔记失败' });
  }
};

// Get notes count for multiple players (batch)
export const getPlayerNotesCount = async (req: Request, res: Response) => {
  const { steamIds } = req.body;
  
  if (!Array.isArray(steamIds)) {
    return res.status(400).json({ status: 'error', message: 'Invalid steamIds' });
  }
  
  try {
    const counts = await prisma.playerNote.groupBy({
      by: ['steamId'],
      where: {
        steamId: { in: steamIds }
      },
      _count: {
        id: true
      }
    });
    
    // Convert to object map: { steamId: count }
    const result: Record<string, number> = {};
    counts.forEach(item => {
      result[item.steamId] = item._count.id;
    });
    
    res.json({ status: 'success', data: result });
  } catch (error) {
    res.status(500).json({ status: 'error', message: '获取笔记数量失败' });
  }
};
