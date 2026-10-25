import express from 'express';
import authRoutes from './authRoutes.js';
import contentRoutes from './contentRoutes.js';
import progressRoutes from './progressRoutes.js';
import questionRoutes from './questionRoutes.js';
import sessionRoutes from './sessionRoutes.js';
import feedbackRoutes from './feedbackRoutes.js';
import chatRoutes from './chatRoutes.js';

const router = express.Router();

// Mount individual route modules onto their specific paths
router.use('/auth', authRoutes);
router.use('/questions', questionRoutes);
router.use('/sessions', sessionRoutes);
router.use('/progress', progressRoutes);
router.use('/chat', chatRoutes);
router.use('/', contentRoutes); // contentRoutes contains root paths like /lessons, /kana, /kanji, /vocab
router.use('/feedback', feedbackRoutes);

export default router;
