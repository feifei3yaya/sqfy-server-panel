import { Request, Response } from 'express';
import rconService from '../services/rconService';

export const getGameState = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  try {
    const gameState = await rconService.getGameState(id);
    if (!gameState) {
      // Fallback if ShowServerInfo fails or returns non-JSON
      // We can try getting CurrentMap and NextMap separately
      const currentMap = await rconService.execute(id, 'ShowCurrentMap');
      const nextMap = await rconService.execute(id, 'ShowNextMap');
      return res.json({
        currentMap,
        nextMap,
        isFallback: true
      });
    }
    res.json(gameState);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching game state', error });
  }
};

export const changeMap = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const { map } = req.body;
  if (!map) return res.status(400).json({ message: 'Map name required' });

  try {
    await rconService.execute(id, `AdminChangeMap ${map}`);
    res.json({ message: `Changing map to ${map}` });
  } catch (error) {
    res.status(500).json({ message: 'Error changing map', error });
  }
};

export const setNextMap = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const { map } = req.body;
  if (!map) return res.status(400).json({ message: 'Map name required' });

  try {
    await rconService.execute(id, `AdminSetNextMap ${map}`);
    res.json({ message: `Next map set to ${map}` });
  } catch (error) {
    res.status(500).json({ message: 'Error setting next map', error });
  }
};

export const endMatch = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  try {
    await rconService.execute(id, 'AdminEndMatch');
    res.json({ message: 'Match ended' });
  } catch (error) {
    res.status(500).json({ message: 'Error ending match', error });
  }
};
