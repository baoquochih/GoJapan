import express from 'express';
import { 
    register, 
    login, 
    refreshToken, 
    logout, 
    getProfile, 
    updateProfile,
    googleLogin,
    facebookLogin
} from '../controllers/authController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/register', register); 
router.post('/login', login);
router.post('/refresh', refreshToken);
router.post('/logout', logout);
router.post('/google', googleLogin);
router.post('/facebook', facebookLogin);

// Protected routes (Require Access Token)
router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, updateProfile);

export default router;
