
import { Router } from 'express';
import { getPlayerNotes, addPlayerNote, deletePlayerNote, getPlayerNotesCount } from '../controllers/playerNoteController';
import { authenticateToken } from '../middlewares/auth';

const router = Router();

router.get('/:steamId/notes', authenticateToken, getPlayerNotes);
router.post('/:steamId/notes', authenticateToken, addPlayerNote);
router.delete('/:id', authenticateToken, deletePlayerNote);
router.post('/batch-count', authenticateToken, getPlayerNotesCount);

export default router;
