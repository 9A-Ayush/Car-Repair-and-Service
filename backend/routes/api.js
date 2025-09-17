import express from 'express';
import authRoutes from './authRoutes.js';
import appointmentRoutes from './appointmentRoutes.js';
import ratingRoutes from './ratingRoutes.js';
import chatbotRoutes from './chatbotRoutes.js';
import cartRoutes from './cartRoutes.js';
import orderRoutes from './orderRoutes.js';

const router = express.Router();

// API Routes
router.use('/auth', authRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/ratings', ratingRoutes);
router.use('/chatbot', chatbotRoutes);
router.use('/cart', cartRoutes);
router.use('/orders', orderRoutes);

// Base API route
router.get('/', (req, res) => {
    res.json({
        message: 'Car Service API v1.0',
        endpoints: {
            auth: '/api/auth',
            appointments: '/api/appointments',
            ratings: '/api/ratings',
            chatbot: '/api/chatbot',
            cart: '/api/cart',
            orders: '/api/orders'
        }
    });
});

export default router;