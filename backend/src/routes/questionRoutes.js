import express from 'express';
import { cacheMiddleware } from '../middlewares/cacheMiddleware.js';
import { 
    getQuestions, 
    getQuizzes, 
    createQuiz, 
    updateQuiz, 
    deleteQuiz, 
    addQuizItems 
} from '../controllers/questionController.js';

const router = express.Router();

// List available quizzes, item can be filtered by lessonId (e.g. /api/questions)
router.get('/', cacheMiddleware, getQuizzes);

// Get questions for a specific quiz (e.g. /api/questions/1 or /api/questions/1/questions)
router.get('/:quizId', cacheMiddleware, getQuestions);
router.get('/:quizId/questions', cacheMiddleware, getQuestions);

// Admin Routes for Quizzes
router.post('/', createQuiz);
router.put('/:id', updateQuiz);
router.delete('/:id', deleteQuiz);

// Add items to a specific Quiz
router.post('/:quizId/items', addQuizItems);

export default router;