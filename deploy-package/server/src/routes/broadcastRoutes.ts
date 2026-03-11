import { Router } from 'express';
import { Request, Response } from 'express';
import broadcastService from '../services/broadcastService';
import { authenticateToken } from '../middlewares/auth';

const router = Router();

// Get all broadcasts for a server
router.get('/:serverId', authenticateToken, async (req: Request, res: Response) => {
  const serverId = req.params.serverId as string;
  try {
    const broadcasts = await broadcastService.getBroadcasts(serverId);
    res.json(broadcasts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch broadcasts' });
  }
});

// Create a broadcast
router.post('/', authenticateToken, async (req: Request, res: Response) => {
  const { serverId, content, interval, enabled } = req.body;
  try {
    const broadcast = await broadcastService.createBroadcast({
      serverId,
      content,
      interval: Number(interval),
      enabled: Boolean(enabled)
    });
    res.status(201).json(broadcast);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create broadcast' });
  }
});

// Update a broadcast
router.put('/:id', authenticateToken, async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const { content, interval, enabled } = req.body;
  try {
    const broadcast = await broadcastService.updateBroadcast(id, {
      content,
      interval: interval ? Number(interval) : undefined,
      enabled: enabled !== undefined ? Boolean(enabled) : undefined
    });
    res.json(broadcast);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update broadcast' });
  }
});

// Delete a broadcast
router.delete('/:id', authenticateToken, async (req: Request, res: Response) => {
  const id = req.params.id as string;
  try {
    await broadcastService.deleteBroadcast(id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete broadcast' });
  }
});

export default router;
