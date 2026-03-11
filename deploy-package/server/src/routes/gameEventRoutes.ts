import { Router } from 'express';
import { authenticateToken } from '../middlewares/auth';
import * as gameEventController from '../controllers/gameEventController';

const router = Router();

router.use(authenticateToken);

router.get('/', gameEventController.getGameEvents);

export default router;
