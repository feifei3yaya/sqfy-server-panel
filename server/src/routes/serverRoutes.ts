import express from 'express';
import { getServers, addServer, updateServer, deleteServer, executeRconCommand, disbandSquad, getServerMetrics } from '../controllers/serverController';
import { getGameState, changeMap, setNextMap, endMatch } from '../controllers/mapController';
import { authenticateToken, requireRole } from '../middlewares/auth';

const router = express.Router();

router.get('/:id/metrics', authenticateToken, getServerMetrics);
router.get('/:id/state', authenticateToken, getGameState);
router.post('/:id/map/change', authenticateToken, requireRole(['superadmin', 'admin']), changeMap);
router.post('/:id/map/next', authenticateToken, requireRole(['superadmin', 'admin']), setNextMap);
router.post('/:id/match/end', authenticateToken, requireRole(['superadmin', 'admin']), endMatch);

router.get('/', authenticateToken, getServers);
router.post('/', authenticateToken, requireRole(['superadmin', 'admin']), addServer);
router.put('/:id', authenticateToken, requireRole(['superadmin', 'admin']), updateServer);
router.delete('/:id', authenticateToken, requireRole(['superadmin', 'admin']), deleteServer);
router.post('/:id/execute', authenticateToken, requireRole(['superadmin', 'admin']), executeRconCommand);
router.post('/:id/disband-squad', authenticateToken, requireRole(['superadmin', 'admin']), disbandSquad);

export default router;
