import express from 'express';
import { generateCDK, redeemCDK, getCDKs } from '../controllers/cdkController';
import { authenticateToken, requireRole } from '../middlewares/auth';

const router = express.Router();

router.get('/', authenticateToken, requireRole(['superadmin', 'admin']), getCDKs);
router.post('/generate', authenticateToken, requireRole(['superadmin', 'admin']), generateCDK);
router.post('/redeem', redeemCDK); // This might be public or require user auth depending on design

export default router;
