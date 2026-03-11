import express from 'express';
import { register, login, generate2FA, verify2FA, getMe } from '../controllers/authController';
import { authenticateToken } from '../middlewares/auth';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticateToken, getMe);
router.get('/2fa/generate', authenticateToken, generate2FA);
router.post('/2fa/verify', authenticateToken, verify2FA);

export default router;
