import express from 'express';
import { getOnlinePlayers, kickPlayer, banPlayer } from '../controllers/playerController';
import { authenticateToken, requireRole } from '../middlewares/auth';

const router = express.Router();

router.get('/:serverId', authenticateToken, getOnlinePlayers);
router.post('/:serverId/kick/:steamId', authenticateToken, requireRole(['superadmin', 'admin']), kickPlayer);
router.post('/:serverId/ban/:steamId', authenticateToken, requireRole(['superadmin', 'admin']), banPlayer);

export default router;
