import express from 'express';
import { getConfig, updateConfig } from '../controllers/configController';
import { authenticateToken, requireServerPermission } from '../middlewares/auth';

const router = express.Router();

router.get('/:id/config/:filename', authenticateToken, requireServerPermission('files'), getConfig);
router.post('/:id/config/:filename', authenticateToken, requireServerPermission('files'), updateConfig);

export default router;
