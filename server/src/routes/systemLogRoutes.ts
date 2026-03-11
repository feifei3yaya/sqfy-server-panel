import { Router } from 'express';
import { 
  getSystemLogs, 
  getSystemLogStats, 
  getLogConfig, 
  updateLogConfig 
} from '../controllers/systemLogController';
import { authenticateToken, requireRole } from '../middlewares/auth';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Config routes (admin only)
router.get('/config', requireRole(['admin', 'superadmin']), getLogConfig);
router.post('/config', requireRole(['admin', 'superadmin']), updateLogConfig);

// Stats
router.get('/stats', getSystemLogStats);

// Logs (query)
router.get('/', getSystemLogs);

export default router;
