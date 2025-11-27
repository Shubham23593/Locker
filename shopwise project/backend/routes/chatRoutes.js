import express from 'express';
import {
  createChatSession,
  sendMessage,
  getChatHistory,
  closeChatSession,
  getMySessions,
} from '../controllers/chatController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/session', createChatSession);
router.post('/message', sendMessage);
router.get('/history/:sessionId', getChatHistory);
router.put('/close/:sessionId', closeChatSession);

// Protected routes
router.get('/my-sessions', protect, getMySessions);

export default router;