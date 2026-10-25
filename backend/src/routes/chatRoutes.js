import express from 'express';
import { getChatHistory, sendChatMessage } from '../controllers/chatController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Tất cả các route chat đều yêu cầu đăng nhập
router.use(authenticateToken);

router.get('/history', getChatHistory);
router.post('/', sendChatMessage);

export default router;
