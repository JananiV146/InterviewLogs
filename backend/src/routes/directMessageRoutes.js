import express from 'express';
import { sendMessage, listConversations, getMessages } from '../controllers/directMessageController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.use(verifyToken); // Protect all DM endpoints

router.get('/', listConversations);
router.get('/:conversationId/messages', getMessages);
router.post('/message', sendMessage);

export default router;
