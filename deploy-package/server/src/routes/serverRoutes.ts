import express from 'express';
import { getServers, addServer, updateServer, deleteServer, executeRconCommand, disbandSquad, getServerMetrics, bulkAction, getServerStatus, testFileConnection, testRconConnection } from '../controllers/serverController';
import { authenticateToken, requireRole, requireServerPermission } from '../middlewares/auth';

const router = express.Router();

router.post('/bulk', authenticateToken, requireRole(['superadmin', 'admin']), bulkAction);
router.post('/test-file-connection', authenticateToken, requireRole(['superadmin']), testFileConnection);
router.post('/:id/test-rcon', authenticateToken, requireServerPermission('console'), testRconConnection);
router.get('/:id/metrics', authenticateToken, requireServerPermission('console'), getServerMetrics);
router.get('/:id/status', authenticateToken, requireServerPermission('console'), getServerStatus);

router.get('/', authenticateToken, getServers);
router.post('/', authenticateToken, requireRole(['superadmin']), addServer);
router.put('/:id', authenticateToken, requireRole(['superadmin']), updateServer);
router.delete('/:id', authenticateToken, requireRole(['superadmin']), deleteServer);
router.post('/:id/execute', authenticateToken, requireServerPermission('console'), executeRconCommand);
router.post('/:id/disband-squad', authenticateToken, requireServerPermission('console'), disbandSquad);

export default router;
