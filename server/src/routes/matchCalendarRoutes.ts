import { Router } from 'express';
import { authenticateToken } from '../middlewares/auth';
import * as controller from '../controllers/matchCalendarController';

const router = Router();

router.use(authenticateToken);

router.get('/', controller.getMatches);
router.post('/', controller.createMatch);
router.put('/:id', controller.updateMatch);
router.delete('/:id', controller.deleteMatch);

export default router;
