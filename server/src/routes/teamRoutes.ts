import express from 'express';
import { getTeams, getTeam, createTeam, joinTeam, leaveTeam, kickMember } from '../controllers/teamController';
import { authenticateToken } from '../middlewares/auth';

const router = express.Router();

router.get('/', authenticateToken, getTeams);
router.get('/:id', authenticateToken, getTeam);
router.post('/', authenticateToken, createTeam);
router.post('/:id/join', authenticateToken, joinTeam);
router.post('/:id/leave', authenticateToken, leaveTeam);
router.delete('/:id/kick/:userId', authenticateToken, kickMember);

export default router;
