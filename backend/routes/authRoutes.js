import express from 'express';
import {
    register,
    login,
    requestPasswordReset,
    resetPassword,
    getCurrentUser
} from '../controllers/authController.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import { validateSignup, validateLogin } from '../middleware/validator.js';

const router = express.Router();

// Public routes
router.post('/register', validateSignup, register);
router.post('/login', validateLogin, login);
router.post('/request-password-reset', requestPasswordReset);
router.post('/reset-password', resetPassword);

// Protected routes
router.get('/me', verifyToken, getCurrentUser);

export default router;
