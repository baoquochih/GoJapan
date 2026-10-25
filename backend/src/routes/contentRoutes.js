import express from 'express';
import { cacheMiddleware } from '../middlewares/cacheMiddleware.js';
import { getLessons, getLessonById, getVocab, getKanji, getKana } from '../controllers/contentController.js';

const router = express.Router();

router.get('/lessons', cacheMiddleware, getLessons);
router.get('/lessons/:id', cacheMiddleware, getLessonById);
router.get('/vocab', cacheMiddleware, getVocab);
router.get('/kanji', cacheMiddleware, getKanji);
router.get('/kana', cacheMiddleware, getKana);

export default router;
