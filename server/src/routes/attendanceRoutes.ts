import express from 'express';
import { startSession, endSession, getStatus, getStats } from '../controllers/attendanceController';
import { authenticateToken } from '../middlewares/auth';

const router = express.Router();

router.post('/start', authenticateToken, startSession);
router.post('/end', authenticateToken, endSession);
router.get('/status', authenticateToken, getStatus);
router.get('/stats', authenticateToken, getStats); // Admin only? Add requireRole middleware later

export default router;
