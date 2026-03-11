import express from 'express';
import { authenticateToken, requireRole } from '../middlewares/auth';
import { getUserPermissions, updatePermission, deletePermission } from '../controllers/permissionController';

const router = express.Router();

// Only superadmin can manage permissions
router.use(authenticateToken);
router.use(requireRole(['superadmin']));

router.get('/:userId', getUserPermissions);
router.post('/', updatePermission);
router.delete('/:userId/:serverId', deletePermission);

export default router;
