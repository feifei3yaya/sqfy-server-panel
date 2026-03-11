import { Router } from 'express';
import {
  getGroups,
  createGroup,
  updateGroup,
  deleteGroup,
  getAdmins,
  addAdmin,
  deleteAdmin,
  generateConfig,
  syncConfig
} from '../controllers/squadAdminController';
import { authenticateToken } from '../middlewares/auth';

const router = Router();

router.use(authenticateToken);

// Groups
router.get('/groups', getGroups);
router.post('/groups', createGroup);
router.put('/groups/:id', updateGroup);
router.delete('/groups/:id', deleteGroup);

// Admins
router.get('/admins', getAdmins);
router.post('/admins', addAdmin);
router.delete('/admins/:id', deleteAdmin);

// Config
router.get('/config', generateConfig);
router.post('/sync', syncConfig);

export default router;
