import express from 'express';
import { authenticateToken, requireServerPermission } from '../middlewares/auth';
import { getWhitelist, addWhitelist, removeWhitelist } from '../controllers/whitelistController';

const router = express.Router();

router.use(authenticateToken);

router.get('/', getWhitelist);
router.post('/', requireServerPermission('admins'), addWhitelist);
router.delete('/:id', requireServerPermission('admins'), removeWhitelist);

export default router;
