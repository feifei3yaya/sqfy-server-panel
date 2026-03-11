import express from 'express';
import { getOnlinePlayers, kickPlayer, banPlayer, getBans, unbanPlayer } from '../controllers/playerController';
import { authenticateToken, requireRole, requireServerPermission } from '../middlewares/auth';

const router = express.Router();

router.get('/bans', authenticateToken, getBans);
router.delete('/bans/:banId', authenticateToken, requireRole(['superadmin', 'admin']), unbanPlayer);

router.get('/:serverId', authenticateToken, requireServerPermission('console'), getOnlinePlayers);
router.post('/:serverId/kick/:steamId', authenticateToken, requireRole(['superadmin', 'admin']), requireServerPermission('console'), kickPlayer);
router.post('/:serverId/ban/:steamId', authenticateToken, requireRole(['superadmin', 'admin']), requireServerPermission('console'), banPlayer);

export default router;
