import express from 'express';
import { getConfig, updateConfig } from '../controllers/configController';
import { authenticateToken, requireRole } from '../middlewares/auth';

const router = express.Router();

router.get('/:id/config/:filename', authenticateToken, requireRole(['superadmin', 'admin']), getConfig);
router.post('/:id/config/:filename', authenticateToken, requireRole(['superadmin', 'admin']), updateConfig);

export default router;
