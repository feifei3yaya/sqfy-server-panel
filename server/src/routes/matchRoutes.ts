import { Router } from 'express';
import { getMatches, getMatchDetail } from '../controllers/matchController';
import { authenticateToken } from '../middlewares/auth';

const router = Router();

router.use(authenticateToken);

router.get('/', getMatches);
router.get('/:id', getMatchDetail);

export default router;
